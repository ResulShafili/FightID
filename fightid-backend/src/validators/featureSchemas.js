import { z } from "zod";
import { optionalUrlSchema, paginationQuerySchema, uuidSchema, weightClassSchema } from "./commonSchemas.js";

export const ruleSetSchema = z.enum(["MMA", "GRAPPLING", "BOXING", "MUAY_THAI"]);
export const trainingTypeSchema = z.enum(["STRIKING", "GRAPPLING", "CONDITIONING", "SPARRING", "DRILLING", "RECOVERY", "OTHER"]);

export const fightSeekCreateSchema = z.object({
  weightClass: weightClassSchema,
  ruleSet: ruleSetSchema,
  location: z.string().min(2).max(120),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  message: z.string().max(500).optional(),
}).refine((data) => data.dateTo >= data.dateFrom, { message: "dateTo must be after dateFrom", path: ["dateTo"] });

export const fightSeekQuerySchema = paginationQuerySchema.extend({
  weightClass: weightClassSchema.optional(),
  ruleSet: ruleSetSchema.optional(),
  country: z.string().min(2).max(2).toUpperCase().optional(),
});

export const trainingLogSchema = z.object({
  type: trainingTypeSchema,
  durationMins: z.coerce.number().int().min(1).max(480),
  note: z.string().max(500).optional(),
  date: z.coerce.date().optional(),
});

export const tournamentCreateSchema = z.object({
  name: z.string().min(2).max(160),
  weightClass: weightClassSchema,
  ruleSet: ruleSetSchema,
  size: z.number().int().refine((value) => [4, 8, 16].includes(value), "Size must be 4, 8, or 16"),
  fighterIds: z.array(uuidSchema),
}).refine((data) => data.fighterIds.length === data.size, { message: "fighterIds must match tournament size", path: ["fighterIds"] });

export const tournamentListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED"]).optional(),
  weightClass: weightClassSchema.optional(),
});

export const tournamentWinnerSchema = z.object({
  winnerId: uuidSchema,
});

export const gymCreateSchema = z.object({
  name: z.string().min(2).max(120),
  country: z.string().min(2).max(2).toUpperCase(),
  city: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  websiteUrl: optionalUrlSchema.optional(),
});

export const gymUpdateSchema = gymCreateSchema.partial();

export const gymListQuerySchema = paginationQuerySchema.extend({
  country: z.string().min(2).max(2).toUpperCase().optional(),
  search: z.string().max(120).optional(),
});

export const micCheckPostSchema = z.object({
  challengeId: uuidSchema,
  message: z.string().min(10).max(280),
  videoUrl: optionalUrlSchema.optional(),
});

export const micCheckReactionSchema = z.object({
  emoji: z.enum(["🔥", "💀", "😂", "🥶", "👊"]),
});
