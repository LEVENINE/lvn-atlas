# Authentication

> Version: 1.0
>
> Status: Approved

---

# Purpose

This document defines how LVN Atlas authenticates users.

It covers the credential model, the access token format, the endpoints introduced by Split 0.6, and the rules that protect user data.

---

# Scope

In scope for the MVP:

- email and password registration
- email and password login
- access to the current authenticated user
- protected API routes

Out of scope for the MVP:

- third-party identity providers (Google, GitHub, and similar)
- refresh tokens and token revocation
- password reset and email verification
- roles and permissions beyond "authenticated user"

---

# Credential Model

Passwords are hashed with bcrypt before they are stored.

- cost factor: 12
- hash column: `User.passwordHash`
- the hash is never included in an API response
- the password itself is never logged, stored, or returned

`passwordHash` is nullable because accounts can exist without a password, such as demo and seeded users, or users created through the internal user endpoints. Such accounts cannot log in until a password is set.

---

# Access Token

LVN Atlas uses a stateless JSON Web Token.

| Property   | Value                                              |
| ---------- | -------------------------------------------------- |
| Algorithm  | `HS256`                                            |
| Secret     | `JWT_SECRET` environment variable                  |
| Lifetime   | `JWT_EXPIRES_IN` environment variable (default `1h`) |
| Subject    | `sub` claim holds the user id                       |
| Additional | `email` claim holds the user email                  |

Tokens are sent with every protected request:

```http
Authorization: Bearer <accessToken>
```

Tokens are not stored in the database, so a token stays valid until it expires. Short lifetimes and refresh tokens are deferred to a later split.

---

# Endpoints

| Method | Path                    | Authentication | Description                    |
| ------ | ----------------------- | -------------- | ------------------------------ |
| POST   | `/api/v1/auth/register` | Public         | Create an account and profile  |
| POST   | `/api/v1/auth/login`    | Public         | Exchange credentials for token |
| GET    | `/api/v1/auth/me`       | Bearer token   | Return the current user        |

## Register

`POST /api/v1/auth/register`

```json
{
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

The user and profile are created in a single transaction.

Response `201 Created`:

```json
{
  "user": {
    "id": "…",
    "email": "john@example.com",
    "createdAt": "…",
    "updatedAt": "…",
    "profile": {
      "id": "…",
      "firstName": "John",
      "lastName": "Doe",
      "householdSize": 1,
      "numberOfDependents": 0
    }
  },
  "accessToken": "…"
}
```

## Login

`POST /api/v1/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

Response `200 OK` has the same shape as registration.

## Current User

`GET /api/v1/auth/me`

Response `200 OK`:

```json
{
  "id": "…",
  "email": "john@example.com",
  "createdAt": "…",
  "updatedAt": "…",
  "profile": { "…": "…" }
}
```

---

# Protected Routes

All user and profile endpoints require a valid access token:

- `/api/v1/users`
- `/api/v1/users/:id`
- `/api/v1/users/:id/profile`
- `/api/v1/profiles`
- `/api/v1/profiles/:id`

Cities and health endpoints remain public because they expose reference data only.

---

# Errors

| Status | Code                      | Meaning                                     |
| ------ | ------------------------- | ------------------------------------------- |
| 400    | `VALIDATION_ERROR`        | Request body failed validation              |
| 401    | `INVALID_CREDENTIALS`     | Wrong email or password, or no password set |
| 401    | `UNAUTHORIZED`            | Token missing, malformed, or expired        |
| 409    | `USER_EMAIL_ALREADY_EXISTS` | Email is already registered               |

Login responses never reveal whether an email exists. A missing account and a wrong password produce the same `INVALID_CREDENTIALS` error.

---

# Environment Variables

| Variable          | Required | Description                                            |
| ----------------- | -------- | ------------------------------------------------------ |
| `JWT_SECRET`      | Yes      | Signing secret, at least 32 characters                 |
| `JWT_EXPIRES_IN`  | No       | Token lifetime, defaults to `1h`                       |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

# Deferred

- Authorization rules that limit a user to their own records
- Refresh tokens and logout
- Password reset and email verification
- Rate limiting on login attempts
