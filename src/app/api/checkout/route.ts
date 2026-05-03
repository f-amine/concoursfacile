import { Checkout } from "@polar-sh/nextjs";

import { env } from "~/env";

export const GET = Checkout({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_SERVER,
  successUrl: `${env.NEXT_PUBLIC_APP_URL ?? ""}/cours?checkout=success`,
});
