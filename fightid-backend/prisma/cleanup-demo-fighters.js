import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoEmailDomains = ["fightbase.app", "fightid.app"];
const demoEventNames = ["FightBase Showcase Baku", "FightID Showcase Baku"];
const demoNotificationText = ["seed data loaded"];

const main = async () => {
  const demoUsers = await prisma.user.findMany({
    where: {
      OR: demoEmailDomains.map((domain) => ({ email: { endsWith: `@${domain}` } })),
    },
    select: { id: true, email: true },
  });

  const demoUserIds = demoUsers.map((user) => user.id);

  if (demoUserIds.length === 0) {
    console.log("No demo users found.");
    return;
  }

  console.log(`Deleting ${demoUserIds.length} demo users:`);
  for (const user of demoUsers) console.log(`- ${user.email}`);

  await prisma.$transaction(async (tx) => {
    await tx.micCheckReaction.deleteMany({ where: { userId: { in: demoUserIds } } });
    await tx.cardCollection.deleteMany({ where: { userId: { in: demoUserIds } } });
    await tx.cornerMan.deleteMany({ where: { userId: { in: demoUserIds } } });
    await tx.notification.deleteMany({
      where: {
        OR: [
          { userId: { in: demoUserIds } },
          ...demoNotificationText.map((text) => ({ message: { contains: text, mode: "insensitive" } })),
        ],
      },
    });
    await tx.refreshToken.deleteMany({ where: { userId: { in: demoUserIds } } });

    await tx.fight.deleteMany({
      where: {
        OR: demoEventNames.map((eventName) => ({ eventName })),
      },
    });

    await tx.user.deleteMany({ where: { id: { in: demoUserIds } } });
  });

  console.log("Demo fighters deleted safely.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
