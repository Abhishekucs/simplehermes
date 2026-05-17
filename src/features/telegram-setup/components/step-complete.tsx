"use client";

import { useWizardStore } from "@/stores/wizard-store";
import Link from "next/link";

export function StepComplete() {
  const { botUsername, reset } = useWizardStore();

  return (
    <div className="space-y-4 text-center py-4">
      <div className="text-green-600">
        <svg
          className="mx-auto h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        Your bot is live!
      </h2>

      <p className="text-sm text-gray-600">
        Your Hermes AI agent is now running on Telegram
      </p>

      {botUsername && (
        <a
          href={`https://t.me/${botUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Open @{botUsername} in Telegram
        </a>
      )}

      <div className="pt-2">
        <Link
          href="/dashboard"
          onClick={() => reset()}
          className="text-sm text-gray-600 underline hover:text-gray-900"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
