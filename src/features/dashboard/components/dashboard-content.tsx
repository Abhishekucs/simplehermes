"use client";

import { useCallback, useEffect, useState } from "react";
import { useSandboxStore } from "@/stores/sandbox-store";
import { StatusCard } from "./status-card";
import { BotLink } from "./bot-link";
import { QuickActions } from "./quick-actions";
import { WizardDialog } from "@/features/telegram-setup/components/wizard-dialog";
import { PricingCard } from "@/components/dashboard/pricing-card";
import type { Sandbox, Subscription, TelegramConfig } from "@/types/database";

interface DashboardContentProps {
  subscription: Subscription | null;
  sandbox: Sandbox | null;
  telegramConfig: Pick<TelegramConfig, "bot_username" | "is_connected"> | null;
  userEmail: string;
}

export function DashboardContent({
  subscription,
  sandbox,
  telegramConfig,
  userEmail,
}: DashboardContentProps) {
  const { startPolling, stopPolling } = useSandboxStore();
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (sandbox) {
      startPolling();
      return () => stopPolling();
    }
  }, [sandbox, startPolling, stopPolling]);

  const handleSetupBot = () => {
    setWizardOpen(true);
  };

  const handleCloseWizard = useCallback(() => {
    setWizardOpen(false);
  }, []);

  if (subscription?.status !== "active") {
    return (
      <div className="mx-auto max-w-md py-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-white">
          Subscribe to get started
        </h2>
        <PricingCard subscription={subscription} userEmail={userEmail} />
      </div>
    );
  }

  if (!telegramConfig || !telegramConfig.is_connected) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-white">
          Connect Your Telegram Bot
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Your agent is ready — now connect it to Telegram
        </p>
        <button
          onClick={handleSetupBot}
          className="mt-4 inline-block rounded-lg bg-[#D77655] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#c4654a]"
        >
          Set Up Telegram Bot
        </button>
        <WizardDialog open={wizardOpen} onClose={handleCloseWizard} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <StatusCard />
        <BotLink username={telegramConfig.bot_username!} />
      </div>
      <QuickActions />
      <WizardDialog open={wizardOpen} onClose={handleCloseWizard} />
    </div>
  );
}
