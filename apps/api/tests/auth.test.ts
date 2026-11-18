import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/app.js";
import { Prisma } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/utils/password.js";
import { signAccessToken } from "../src/utils/token.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: prismaMock }));

const DEMO_PASSWORD = "Password123!";
const DEMO_PASSWORD_HASH = await hashPassword(DEMO_PASSWORD);

const demoUser = {
  id: "3f0a1f7c-9b2d-4c55-8e1a-7d6c5b4a3928",
  email: "john@example.com",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  profile: {
    id: "8c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f",
    firstName: "John",
    lastName: "Doe",
    occupation: null,
    householdSize: 1,
    numberOfDependents: 0,
    dietaryPreference: null,
    housingPreference: null,
    transportationPreference: null,
    lifestylePreference: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
};

describe("auth endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/register", () => {
    it("creates a user and returns an access token", async () => {
      prismaMock.user.create.mockResolvedValue(demoUser);

      const response = await request(app).post("/api/v1/auth/register").send({
        email: demoUser.email,
        password: DEMO_PASSWORD,
        firstName: "John",
        lastName: "Doe",
      });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(demoUser.email);
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.accessToken).toBeTypeOf("string");
    });

    it("rejects an invalid payload", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "not-an-email", password: "short" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("returns 409 when the email is already taken", async () => {
      prismaMock.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "test",
        }),
      );

      const response = await request(app).post("/api/v1/auth/register").send({
        email: demoUser.email,
        password: DEMO_PASSWORD,
        firstName: "John",
        lastName: "Doe",
      });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("USER_EMAIL_ALREADY_EXISTS");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("returns a token for valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...demoUser,
        passwordHash: DEMO_PASSWORD_HASH,
      });

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: demoUser.email, password: DEMO_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeTypeOf("string");
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it("rejects a wrong password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...demoUser,
        passwordHash: DEMO_PASSWORD_HASH,
      });

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: demoUser.email, password: "WrongPassword123!" });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects an account without a password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...demoUser,
        passwordHash: null,
      });

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: demoUser.email, password: DEMO_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects an unknown email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: DEMO_PASSWORD });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("returns the authenticated user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(demoUser);

      const token = signAccessToken({
        sub: demoUser.id,
        email: demoUser.email,
      });

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(demoUser.id);
    });

    it("returns 401 without a token", async () => {
      const response = await request(app).get("/api/v1/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns 401 for a malformed token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer not-a-real-token");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });
});
