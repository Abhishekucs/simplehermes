const MODEL_BY_PRODUCT: Record<string, string> = {
  [process.env.DODO_PRODUCT_ID_PRO!]: "global.anthropic.claude-sonnet-4-6",
  [process.env.DODO_PRODUCT_ID_ULTRA!]: "global.anthropic.claude-opus-4-7",
};

const PLAN_ID_BY_PRODUCT: Record<string, string> = {
  [process.env.DODO_PRODUCT_ID_PRO!]: "pro",
  [process.env.DODO_PRODUCT_ID_ULTRA!]: "ultra",
};

export function getModelForProduct(productId: string | null): string {
  if (productId && MODEL_BY_PRODUCT[productId]) {
    return MODEL_BY_PRODUCT[productId];
  }
  return "global.anthropic.claude-sonnet-4-6";
}

export function getPlanIdForProduct(productId: string | null): string {
  if (productId && PLAN_ID_BY_PRODUCT[productId]) {
    return PLAN_ID_BY_PRODUCT[productId];
  }
  return "pro";
}

const DAILY_LIMIT_BY_PRODUCT: Record<string, number> = {
  [process.env.DODO_PRODUCT_ID_PRO!]: 10,
  [process.env.DODO_PRODUCT_ID_ULTRA!]: 12,
};

export function getDailyLimitForProduct(productId: string | null): number {
  if (productId && DAILY_LIMIT_BY_PRODUCT[productId]) {
    return DAILY_LIMIT_BY_PRODUCT[productId];
  }
  return 10;
}
