import { z } from "zod";

import { AppError } from "./app-error.js";

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".");

        return path ? `${path}: ${issue.message}` : issue.message;
      })
      .join("; ");

    throw new AppError(400, "VALIDATION_ERROR", message);
  }

  return result.data;
}
