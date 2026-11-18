import { z } from "zod";

import {
  DietaryPreference,
  HousingPreference,
  TransportationPreference,
} from "../generated/prisma/enums.js";

const profileFieldsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  occupation: z.string().optional(),
  householdSize: z.number().int().positive().optional(),
  numberOfDependents: z.number().int().min(0).optional(),
  dietaryPreference: z.enum(DietaryPreference).optional(),
  housingPreference: z.enum(HousingPreference).optional(),
  transportationPreference: z.enum(TransportationPreference).optional(),
  lifestylePreference: z.string().optional(),
});

export const updateProfileSchema = profileFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
