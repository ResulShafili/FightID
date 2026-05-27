import { z } from "zod";
import { optionalUrlSchema, paginationQuerySchema, userRoleSchema, weightClassSchema } from "./commonSchemas.js";

export const fighterListQuerySchema = paginationQuerySchema.extend({
  weightClass: weightClassSchema.optional(),
  country: z.string().min(2).max(2).toUpperCase().optional(),
  role: userRoleSchema.optional(),
  search: z.string().max(120).optional(),
});

export const leaderboardQuerySchema = paginationQuerySchema.extend({
  weightClass: weightClassSchema.optional(),
  country: z.string().min(2).max(2).toUpperCase().optional(),
  role: z.enum(["PRO", "AMATEUR"]).optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  nickname: z.string().max(80).nullable().optional(),
  country: z.string().min(2).max(2).toUpperCase().optional(),
  weightClass: weightClassSchema.optional(),
  gym: z.string().max(120).nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  instagramUrl: optionalUrlSchema.nullable().optional(),
  youtubeUrl: optionalUrlSchema.nullable().optional(),
  coverPhotoUrl: optionalUrlSchema.nullable().optional(),
});
