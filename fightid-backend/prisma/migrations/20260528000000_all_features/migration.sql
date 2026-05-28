-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AMATEUR', 'PRO', 'FEDERATION_REP', 'ADMIN');

-- CreateEnum
CREATE TYPE "WeightClass" AS ENUM ('STRAWWEIGHT', 'FLYWEIGHT', 'BANTAMWEIGHT', 'FEATHERWEIGHT', 'LIGHTWEIGHT', 'WELTERWEIGHT', 'MIDDLEWEIGHT', 'LIGHT_HEAVYWEIGHT', 'HEAVYWEIGHT');

-- CreateEnum
CREATE TYPE "FightResult" AS ENUM ('WIN', 'LOSS', 'DRAW', 'NO_CONTEST');

-- CreateEnum
CREATE TYPE "FightMethod" AS ENUM ('KO_TKO', 'SUBMISSION', 'DECISION', 'DQ', 'OTHER');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTERED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RuleSet" AS ENUM ('MMA', 'GRAPPLING', 'BOXING', 'MUAY_THAI');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CHALLENGE_RECEIVED', 'CHALLENGE_ACCEPTED', 'CHALLENGE_DECLINED', 'PRO_APPROVED', 'PRO_REJECTED', 'FIGHT_CONFIRMED', 'RANK_CHANGE', 'FIGHTER_WON', 'BADGE_EARNED', 'MIC_CHECK_POSTED');

-- CreateEnum
CREATE TYPE "CardTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'CHAMPION');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('STRIKING', 'GRAPPLING', 'CONDITIONING', 'SPARRING', 'DRILLING', 'RECOVERY', 'OTHER');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_WIN', 'FIRST_KO', 'FIRST_SUBMISSION', 'WIN_STREAK_3', 'WIN_STREAK_5', 'WIN_STREAK_10', 'UNDEFEATED', 'VETERAN_10_FIGHTS', 'VETERAN_25_FIGHTS', 'KO_SPECIALIST', 'SUBMISSION_SPECIALIST', 'DECISION_MASTER', 'POINTS_500', 'POINTS_1000', 'POINTS_2000', 'PLATFORM_PIONEER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AMATEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FighterProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "nickname" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "weightClass" "WeightClass" NOT NULL,
    "gym" TEXT,
    "bio" TEXT,
    "profilePhotoUrl" TEXT,
    "coverPhotoUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "gymId" UUID,
    "seekingSparring" BOOLEAN NOT NULL DEFAULT false,
    "sparringLocation" TEXT,
    "sparringNote" TEXT,
    "isVerifiedPro" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByFederationId" UUID,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FighterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Federation" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "repUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Federation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fight" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentProfileId" UUID,
    "eventName" TEXT NOT NULL,
    "fightDate" TIMESTAMP(3) NOT NULL,
    "result" "FightResult" NOT NULL,
    "method" "FightMethod" NOT NULL,
    "round" INTEGER NOT NULL,
    "fightTime" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "highlightUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "proposedDateFrom" TIMESTAMP(3) NOT NULL,
    "proposedDateTo" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "weightClass" "WeightClass" NOT NULL,
    "ruleSet" "RuleSet" NOT NULL,
    "senderMessage" TEXT,
    "counterOffer" TEXT,
    "resultSubmittedBy" UUID,
    "resultConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FighterCard" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "tier" "CardTier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FighterCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardCollection" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cardId" UUID NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CornerMan" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CornerMan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FightSeek" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "weightClass" "WeightClass" NOT NULL,
    "ruleSet" "RuleSet" NOT NULL,
    "location" TEXT NOT NULL,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FightSeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingLog" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "type" "TrainingType" NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "weightClass" "WeightClass" NOT NULL,
    "ruleSet" "RuleSet" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "size" INTEGER NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "fighter1Id" UUID,
    "fighter2Id" UUID,
    "winnerId" UUID,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FighterBadge" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "type" "BadgeType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FighterBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "ownerId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicCheck" (
    "id" UUID NOT NULL,
    "challengeId" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicCheckReaction" (
    "id" UUID NOT NULL,
    "micCheckId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MicCheckReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProVerificationRequest" (
    "id" UUID NOT NULL,
    "fighterId" UUID NOT NULL,
    "federationId" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT NOT NULL,
    "adminNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProVerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FighterProfile_userId_key" ON "FighterProfile"("userId");

-- CreateIndex
CREATE INDEX "FighterProfile_fullName_idx" ON "FighterProfile"("fullName");

-- CreateIndex
CREATE INDEX "FighterProfile_country_idx" ON "FighterProfile"("country");

-- CreateIndex
CREATE INDEX "FighterProfile_gymId_idx" ON "FighterProfile"("gymId");

-- CreateIndex
CREATE INDEX "FighterProfile_weightClass_idx" ON "FighterProfile"("weightClass");

-- CreateIndex
CREATE INDEX "FighterProfile_seekingSparring_idx" ON "FighterProfile"("seekingSparring");

-- CreateIndex
CREATE INDEX "FighterProfile_isVerifiedPro_weightClass_points_idx" ON "FighterProfile"("isVerifiedPro", "weightClass", "points");

-- CreateIndex
CREATE UNIQUE INDEX "Federation_repUserId_key" ON "Federation"("repUserId");

-- CreateIndex
CREATE INDEX "Federation_country_idx" ON "Federation"("country");

-- CreateIndex
CREATE INDEX "Fight_fighterId_idx" ON "Fight"("fighterId");

-- CreateIndex
CREATE INDEX "Fight_opponentProfileId_idx" ON "Fight"("opponentProfileId");

-- CreateIndex
CREATE INDEX "Fight_fightDate_idx" ON "Fight"("fightDate");

-- CreateIndex
CREATE INDEX "Fight_isVerified_idx" ON "Fight"("isVerified");

-- CreateIndex
CREATE INDEX "Challenge_senderId_idx" ON "Challenge"("senderId");

-- CreateIndex
CREATE INDEX "Challenge_receiverId_idx" ON "Challenge"("receiverId");

-- CreateIndex
CREATE INDEX "Challenge_status_idx" ON "Challenge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FighterCard_fighterId_key" ON "FighterCard"("fighterId");

-- CreateIndex
CREATE INDEX "FighterCard_tier_idx" ON "FighterCard"("tier");

-- CreateIndex
CREATE INDEX "CardCollection_userId_idx" ON "CardCollection"("userId");

-- CreateIndex
CREATE INDEX "CardCollection_cardId_idx" ON "CardCollection"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CardCollection_userId_cardId_key" ON "CardCollection"("userId", "cardId");

-- CreateIndex
CREATE INDEX "CornerMan_fighterId_idx" ON "CornerMan"("fighterId");

-- CreateIndex
CREATE INDEX "CornerMan_userId_idx" ON "CornerMan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CornerMan_userId_fighterId_key" ON "CornerMan"("userId", "fighterId");

-- CreateIndex
CREATE INDEX "FightSeek_weightClass_idx" ON "FightSeek"("weightClass");

-- CreateIndex
CREATE INDEX "FightSeek_ruleSet_idx" ON "FightSeek"("ruleSet");

-- CreateIndex
CREATE INDEX "FightSeek_isActive_expiresAt_idx" ON "FightSeek"("isActive", "expiresAt");

-- CreateIndex
CREATE INDEX "FightSeek_fighterId_idx" ON "FightSeek"("fighterId");

-- CreateIndex
CREATE INDEX "TrainingLog_fighterId_date_idx" ON "TrainingLog"("fighterId", "date");

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "Tournament_weightClass_idx" ON "Tournament"("weightClass");

-- CreateIndex
CREATE INDEX "Tournament_createdById_idx" ON "Tournament"("createdById");

-- CreateIndex
CREATE INDEX "TournamentMatch_tournamentId_idx" ON "TournamentMatch"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentMatch_fighter1Id_idx" ON "TournamentMatch"("fighter1Id");

-- CreateIndex
CREATE INDEX "TournamentMatch_fighter2Id_idx" ON "TournamentMatch"("fighter2Id");

-- CreateIndex
CREATE INDEX "TournamentMatch_winnerId_idx" ON "TournamentMatch"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentMatch_tournamentId_round_matchNumber_key" ON "TournamentMatch"("tournamentId", "round", "matchNumber");

-- CreateIndex
CREATE INDEX "FighterBadge_fighterId_idx" ON "FighterBadge"("fighterId");

-- CreateIndex
CREATE UNIQUE INDEX "FighterBadge_fighterId_type_key" ON "FighterBadge"("fighterId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Gym_name_key" ON "Gym"("name");

-- CreateIndex
CREATE INDEX "Gym_country_idx" ON "Gym"("country");

-- CreateIndex
CREATE INDEX "Gym_name_idx" ON "Gym"("name");

-- CreateIndex
CREATE INDEX "Gym_ownerId_idx" ON "Gym"("ownerId");

-- CreateIndex
CREATE INDEX "MicCheck_challengeId_idx" ON "MicCheck"("challengeId");

-- CreateIndex
CREATE INDEX "MicCheck_fighterId_idx" ON "MicCheck"("fighterId");

-- CreateIndex
CREATE INDEX "MicCheck_createdAt_idx" ON "MicCheck"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MicCheck_challengeId_fighterId_key" ON "MicCheck"("challengeId", "fighterId");

-- CreateIndex
CREATE INDEX "MicCheckReaction_micCheckId_idx" ON "MicCheckReaction"("micCheckId");

-- CreateIndex
CREATE INDEX "MicCheckReaction_userId_idx" ON "MicCheckReaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MicCheckReaction_micCheckId_userId_key" ON "MicCheckReaction"("micCheckId", "userId");

-- CreateIndex
CREATE INDEX "ProVerificationRequest_fighterId_idx" ON "ProVerificationRequest"("fighterId");

-- CreateIndex
CREATE INDEX "ProVerificationRequest_federationId_idx" ON "ProVerificationRequest"("federationId");

-- CreateIndex
CREATE INDEX "ProVerificationRequest_status_idx" ON "ProVerificationRequest"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterProfile" ADD CONSTRAINT "FighterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterProfile" ADD CONSTRAINT "FighterProfile_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterProfile" ADD CONSTRAINT "FighterProfile_verifiedByFederationId_fkey" FOREIGN KEY ("verifiedByFederationId") REFERENCES "Federation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Federation" ADD CONSTRAINT "Federation_repUserId_fkey" FOREIGN KEY ("repUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fight" ADD CONSTRAINT "Fight_opponentProfileId_fkey" FOREIGN KEY ("opponentProfileId") REFERENCES "FighterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_resultSubmittedBy_fkey" FOREIGN KEY ("resultSubmittedBy") REFERENCES "FighterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterCard" ADD CONSTRAINT "FighterCard_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardCollection" ADD CONSTRAINT "CardCollection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardCollection" ADD CONSTRAINT "CardCollection_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "FighterCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CornerMan" ADD CONSTRAINT "CornerMan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CornerMan" ADD CONSTRAINT "CornerMan_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FightSeek" ADD CONSTRAINT "FightSeek_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingLog" ADD CONSTRAINT "TrainingLog_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_fighter1Id_fkey" FOREIGN KEY ("fighter1Id") REFERENCES "FighterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_fighter2Id_fkey" FOREIGN KEY ("fighter2Id") REFERENCES "FighterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "FighterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterBadge" ADD CONSTRAINT "FighterBadge_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicCheck" ADD CONSTRAINT "MicCheck_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicCheck" ADD CONSTRAINT "MicCheck_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicCheckReaction" ADD CONSTRAINT "MicCheckReaction_micCheckId_fkey" FOREIGN KEY ("micCheckId") REFERENCES "MicCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicCheckReaction" ADD CONSTRAINT "MicCheckReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProVerificationRequest" ADD CONSTRAINT "ProVerificationRequest_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "FighterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProVerificationRequest" ADD CONSTRAINT "ProVerificationRequest_federationId_fkey" FOREIGN KEY ("federationId") REFERENCES "Federation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

