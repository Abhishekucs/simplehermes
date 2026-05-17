import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClient } from "@/lib/dodo";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscription_id } = await request.json();

  if (!subscription_id) {
    return NextResponse.json({ error: "subscription_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("dodo_subscription_id", subscription_id)
    .single();

  if (existing) {
    return NextResponse.json({ success: true });
  }

  try {
    const dodo = getClient();
    const sub = await dodo.subscriptions.retrieve(subscription_id);

    await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        dodo_subscription_id: sub.subscription_id,
        dodo_customer_id: sub.customer.customer_id,
        status: sub.status,
        product_id: sub.product_id,
        current_period_start: sub.previous_billing_date,
        current_period_end: sub.next_billing_date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "dodo_subscription_id" }
    );

    return NextResponse.json({ success: true, status: sub.status });
  } catch (e) {
    console.error("[checkout/confirm] error:", e);
    const message = e instanceof Error ? e.message : "Failed to confirm subscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
