import DodoPayments from "dodopayments";

let _client: DodoPayments | null = null;

export function getClient() {
  if (!_client) {
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment:
        process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    });
  }
  return _client;
}

const PRODUCT_IDS: Record<string, string | undefined> = {
  pro: process.env.DODO_PRODUCT_ID_PRO,
  ultra: process.env.DODO_PRODUCT_ID_ULTRA,
};

export async function createCheckoutSession(userId: string, email: string, planId: string) {
  const productId = PRODUCT_IDS[planId];
  if (!productId) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  const dodo = getClient();
  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: { email },
    metadata: { user_id: userId, plan_id: planId },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
  });
  return session;
}
