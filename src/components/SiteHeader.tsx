import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export function SiteHeader({ user }: { user: SessionUser | null }) {
  return (
    <header className="relative z-20 border-b border-[var(--line)] bg-[rgba(238,246,241,0.78)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink transition group-hover:text-tide md:text-[1.7rem]">
            BETME
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 text-sm font-medium text-ink/75 md:gap-1">
          <Link className="rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink" href="/markets">
            Markets
          </Link>
          <Link
            className="hidden rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink sm:inline"
            href="/social"
          >
            Social
          </Link>
          <Link
            className="hidden rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink md:inline"
            href="/leaderboards"
          >
            Boards
          </Link>
          {user ? (
            <>
              <Link
                className="hidden rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink sm:inline"
                href="/messages"
              >
                Chat
              </Link>
              <Link
                className="rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink"
                href="/create"
              >
                Post
              </Link>
              <Link
                className="rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink"
                href={`/u/${user.username}`}
              >
                <span className="mr-1.5 hidden lg:inline">{user.displayName}</span>
                <span className="rounded-md bg-ink px-2 py-0.5 font-semibold text-lime">
                  {user.credits} cr
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link className="rounded-md px-2 py-1.5 transition hover:bg-mist hover:text-ink" href="/login">
                Log in
              </Link>
              <Link
                className="rounded-md bg-ink px-3 py-1.5 font-semibold text-lime transition hover:bg-ink-soft"
                href="/signup"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
