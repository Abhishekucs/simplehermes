import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PricingCard } from "@/components/dashboard/pricing-card";
import { SubscriptionDetails } from "@/components/dashboard/subscription-details";

export default async function BillingPage() {
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

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Billing</h1>
      {subscription && <SubscriptionDetails subscription={subscription} />}
      <div className="mt-6">
        <PricingCard subscription={subscription} userEmail={user.email!} />
      </div>
    </div>
  );
}
