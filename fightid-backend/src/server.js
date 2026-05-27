import http from "node:http";
import cron from "node-cron";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { initSocket } from "./socket/index.js";
import { applyInactivityDecay } from "./services/rankingService.js";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

initSocket(io);

cron.schedule("15 3 * * *", async () => {
  try {
    await applyInactivityDecay();
  } catch (error) {
    console.error("Daily ranking decay failed", error);
  }
});

server.listen(env.port, () => {
  console.log(`FightID backend running on port ${env.port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
