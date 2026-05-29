import { z } from "zod";
import { weightClassSchema } from "./commonSchemas.js";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  nickname: z.string().max(80).optional(),
  dateOfBirth: z.coerce.date(),
  country: z.string().min(2).max(2).toUpperCase(),
  weightClass: weightClassSchema,
  gym: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const logoutSchema = refreshSchema;

export const verifyEmailCodeSchema = z.object({
  email: z.string().email().toLowerCase(),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
  purpose: z.enum(["LOGIN", "REGISTER"]),
});
