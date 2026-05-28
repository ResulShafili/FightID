import { prisma } from "../lib/prisma.js";

export const tierForPoints = (points = 0) => {
  if (points >= 2000) return "CHAMPION";
  if (points >= 1000) return "GOLD";
  if (points >= 500) return "SILVER";
  return "BRONZE";
};

export const upsertFighterCard = async (fighter) => {
  const profile = typeof fighter === "string" ? await prisma.fighterProfile.findUnique({ where: { id: fighter } }) : fighter;
  if (!profile) return null;

  return prisma.fighterCard.upsert({
    where: { fighterId: profile.id },
    update: { tier: tierForPoints(profile.points) },
    create: { fighterId: profile.id, tier: tierForPoints(profile.points) },
    include: { fighter: true, collectors: true },
  });
};
