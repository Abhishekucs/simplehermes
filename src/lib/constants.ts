export const PLANS = [
  {
    id: "pro",
    name: "SimpleHermes Pro",
    price: "$20/month",
    features: [
      "Your own AI agent on Telegram",
      "Always available, 24/7",
      "Powered by Claude Sonnet 4.6",
      "No coding or DevOps required",
      "Auto-scales when inactive (no idle costs)",
    ],
  },
  {
    id: "ultra",
    name: "SimpleHermes Ultra",
    price: "$100/month",
    features: [
      "Everything in Pro",
      "Powered by Claude Opus 4.7",
      "Priority support",
      "Higher rate limits",
      "Early access to new features",
    ],
  },
] as const;

export const SANDBOX_POLL_INTERVAL_MS = 30_000;

export const BOT_TOKEN_REGEX = /^\d+:[A-Za-z0-9_-]{35}$/;
