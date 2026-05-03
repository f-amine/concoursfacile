import { Webhooks } from "@polar-sh/nextjs";

import { env } from "~/env";
import { db } from "~/server/db";
import { ACCESS_DURATION_MONTHS, PRICE_PER_CONCOURS_MAD } from "~/lib/pricing";

export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderPaid: async ({ data }) => {
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const userId =
      typeof metadata.userId === "string" ? metadata.userId : null;
    const concoursId =
      typeof metadata.concoursId === "string" ? metadata.concoursId : null;

    if (!userId || !concoursId) {
      console.warn(
        `[polar] order.paid ${data.id} missing userId/concoursId metadata; skipping grant`,
      );
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + ACCESS_DURATION_MONTHS);

    await db.userConcours.upsert({
      where: {
        userId_concoursId: { userId, concoursId },
      },
      update: {
        expiresAt,
        polarOrderId: data.id,
        pricePaid: Math.round((data.totalAmount ?? 0) / 100) || PRICE_PER_CONCOURS_MAD,
      },
      create: {
        userId,
        concoursId,
        expiresAt,
        polarOrderId: data.id,
        pricePaid: Math.round((data.totalAmount ?? 0) / 100) || PRICE_PER_CONCOURS_MAD,
      },
    });
  },
});
