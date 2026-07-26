import Link from "next/link";
import { ShareWaterfall } from "@/components/ShareWaterfall";
import { CREDIT_REWARDS } from "@/lib/constants";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">How it works</p>
      <h1 className="mt-2 max-w-3xl font-display text-4xl font-extrabold text-ink md:text-5xl">
        A legal social prediction market built on earned credits and ad revenue.
      </h1>
      <p className="mt-4 max-w-2xl text-ink/65">
        Betme is framed as entertainment + creator economy: virtual credits you earn (never buy),
        flat fees to participate, and partner ads that fund a transparent revenue waterfall.
      </p>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold text-ink">Earn Betme credits</h2>
          <ul className="mt-5 space-y-3 text-sm text-ink/70">
            <li className="border-b border-[var(--line)] pb-3">
              <strong className="text-ink">Signup:</strong> +{CREDIT_REWARDS.signup} credits
            </li>
            <li className="border-b border-[var(--line)] pb-3">
              <strong className="text-ink">Daily check-in:</strong> +{CREDIT_REWARDS.daily} credits
            </li>
            <li className="border-b border-[var(--line)] pb-3">
              <strong className="text-ink">Watch ads to enter:</strong> +{CREDIT_REWARDS.adWatch}{" "}
              credits + fund the market pool
            </li>
            <li className="border-b border-[var(--line)] pb-3">
              <strong className="text-ink">Partner ad rewards:</strong> +{CREDIT_REWARDS.partnerBonus}{" "}
              credits
            </li>
            <li className="border-b border-[var(--line)] pb-3">
              <strong className="text-ink">Post a market:</strong> +{CREDIT_REWARDS.createMarket}{" "}
              credits
            </li>
          </ul>
          <p className="mt-4 rounded-md bg-mist/80 px-4 py-3 text-sm text-ink/70">
            Credits cannot be purchased. That keeps Betme outside a paid wagering model and closer
            to a rewards / social entertainment product.
          </p>
        </div>

        <div>
          <h2 className="font-display text-3xl font-bold text-ink">Play a prediction</h2>
          <ol className="mt-5 space-y-4">
            {[
              "Pick an open market that interests you.",
              "Watch a short partner ad — required to unlock entry.",
              "Spend a flat credit fee and lock your call.",
              "When resolved, ad revenue distributes by the waterfall.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="font-display text-xl font-extrabold text-tide">{i + 1}</span>
                <p className="text-sm leading-relaxed text-ink/70">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-ink px-6 py-10 text-foam md:px-10">
        <h2 className="font-display text-3xl font-bold text-lime">Ad revenue waterfall</h2>
        <p className="mt-3 max-w-2xl text-foam/70">
          Accurate and more active users earn larger weights inside their tiers. Biggest slices go
          to Betme, then the prediction creator.
        </p>
        <div className="mt-8 [&_li]:border-lime [&_p]:text-foam [&_.text-ink]:text-foam [&_.text-ink\/60]:text-foam/65 [&_.text-tide]:text-lime">
          <ShareWaterfall />
        </div>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-ink">Why this can launch without a sportsbook license</h2>
        <p className="mt-4 text-ink/65">
          Betme does not sell credits, does not take cash wagers, and does not pay cash odds from a
          betting book. Participation uses earned virtual credits. Real money in the system is ad
          revenue shared like a creator platform — to Betme, market posters, and participants —
          not a prize pool funded by stakes.
        </p>
        <p className="mt-4 text-sm text-ink/50">
          This is product framing for a social / rewards model. Always confirm compliance for your
          jurisdictions before a public launch; rules vary by region.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink"
        >
          Start with signup credits
        </Link>
      </section>
    </div>
  );
}
