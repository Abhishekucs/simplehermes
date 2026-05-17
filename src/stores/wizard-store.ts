"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WizardStep = "create-bot" | "paste-token" | "connecting" | "complete";

interface WizardState {
  step: WizardStep;
  botToken: string;
  botUsername: string | null;
  telegramUserId: string;
  isValidating: boolean;
  error: string | null;
  setStep: (step: WizardStep) => void;
  setToken: (token: string) => void;
  setTelegramUserId: (id: string) => void;
  validateToken: () => Promise<boolean>;
  configure: () => Promise<boolean>;
  reset: () => void;
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      step: "create-bot",
      botToken: "",
      botUsername: null,
      telegramUserId: "",
      isValidating: false,
      error: null,

      setStep: (step) => set({ step, error: null }),
      setToken: (botToken) => set({ botToken, error: null }),
      setTelegramUserId: (telegramUserId) => set({ telegramUserId }),

      validateToken: async () => {
        const { botToken } = get();
        set({ isValidating: true, error: null });

        try {
          const res = await fetch("/api/telegram/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: botToken.trim() }),
          });
          const data = await res.json();

          if (data.valid) {
            set({ botUsername: data.username, isValidating: false });
            return true;
          }
          set({ error: data.error, isValidating: false });
          return false;
        } catch {
          set({ error: "Validation failed. Please try again.", isValidating: false });
          return false;
        }
      },

      configure: async () => {
        const { botToken, botUsername, telegramUserId } = get();
        set({ error: null });

        try {
          const provisionRes = await fetch("/api/sandbox/provision", { method: "POST" });
          if (!provisionRes.ok) {
            const data = await provisionRes.json();
            set({ error: data.error || "Provisioning failed" });
            return false;
          }

          const res = await fetch("/api/sandbox/configure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ botToken: botToken.trim(), botUsername, telegramUserId: telegramUserId.trim() }),
          });

          if (!res.ok) {
            const data = await res.json();
            set({ error: data.error || "Configuration failed" });
            return false;
          }
          return true;
        } catch {
          set({ error: "Configuration failed. Please try again." });
          return false;
        }
      },

      reset: () =>
        set({
          step: "create-bot",
          botToken: "",
          botUsername: null,
          telegramUserId: "",
          isValidating: false,
          error: null,
        }),
    }),
    { name: "wizard-store", partialize: (state) => ({ step: state.step }) }
  )
);
