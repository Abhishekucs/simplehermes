export const PLAN = {
  name: "Hermes Pro",
  price: "$9/month",
  features: [
    "Your own AI agent on Telegram",
    "Always available, 24/7",
    "Powered by advanced LLMs",
    "No coding or DevOps required",
    "Auto-scales when inactive (no idle costs)",
  ],
} as const;

export const SANDBOX_POLL_INTERVAL_MS = 30_000;

export const BOT_TOKEN_REGEX = /^\d+:[A-Za-z0-9_-]{35}$/;
