import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
});

export const updateUserSchema = z
  .object({
    email: z.string().email(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
