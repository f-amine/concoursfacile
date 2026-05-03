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
        <Link
          href="/"
          aria-label="ConcoursFacile.ma"
          className="flex flex-shrink-0 items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo1.jpeg"
            alt="ConcoursFacile.ma"
            className="h-7 w-auto"
            loading="eager"
            decoding="async"
          />
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
