import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--line)] bg-ink text-foam">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl font-extrabold tracking-tight text-lime">BETME</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-foam/70">
            A legal social prediction space. Betme credits are earned through signup, usage, and
            partner ads — never purchased. Ad revenue funds creators and predictors.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/80">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-foam/75">
            <li>
              <Link className="hover:text-lime" href="/markets">
                Open markets
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/how-it-works">
                Revenue waterfall
              </Link>
            </li>
            <li>
              <Link className="hover:text-lime" href="/create">
                Post a prediction
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lime/80">Legal frame</p>
          <p className="mt-3 text-sm leading-relaxed text-foam/70">
            Entertainment + creator economy. No credit purchases, no cash wagering, no odds books.
            Participation uses earned virtual credits; real ad dollars are shared as platform and
            creator rewards.
          </p>
        </div>
      </div>
    </footer>
  );
}
