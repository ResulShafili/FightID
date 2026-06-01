import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { hashToken, refreshExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { upsertFighterCard } from "../services/cardService.js";
import { evaluateBadges } from "../services/badgeService.js";
import { isEmailConfigured, sendEmailWithResult } from "../services/emailService.js";

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fighterProfile: user.fighterProfile,
});

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge,
});

const parseCookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const [key, ...value] = item.split("=");
        return [key, decodeURIComponent(value.join("="))];
      }),
  );

const setAuthCookies = (res, tokens) => {
  res.cookie("auth_token", tokens.accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie("refresh_token", tokens.refreshToken, cookieOptions(30 * 24 * 60 * 60 * 1000));
};

const clearAuthCookies = (res) => {
  const options = cookieOptions(0);
  res.clearCookie("auth_token", options);
  res.clearCookie("refresh_token", options);
};

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

  const emailResult = await sendEmailWithResult({
    to: user.email,
    subject: purpose === "REGISTER" ? "FightBase qeydiyyat kodu" : "FightBase giriş kodu",
    text: `Your FightBase verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>FightBase kodunuz: <strong>${code}</strong></p><p>Bu kod 10 dəqiqə ərzində keçərlidir.</p>`,
  });

  if (!emailResult.sent && process.env.NODE_ENV === "production") {
    const message = isEmailConfigured()
      ? `Email could not be sent: ${emailResult.error}. Check RESEND_API_KEY, EMAIL_FROM and Railway logs.`
      : "Email service is not configured. Set RESEND_API_KEY and EMAIL_FROM in Railway backend variables.";
    throw new ApiError(503, message);
  }

  return {
    emailSent: emailResult.sent,
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
          dateOfBirth: dateOfBirth || new Date("2000-01-01"),
          country: country || "AZ",
          weightClass: weightClass || "LIGHTWEIGHT",
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
  setAuthCookies(res, tokens);
  res.status(201).json({ user: publicUser(user), ...tokens });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens);
  res.json({ user: publicUser(user), ...tokens });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });

  if (!user) {
    res.json({ message: "If this email exists, a reset code has been sent." });
    return;
  }

  const delivery = await sendEmailCode(user, "PASSWORD_RESET");
  res.json({
    email: user.email,
    message: "Password reset code sent to your email.",
    ...delivery,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, include: { fighterProfile: true } });
  if (!user) {
    throw new ApiError(401, "Invalid or expired verification code");
  }

  const storedCode = await prisma.emailVerificationCode.findFirst({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!storedCode || !(await bcrypt.compare(code, storedCode.codeHash))) {
    throw new ApiError(401, "Invalid or expired verification code");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.emailVerificationCode.update({
      where: { id: storedCode.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  const tokens = await issueTokens(user);
  setAuthCookies(res, tokens);
  res.json({ user: publicUser(user), ...tokens });
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
  setAuthCookies(res, tokens);
  res.json({ user: publicUser(user), ...tokens });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { fighterProfile: true },
  });

  if (!user) {
    throw new ApiError(401, "Authenticated user no longer exists");
  }

  res.json({ user: publicUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const cookies = parseCookies(req);
  const refreshToken = req.body?.refreshToken || cookies.refresh_token;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

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

  const updatedUser = await prisma.user.findUnique({
    where: { id: stored.userId },
    include: { fighterProfile: true },
  });
  const tokens = await issueTokens(updatedUser);
  setAuthCookies(res, tokens);
  res.json({ user: publicUser(updatedUser), ...tokens });
});

export const logout = asyncHandler(async (req, res) => {
  const cookies = parseCookies(req);
  const refreshToken = req.body?.refreshToken || cookies.refresh_token;

  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  clearAuthCookies(res);
  res.status(204).send();
});
