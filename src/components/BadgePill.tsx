export function BadgePill({
  icon,
  name,
  description,
  tier,
}: {
  icon: string;
  name: string;
  description: string;
  tier: string;
}) {
  const tone =
    tier === "GOLD"
      ? "border-[#c9a227]/40 bg-[#f7efd0]/70"
      : tier === "SILVER"
        ? "border-ink/15 bg-white/70"
        : "border-tide/20 bg-mist/70";

  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`} title={description}>
      <p className="text-sm font-semibold text-ink">
        <span className="mr-1.5">{icon}</span>
        {name}
      </p>
      <p className="mt-0.5 text-xs text-ink/55">{description}</p>
    </div>
  );
}
