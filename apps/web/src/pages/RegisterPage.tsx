import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { Notice } from "../components/Notice";
import { errorMessage } from "../lib/api";

export function RegisterPage() {
  const { status, signUp } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter your first and last name.");

      return;
    }

    if (password.length < 8) {
      setError("Use a password with at least 8 characters.");

      return;
    }

    setSubmitting(true);

    try {
      await signUp({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      navigate("/", { replace: true });
    } catch (signUpError) {
      setError(errorMessage(signUpError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="eyebrow">Start planning</p>
        <h2 className="mt-3 font-display text-3xl text-mist-50">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-mist-400">
          One account keeps all of your relocation scenarios together.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {error && <Notice>{error}</Notice>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="field-label">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Asha"
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="field-label">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Rao"
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="field-input"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="field-input"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-1"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-mist-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-ember-300 transition hover:text-ember-200"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
