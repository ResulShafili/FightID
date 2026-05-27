import { z } from "zod";
import { uuidSchema } from "./commonSchemas.js";

export const verificationApplySchema = z.object({
  federationId: uuidSchema,
});

export const verificationRejectSchema = z.object({
  adminNote: z.string().min(2).max(1000),
});
