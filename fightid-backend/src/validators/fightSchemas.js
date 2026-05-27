import { z } from "zod";
import { uuidSchema } from "./commonSchemas.js";

export const fightCreateSchema = z.object({
  opponentName: z.string().min(2).max(120),
  opponentProfileId: uuidSchema.optional(),
  eventName: z.string().min(2).max(160),
  fightDate: z.coerce.date(),
  result: z.enum(["WIN", "LOSS", "DRAW", "NO_CONTEST"]),
  method: z.enum(["KO_TKO", "SUBMISSION", "DECISION", "DQ", "OTHER"]),
  round: z.coerce.number().int().min(1).max(12),
  fightTime: z.string().regex(/^\d{1,2}:\d{2}$/),
});
