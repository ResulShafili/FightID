import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  console.error("Refusing to run seed in production because it deletes all existing data.");
  console.error("Set ALLOW_PRODUCTION_SEED=true only for an intentional full production reset.");
  process.exit(1);
}

const profilePhotoUrl = "/assets/fightid-logo.svg";
const coverPhotoUrl = "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1600&q=80";

const federationSeeds = [
  ["rep.amf@fightbase.app", "Azerbaijan MMA Federation", "AZ"],
  ["rep.caspian@fightbase.app", "Caspian Combat League", "AZ"],
  ["rep.bfa@fightbase.app", "Baku Fight Association", "AZ"],
];

const fighterSeeds = [
  {
    email: "reshad.mammadov@fightbase.app",
    fullName: "Rəşad Məmmədov",
    nickname: "Qartal",
    dateOfBirth: "1996-03-14",
    weightClass: "LIGHTWEIGHT",
    gym: "Bakı Combat Club",
    isVerifiedPro: true,
    points: 1420,
  },
  {
    email: "tural.hasanov@fightbase.app",
    fullName: "Tural Həsənov",
    nickname: "Xəzər",
    dateOfBirth: "1994-08-22",
    weightClass: "WELTERWEIGHT",
    gym: "Xəzər MMA",
    isVerifiedPro: true,
    points: 1360,
  },
  {
    email: "elnur.quliyev@fightbase.app",
    fullName: "Elnur Quliyev",
    nickname: "Şimşək",
    dateOfBirth: "1998-01-09",
    weightClass: "MIDDLEWEIGHT",
    gym: "Neftçi Fight Team",
    isVerifiedPro: false,
    points: 980,
  },
  {
    email: "kamran.aliyev@fightbase.app",
    fullName: "Kamran Əliyev",
    nickname: "Daş Yumruq",
    dateOfBirth: "1995-11-30",
    weightClass: "LIGHTWEIGHT",
    gym: "Bakı Combat Club",
    isVerifiedPro: true,
    points: 1285,
  },
  {
    email: "nicat.huseynov@fightbase.app",
    fullName: "Nicat Hüseynov",
    nickname: "Aslan",
    dateOfBirth: "1999-06-18",
    weightClass: "WELTERWEIGHT",
    gym: "Xəzər MMA",
    isVerifiedPro: false,
    points: 910,
  },
  {
    email: "mushfiq.babayev@fightbase.app",
    fullName: "Müşfiq Babayev",
    nickname: "Səssiz",
    dateOfBirth: "1993-04-05",
    weightClass: "MIDDLEWEIGHT",
    gym: "Neftçi Fight Team",
    isVerifiedPro: true,
    points: 1510,
  },
  {
    email: "terlan.ismayilov@fightbase.app",
    fullName: "Tərlan İsmayılov",
    nickname: "Qara Kəmər",
    dateOfBirth: "1997-09-12",
    weightClass: "LIGHTWEIGHT",
    gym: "Bakı Combat Club",
    isVerifiedPro: false,
    points: 870,
  },
  {
    email: "orxan.necefov@fightbase.app",
    fullName: "Orxan Nəcəfov",
    nickname: "Kaspi",
    dateOfBirth: "1992-12-27",
    weightClass: "WELTERWEIGHT",
    gym: "Xəzər MMA",
    isVerifiedPro: true,
    points: 1335,
  },
  {
    email: "behruz.ahmadov@fightbase.app",
    fullName: "Bəhruz Əhmədov",
    nickname: "Polad",
    dateOfBirth: "2000-02-21",
    weightClass: "MIDDLEWEIGHT",
    gym: "Neftçi Fight Team",
    isVerifiedPro: false,
    points: 760,
  },
  {
    email: "ferid.rzayev@fightbase.app",
    fullName: "Fərid Rzayev",
    nickname: "Alov",
    dateOfBirth: "1996-07-07",
    weightClass: "LIGHTWEIGHT",
    gym: "Bakı Combat Club",
    isVerifiedPro: true,
    points: 1395,
  },
];

const fightSeeds = [
  [0, 3, "Baku Grand Prix 2024", "2024-03-16", "WIN", "DECISION", 3, "5:00", true],
  [0, 6, "Caspian Cage Night 12", "2024-06-22", "WIN", "KO_TKO", 2, "3:18", true],
  [0, 9, "Azerbaijan Fight Series", "2025-02-08", "LOSS", "SUBMISSION", 2, "4:02", true],
  [1, 4, "Baku Warriors 9", "2024-02-10", "WIN", "KO_TKO", 1, "2:41", true],
  [1, 7, "Caspian Combat League 18", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [1, 4, "FightBase Showcase Baku", "2025-04-19", "WIN", "DECISION", 3, "5:00", true],
  [2, 5, "Neftçi Fight Open", "2024-01-28", "LOSS", "DECISION", 3, "5:00", true],
  [2, 8, "Baku Amateur Cup", "2024-05-25", "WIN", "SUBMISSION", 2, "3:55", true],
  [2, 5, "Caspian Trials", "2025-01-18", "LOSS", "KO_TKO", 1, "4:12", false],
  [3, 6, "Baku Combat Night", "2023-11-11", "WIN", "SUBMISSION", 1, "4:44", true],
  [3, 9, "Caspian Cage Night 15", "2024-10-05", "LOSS", "DECISION", 3, "5:00", true],
  [4, 7, "Xəzər MMA Open", "2024-04-13", "LOSS", "KO_TKO", 2, "1:59", true],
  [4, 1, "FightBase Showcase Baku", "2025-04-19", "LOSS", "DECISION", 3, "5:00", true],
  [5, 8, "Neftçi Fight League", "2024-07-20", "WIN", "KO_TKO", 2, "2:26", true],
  [5, 2, "Caspian Trials", "2025-01-18", "WIN", "KO_TKO", 1, "4:12", false],
  [6, 0, "Caspian Cage Night 12", "2024-06-22", "LOSS", "KO_TKO", 2, "3:18", true],
  [6, 3, "Baku Combat Night", "2023-11-11", "LOSS", "SUBMISSION", 1, "4:44", true],
  [7, 1, "Caspian Combat League 18", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [8, 2, "Baku Amateur Cup", "2024-05-25", "LOSS", "SUBMISSION", 2, "3:55", true],
  [9, 0, "Azerbaijan Fight Series", "2025-02-08", "WIN", "SUBMISSION", 2, "4:02", true],
];

const challengeSeeds = [
  [0, 9, "PENDING", "2026-06-12", "2026-06-26", "Baku, Azerbaijan", "LIGHTWEIGHT", "MMA", "Main-card rematch in Baku."],
  [1, 7, "ACCEPTED", "2026-07-05", "2026-07-12", "Sumqayit, Azerbaijan", "WELTERWEIGHT", "MMA", "Three rounds under pro MMA rules."],
  [2, 8, "COUNTERED", "2026-06-20", "2026-07-04", "Ganja, Azerbaijan", "MIDDLEWEIGHT", "GRAPPLING", "Submission-only test match."],
  [3, 6, "DECLINED", "2026-08-01", "2026-08-15", "Baku, Azerbaijan", "LIGHTWEIGHT", "BOXING", "Striking bout before the autumn season."],
  [5, 2, "COMPLETED", "2026-05-01", "2026-05-08", "Baku, Azerbaijan", "MIDDLEWEIGHT", "MMA", "Verified result from Neftçi Fight League."],
];

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[əƏ]/g, "e")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[öÖ]/g, "o")
    .replace(/[üÜ]/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");
}

async function main() {
  await prisma.micCheckReaction.deleteMany();
  await prisma.micCheck.deleteMany();
  await prisma.tournamentMatch.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.trainingLog.deleteMany();
  await prisma.fightSeek.deleteMany();
  await prisma.cornerMan.deleteMany();
  await prisma.cardCollection.deleteMany();
  await prisma.fighterCard.deleteMany();
  await prisma.fighterBadge.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.proVerificationRequest.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.fight.deleteMany();
  await prisma.fighterProfile.deleteMany();
  await prisma.federation.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: { email: "admin@fightbase.app", passwordHash, role: "ADMIN" },
  });

  const federations = [];
  for (const [email, name, country] of federationSeeds) {
    const repUser = await prisma.user.create({
      data: { email, passwordHash, role: "FEDERATION_REP" },
    });

    const federation = await prisma.federation.create({
      data: { name, country, repUserId: repUser.id },
    });

    federations.push(federation);
  }

  const gyms = await Promise.all([
    prisma.gym.create({ data: { name: "Baki Combat Club", country: "AZ", city: "Baku", ownerId: admin.id, description: "Elite MMA training room in Baku." } }),
    prisma.gym.create({ data: { name: "Xezer MMA", country: "AZ", city: "Baku", description: "Caspian grappling and striking team." } }),
    prisma.gym.create({ data: { name: "Neftci Fight Team", country: "AZ", city: "Baku", description: "High-output fight camp for amateur and pro fighters." } }),
  ]);

  const profiles = [];
  for (let index = 0; index < fighterSeeds.length; index += 1) {
    const fighter = fighterSeeds[index];
    const federation = federations[index % federations.length];
    const handle = slugify(fighter.fullName);

    const user = await prisma.user.create({
      data: {
        email: fighter.email,
        passwordHash,
        role: fighter.isVerifiedPro ? "PRO" : "AMATEUR",
        fighterProfile: {
          create: {
            fullName: fighter.fullName,
            nickname: fighter.nickname,
            dateOfBirth: new Date(fighter.dateOfBirth),
            country: "AZ",
            weightClass: fighter.weightClass,
            gym: fighter.gym,
            gymId: gyms[index % gyms.length].id,
            bio: `${fighter.fullName} is an Azerbaijani ${fighter.weightClass.toLowerCase().replace("_", " ")} fighter representing ${fighter.gym}.`,
            profilePhotoUrl,
            coverPhotoUrl,
            instagramUrl: `https://instagram.com/${handle}`,
            youtubeUrl: `https://youtube.com/@${handle}`,
            isVerifiedPro: fighter.isVerifiedPro,
            verifiedByFederationId: fighter.isVerifiedPro ? federation.id : undefined,
            points: fighter.points,
            seekingSparring: index % 3 === 0,
            sparringLocation: index % 3 === 0 ? "Baku" : undefined,
            sparringNote: index % 3 === 0 ? "Technical sparring, 3 rounds preferred." : undefined,
          },
        },
      },
      include: { fighterProfile: true },
    });

    profiles.push(user.fighterProfile);
  }

  const cards = [];
  for (const profile of profiles) {
    const tier = profile.points >= 2000 ? "CHAMPION" : profile.points >= 1000 ? "GOLD" : profile.points >= 500 ? "SILVER" : "BRONZE";
    cards.push(await prisma.fighterCard.create({ data: { fighterId: profile.id, tier } }));
  }

  for (const [fighterIndex, opponentIndex, eventName, fightDate, result, method, round, fightTime, isVerified] of fightSeeds) {
    const fighter = profiles[fighterIndex];
    const opponent = profiles[opponentIndex];

    await prisma.fight.create({
      data: {
        fighterId: fighter.id,
        opponentName: opponent.fullName,
        opponentProfileId: opponent.id,
        eventName,
        fightDate: new Date(fightDate),
        result,
        method,
        round,
        fightTime,
        isVerified,
      },
    });
  }

  const challenges = [];
  for (const [senderIndex, receiverIndex, status, proposedDateFrom, proposedDateTo, location, weightClass, ruleSet, senderMessage] of challengeSeeds) {
    const sender = profiles[senderIndex];
    const receiver = profiles[receiverIndex];

    const challenge = await prisma.challenge.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        status,
        proposedDateFrom: new Date(proposedDateFrom),
        proposedDateTo: new Date(proposedDateTo),
        location,
        weightClass,
        ruleSet,
        senderMessage,
        counterOffer: status === "COUNTERED" ? "Move it to Baku and make it MMA rules." : undefined,
        resultSubmittedBy: status === "COMPLETED" ? sender.id : undefined,
        resultConfirmed: status === "COMPLETED",
      },
    });
    challenges.push(challenge);
  }

  await prisma.cardCollection.createMany({ data: [{ userId: profiles[0].userId, cardId: cards[1].id }, { userId: profiles[1].userId, cardId: cards[0].id }, { userId: profiles[2].userId, cardId: cards[5].id }] });
  await prisma.cornerMan.createMany({ data: [{ userId: profiles[4].userId, fighterId: profiles[0].id }, { userId: profiles[6].userId, fighterId: profiles[1].id }, { userId: profiles[8].userId, fighterId: profiles[5].id }] });
  await prisma.fighterBadge.createMany({ data: [{ fighterId: profiles[0].id, type: "FIRST_WIN" }, { fighterId: profiles[0].id, type: "POINTS_1000" }, { fighterId: profiles[5].id, type: "FIRST_KO" }] });
  await prisma.fightSeek.createMany({ data: [{ fighterId: profiles[0].id, weightClass: "LIGHTWEIGHT", ruleSet: "MMA", location: "Baku", dateFrom: new Date("2026-06-01"), dateTo: new Date("2026-06-30"), expiresAt: new Date("2026-07-01"), message: "Looking for a ranked lightweight." }, { fighterId: profiles[1].id, weightClass: "WELTERWEIGHT", ruleSet: "GRAPPLING", location: "Baku", dateFrom: new Date("2026-07-01"), dateTo: new Date("2026-07-15"), expiresAt: new Date("2026-07-31"), message: "Grappling super fight wanted." }] });
  await prisma.trainingLog.createMany({ data: [{ fighterId: profiles[0].id, type: "STRIKING", durationMins: 90, note: "Pad work and cage exits." }, { fighterId: profiles[0].id, type: "SPARRING", durationMins: 60, note: "Five technical rounds." }, { fighterId: profiles[5].id, type: "GRAPPLING", durationMins: 75, note: "Back control rounds." }] });
  await prisma.micCheck.create({ data: { challengeId: challenges[1].id, fighterId: profiles[1].id, message: "I respect the work, but this cage belongs to me.", videoUrl: "https://youtu.be/dQw4w9WgXcQ" } });

  const tournament = await prisma.tournament.create({ data: { name: "Baku Lightweight Grand Prix", weightClass: "LIGHTWEIGHT", ruleSet: "MMA", size: 4, status: "ACTIVE", createdById: admin.id } });
  await prisma.tournamentMatch.createMany({
    data: [
      { tournamentId: tournament.id, round: 1, matchNumber: 1, fighter1Id: profiles[0].id, fighter2Id: profiles[3].id },
      { tournamentId: tournament.id, round: 1, matchNumber: 2, fighter1Id: profiles[6].id, fighter2Id: profiles[9].id },
      { tournamentId: tournament.id, round: 2, matchNumber: 1 },
    ],
  });

  await prisma.proVerificationRequest.create({
    data: {
      fighterId: profiles[2].id,
      federationId: federations[0].id,
      documentUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
      status: "PENDING",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: "RANK_CHANGE",
        message: "Azerbaijani FightBase seed data loaded successfully.",
      },
      {
        userId: profiles[9].userId,
        type: "CHALLENGE_RECEIVED",
        message: "Rəşad Məmmədov challenged you to a lightweight MMA bout in Baku.",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("FightBase Azerbaijani seed data created.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
