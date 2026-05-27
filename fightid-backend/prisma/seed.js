import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const weightClasses = ["FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT"];

const fighters = [
  ["darya@fightid.app", "Darya Volkova", "The Switch", "AZ", "FLYWEIGHT", true, 1840],
  ["marco@fightid.app", "Marco Santos", "North Star", "BR", "BANTAMWEIGHT", true, 1715],
  ["elias@fightid.app", "Elias Kane", "The Ledger", "US", "WELTERWEIGHT", false, 1520],
  ["leyla@fightid.app", "Leyla Imanova", "Iron Silk", "AZ", "FLYWEIGHT", true, 1480],
  ["mira@fightid.app", "Mira Petrova", "No Mercy", "BG", "FLYWEIGHT", false, 1310],
  ["tomasz@fightid.app", "Tomasz Nowak", "Husaria", "PL", "WELTERWEIGHT", false, 1195],
  ["aylin@fightid.app", "Aylin Demir", "Red Line", "TR", "BANTAMWEIGHT", true, 1660],
  ["niko@fightid.app", "Niko Orlova", "Black Sea", "GE", "FEATHERWEIGHT", false, 990],
  ["samir@fightid.app", "Samir Haddad", "Atlas", "MA", "LIGHTWEIGHT", true, 1580],
  ["keon@fightid.app", "Keon Brooks", "Static", "US", "LIGHTWEIGHT", false, 880],
];

const fightMethods = ["KO_TKO", "SUBMISSION", "DECISION", "DQ", "OTHER"];
const fightResults = ["WIN", "LOSS", "DRAW", "WIN", "WIN"];

async function main() {
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
    data: { email: "admin@fightid.app", passwordHash, role: "ADMIN" },
  });

  const repUsers = await Promise.all(
    [
      ["rep.az@fightid.app", "FEDERATION_REP"],
      ["rep.br@fightid.app", "FEDERATION_REP"],
      ["rep.us@fightid.app", "FEDERATION_REP"],
    ].map(([email, role]) => prisma.user.create({ data: { email, passwordHash, role } })),
  );

  const federations = await Promise.all([
    prisma.federation.create({
      data: { name: "Azerbaijan MMA Federation", country: "AZ", repUserId: repUsers[0].id },
    }),
    prisma.federation.create({
      data: { name: "Brazilian Combat Sports Commission", country: "BR", repUserId: repUsers[1].id },
    }),
    prisma.federation.create({
      data: { name: "United States Amateur MMA Federation", country: "US", repUserId: repUsers[2].id },
    }),
  ]);

  const profiles = [];
  for (let index = 0; index < fighters.length; index += 1) {
    const [email, fullName, nickname, country, weightClass, isVerifiedPro, points] = fighters[index];
    const federation = federations.find((item) => item.country === country) || federations[index % federations.length];
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: isVerifiedPro ? "PRO" : "AMATEUR",
        fighterProfile: {
          create: {
            fullName,
            nickname,
            dateOfBirth: new Date(1995 + (index % 8), index % 12, 10 + index),
            country,
            weightClass,
            gym: `${country} Combat Lab`,
            bio: `${fullName} is a ${weightClass.toLowerCase().replace("_", " ")} fighter seeded for FightID development data.`,
            profilePhotoUrl: `https://res.cloudinary.com/demo/image/upload/sample-${(index % 5) + 1}.jpg`,
            coverPhotoUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            instagramUrl: `https://instagram.com/${fullName.toLowerCase().replaceAll(" ", ".")}`,
            youtubeUrl: `https://youtube.com/@${fullName.toLowerCase().replaceAll(" ", "")}`,
            isVerifiedPro,
            verifiedByFederationId: isVerifiedPro ? federation.id : undefined,
            points,
          },
        },
      },
      include: { fighterProfile: true },
    });

    profiles.push(user.fighterProfile);
  }

  for (let index = 0; index < 20; index += 1) {
    const fighter = profiles[index % profiles.length];
    const opponent = profiles[(index + 3) % profiles.length];
    await prisma.fight.create({
      data: {
        fighterId: fighter.id,
        opponentName: opponent.fullName,
        opponentProfileId: opponent.id,
        eventName: `FightID Regional Series ${index + 1}`,
        fightDate: new Date(2025, index % 12, 5 + (index % 20)),
        result: fightResults[index % fightResults.length],
        method: fightMethods[index % fightMethods.length],
        round: (index % 3) + 1,
        fightTime: `${2 + (index % 3)}:${String(10 + index).padStart(2, "0")}`,
        isVerified: index < 16,
      },
    });
  }

  for (let index = 0; index < 5; index += 1) {
    await prisma.challenge.create({
      data: {
        senderId: profiles[index].id,
        receiverId: profiles[index + 5].id,
        status: ["PENDING", "ACCEPTED", "COUNTERED", "DECLINED", "COMPLETED"][index],
        proposedDateFrom: new Date(2026, 5, 10 + index),
        proposedDateTo: new Date(2026, 5, 17 + index),
        location: ["Baku, AZ", "Rio de Janeiro, BR", "Austin, US", "Warsaw, PL", "Tbilisi, GE"][index],
        weightClass: weightClasses[index % weightClasses.length],
        ruleSet: ["MMA", "GRAPPLING", "BOXING", "MUAY_THAI", "MMA"][index],
        senderMessage: "Open challenge for a verified FightID matchup.",
        counterOffer: index === 2 ? "Can move the fight one week later." : undefined,
        resultSubmittedBy: index === 4 ? profiles[index].id : undefined,
        resultConfirmed: index === 4,
      },
    });
  }

  await prisma.proVerificationRequest.create({
    data: {
      fighterId: profiles[2].id,
      federationId: federations[2].id,
      documentUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      type: "RANK_CHANGE",
      message: "Seed data loaded successfully.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("FightID seed data created.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
