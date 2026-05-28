import { prisma } from "../lib/prisma.js";
import { evaluateBadges } from "./badgeService.js";
import { upsertFighterCard } from "./cardService.js";

const TOP_10_MULTIPLIER = 2.5;
const TOP_50_MULTIPLIER = 1.5;
const BASE_WIN_POINTS = 100;
const LOSS_DEDUCTION = 30;
const DECAY_POINTS = 10;
const DAYS_PER_DECAY_PERIOD = 90;

export const getLeaderboard = async ({ weightClass, country, role, page = 1, limit = 50 }) => {
  const skip = (page - 1) * limit;
  const isVerifiedPro = role === "PRO" ? true : role === "AMATEUR" ? false : undefined;

  const where = {
    ...(weightClass ? { weightClass } : {}),
    ...(country ? { country } : {}),
    ...(isVerifiedPro !== undefined ? { isVerifiedPro } : {}),
  };

  const [fighters, total] = await Promise.all([
    prisma.fighterProfile.findMany({
      where,
      orderBy: [{ points: "desc" }, { fullName: "asc" }],
      skip,
      take: limit,
      include: { user: { select: { role: true } }, verifiedByFederation: true },
    }),
    prisma.fighterProfile.count({ where }),
  ]);

  return {
    data: fighters.map((fighter, index) => ({
      ...fighter,
      rank: skip + index + 1,
    })),
    pagination: { page, limit, total },
  };
};

export const getRankInDivision = async (fighter) => {
  const betterCount = await prisma.fighterProfile.count({
    where: {
      weightClass: fighter.weightClass,
      isVerifiedPro: fighter.isVerifiedPro,
      points: { gt: fighter.points },
    },
  });

  return betterCount + 1;
};

const opponentRankMultiplier = (rank) => {
  if (!rank) return 1;
  if (rank <= 10) return TOP_10_MULTIPLIER;
  if (rank <= 50) return TOP_50_MULTIPLIER;
  return 1;
};

export const applyFightRanking = async (fight) => {
  if (!fight.isVerified) return null;

  const fighter = await prisma.fighterProfile.findUnique({ where: { id: fight.fighterId } });
  if (!fighter) return null;

  let delta = 0;
  if (fight.result === "WIN") {
    let opponentRank;
    if (fight.opponentProfileId) {
      const opponent = await prisma.fighterProfile.findUnique({ where: { id: fight.opponentProfileId } });
      if (opponent) opponentRank = await getRankInDivision(opponent);
    }
    delta = Math.round(BASE_WIN_POINTS * opponentRankMultiplier(opponentRank));
  } else if (fight.result === "LOSS") {
    delta = -LOSS_DEDUCTION;
  }

  if (delta === 0) return fighter;

  const updated = await prisma.fighterProfile.update({
    where: { id: fighter.id },
    data: { points: Math.max(0, fighter.points + delta) },
  });

  await upsertFighterCard(updated);
  await evaluateBadges(updated.id);
  return updated;
};

export const applyInactivityDecay = async () => {
  const fighters = await prisma.fighterProfile.findMany({
    include: {
      fights: {
        where: { isVerified: true },
        orderBy: { fightDate: "desc" },
        take: 1,
      },
    },
  });

  const now = Date.now();

  for (const fighter of fighters) {
    const lastFight = fighter.fights[0];
    if (!lastFight || fighter.points <= 0) continue;

    const daysInactive = Math.floor((now - lastFight.fightDate.getTime()) / (1000 * 60 * 60 * 24));
    const periods = Math.floor(daysInactive / DAYS_PER_DECAY_PERIOD);
    const deduction = periods * DECAY_POINTS;

    if (deduction > 0) {
      const updated = await prisma.fighterProfile.update({
        where: { id: fighter.id },
        data: { points: Math.max(0, fighter.points - deduction) },
      });
      await upsertFighterCard(updated);
      await evaluateBadges(updated.id);
    }
  }
};
