import cron from "node-cron";
import { prisma } from "../lib/prisma";

export const startEventStatusCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    console.log(`[CRON START] ${now.toISOString()}`);

    try {
      const exists = await prisma.event.findFirst({
        where: {
          isDeleted: false,
          OR: [
            {
              status: "UPCOMING",
              startDateTime: { not: null, lte: now },
            },
            {
              status: { in: ["UPCOMING", "ONGOING"] },
              endDateTime: { not: null, lt: now },
            },
          ],
        },
      });

      if (!exists) {
        console.log("[CRON SKIP] No events to update");
        return;
      }

      const ongoingUpdate = await prisma.event.updateMany({
        where: {
          startDateTime: { not: null, lte: now },
          endDateTime: { not: null, gte: now },
          status: "UPCOMING",
          isDeleted: false,
        },
        data: { status: "ONGOING" },
      });

      const endedUpdate = await prisma.event.updateMany({
        where: {
          endDateTime: { not: null, lt: now },
          status: { in: ["UPCOMING", "ONGOING"] },
          isDeleted: false,
        },
        data: { status: "ENDED" },
      });

      console.log(
        `[CRON SUCCESS] ONGOING: ${ongoingUpdate.count}, ENDED: ${endedUpdate.count}`,
      );
    } catch (error) {
      console.error("[CRON ERROR]", error);
    }
  });

  console.log("[CRON INIT] Running every 5 minutes");
};
