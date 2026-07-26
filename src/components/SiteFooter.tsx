import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--line)] bg-ink text-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight text-lime">BETME</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-foam/70">
            Social prediction markets with badges, follows, chat, and video. Betme credits are
            earned through signup, referrals, and usage — never purchased, never cashed out.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/80">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-foam/75">
            <li>
              <Link className="hover:text-lime" href="/markets">
                Markets
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/social">
                Social
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/leaderboards">
                Leaderboards
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/messages">
                Messages
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/video">
                Video
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/80">Legal frame</p>
          <p className="mt-3 text-sm leading-relaxed text-foam/70">
            Entertainment + creator economy. No credit purchases, no cash redemption, no odds books.
            Ad dollars fund creator and participant rewards.
          </p>
        </div>
      </div>
    </footer>
  );
}
