import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Minimal topbar */}
      <header className="flex h-12 items-center px-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
            <span className="text-[9px] font-bold text-primary-foreground">CF</span>
          </div>
          <span className="text-sm font-semibold">ConcoursFacile</span>
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
