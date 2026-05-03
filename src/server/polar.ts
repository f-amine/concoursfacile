import "server-only";

import { Polar } from "@polar-sh/sdk";

import { env } from "~/env";

let cached: Polar | null = null;

export function getPolar(): Polar {
  if (cached) return cached;
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new Error("POLAR_ACCESS_TOKEN not configured");
  }
  cached = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: env.POLAR_SERVER,
  });
  return cached;
}
