import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  clientUrls: (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "FightID <notifications@fightid.app>",
  },
};
