import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const platformStats = asyncHandler(async (_req, res) => {
  const [totalFighters, fightsLogged, activeChallenges, proCount] = await Promise.all([
    prisma.fighterProfile.count(),
    prisma.fight.count(),
    prisma.challenge.count({ where: { status: { in: ["PENDING", "ACCEPTED", "COUNTERED"] } } }),
    prisma.fighterProfile.count({ where: { isVerifiedPro: true } }),
  ]);

  res.json({ totalFighters, fightsLogged, activeChallenges, proCount });
});

export const adminFighters = asyncHandler(async (req, res) => {
  const { page, limit, weightClass, country, role, search } = req.query;
  const skip = (page - 1) * limit;
  const isVerifiedPro = role === "PRO" ? true : role === "AMATEUR" ? false : undefined;

  const where = {
    ...(weightClass ? { weightClass } : {}),
    ...(country ? { country } : {}),
    ...(isVerifiedPro !== undefined ? { isVerifiedPro } : {}),
    ...(search ? { fullName: { contains: search, mode: "insensitive" } } : {}),
  };

  const [fighters, total] = await Promise.all([
    prisma.fighterProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true, verifiedByFederation: true },
    }),
    prisma.fighterProfile.count({ where }),
  ]);

  res.json({ data: fighters, pagination: { page, limit, total } });
});

export const updateFighterRole = asyncHandler(async (req, res) => {
  const fighter = await prisma.fighterProfile.findUnique({ where: { id: req.params.id } });
  if (!fighter) throw new ApiError(404, "Fighter not found");

  const user = await prisma.user.update({
    where: { id: fighter.userId },
    data: { role: req.body.role },
  });

  const updated = await prisma.fighterProfile.update({
    where: { id: fighter.id },
    data: { isVerifiedPro: req.body.role === "PRO" },
    include: { user: true },
  });

  res.json({ ...updated, user });
});

// Fights across all fighters, so reviewers can work an unverified queue.
// Without this there is no way to reach PUT /fights/:id/verify.
export const adminFights = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const where = req.query.isVerified === undefined ? {} : { isVerified: req.query.isVerified === "true" };

  const [fights, total] = await Promise.all([
    prisma.fight.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isVerified: "asc" }, { fightDate: "desc" }],
      include: { fighter: { select: { id: true, fullName: true, profilePhotoUrl: true, weightClass: true, country: true } } },
    }),
    prisma.fight.count({ where }),
  ]);

  res.json({ data: fights, pagination: { page, limit, total } });
});

export const adminDeleteFight = asyncHandler(async (req, res) => {
  await prisma.fight.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
