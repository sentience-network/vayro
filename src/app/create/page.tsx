import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CreateMarketForm } from "@/components/CreateMarketForm";

export default async function CreatePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">Create</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold text-ink md:text-5xl">
        Post a prediction
      </h1>
      <p className="mt-3 text-ink/65">
        Attract players who watch ads to enter. You earn creator share of the ad pool — plus 25
        credits for publishing.
      </p>
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white/50 p-6 md:p-8">
        <CreateMarketForm />
      </div>
    </div>
  );
}
