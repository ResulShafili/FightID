import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: "15m",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, tokenType: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: "30d",
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
};
