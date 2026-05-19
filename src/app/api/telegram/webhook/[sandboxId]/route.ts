import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDailyLimitForProduct, getPlanIdForProduct } from "@/lib/plans";
import { decrypt } from "@/lib/encryption";
import { getPostHogClient } from "@/lib/posthog";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  const { sandboxId } = await params;
  const body = await request.text();
  const secretHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token");

  const admin = createAdminClient();

  const { data: sandbox } = await admin
    .from("sandboxes")
    .select("id, user_id, sandbox_url, status")
    .eq("id", sandboxId)
    .neq("status", "deleted")
    .single();

  if (!sandbox) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: telegramConfig } = await admin
    .from("telegram_configs")
    .select("bot_token_encrypted, webhook_url, webhook_secret")
    .eq("sandbox_id", sandbox.id)
    .single();

  if (!telegramConfig) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }

  if (!secretHeader || secretHeader !== telegramConfig.webhook_secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let update: Record<string, unknown>;
  try {
    update = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isCountableMessage =
    "message" in update &&
    update.message &&
    typeof (update.message as Record<string, unknown>).text === "string";

  if (isCountableMessage) {
    const updateId = update.update_id as number;
    const message = update.message as Record<string, unknown>;
    const chat = message.chat as Record<string, unknown>;
    const chatId = chat.id as number;

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("product_id, status")
      .eq("user_id", sandbox.user_id)
      .eq("status", "active")
      .single();

    if (!subscription) {
      await sendTelegramMessage(
        telegramConfig.bot_token_encrypted,
        chatId,
        "Your subscription is not active. Please renew to continue using your agent."
      );
      return NextResponse.json({ ok: true });
    }

    const dailyLimit = getDailyLimitForProduct(subscription.product_id);
    const plan = getPlanIdForProduct(subscription.product_id);
    const today = new Date().toISOString().split("T")[0];

    const { count } = await admin
      .from("message_usage")
      .select("*", { count: "exact", head: true })
      .eq("sandbox_id", sandbox.id)
      .eq("message_date", today);

    const dailyCount = count ?? 0;

    const posthog = getPostHogClient();
    const rateLimitEnabled = await posthog.isFeatureEnabled(
      "message-rate-limiting",
      sandbox.user_id
    );

    if (rateLimitEnabled && dailyCount >= dailyLimit) {
      posthog.capture({
        distinctId: sandbox.user_id,
        event: "message_received",
        properties: {
          plan,
          daily_count: dailyCount,
          daily_limit: dailyLimit,
          was_limited: true,
          sandbox_id: sandbox.id,
        },
      });

      await sendTelegramMessage(
        telegramConfig.bot_token_encrypted,
        chatId,
        `You've reached your daily message limit (${dailyLimit} messages). Your limit resets at midnight UTC.`
      );
      return NextResponse.json({ ok: true });
    }

    await admin.from("message_usage").upsert(
      {
        sandbox_id: sandbox.id,
        user_id: sandbox.user_id,
        telegram_update_id: updateId,
        message_date: today,
      },
      { onConflict: "sandbox_id,telegram_update_id", ignoreDuplicates: true }
    );

    posthog.capture({
      distinctId: sandbox.user_id,
      event: "message_received",
      properties: {
        plan,
        daily_count: dailyCount + 1,
        daily_limit: dailyLimit,
        was_limited: false,
        sandbox_id: sandbox.id,
      },
    });
  }

  fetch(telegramConfig.webhook_url!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": secretHeader,
    },
    body,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

async function sendTelegramMessage(
  encryptedToken: string,
  chatId: number,
  text: string
) {
  const botToken = decrypt(encryptedToken);
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
