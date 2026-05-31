import { prisma } from "../lib/prisma.js";
import { getLeaderboard } from "../services/rankingService.js";
import { uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { getProfileForUser } from "../services/profileService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const fighterInclude = {
  user: { select: { role: true, email: true } },
  verifiedByFederation: true,
  gymProfile: true,
  cornerMen: true,
};

const statsForFights = (fights) => {
  const wins = fights.filter((fight) => fight.result === "WIN");
  const stats = {
    record: {
      wins: wins.length,
      losses: fights.filter((fight) => fight.result === "LOSS").length,
      draws: fights.filter((fight) => fight.result === "DRAW").length,
      noContests: fights.filter((fight) => fight.result === "NO_CONTEST").length,
    },
    methods: {
      KO_TKO: wins.filter((fight) => fight.method === "KO_TKO").length,
      SUBMISSION: wins.filter((fight) => fight.method === "SUBMISSION").length,
      DECISION: wins.filter((fight) => fight.method === "DECISION").length,
      DQ: wins.filter((fight) => fight.method === "DQ").length,
      OTHER: wins.filter((fight) => fight.method === "OTHER").length,
    },
  };
  const totalWins = stats.record.wins;
  const koRatio = totalWins > 0 ? stats.methods.KO_TKO / totalWins : 0;
  const subRatio = totalWins > 0 ? stats.methods.SUBMISSION / totalWins : 0;
  const decRatio = totalWins > 0 ? stats.methods.DECISION / totalWins : 0;
  let style = "BALANCED";
  if (koRatio >= 0.5) style = "STRIKER";
  else if (subRatio >= 0.5) style = "GRAPPLER";
  else if (decRatio >= 0.6) style = "TECHNICIAN";
  else if (totalWins === 0) style = "UNPROVEN";
  return { stats, style };
};

export const listFighters = asyncHandler(async (req, res) => {
  const { weightClass, country, role, search, seekingSparring } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const isVerifiedPro = role === "PRO" ? true : role === "AMATEUR" ? false : undefined;

  const where = {
    ...(weightClass ? { weightClass } : {}),
    ...(country ? { country } : {}),
    ...(isVerifiedPro !== undefined ? { isVerifiedPro } : {}),
    ...(seekingSparring === "true" ? { seekingSparring: true } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { nickname: { contains: search, mode: "insensitive" } },
            { gym: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [fighters, total] = await Promise.all([
    prisma.fighterProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ points: "desc" }, { fullName: "asc" }],
      include: { ...fighterInclude, fights: { where: { isVerified: true } } },
    }),
    prisma.fighterProfile.count({ where }),
  ]);

  res.json({ data: fighters.map((fighter) => ({ ...fighter, ...statsForFights(fighter.fights), cornerCount: fighter.cornerMen.length })), pagination: { page, limit, total } });
});

export const getFighter = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({
    where: { id: req.params.id },
    include: {
      ...fighterInclude,
      fights: { orderBy: { fightDate: "desc" } },
      badges: true,
      fighterCard: true,
    },
  });

  if (!fighter) throw new ApiError(404, "Fighter not found");

  res.json({ ...fighter, ...statsForFights(fighter.fights), cornerCount: fighter.cornerMen.length });
});

export const updateMe = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const updated = await prisma.fighterProfile.update({
    where: { id: profile.id },
    data: req.body,
    include: fighterInclude,
  });

  res.json(updated);
});

export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const profilePhotoUrl = await uploadBufferToCloudinary(req.file, "fightbase/profile-photos");

  const updated = await prisma.fighterProfile.update({
    where: { id: profile.id },
    data: { profilePhotoUrl },
  });

  res.json(updated);
});

export const leaderboard = asyncHandler(async (req, res) => {
  const result = await getLeaderboard(req.query);
  res.json(result);
});

export const rivals = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({ where: { id: req.params.id } });
  if (!fighter) throw new ApiError(404, "Fighter not found");

  const data = await prisma.fighterProfile.findMany({
    where: {
      id: { not: fighter.id },
      weightClass: fighter.weightClass,
      points: { gte: Math.max(0, fighter.points - 200), lte: fighter.points + 200 },
    },
    include: { ...fighterInclude, fights: { where: { isVerified: true } } },
  });

  res.json(data
    .map((item) => ({ ...item, ...statsForFights(item.fights), pointGap: Math.abs(item.points - fighter.points) }))
    .sort((a, b) => a.pointGap - b.pointGap)
    .slice(0, 5));
});
