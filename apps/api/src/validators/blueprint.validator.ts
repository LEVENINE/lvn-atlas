import { z } from "zod";

const blueprintFieldsSchema = z.object({
  originCityId: z.string().uuid(),
  destinationCityId: z.string().uuid(),
  expectedMonthlyIncome: z.number().positive(),
  plannedRelocationDate: z.coerce.date().optional(),
  relocatingHouseholdSize: z.number().int().positive().optional(),
});

export const createBlueprintSchema = blueprintFieldsSchema.refine(
  (value) => value.originCityId !== value.destinationCityId,
  {
    message: "Origin and destination cities must be different",
    path: ["destinationCityId"],
  },
);

export const updateBlueprintSchema = blueprintFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;
export type UpdateBlueprintInput = z.infer<typeof updateBlueprintSchema>;
