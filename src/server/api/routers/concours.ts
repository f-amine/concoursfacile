import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { hasConcoursAccess } from "~/lib/access";
import { PRICE_PER_CONCOURS_MAD, ACCESS_DURATION_MONTHS } from "~/lib/pricing";
import { getPolar } from "~/server/polar";
import { env } from "~/env";

export const concoursRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    const concours = await ctx.db.concours.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        _count: {
          select: { subjects: true },
        },
      },
    });

    if (!ctx.session?.user) {
      return concours.map((c) => ({ ...c, hasAccess: false }));
    }

    const owned = await ctx.db.userConcours.findMany({
      where: {
        userId: ctx.session.user.id,
        concoursId: { in: concours.map((c) => c.id) },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { concoursId: true },
    });
    const ownedSet = new Set(owned.map((o) => o.concoursId));

    return concours.map((c) => ({ ...c, hasAccess: ownedSet.has(c.id) }));
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const concours = await ctx.db.concours.findUnique({
        where: { slug: input.slug },
        include: {
          subjects: {
            where: { isActive: true },
            orderBy: { order: "asc" },
            include: {
              _count: {
                select: { chapters: true },
              },
            },
          },
        },
      });
      if (!concours) return null;

      const hasAccess = ctx.session?.user
        ? await hasConcoursAccess(ctx.db, ctx.session.user.id, {
            concoursId: concours.id,
          })
        : false;

      return {
        ...concours,
        hasAccess,
        priceMad: PRICE_PER_CONCOURS_MAD,
        accessMonths: ACCESS_DURATION_MONTHS,
      };
    }),

  createCheckout: protectedProcedure
    .input(z.object({ concoursId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const concours = await ctx.db.concours.findUnique({
        where: { id: input.concoursId },
        select: { id: true, name: true, slug: true, polarProductId: true },
      });
      if (!concours) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!concours.polarProductId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Produit Polar non configure pour ce concours. Contactez l'administrateur.",
        });
      }

      const appUrl = env.NEXT_PUBLIC_APP_URL ?? "";
      const polar = getPolar();
      const checkout = await polar.checkouts.create({
        products: [concours.polarProductId],
        customerEmail: ctx.session.user.email,
        successUrl: `${appUrl}/cours/${concours.slug}?checkout=success`,
        metadata: {
          userId: ctx.session.user.id,
          concoursId: concours.id,
        },
      });

      return { url: checkout.url };
    }),

  // Dev-only self-grant. Gate behind ALLOW_FREE_GRANT=true so prod stays safe.
  devGrant: protectedProcedure
    .input(z.object({ concoursId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (process.env.ALLOW_FREE_GRANT !== "true") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + ACCESS_DURATION_MONTHS);
      return ctx.db.userConcours.upsert({
        where: {
          userId_concoursId: {
            userId: ctx.session.user.id,
            concoursId: input.concoursId,
          },
        },
        update: { expiresAt },
        create: {
          userId: ctx.session.user.id,
          concoursId: input.concoursId,
          expiresAt,
          pricePaid: PRICE_PER_CONCOURS_MAD,
        },
      });
    }),
});
