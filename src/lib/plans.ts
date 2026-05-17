const MODEL_BY_PRODUCT: Record<string, string> = {
  [process.env.DODO_PRODUCT_ID_PRO!]: "global.anthropic.claude-sonnet-4-6",
  [process.env.DODO_PRODUCT_ID_ULTRA!]: "global.anthropic.claude-opus-4-7",
};

export function getModelForProduct(productId: string | null): string {
  if (productId && MODEL_BY_PRODUCT[productId]) {
    return MODEL_BY_PRODUCT[productId];
  }
  return "global.anthropic.claude-sonnet-4-6";
}
