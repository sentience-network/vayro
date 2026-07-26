export const REVENUE_SHARES = {
  betme: 0.4,
  creator: 0.25,
  accurate: 0.25,
  participants: 0.1,
} as const;

/** Credits are earned only — never purchased, never cashed out. */
export const CREDIT_REWARDS = {
  signup: 100,
  referral: 50,
  referredSignup: 25,
  daily: 15,
  adWatch: 5,
  createMarket: 25,
  partnerBonus: 20,
  firstFollow: 5,
  messageActivity: 2,
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

export const BADGE_CATALOG = [
  {
    key: "welcome_caller",
    name: "Welcome Caller",
    description: "Joined Betme and earned signup credits",
    icon: "◎",
    tier: "BRONZE",
  },
  {
    key: "first_call",
    name: "First Call",
    description: "Entered your first prediction market",
    icon: "▸",
    tier: "BRONZE",
  },
  {
    key: "sharp_eye",
    name: "Sharp Eye",
    description: "Reached 60%+ accuracy with 5+ resolved calls",
    icon: "◉",
    tier: "SILVER",
  },
  {
    key: "oracle",
    name: "Oracle",
    description: "Reached 75%+ accuracy with 8+ resolved calls",
    icon: "✦",
    tier: "GOLD",
  },
  {
    key: "crowd_magnet",
    name: "Crowd Magnet",
    description: "Posted a market that drew 3+ participants",
    icon: "◈",
    tier: "SILVER",
  },
  {
    key: "signal_booster",
    name: "Signal Booster",
    description: "Brought a friend with your referral code",
    icon: "⤴",
    tier: "SILVER",
  },
  {
    key: "social_spark",
    name: "Social Spark",
    description: "Followed someone and joined the social graph",
    icon: "☍",
    tier: "BRONZE",
  },
  {
    key: "live_wire",
    name: "Live Wire",
    description: "Started or joined a Betme video room",
    icon: "◁",
    tier: "GOLD",
  },
] as const;
