import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sandbox } = await supabase
    .from("sandboxes")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!sandbox) {
    return NextResponse.json({ sandbox: null });
  }

  const { data: telegramConfig } = await supabase
    .from("telegram_configs")
    .select("bot_username, is_connected")
    .eq("sandbox_id", sandbox.id)
    .single();

  return NextResponse.json({
    sandbox: {
      status: sandbox.status,
      sandbox_url: sandbox.sandbox_url,
      error_message: sandbox.error_message,
    },
    telegram: telegramConfig
      ? {
          bot_username: telegramConfig.bot_username,
          is_connected: telegramConfig.is_connected,
        }
      : null,
  });
}
