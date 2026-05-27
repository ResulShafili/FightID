import { z } from "zod";
import { uuidSchema, weightClassSchema } from "./commonSchemas.js";

export const challengeCreateSchema = z
  .object({
    receiverId: uuidSchema,
    proposedDateFrom: z.coerce.date(),
    proposedDateTo: z.coerce.date(),
    location: z.string().min(2).max(160),
    weightClass: weightClassSchema,
    ruleSet: z.enum(["MMA", "GRAPPLING", "BOXING", "MUAY_THAI"]),
    senderMessage: z.string().max(1000).optional(),
  })
  .refine((data) => data.proposedDateTo >= data.proposedDateFrom, {
    message: "proposedDateTo must be after proposedDateFrom",
    path: ["proposedDateTo"],
  });

export const challengeCounterSchema = z
  .object({
    proposedDateFrom: z.coerce.date().optional(),
    proposedDateTo: z.coerce.date().optional(),
    location: z.string().min(2).max(160).optional(),
    weightClass: weightClassSchema.optional(),
    counterOffer: z.string().min(1).max(1000),
  })
  .refine((data) => !data.proposedDateFrom || !data.proposedDateTo || data.proposedDateTo >= data.proposedDateFrom, {
    message: "proposedDateTo must be after proposedDateFrom",
    path: ["proposedDateTo"],
  });

export const challengeResultSchema = z.object({
  message: z.string().max(1000).optional(),
});
