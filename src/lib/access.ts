import type { db as Db } from "~/server/db";
import { env } from "~/env";

export type ConcoursLookup =
  | { concoursId: string }
  | { concoursSlug: string };

let cachedAdminSet: Set<string> | null = null;
function adminEmailSet(): Set<string> {
  if (cachedAdminSet) return cachedAdminSet;
  cachedAdminSet = new Set(
    env.ADMIN_EMAILS.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return cachedAdminSet;
}

const adminUserCache = new Map<string, boolean>();

export async function isAdminUser(
  db: typeof Db,
  userId: string,
): Promise<boolean> {
  const cached = adminUserCache.get(userId);
  if (cached !== undefined) return cached;
  const set = adminEmailSet();
  if (set.size === 0) {
    adminUserCache.set(userId, false);
    return false;
  }
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  const isAdmin = !!user && set.has(user.email.toLowerCase());
  adminUserCache.set(userId, isAdmin);
  return isAdmin;
}

export async function hasConcoursAccess(
  db: typeof Db,
  userId: string,
  lookup: ConcoursLookup,
): Promise<boolean> {
  if (await isAdminUser(db, userId)) return true;

  const where =
    "concoursId" in lookup
      ? { userId, concoursId: lookup.concoursId }
      : { userId, concours: { slug: lookup.concoursSlug } };

  const row = await db.userConcours.findFirst({
    where,
    select: { expiresAt: true },
  });

  if (!row) return false;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return false;
  return true;
}

export async function assertConcoursAccess(
  db: typeof Db,
  userId: string,
  lookup: ConcoursLookup,
): Promise<void> {
  const allowed = await hasConcoursAccess(db, userId, lookup);
  if (!allowed) {
    const { TRPCError } = await import("@trpc/server");
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acces non actif pour ce concours. Paiement requis.",
    });
  }
}
