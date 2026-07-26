import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="relative z-20 border-b border-[var(--line)] bg-[rgba(238,246,241,0.78)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink transition group-hover:text-tide md:text-[1.7rem]">
            BETME
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-ink/45 sm:inline">
            social predictions
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium text-ink/75 md:gap-2">
          <Link className="rounded-md px-2.5 py-1.5 transition hover:bg-mist hover:text-ink" href="/markets">
            Markets
          </Link>
          <Link
            className="hidden rounded-md px-2.5 py-1.5 transition hover:bg-mist hover:text-ink sm:inline"
            href="/how-it-works"
          >
            How it works
          </Link>
          {user ? (
            <>
              <Link
                className="rounded-md px-2.5 py-1.5 transition hover:bg-mist hover:text-ink"
                href="/create"
              >
                Post
              </Link>
              <Link
                className="rounded-md px-2.5 py-1.5 transition hover:bg-mist hover:text-ink"
                href="/dashboard"
              >
                <span className="mr-1.5 hidden md:inline">{user.displayName}</span>
                <span className="rounded-md bg-ink px-2 py-0.5 font-semibold text-lime">
                  {user.credits} cr
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="rounded-md px-2.5 py-1.5 transition hover:bg-mist hover:text-ink" href="/login">
                Log in
              </Link>
              <Link
                className="rounded-md bg-ink px-3 py-1.5 font-semibold text-lime transition hover:bg-ink-soft"
                href="/signup"
              >
                Earn credits
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
