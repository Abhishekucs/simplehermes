"use client";

import { useWizardStore } from "@/stores/wizard-store";

export function StepCreateBot() {
  const setStep = useWizardStore((s) => s.setStep);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Create a Telegram Bot
      </h2>

      <ol className="space-y-3 text-sm text-gray-600">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            1
          </span>
          <span>
            Open Telegram and search for{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              @BotFather
            </code>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            2
          </span>
          <span>
            Send the command{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              /newbot
            </code>
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            3
          </span>
          <span>Follow the prompts to choose a name and username for your bot</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            4
          </span>
          <span>
            BotFather will give you an API token — you&apos;ll need it in the next step
          </span>
        </li>
      </ol>

      <button
        onClick={() => setStep("paste-token")}
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        I&apos;ve created my bot
      </button>
    </div>
  );
}
