import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    .eq("status", "active")
    .single();

  if (existing) {
    return NextResponse.json({ success: true });
  }

  await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      dodo_subscription_id: subscription_id,
      dodo_customer_id: user.email ?? "",
      status: "active",
      product_id: process.env.DODO_PRODUCT_ID!,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "dodo_subscription_id" }
  );

  return NextResponse.json({ success: true });
}
