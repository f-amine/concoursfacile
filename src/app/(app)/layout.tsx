import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";
import { AppNav } from "~/components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/connexion");
  }

  return (
    <div className="min-h-screen">
      <AppNav user={session.user} />
      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
