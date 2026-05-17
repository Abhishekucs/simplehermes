import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: sandbox } = await supabase
    .from("sandboxes")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: telegramConfig } = sandbox
    ? await supabase
        .from("telegram_configs")
        .select("bot_username, is_connected")
        .eq("sandbox_id", sandbox.id)
        .single()
    : { data: null };

  return (
    <DashboardContent
      subscription={subscription}
      sandbox={sandbox}
      telegramConfig={telegramConfig}
      userEmail={user.email!}
    />
  );
}
