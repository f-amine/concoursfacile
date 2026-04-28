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
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav user={session.user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
