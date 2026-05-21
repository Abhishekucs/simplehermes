import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateSandboxModel, restartHermes, refreshPreviewWhenReady } from "@/lib/blaxel";
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
    .select("id, blaxel_sandbox_name")
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
    restartHermes(sandbox.blaxel_sandbox_name);

    after(async () => {
      try {
        const freshUrl = await refreshPreviewWhenReady(sandbox.blaxel_sandbox_name);
        const webhookUrl = `${freshUrl}/telegram`;
        const admin = createAdminClient();
        await admin
          .from("telegram_configs")
          .update({ webhook_url: webhookUrl, updated_at: new Date().toISOString() })
          .eq("sandbox_id", sandbox.id);
      } catch (err) {
        console.error("[sandbox/restart] background preview refresh failed:", err);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sandbox/restart]", error);
    return NextResponse.json({ error: "Restart failed" }, { status: 500 });
  }
}
