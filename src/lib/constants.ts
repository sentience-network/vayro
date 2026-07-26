export const REVENUE_SHARES = {
  betme: 0.4,
  creator: 0.25,
  accurate: 0.25,
  participants: 0.1,
} as const;

export const CREDIT_REWARDS = {
  signup: 100,
  daily: 15,
  adWatch: 5,
  createMarket: 25,
  partnerBonus: 20,
} as const;

export const DEFAULT_ENTRY_FEE = 10;

export const CATEGORIES = [
  "Sports",
  "Entertainment",
  "Tech",
  "Culture",
  "Politics",
  "Science",
  "Other",
] as const;

export const AD_PARTNERS = [
  { name: "NovaFit", tagline: "Train smarter. Move freer.", color: "#1A6B5A" },
  { name: "PulsePay", tagline: "Money that moves with you.", color: "#0B3D4A" },
  { name: "Trailora", tagline: "Gear for every outdoors.", color: "#2F5D3A" },
  { name: "BrightBite", tagline: "Snacks with a spark.", color: "#C45C26" },
] as const;
