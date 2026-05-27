import { z } from "zod";
import { fighterListQuerySchema } from "./fighterSchemas.js";
import { userRoleSchema } from "./commonSchemas.js";

export const adminFightersQuerySchema = fighterListQuerySchema;

export const adminRoleUpdateSchema = z.object({
  role: userRoleSchema,
});
