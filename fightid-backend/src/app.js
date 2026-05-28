import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import fighterRoutes from "./routes/fighterRoutes.js";
import fightRoutes from "./routes/fightRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import { badgeRoutes, cardRoutes, cornerManRoutes, fightSeekRoutes, gymRoutes, leaderboardRoutes, micCheckRoutes, tournamentRoutes, trainingRoutes } from "./routes/featureRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.clientUrls.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "fightid-backend" });
  });

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/fighters", fighterRoutes);
  app.use("/api/fights", fightRoutes);
  app.use("/api/challenges", challengeRoutes);
  app.use("/api/verification", verificationRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/cards", cardRoutes);
  app.use("/api/cornermen", cornerManRoutes);
  app.use("/api/fightseek", fightSeekRoutes);
  app.use("/api/training", trainingRoutes);
  app.use("/api/badges", badgeRoutes);
  app.use("/api/leaderboard", leaderboardRoutes);
  app.use("/api/gyms", gymRoutes);
  app.use("/api/micchecks", micCheckRoutes);
  app.use("/api/tournaments", tournamentRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
};
