import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .single();

  const hasSubscription = !!subscription;

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <DashboardSidebar email={user.email!} hasSubscription={hasSubscription} />
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
