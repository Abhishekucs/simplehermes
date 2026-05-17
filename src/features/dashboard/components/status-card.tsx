"use client";

import { useSandboxStore } from "@/stores/sandbox-store";

const STATUS_COLORS: Record<string, string> = {
  running: "bg-green-900/50 text-green-400",
  standby: "bg-yellow-900/50 text-yellow-400",
  error: "bg-red-900/50 text-red-400",
  provisioning: "bg-blue-900/50 text-blue-400",
  pending: "bg-gray-800 text-gray-400",
};

export function StatusCard() {
  const { status, error } = useSandboxStore();
  const displayStatus = status || "unknown";
  const colorClass = STATUS_COLORS[displayStatus] || "bg-gray-800 text-gray-400";

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-5">
      <h3 className="text-sm font-medium text-gray-400">Agent Status</h3>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {displayStatus}
        </span>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
