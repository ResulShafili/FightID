import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { hashToken, refreshExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { upsertFighterCard } from "../services/cardService.js";
import { evaluateBadges } from "../services/badgeService.js";
import { sendEmail } from "../services/emailService.js";

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

const createEmailCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendEmailCode = async (user, purpose) => {
  const code = createEmailCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerificationCode.updateMany({
    where: { userId: user.id, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.emailVerificationCode.create({
    data: {
      userId: user.id,
      purpose,
      codeHash,
      expiresAt,
    },
  });

  const emailSent = await sendEmail({
    to: user.email,
    subject: purpose === "REGISTER" ? "Your FightID registration code" : "Your FightID login code",
    text: `Your FightID verification code is ${code}. It expires in 10 minutes.`,
  });

  return {
    emailSent,
    ...(process.env.NODE_ENV === "production" ? {} : { devCode: code }),
  };
};

const authPendingResponse = async (res, user, purpose) => {
  const delivery = await sendEmailCode(user, purpose);
  res.status(202).json({
    requiresEmailCode: true,
    purpose,
    email: user.email,
    message: "Verification code sent to your email.",
    ...delivery,
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, nickname, dateOfBirth, country, weightClass, gym, bio } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

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
  await authPendingResponse(res, user, "REGISTER");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  await authPendingResponse(res, user, "LOGIN");
});

export const verifyEmailCode = asyncHandler(async (req, res) => {
  const { email, code, purpose } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });
  if (!user) {
    throw new ApiError(401, "Invalid verification code");
  }

  const storedCode = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!storedCode || !(await bcrypt.compare(code, storedCode.codeHash))) {
    throw new ApiError(401, "Invalid or expired verification code");
  }

  await prisma.emailVerificationCode.update({
    where: { id: storedCode.id },
    data: { consumedAt: new Date() },
  });

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
