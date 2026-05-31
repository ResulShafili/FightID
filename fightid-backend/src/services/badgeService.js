import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notificationService.js";

const badgeLabels = {
  FIRST_WIN: "First Blood",
  FIRST_KO: "Lights Out",
  FIRST_SUBMISSION: "Tap Out",
  WIN_STREAK_3: "On Fire",
  WIN_STREAK_5: "Unstoppable",
  WIN_STREAK_10: "Wrecking Machine",
  UNDEFEATED: "Perfect Record",
  VETERAN_10_FIGHTS: "Veteran",
  VETERAN_25_FIGHTS: "War Machine",
  KO_SPECIALIST: "KO Artist",
  SUBMISSION_SPECIALIST: "Submission Wizard",
  DECISION_MASTER: "Chess Player",
  POINTS_500: "Silver Fighter",
  POINTS_1000: "Gold Fighter",
  POINTS_2000: "Champion Class",
  PLATFORM_PIONEER: "Pioneer",
};

const hasWinStreak = (fights, size) => fights.length >= size && fights.slice(0, size).every((fight) => fight.result === "WIN");

export const evaluateBadges = async (fighterId) => {
  const fighter = await prisma.fighterProfile.findUnique({
    where: { id: fighterId },
    include: {
      fights: { where: { isVerified: true }, orderBy: { fightDate: "desc" } },
      badges: true,
    },
  });
  if (!fighter) return [];

  const wins = fighter.fights.filter((fight) => fight.result === "WIN");
  const losses = fighter.fights.filter((fight) => fight.result === "LOSS").length;
  const draws = fighter.fights.filter((fight) => fight.result === "DRAW").length;
  const koWins = wins.filter((fight) => fight.method === "KO_TKO").length;
  const submissionWins = wins.filter((fight) => fight.method === "SUBMISSION").length;
  const decisionWins = wins.filter((fight) => fight.method === "DECISION").length;
  const desired = new Set();

  if (wins.length >= 1) desired.add("FIRST_WIN");
  if (koWins >= 1) desired.add("FIRST_KO");
  if (submissionWins >= 1) desired.add("FIRST_SUBMISSION");
  if (hasWinStreak(fighter.fights, 3)) desired.add("WIN_STREAK_3");
  if (hasWinStreak(fighter.fights, 5)) desired.add("WIN_STREAK_5");
  if (hasWinStreak(fighter.fights, 10)) desired.add("WIN_STREAK_10");
  if (losses === 0 && draws === 0 && fighter.fights.length >= 3) desired.add("UNDEFEATED");
  if (fighter.fights.length >= 10) desired.add("VETERAN_10_FIGHTS");
  if (fighter.fights.length >= 25) desired.add("VETERAN_25_FIGHTS");
  if (koWins >= 5) desired.add("KO_SPECIALIST");
  if (submissionWins >= 5) desired.add("SUBMISSION_SPECIALIST");
  if (decisionWins >= 5) desired.add("DECISION_MASTER");
  if (fighter.points >= 500) desired.add("POINTS_500");
  if (fighter.points >= 1000) desired.add("POINTS_1000");
  if (fighter.points >= 2000) desired.add("POINTS_2000");

  const pioneerCount = await prisma.fighterProfile.count({ where: { createdAt: { lte: fighter.createdAt } } });
  if (pioneerCount <= 100) desired.add("PLATFORM_PIONEER");

  const existing = new Set(fighter.badges.map((badge) => badge.type));
  const newlyEarned = [];

  for (const type of desired) {
    if (existing.has(type)) continue;
    const badge = await prisma.fighterBadge.create({ data: { fighterId, type } });
    newlyEarned.push(badge);
    await createNotification({
      userId: fighter.userId,
      type: "BADGE_EARNED",
      message: `You earned a new badge: ${badgeLabels[type]}!`,
      relatedEntityId: badge.id,
      emailSubject: "New FightBase badge earned",
    });
  }

  return newlyEarned;
};
