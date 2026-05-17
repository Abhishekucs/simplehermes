import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import DodoPayments from "dodopayments";

function getDodoClient() {
  return new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: "test_mode",
  });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("dodo_customer_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription?.dodo_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  try {
    const dodo = getDodoClient();
    const session = await dodo.customers.customerPortal.create(
      subscription.dodo_customer_id,
      { return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing` }
    );
    return NextResponse.json({ url: session.link });
  } catch (e) {
    console.error("[billing/portal] error:", e);
    const message = e instanceof Error ? e.message : "Failed to create portal session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
