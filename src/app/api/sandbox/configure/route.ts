import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configureSandbox, startHermes, getPublicWebhookUrl } from "@/lib/blaxel";
import { encrypt } from "@/lib/encryption";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { botToken, botUsername, telegramUserId } = await request.json();

  if (!botToken || !botUsername || !telegramUserId) {
    return NextResponse.json(
      { error: "botToken, botUsername, and telegramUserId required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: sandbox } = await admin
    .from("sandboxes")
    .select("id, blaxel_sandbox_name, sandbox_url")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .single();

  if (!sandbox) {
    return NextResponse.json({ error: "No sandbox found" }, { status: 404 });
  }

  try {
    const webhookSecret = randomBytes(32).toString("hex");
    const publicUrl = await getPublicWebhookUrl(sandbox.blaxel_sandbox_name);
    const webhookUrl = `${publicUrl}/telegram`;

    const envVars = {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
      HERMES_INFERENCE_MODEL: process.env.HERMES_LLM_MODEL || "anthropic/claude-sonnet-4.6",
      HERMES_INFERENCE_PROVIDER: "openrouter",
      TELEGRAM_ALLOWED_USERS: telegramUserId,
      TELEGRAM_HOME_CHANNEL: telegramUserId,
      TELEGRAM_BOT_TOKEN: botToken,
      TELEGRAM_WEBHOOK_URL: webhookUrl,
      TELEGRAM_WEBHOOK_PORT: "8443",
      TELEGRAM_WEBHOOK_SECRET: webhookSecret,
      HERMES_HOME: "/opt/data",
    };

    await configureSandbox(sandbox.blaxel_sandbox_name, envVars);
    await startHermes(sandbox.blaxel_sandbox_name, envVars);

    const encryptedToken = encrypt(botToken);

    const { error: upsertError } = await admin.from("telegram_configs").upsert(
      {
        user_id: user.id,
        sandbox_id: sandbox.id,
        bot_token_encrypted: encryptedToken,
        bot_username: botUsername,
        is_connected: true,
        webhook_url: webhookUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      console.error("[sandbox/configure] telegram_configs upsert failed:", upsertError);
      return NextResponse.json(
        { error: `Failed to save telegram config: ${upsertError.message}` },
        { status: 500 }
      );
    }

    await admin
      .from("sandboxes")
      .update({ status: "running", updated_at: new Date().toISOString() })
      .eq("id", sandbox.id);

    return NextResponse.json({ success: true, webhookUrl });
  } catch (error) {
    console.error("[sandbox/configure]", error);
    return NextResponse.json(
      { error: "Configuration failed" },
      { status: 500 }
    );
  }
}
