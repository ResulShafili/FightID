import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { hashToken, refreshExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { upsertFighterCard } from "../services/cardService.js";
import { evaluateBadges } from "../services/badgeService.js";

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fighterProfile: user.fighterProfile,
});

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: refreshExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, nickname, dateOfBirth, country, weightClass, gym, bio } = req.body;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fighterProfile: {
        create: {
          fullName,
          nickname,
          dateOfBirth,
          country,
          weightClass,
          gym,
          bio,
        },
      },
    },
    include: { fighterProfile: true },
  });

  await upsertFighterCard(user.fighterProfile);
  await evaluateBadges(user.fighterProfile.id);
  const tokens = await issueTokens(user);
  res.status(201).json({ user: publicUser(user), ...tokens });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  res.json({ user: publicUser(user), ...tokens });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueTokens(stored.user);
  res.json(tokens);
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });

  res.status(204).send();
});
