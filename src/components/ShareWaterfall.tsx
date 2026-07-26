const STEPS = [
  {
    label: "Betme",
    share: "40%",
    detail: "Platform operations, trust, and market infrastructure",
  },
  {
    label: "Creator",
    share: "25%",
    detail: "The person who posted a prediction people actually join",
  },
  {
    label: "Accurate predictors",
    share: "25%",
    detail: "Correct calls, weighted toward more active users",
  },
  {
    label: "All participants",
    share: "10%",
    detail: "Everyone who watched an ad and entered gets a base share",
  },
];

export function ShareWaterfall() {
  return (
    <ol className="space-y-4">
      {STEPS.map((step, index) => (
        <li
          key={step.label}
          className="grid grid-cols-[auto_1fr_auto] items-start gap-4 border-l-2 border-lime pl-4"
        >
          <span className="font-display text-lg font-bold text-tide">{index + 1}</span>
          <div>
            <p className="font-display text-xl font-bold text-ink">{step.label}</p>
            <p className="mt-1 text-sm text-ink/60">{step.detail}</p>
          </div>
          <span className="font-display text-2xl font-extrabold text-ink">{step.share}</span>
        </li>
      ))}
    </ol>
  );
}
