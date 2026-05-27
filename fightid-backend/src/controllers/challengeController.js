import { prisma } from "../lib/prisma.js";
import { createNotification } from "../services/notificationService.js";
import { getProfileForUser } from "../services/profileService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const getChallengeOrThrow = async (id) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      sender: { include: { user: true } },
      receiver: { include: { user: true } },
    },
  });
  if (!challenge) throw new ApiError(404, "Challenge not found");
  return challenge;
};

export const sendChallenge = asyncHandler(async (req, res) => {
  const sender = await getProfileForUser(req.user.id);
  if (sender.id === req.body.receiverId) throw new ApiError(400, "You cannot challenge yourself");

  const receiver = await prisma.fighterProfile.findUnique({
    where: { id: req.body.receiverId },
    include: { user: true },
  });
  if (!receiver) throw new ApiError(404, "Receiver fighter not found");

  const challenge = await prisma.challenge.create({
    data: { ...req.body, senderId: sender.id },
    include: { sender: true, receiver: true },
  });

  await createNotification({
    userId: receiver.userId,
    type: "CHALLENGE_RECEIVED",
    message: `${sender.fullName} challenged you to a ${challenge.ruleSet} fight in ${challenge.location}.`,
    relatedEntityId: challenge.id,
    emailSubject: "New FightID challenge received",
  });

  res.status(201).json(challenge);
});

export const myChallenges = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenges = await prisma.challenge.findMany({
    where: {
      OR: [{ senderId: profile.id }, { receiverId: profile.id }],
    },
    orderBy: { createdAt: "desc" },
    include: { sender: true, receiver: true },
  });

  res.json(challenges);
});

export const acceptChallenge = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await getChallengeOrThrow(req.params.id);
  if (challenge.receiverId !== profile.id) throw new ApiError(403, "Only the receiver can accept this challenge");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: "ACCEPTED" },
    include: { sender: true, receiver: true },
  });

  await createNotification({
    userId: challenge.sender.userId,
    type: "CHALLENGE_ACCEPTED",
    message: `${profile.fullName} accepted your challenge.`,
    relatedEntityId: challenge.id,
    emailSubject: "Your FightID challenge was accepted",
  });

  res.json(updated);
});

export const declineChallenge = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await getChallengeOrThrow(req.params.id);
  if (challenge.receiverId !== profile.id) throw new ApiError(403, "Only the receiver can decline this challenge");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: "DECLINED" },
  });

  await createNotification({
    userId: challenge.sender.userId,
    type: "CHALLENGE_DECLINED",
    message: `${profile.fullName} declined your challenge.`,
    relatedEntityId: challenge.id,
  });

  res.json(updated);
});

export const counterChallenge = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await getChallengeOrThrow(req.params.id);
  if (challenge.receiverId !== profile.id) throw new ApiError(403, "Only the receiver can counter this challenge");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { ...req.body, status: "COUNTERED" },
  });

  await createNotification({
    userId: challenge.sender.userId,
    type: "CHALLENGE_RECEIVED",
    message: `${profile.fullName} sent a counter-offer.`,
    relatedEntityId: challenge.id,
  });

  res.json(updated);
});

export const cancelChallenge = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await getChallengeOrThrow(req.params.id);
  if (challenge.senderId !== profile.id) throw new ApiError(403, "Only the sender can cancel this challenge");
  if (!["PENDING", "COUNTERED"].includes(challenge.status)) throw new ApiError(400, "Only pending or countered challenges can be cancelled");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: "CANCELLED" },
  });

  res.json(updated);
});

export const submitChallengeResult = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id);
  const challenge = await getChallengeOrThrow(req.params.id);
  if (![challenge.senderId, challenge.receiverId].includes(profile.id)) throw new ApiError(403, "Only challenge fighters can submit a result");
  if (challenge.status !== "ACCEPTED" && challenge.status !== "COMPLETED") throw new ApiError(400, "Challenge must be accepted before result submission");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { status: "COMPLETED", resultSubmittedBy: profile.id, resultConfirmed: false },
  });

  const opponentUserId = challenge.senderId === profile.id ? challenge.receiver.userId : challenge.sender.userId;
  await createNotification({
    userId: opponentUserId,
    type: "FIGHT_CONFIRMED",
    message: `${profile.fullName} submitted a challenge result. Please confirm or dispute it.`,
    relatedEntityId: challenge.id,
  });

  res.json(updated);
});

export const confirmChallengeResult = asyncHandler(async (req, res) => {
  const profile = await getProfileForUser(req.user.id).catch(() => null);
  const challenge = await getChallengeOrThrow(req.params.id);
  const isAdmin = ["ADMIN", "FEDERATION_REP"].includes(req.user.role);
  const isOpponent = profile && [challenge.senderId, challenge.receiverId].includes(profile.id) && challenge.resultSubmittedBy !== profile.id;

  if (!isAdmin && !isOpponent) throw new ApiError(403, "Only the opponent or an admin can confirm this result");

  const updated = await prisma.challenge.update({
    where: { id: challenge.id },
    data: { resultConfirmed: true, status: "COMPLETED" },
  });

  await Promise.all([
    createNotification({
      userId: challenge.sender.userId,
      type: "FIGHT_CONFIRMED",
      message: "Challenge result confirmed.",
      relatedEntityId: challenge.id,
    }),
    createNotification({
      userId: challenge.receiver.userId,
      type: "FIGHT_CONFIRMED",
      message: "Challenge result confirmed.",
      relatedEntityId: challenge.id,
    }),
  ]);

  res.json(updated);
});
