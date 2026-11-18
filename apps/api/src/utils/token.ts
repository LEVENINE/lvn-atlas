import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

const TOKEN_ALGORITHM = "HS256";

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

function invalidTokenError() {
  return new AppError(401, "UNAUTHORIZED", "Invalid or expired access token");
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: TOKEN_ALGORITHM,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: [TOKEN_ALGORITHM],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw invalidTokenError();
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
    };
  } catch {
    throw invalidTokenError();
  }
}
