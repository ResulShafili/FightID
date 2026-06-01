import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoEmailDomains = ["fightbase.app", "fightid.app"];
const demoEventNames = ["FightBase Showcase Baku", "FightID Showcase Baku"];
const demoNotificationText = ["seed data loaded"];
const demoGymNames = ["Baki Combat Club", "Xezer MMA", "Neftci Fight Team", "Bakı Combat Club", "Xəzər MMA", "Neftçi Fight Team"];

const main = async () => {
  const demoUsers = await prisma.user.findMany({
    where: {
      OR: demoEmailDomains.map((domain) => ({ email: { endsWith: `@${domain}` } })),
    },
    select: { id: true, email: true },
  });

  const demoUserIds = demoUsers.map((user) => user.id);

  if (demoUserIds.length > 0) {
    console.log(`Deleting ${demoUserIds.length} demo users:`);
    for (const user of demoUsers) console.log(`- ${user.email}`);
  } else {
    console.log("No demo users found. Checking demo gyms anyway.");
  }

  await prisma.$transaction(async (tx) => {
    if (demoUserIds.length > 0) {
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
    }

    await tx.fight.deleteMany({
      where: {
        OR: demoEventNames.map((eventName) => ({ eventName })),
      },
    });

    if (demoUserIds.length > 0) await tx.user.deleteMany({ where: { id: { in: demoUserIds } } });

    const deletedGyms = await tx.gym.deleteMany({
      where: {
        name: { in: demoGymNames },
        fighters: { none: {} },
      },
    });
    console.log(`Deleted ${deletedGyms.count} empty demo gyms.`);
  });

  console.log("Demo fighters and empty demo gyms deleted safely.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
