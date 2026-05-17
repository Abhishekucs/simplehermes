"use client";

import { useEffect, useRef } from "react";
import { useWizardStore } from "@/stores/wizard-store";

export function StepConnecting() {
  const { configure, setStep, error } = useWizardStore();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    configure().then((success) => {
      if (success) setStep("complete");
    });
  }, [configure, setStep]);

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-red-600">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => setStep("paste-token")}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center py-4">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <p className="text-sm text-gray-600">
        Configuring your Hermes agent...
      </p>
      <p className="text-xs text-gray-400">This may take a few seconds</p>
    </div>
  );
}
