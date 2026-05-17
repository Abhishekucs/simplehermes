import DodoPayments from "dodopayments";

let _client: DodoPayments | null = null;

function getClient() {
  if (!_client) {
    _client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment:
        process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    });
  }
  return _client;
}

export async function createCheckoutSession(userId: string, email: string) {
  const dodo = getClient();
  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_PRODUCT_ID!, quantity: 1 }],
    customer: { email },
    metadata: { user_id: userId },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
  });
  return session;
}
