"use client";

import { create } from "zustand";
import type { SandboxStatus } from "@/types/database";

interface SandboxState {
  status: SandboxStatus | null;
  sandboxUrl: string | null;
  botUsername: string | null;
  isConnected: boolean;
  error: string | null;
  isPolling: boolean;
  pollInterval: ReturnType<typeof setInterval> | null;
  fetchStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  restart: () => Promise<void>;
}

export const useSandboxStore = create<SandboxState>((set, get) => ({
  status: null,
  sandboxUrl: null,
  botUsername: null,
  isConnected: false,
  error: null,
  isPolling: false,
  pollInterval: null,

  fetchStatus: async () => {
    try {
      const res = await fetch("/api/sandbox/status");
      const data = await res.json();

      if (data.sandbox) {
        set({
          status: data.sandbox.status,
          sandboxUrl: data.sandbox.sandbox_url,
          error: data.sandbox.error_message,
          botUsername: data.telegram?.bot_username ?? null,
          isConnected: data.telegram?.is_connected ?? false,
        });
      } else {
        set({ status: null, sandboxUrl: null, error: null });
      }
    } catch {
      set({ error: "Failed to fetch status" });
    }
  },

  startPolling: () => {
    const { isPolling, fetchStatus } = get();
    if (isPolling) return;

    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    set({ isPolling: true, pollInterval: interval });
  },

  stopPolling: () => {
    const { pollInterval } = get();
    if (pollInterval) clearInterval(pollInterval);
    set({ isPolling: false, pollInterval: null });
  },

  restart: async () => {
    const res = await fetch("/api/sandbox/restart", { method: "POST" });
    if (!res.ok) {
      set({ error: "Restart failed" });
      throw new Error("Restart failed");
    }
    await get().fetchStatus();
  },
}));
