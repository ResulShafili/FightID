import { prisma } from "../lib/prisma.js";
import { uploadBufferToCloudinary } from "../services/cloudinaryService.js";
import { createNotification } from "../services/notificationService.js";
import { getProfileForUser } from "../services/profileService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

const canReviewFederation = (user, request) => {
  if (user.role === "ADMIN") return true;
  if (user.role !== "FEDERATION_REP") return false;
  return request.federation.repUserId === user.id;
};

export const applyForPro = asyncHandler(async (req, res) => {
  const fighter = await getProfileForUser(req.user.id);
  const documentUrl = await uploadBufferToCloudinary(req.file, "fightid/verification-documents");

  const request = await prisma.proVerificationRequest.create({
    data: {
      fighterId: fighter.id,
      federationId: req.body.federationId,
      documentUrl,
    },
    include: { federation: true, fighter: true },
  });

  res.status(201).json(request);
});

export const pendingRequests = asyncHandler(async (req, res) => {
  const federationWhere = req.user.role === "FEDERATION_REP" ? { repUserId: req.user.id } : {};
  const requests = await prisma.proVerificationRequest.findMany({
    where: {
      status: "PENDING",
      federation: federationWhere,
    },
    orderBy: { createdAt: "asc" },
    include: { fighter: { include: { user: true } }, federation: true },
  });

  res.json(requests);
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await prisma.proVerificationRequest.findUnique({
    where: { id: req.params.id },
    include: { federation: true, fighter: { include: { user: true } } },
  });
  if (!request) throw new ApiError(404, "Verification request not found");
  if (!canReviewFederation(req.user, request)) throw new ApiError(403, "You cannot review this request");

  const [updated] = await prisma.$transaction([
    prisma.proVerificationRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", reviewedAt: new Date(), adminNote: req.body?.adminNote },
    }),
    prisma.fighterProfile.update({
      where: { id: request.fighterId },
      data: { isVerifiedPro: true, verifiedByFederationId: request.federationId },
    }),
    prisma.user.update({
      where: { id: request.fighter.userId },
      data: { role: "PRO" },
    }),
  ]);

  await createNotification({
    userId: request.fighter.userId,
    type: "PRO_APPROVED",
    message: `Your Pro verification was approved by ${request.federation.name}.`,
    relatedEntityId: request.id,
    emailSubject: "FightID Pro verification approved",
  });

  res.json(updated);
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const request = await prisma.proVerificationRequest.findUnique({
    where: { id: req.params.id },
    include: { federation: true, fighter: { include: { user: true } } },
  });
  if (!request) throw new ApiError(404, "Verification request not found");
  if (!canReviewFederation(req.user, request)) throw new ApiError(403, "You cannot review this request");

  const updated = await prisma.proVerificationRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", reviewedAt: new Date(), adminNote: req.body.adminNote },
  });

  await createNotification({
    userId: request.fighter.userId,
    type: "PRO_REJECTED",
    message: `Your Pro verification was rejected. Note: ${req.body.adminNote}`,
    relatedEntityId: request.id,
    emailSubject: "FightID Pro verification update",
  });

  res.json(updated);
});
