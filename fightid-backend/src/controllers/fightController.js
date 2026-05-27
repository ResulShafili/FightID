import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notificationService.js";
import { getProfileForUser } from "../services/profileService.js";
import { applyFightRanking } from "../services/rankingService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const canManageFight = (req, fight, profile) => {
  if (["ADMIN", "FEDERATION_REP"].includes(req.user.role)) return true;
  return profile?.id === fight.fighterId && !fight.isVerified;
};

export const createFight = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const fight = await prisma.fight.create({
    data: {
      ...req.body,
      fighterId: profile.id,
    },
  });

  res.status(201).json(fight);
});

export const fightsForFighter = asyncHandler(async (req, res) => {
  const fights = await prisma.fight.findMany({
    where: { fighterId: req.params.fighterId },
    orderBy: { fightDate: "desc" },
  });

  res.json(fights);
});

export const verifyFight = asyncHandler(async (req, res) => {
  const fight = await prisma.fight.update({
    where: { id: req.params.id },
    data: { isVerified: true },
    include: { fighter: { include: { user: true } } },
  });

  await applyFightRanking(fight);
  await createNotification({
    userId: fight.fighter.userId,
    type: "FIGHT_CONFIRMED",
    message: `${fight.eventName} result has been verified.`,
    relatedEntityId: fight.id,
    emailSubject: "Your FightID result was verified",
  });

  res.json(fight);
});

export const deleteFight = asyncHandler(async (req, res) => {
  const fight = await prisma.fight.findUnique({ where: { id: req.params.id } });
  if (!fight) throw new ApiError(404, "Fight not found");

  const profile = req.user.role === "AMATEUR" || req.user.role === "PRO" ? await getProfileForUser(req.user.id) : null;
  if (!canManageFight(req, fight, profile)) {
    throw new ApiError(403, "Only the fighter or an admin can delete this fight");
  }

  await prisma.fight.delete({ where: { id: fight.id } });
  res.status(204).send();
});
