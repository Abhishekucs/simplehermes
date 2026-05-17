"use client";

import { useState } from "react";
import { useSandboxStore } from "@/stores/sandbox-store";

export function QuickActions() {
  const { restart } = useSandboxStore();
  const [restarting, setRestarting] = useState(false);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  const handleRestart = async () => {
    setRestarting(true);
    setFeedback(null);
    try {
      await restart();
      setFeedback("success");
    } catch {
      setFeedback("error");
    } finally {
      setRestarting(false);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-5">
      <h3 className="mb-3 text-sm font-medium text-gray-400">Quick Actions</h3>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRestart}
          disabled={restarting}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {restarting ? "Restarting…" : "Restart Bot"}
        </button>
        {feedback === "success" && (
          <span className="text-sm text-green-400">Bot restarted</span>
        )}
        {feedback === "error" && (
          <span className="text-sm text-red-400">Restart failed</span>
        )}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        For feedback or support contact{" "}
        <a href="mailto:abhishek@thinkingsoundlab.com" className="text-gray-400 hover:text-white">
          abhishek@thinkingsoundlab.com
        </a>
      </p>
    </div>
  );
}
