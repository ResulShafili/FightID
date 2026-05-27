import { prisma } from "../lib/prisma.js";
import { getLeaderboard } from "../services/rankingService.js";
import { uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { getProfileForUser } from "../services/profileService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const fighterInclude = {
  user: { select: { role: true, email: true } },
  verifiedByFederation: true,
};

export const listFighters = asyncHandler(async (req, res) => {
  const { page, limit, weightClass, country, role, search } = req.query;
  const skip = (page - 1) * limit;
  const isVerifiedPro = role === "PRO" ? true : role === "AMATEUR" ? false : undefined;

  const where = {
    ...(weightClass ? { weightClass } : {}),
    ...(country ? { country } : {}),
    ...(isVerifiedPro !== undefined ? { isVerifiedPro } : {}),
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
      include: fighterInclude,
    }),
    prisma.fighterProfile.count({ where }),
  ]);

  res.json({ data: fighters, pagination: { page, limit, total } });
});

export const getFighter = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({
    where: { id: req.params.id },
    include: {
      ...fighterInclude,
      fights: { orderBy: { fightDate: "desc" } },
    },
  });

  if (!fighter) throw new ApiError(404, "Fighter not found");

  const wins = fighter.fights.filter((fight) => fight.result === "WIN");
  const stats = {
    record: {
      wins: wins.length,
      losses: fighter.fights.filter((fight) => fight.result === "LOSS").length,
      draws: fighter.fights.filter((fight) => fight.result === "DRAW").length,
      noContests: fighter.fights.filter((fight) => fight.result === "NO_CONTEST").length,
    },
    methods: {
      KO_TKO: wins.filter((fight) => fight.method === "KO_TKO").length,
      SUBMISSION: wins.filter((fight) => fight.method === "SUBMISSION").length,
      DECISION: wins.filter((fight) => fight.method === "DECISION").length,
      DQ: wins.filter((fight) => fight.method === "DQ").length,
      OTHER: wins.filter((fight) => fight.method === "OTHER").length,
    },
  };

  res.json({ ...fighter, stats });
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
  const profilePhotoUrl = await uploadBufferToCloudinary(req.file, "fightid/profile-photos");

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
