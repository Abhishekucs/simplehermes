import { PLANS } from "@/lib/constants";
import { getPlanIdForProduct } from "@/lib/plans";
import type { Subscription } from "@/types/database";

interface SubscriptionDetailsProps {
  subscription: Subscription;
}

export function SubscriptionDetails({ subscription }: SubscriptionDetailsProps) {
  const planId = getPlanIdForProduct(subscription.product_id);
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const planName = plan.name;

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Current plan</p>
          <p className="mt-1 text-lg font-semibold text-white">{planName}</p>
        </div>
        <span className="rounded-full bg-green-400/10 px-3 py-1 text-xs font-medium capitalize text-green-400">
          {subscription.status}
        </span>
      </div>
    </div>
  );
}
