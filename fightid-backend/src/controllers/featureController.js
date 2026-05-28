import { prisma } from "../lib/prisma.js";
import { uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { createNotification } from "../services/notificationService.js";
import { getProfileForUser } from "../services/profileService.js";
import { upsertFighterCard } from "../services/cardService.js";
import { emitToUser } from "../socket/index.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const withStats = (fighter) => {
  const fights = fighter.fights || [];
  const wins = fights.filter((fight) => fight.result === "WIN");
  const methods = {
    KO_TKO: wins.filter((fight) => fight.method === "KO_TKO").length,
    SUBMISSION: wins.filter((fight) => fight.method === "SUBMISSION").length,
    DECISION: wins.filter((fight) => fight.method === "DECISION").length,
    DQ: wins.filter((fight) => fight.method === "DQ").length,
    OTHER: wins.filter((fight) => fight.method === "OTHER").length,
  };
  return {
    ...fighter,
    stats: {
      record: {
        wins: wins.length,
        losses: fights.filter((fight) => fight.result === "LOSS").length,
        draws: fights.filter((fight) => fight.result === "DRAW").length,
        noContests: fights.filter((fight) => fight.result === "NO_CONTEST").length,
      },
      methods,
    },
  };
};

const paginate = (req) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const getCardForFighter = asyncHandler(async (req, res) => {
  const card = await upsertFighterCard(req.params.fighterId);
  if (!card) throw new ApiError(404, "Fighter not found");
  res.json(card);
});

export const collectCard = asyncHandler(async (req, res) => {
  const card = await prisma.fighterCard.findUnique({ where: { id: req.params.cardId }, include: { fighter: true } });
  if (!card) throw new ApiError(404, "Card not found");
  if (card.fighter.userId === req.user.id) throw new ApiError(400, "You cannot collect your own card");
  const collection = await prisma.cardCollection.upsert({
    where: { userId_cardId: { userId: req.user.id, cardId: card.id } },
    update: {},
    create: { userId: req.user.id, cardId: card.id },
    include: { card: { include: { fighter: true } } },
  });
  res.status(201).json(collection);
});

export const uncollectCard = asyncHandler(async (req, res) => {
  await prisma.cardCollection.deleteMany({ where: { userId: req.user.id, cardId: req.params.cardId } });
  res.status(204).send();
});

export const myCardCollection = asyncHandler(async (req, res) => {
  const data = await prisma.cardCollection.findMany({
    where: { userId: req.user.id },
    orderBy: { collectedAt: "desc" },
    include: { card: { include: { fighter: { include: { fights: { where: { isVerified: true } } } } } } },
  });
  res.json(data);
});

export const addCornerMan = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({ where: { id: req.params.fighterId } });
  if (!fighter) throw new ApiError(404, "Fighter not found");
  if (fighter.userId === req.user.id) throw new ApiError(400, "You cannot corner yourself");
  const corner = await prisma.cornerMan.upsert({
    where: { userId_fighterId: { userId: req.user.id, fighterId: fighter.id } },
    update: {},
    create: { userId: req.user.id, fighterId: fighter.id },
  });
  res.status(201).json(corner);
});

export const removeCornerMan = asyncHandler(async (req, res) => {
  await prisma.cornerMan.deleteMany({ where: { userId: req.user.id, fighterId: req.params.fighterId } });
  res.status(204).send();
});

export const cornerCount = asyncHandler(async (req, res) => {
  const [count, mine] = await Promise.all([
    prisma.cornerMan.count({ where: { fighterId: req.params.fighterId } }),
    req.user?.id ? prisma.cornerMan.findUnique({ where: { userId_fighterId: { userId: req.user.id, fighterId: req.params.fighterId } } }) : null,
  ]);
  res.json({ count, hasCornered: Boolean(mine) });
});

export const myCornerFighters = asyncHandler(async (req, res) => {
  const data = await prisma.cornerMan.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: { fighter: { include: { user: { select: { role: true } }, fights: { where: { isVerified: true } } } } },
  });
  res.json(data.map((item) => ({ ...item, fighter: withStats(item.fighter) })));
});

export const createFightSeek = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const existing = await prisma.fightSeek.findFirst({ where: { fighterId: profile.id, isActive: true, expiresAt: { gt: new Date() } } });
  if (existing) throw new ApiError(400, "You already have an active fight seek listing");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const listing = await prisma.fightSeek.create({ data: { ...req.body, fighterId: profile.id, expiresAt }, include: { fighter: true } });
  res.status(201).json(listing);
});

export const listFightSeeks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const where = {
    isActive: true,
    expiresAt: { gt: new Date() },
    ...(req.query.weightClass ? { weightClass: req.query.weightClass } : {}),
    ...(req.query.ruleSet ? { ruleSet: req.query.ruleSet } : {}),
    ...(req.query.country ? { fighter: { country: req.query.country } } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.fightSeek.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { fighter: true } }),
    prisma.fightSeek.count({ where }),
  ]);
  res.json({ data, pagination: { page, limit, total } });
});

export const removeFightSeek = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const listing = await prisma.fightSeek.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new ApiError(404, "Fight seek listing not found");
  if (listing.fighterId !== profile.id) throw new ApiError(403, "Only the listing owner can remove it");
  await prisma.fightSeek.update({ where: { id: listing.id }, data: { isActive: false } });
  res.status(204).send();
});

export const logTraining = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const log = await prisma.trainingLog.create({ data: { ...req.body, fighterId: profile.id }, include: { fighter: true } });
  const cornerMen = await prisma.cornerMan.findMany({ where: { fighterId: profile.id } });
  for (const corner of cornerMen) emitToUser(corner.userId, "training:new", log);
  res.status(201).json(log);
});

export const trainingForFighter = asyncHandler(async (req, res) => {
  const logs = await prisma.trainingLog.findMany({ where: { fighterId: req.params.fighterId }, orderBy: { date: "desc" }, take: 30 });
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const month = logs.filter((log) => log.date >= start);
  const counts = month.reduce((acc, log) => ({ ...acc, [log.type]: (acc[log.type] || 0) + 1 }), {});
  const mostCommonType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  res.json({
    data: logs,
    summary: {
      totalSessionsThisMonth: month.length,
      totalHoursThisMonth: month.reduce((sum, log) => sum + log.durationMins, 0) / 60,
      mostCommonType,
      counts,
    },
  });
});

export const deleteTraining = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const log = await prisma.trainingLog.findUnique({ where: { id: req.params.id } });
  if (!log) throw new ApiError(404, "Training log not found");
  if (log.fighterId !== profile.id) throw new ApiError(403, "Only the fighter can delete this log");
  await prisma.trainingLog.delete({ where: { id: log.id } });
  res.status(204).send();
});

export const listBadges = asyncHandler(async (req, res) => {
  const badges = await prisma.fighterBadge.findMany({ where: { fighterId: req.params.fighterId }, orderBy: { earnedAt: "desc" } });
  res.json(badges);
});

const buildNationalLeaderboard = async () => {
  const result = {};
  const weights = ["STRAWWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "LIGHT_HEAVYWEIGHT", "HEAVYWEIGHT"];
  for (const weightClass of weights) {
    const fighters = await prisma.fighterProfile.findMany({ where: { weightClass }, orderBy: [{ points: "desc" }, { fullName: "asc" }], take: 500, include: { fights: { where: { isVerified: true } } } });
    const seen = new Set();
    result[weightClass] = fighters.filter((fighter) => {
      if (seen.has(fighter.country)) return false;
      seen.add(fighter.country);
      return true;
    }).map((fighter) => ({ country: fighter.country, fighter: withStats(fighter), rank: 1 }));
  }
  return result;
};

export const nationalLeaderboard = asyncHandler(async (_req, res) => {
  res.json(await buildNationalLeaderboard());
});

export const nationalByCountry = asyncHandler(async (req, res) => {
  const all = await buildNationalLeaderboard();
  const filtered = Object.fromEntries(Object.entries(all).map(([key, rows]) => [key, rows.filter((row) => row.country === req.params.country.toUpperCase())]));
  res.json(filtered);
});

export const isNationalChampion = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({ where: { id: req.params.id } });
  if (!fighter) throw new ApiError(404, "Fighter not found");
  const betterCount = await prisma.fighterProfile.count({ where: { country: fighter.country, weightClass: fighter.weightClass, points: { gt: fighter.points } } });
  res.json({ isChampion: betterCount === 0, rank: betterCount + 1 });
});

export const createGym = asyncHandler(async (req, res) => {
  const owned = await prisma.gym.findFirst({ where: { ownerId: req.user.id } });
  if (owned) throw new ApiError(400, "You already own a gym");
  const gym = await prisma.gym.create({ data: { ...req.body, ownerId: req.user.id } });
  res.status(201).json(gym);
});

export const listGyms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const where = {
    ...(req.query.country ? { country: req.query.country } : {}),
    ...(req.query.search ? { name: { contains: req.query.search, mode: "insensitive" } } : {}),
  };
  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({ where, skip, take: limit, orderBy: { name: "asc" }, include: { fighters: true } }),
    prisma.gym.count({ where }),
  ]);
  res.json({
    data: gyms.map((gym) => ({
      ...gym,
      fighterCount: gym.fighters.length,
      totalPoints: gym.fighters.reduce((sum, fighter) => sum + fighter.points, 0),
    })),
    pagination: { page, limit, total },
  });
});

export const gymLeaderboard = asyncHandler(async (_req, res) => {
  const gyms = await prisma.gym.findMany({ include: { fighters: true } });
  res.json(gyms
    .map((gym) => ({ ...gym, fighterCount: gym.fighters.length, totalPoints: gym.fighters.reduce((sum, fighter) => sum + fighter.points, 0) }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 20));
});

export const getGym = asyncHandler(async (req, res) => {
  const gym = await prisma.gym.findUnique({ where: { id: req.params.id }, include: { fighters: { include: { user: { select: { role: true } }, fights: { where: { isVerified: true } } } } } });
  if (!gym) throw new ApiError(404, "Gym not found");
  const fighters = gym.fighters.map(withStats);
  res.json({
    ...gym,
    fighters,
    fighterCount: fighters.length,
    proFighters: fighters.filter((fighter) => fighter.isVerifiedPro).length,
    totalPoints: fighters.reduce((sum, fighter) => sum + fighter.points, 0),
    averagePoints: fighters.length ? Math.round(fighters.reduce((sum, fighter) => sum + fighter.points, 0) / fighters.length) : 0,
  });
});

const assertGymOwner = async (gymId, userId) => {
  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) throw new ApiError(404, "Gym not found");
  if (gym.ownerId !== userId) throw new ApiError(403, "Only the gym owner can update this gym");
  return gym;
};

export const updateGym = asyncHandler(async (req, res) => {
  await assertGymOwner(req.params.id, req.user.id);
  res.json(await prisma.gym.update({ where: { id: req.params.id }, data: req.body }));
});

export const uploadGymLogo = asyncHandler(async (req, res) => {
  await assertGymOwner(req.params.id, req.user.id);
  const logoUrl = await uploadBufferToCloudinary(req.file, "fightid/gym-logos");
  res.json(await prisma.gym.update({ where: { id: req.params.id }, data: { logoUrl } }));
});

export const joinGym = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const gym = await prisma.gym.findUnique({ where: { id: req.params.id } });
  if (!gym) throw new ApiError(404, "Gym not found");
  res.json(await prisma.fighterProfile.update({ where: { id: profile.id }, data: { gymId: gym.id }, include: { gymProfile: true } }));
});

export const leaveGym = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  await prisma.fighterProfile.update({ where: { id: profile.id }, data: { gymId: null } });
  res.status(204).send();
});

export const postMicCheck = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await prisma.challenge.findUnique({ where: { id: req.body.challengeId }, include: { sender: true, receiver: true } });
  if (!challenge) throw new ApiError(404, "Challenge not found");
  if (challenge.status !== "ACCEPTED") throw new ApiError(400, "Mic Checks require an accepted challenge");
  if (![challenge.senderId, challenge.receiverId].includes(profile.id)) throw new ApiError(403, "Only challenge fighters can post Mic Checks");
  const micCheck = await prisma.micCheck.create({ data: { ...req.body, fighterId: profile.id }, include: { fighter: true, challenge: true, reactions: true } });
  const opponent = challenge.senderId === profile.id ? challenge.receiver : challenge.sender;
  await createNotification({ userId: opponent.userId, type: "MIC_CHECK_POSTED", message: `${profile.fullName} just dropped a Mic Check on you 🎤`, relatedEntityId: micCheck.id });
  emitToUser(opponent.userId, "miccheck:new", micCheck);
  res.status(201).json(micCheck);
});

const micCheckInclude = { fighter: true, challenge: { include: { sender: true, receiver: true } }, reactions: true };
const addReactionCounts = (micCheck) => ({
  ...micCheck,
  reactionCounts: micCheck.reactions.reduce((acc, reaction) => ({ ...acc, [reaction.emoji]: (acc[reaction.emoji] || 0) + 1 }), {}),
});

export const micCheckFeed = asyncHandler(async (_req, res) => {
  const items = await prisma.micCheck.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: micCheckInclude });
  res.json(items.map(addReactionCounts));
});

export const micChecksForChallenge = asyncHandler(async (req, res) => {
  const items = await prisma.micCheck.findMany({ where: { challengeId: req.params.challengeId }, orderBy: { createdAt: "desc" }, include: micCheckInclude });
  res.json(items.map(addReactionCounts));
});

export const reactToMicCheck = asyncHandler(async (req, res) => {
  const micCheck = await prisma.micCheck.findUnique({ where: { id: req.params.id } });
  if (!micCheck) throw new ApiError(404, "Mic Check not found");
  const reaction = await prisma.micCheckReaction.upsert({
    where: { micCheckId_userId: { micCheckId: micCheck.id, userId: req.user.id } },
    update: { emoji: req.body.emoji },
    create: { micCheckId: micCheck.id, userId: req.user.id, emoji: req.body.emoji },
  });
  res.json(reaction);
});

export const unreactToMicCheck = asyncHandler(async (req, res) => {
  await prisma.micCheckReaction.deleteMany({ where: { micCheckId: req.params.id, userId: req.user.id } });
  res.status(204).send();
});

export const createTournament = asyncHandler(async (req, res) => {
  const tournament = await prisma.tournament.create({
    data: {
      name: req.body.name,
      weightClass: req.body.weightClass,
      ruleSet: req.body.ruleSet,
      size: req.body.size,
      createdById: req.user.id,
      status: "ACTIVE",
    },
  });
  const rounds = Math.log2(req.body.size);
  for (let round = 1; round <= rounds; round += 1) {
    const matchCount = req.body.size / 2 ** round;
    for (let matchNumber = 1; matchNumber <= matchCount; matchNumber += 1) {
      const firstIndex = (matchNumber - 1) * 2;
      await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          round,
          matchNumber,
          fighter1Id: round === 1 ? req.body.fighterIds[firstIndex] : undefined,
          fighter2Id: round === 1 ? req.body.fighterIds[firstIndex + 1] : undefined,
        },
      });
    }
  }
  res.status(201).json(await prisma.tournament.findUnique({ where: { id: tournament.id }, include: { matches: true } }));
});

export const listTournaments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const where = { ...(req.query.status ? { status: req.query.status } : {}), ...(req.query.weightClass ? { weightClass: req.query.weightClass } : {}) };
  const [data, total] = await Promise.all([
    prisma.tournament.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { matches: true } }),
    prisma.tournament.count({ where }),
  ]);
  res.json({ data, pagination: { page, limit, total } });
});

export const getTournament = asyncHandler(async (req, res) => {
  const tournament = await prisma.tournament.findUnique({ where: { id: req.params.id }, include: { matches: { orderBy: [{ round: "asc" }, { matchNumber: "asc" }], include: { fighter1: true, fighter2: true, winner: true } } } });
  if (!tournament) throw new ApiError(404, "Tournament not found");
  res.json(tournament);
});

export const setTournamentWinner = asyncHandler(async (req, res) => {
  const match = await prisma.tournamentMatch.findUnique({ where: { id: req.params.matchId }, include: { tournament: true } });
  if (!match || match.tournamentId !== req.params.id) throw new ApiError(404, "Match not found");
  if (![match.fighter1Id, match.fighter2Id].includes(req.body.winnerId)) throw new ApiError(400, "Winner must be in this match");
  const updated = await prisma.tournamentMatch.update({ where: { id: match.id }, data: { winnerId: req.body.winnerId, completedAt: new Date() } });
  const next = await prisma.tournamentMatch.findUnique({ where: { tournamentId_round_matchNumber: { tournamentId: match.tournamentId, round: match.round + 1, matchNumber: Math.ceil(match.matchNumber / 2) } } });
  if (next) {
    await prisma.tournamentMatch.update({ where: { id: next.id }, data: match.matchNumber % 2 === 1 ? { fighter1Id: req.body.winnerId } : { fighter2Id: req.body.winnerId } });
  } else {
    await prisma.tournament.update({ where: { id: match.tournamentId }, data: { status: "COMPLETED" } });
  }
  res.json(updated);
});
