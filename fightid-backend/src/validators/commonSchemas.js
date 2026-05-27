import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const weightClassSchema = z.enum([
  "STRAWWEIGHT",
  "FLYWEIGHT",
  "BANTAMWEIGHT",
  "FEATHERWEIGHT",
  "LIGHTWEIGHT",
  "WELTERWEIGHT",
  "MIDDLEWEIGHT",
  "LIGHT_HEAVYWEIGHT",
  "HEAVYWEIGHT",
]);

export const userRoleSchema = z.enum(["AMATEUR", "PRO", "FEDERATION_REP", "ADMIN"]);

export const optionalUrlSchema = z.string().url().optional().or(z.literal("").transform(() => undefined));
