import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSandboxModel, restartHermes } from "@/lib/blaxel";
import { getModelForProduct } from "@/lib/plans";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sandbox } = await supabase
    .from("sandboxes")
    .select("blaxel_sandbox_name")
    .eq("user_id", user.id)
    .eq("status", "running")
    .single();

  if (!sandbox) {
    return NextResponse.json({ error: "No running sandbox" }, { status: 404 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  const model = getModelForProduct(subscription?.product_id ?? null);

  try {
    await updateSandboxModel(sandbox.blaxel_sandbox_name, model);
    await restartHermes(sandbox.blaxel_sandbox_name);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sandbox/restart]", error);
    return NextResponse.json({ error: "Restart failed" }, { status: 500 });
  }
}
