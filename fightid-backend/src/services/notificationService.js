import { prisma } from "../lib/prisma.js";
import { emitToUser } from "../socket/index.js";
import { sendEmail } from "./emailService.js";

const socketEventByType = {
  CHALLENGE_RECEIVED: "challenge:received",
  CHALLENGE_ACCEPTED: "challenge:accepted",
  CHALLENGE_DECLINED: "challenge:declined",
  FIGHT_CONFIRMED: "result:confirmed",
  PRO_APPROVED: "pro:approved",
};

export const createNotification = async ({ userId, type, message, relatedEntityId, emailSubject }) => {
  const notification = await prisma.notification.create({
    data: { userId, type, message, relatedEntityId },
  });

  emitToUser(userId, socketEventByType[type] || "notification:new", notification);

  if (emailSubject) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    sendEmail({ to: user?.email, subject: emailSubject, text: message }).catch((error) => {
      console.warn(`[notification email failed] ${emailSubject}: ${error.message}`);
    });
  }

  return notification;
};
