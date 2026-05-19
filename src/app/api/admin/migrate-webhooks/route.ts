import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt } from "@/lib/encryption";
import { restartHermes } from "@/lib/blaxel";
import { randomBytes } from "crypto";
import { SandboxInstance } from "@blaxel/core";

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";

  let query = admin
    .from("telegram_configs")
    .select("id, user_id, sandbox_id, bot_token_encrypted, webhook_url, webhook_secret")
    .eq("is_connected", true);

  if (!force) {
    query = query.is("webhook_secret", null);
  }

  const { data: configs, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!configs || configs.length === 0) {
    return NextResponse.json({ message: "No configs to migrate", migrated: 0 });
  }

  const results: { user_id: string; success: boolean; error?: string }[] = [];

  for (const config of configs) {
    try {
      if (!config.sandbox_id) {
        results.push({ user_id: config.user_id, success: false, error: "No sandbox_id" });
        continue;
      }

      const { data: sandbox } = await admin
        .from("sandboxes")
        .select("id, blaxel_sandbox_name, status")
        .eq("id", config.sandbox_id)
        .neq("status", "deleted")
        .single();

      if (!sandbox) {
        results.push({ user_id: config.user_id, success: false, error: "No active sandbox" });
        continue;
      }

      const webhookSecret = randomBytes(32).toString("hex");
      const proxyWebhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook/${sandbox.id}`;
      const botToken = decrypt(config.bot_token_encrypted);

      // Update sandbox .env with new webhook URL and secret
      const sandboxInstance = await SandboxInstance.get(sandbox.blaxel_sandbox_name);
      const envContent = await sandboxInstance.fs.read("/opt/data/.env");
      const updatedEnv = envContent
        .split("\n")
        .map((line: string) => {
          if (line.startsWith("TELEGRAM_WEBHOOK_URL=")) {
            return `TELEGRAM_WEBHOOK_URL=${proxyWebhookUrl}`;
          }
          if (line.startsWith("TELEGRAM_WEBHOOK_SECRET=")) {
            return `TELEGRAM_WEBHOOK_SECRET=${webhookSecret}`;
          }
          return line;
        })
        .join("\n");

      await sandboxInstance.fs.write("/opt/data/.env", updatedEnv);

      // Call Telegram setWebhook to point to the proxy
      const setWebhookRes = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: proxyWebhookUrl,
            secret_token: webhookSecret,
          }),
        }
      );

      const webhookResult = await setWebhookRes.json();
      if (!webhookResult.ok) {
        results.push({
          user_id: config.user_id,
          success: false,
          error: `Telegram setWebhook failed: ${webhookResult.description}`,
        });
        continue;
      }

      // Restart Hermes so it picks up the new secret
      await restartHermes(sandbox.blaxel_sandbox_name);

      // Store the sandbox target URL and webhook secret in DB
      await admin
        .from("telegram_configs")
        .update({
          webhook_secret: webhookSecret,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      results.push({ user_id: config.user_id, success: true });
    } catch (err) {
      results.push({
        user_id: config.user_id,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const migrated = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  return NextResponse.json({ migrated, failed, total: configs.length });
}
