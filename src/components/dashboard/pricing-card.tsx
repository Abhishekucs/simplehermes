"use client";

import { useState } from "react";
import { PLANS } from "@/lib/constants";
import type { Subscription } from "@/types/database";

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      if (!res.ok) return;
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="w-full rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Loading…" : "Manage Subscription"}
    </button>
  );
}

interface PricingCardProps {
  subscription: Subscription | null;
  userEmail: string;
}

export function PricingCard({ subscription }: PricingCardProps) {
  const isActive = subscription?.status === "active";

  const handleSubscribe = async (planId: string) => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    if (!res.ok) return;
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  if (isActive) {
    return (
      <div className="rounded-xl border border-gray-800 bg-[#111111] p-6">
        <div className="space-y-3">
          <p className="text-sm text-green-400 font-medium">Active subscription</p>
          {subscription.current_period_end && (
            <p className="text-xs text-gray-500">
              Renews{" "}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
          <ManageSubscriptionButton />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {PLANS.map((plan) => (
        <div key={plan.id} className="rounded-xl border border-gray-800 bg-[#111111] p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-3xl font-bold text-white">{plan.price}</p>
          </div>

          <ul className="mb-6 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-400">
                <svg
                  className="h-4 w-4 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(plan.id)}
            className="w-full rounded-lg bg-[#D77655] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#c4654a]"
          >
            Subscribe — {plan.price}
          </button>
        </div>
      ))}
    </div>
  );
}
