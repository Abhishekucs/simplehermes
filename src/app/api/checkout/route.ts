import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/dodo";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await request.json();

  if (!planId) {
    return NextResponse.json({ error: "planId required" }, { status: 400 });
  }

  try {
    if (!user.email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    const session = await createCheckoutSession(user.id, user.email, planId);
    return NextResponse.json({ url: session.checkout_url });
  } catch (e) {
    console.error("[checkout] error:", e);
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
