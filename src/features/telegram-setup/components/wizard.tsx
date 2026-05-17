"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { StepCreateBot } from "./step-create-bot";
import { StepPasteToken } from "./step-paste-token";
import { StepConnecting } from "./step-connecting";
import { StepComplete } from "./step-complete";

export function TelegramWizard() {
  const step = useWizardStore((s) => s.step);

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Connect Your Telegram Bot
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Follow these steps to connect your Hermes agent to Telegram
        </p>
      </div>

      <StepIndicator current={step} />

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        {step === "create-bot" && <StepCreateBot />}
        {step === "paste-token" && <StepPasteToken />}
        {step === "connecting" && <StepConnecting />}
        {step === "complete" && <StepComplete />}
      </div>
    </div>
  );
}

const STEPS = ["create-bot", "paste-token", "connecting", "complete"] as const;

function StepIndicator({ current }: { current: string }) {
  const currentIdx = STEPS.indexOf(current as (typeof STEPS)[number]);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, idx) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              idx <= currentIdx ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
          {idx < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-8 ${
                idx < currentIdx ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
