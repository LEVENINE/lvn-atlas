import { z } from "zod";

export const updateUserSchema = z
  .object({
    email: z.string().email(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
