"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWizardStore } from "@/stores/wizard-store";

interface WizardDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WizardDialog({ open, onClose }: WizardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    step,
    botToken,
    telegramUserId,
    isValidating,
    error,
    botUsername,
    setToken,
    setTelegramUserId,
    validateToken,
    configure,
    setStep,
    reset,
  } = useWizardStore();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        dialog.close();
      }
    };
    dialog.addEventListener("click", handleBackdropClick);
    return () => dialog.removeEventListener("click", handleBackdropClick);
  }, []);

  const handleSaveConnect = useCallback(async () => {
    const valid = await validateToken();
    if (valid) {
      setStep("connecting");
      const success = await configure();
      if (success) {
        setStep("complete");
      }
    }
  }, [validateToken, setStep, configure]);

  const handleDone = () => {
    reset();
    onClose();
    window.location.reload();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-[70vh] w-[60vw] rounded-2xl border border-gray-800 bg-[#111111] p-0 backdrop:bg-black/80"
    >
      <div className="flex h-full" onClick={(e) => e.stopPropagation()}>
      {/* Left side - content */}
      <div className="flex-1 p-8 text-left">
        <div className="max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-[#26A5E4]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.44 3.81-1.58 4.6-1.86 5.12-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z" />
          </svg>
          <h2 className="text-base font-medium text-white">Connect Telegram</h2>
        </div>

        {step === "complete" ? (
          <div className="mt-6 space-y-4">
            <div className="text-green-400">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Your bot is live!</h3>
            <p className="text-sm text-gray-400">Your Hermes AI agent is now running on Telegram</p>
            {botUsername && (
              <a
                href={`https://t.me/${botUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-[#D77655] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c4654a]"
              >
                Open @{botUsername} in Telegram
              </a>
            )}
            <div>
              <button
                onClick={handleDone}
                className="text-sm text-gray-400 underline hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : step === "connecting" ? (
          <div className="mt-6 space-y-4 py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-[#D77655]" />
            <p className="text-sm text-gray-300">Configuring your Hermes agent...</p>
            <p className="text-xs text-gray-500">This may take a few seconds</p>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="mt-5">
              <p className="text-sm font-medium text-gray-300">How to get your bot token?</p>
              <ol className="mt-3 space-y-2 text-[13px] leading-relaxed text-gray-400">
                <li>
                  1. Open Telegram and go to{" "}
                  <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#D77655] hover:underline">@BotFather</a>
                </li>
                <li>
                  2. Start a chat and type{" "}
                  <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-gray-300">/newbot</code>
                </li>
                <li>3. Follow the prompts to name your bot and choose a username.</li>
                <li>4. BotFather will send you a message with your bot token. Copy the whole token (it looks like a string of numbers and letters).</li>
                <li>5. Paste the token in the field below and click Save & Connect</li>
              </ol>
            </div>

            {/* Token input */}
            <div className="mt-5">
              <label className="block text-sm text-gray-300">Enter bot token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456789:ABCdefGHI-jklMNOpqrsTUVwxyz"
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#D77655] focus:outline-none"
                disabled={isValidating}
              />
            </div>

            {/* Telegram User ID input */}
            <div className="mt-3">
              <label className="block text-sm text-gray-300">Enter Telegram User ID</label>
              <p className="mt-0.5 text-xs text-gray-500">
                Send a message to <code className="font-mono text-gray-400">@userinfobot</code> to get your ID
              </p>
              <input
                type="text"
                value={telegramUserId}
                onChange={(e) => setTelegramUserId(e.target.value)}
                placeholder="123456789"
                className="mt-1.5 w-full rounded-lg border border-gray-700 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#D77655] focus:outline-none"
                disabled={isValidating}
              />
            </div>

            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

            {/* Save & Connect button */}
            <button
              onClick={handleSaveConnect}
              disabled={!botToken.trim() || !telegramUserId.trim() || isValidating}
              className="mt-5 w-full rounded-lg bg-[#D77655] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c4654a] disabled:opacity-50"
            >
              {isValidating ? "Validating..." : "Save & Connect"}
            </button>
          </>
        )}
        </div>
      </div>

      {/* Right side - video demo */}
      <div className="flex w-[35%] items-center justify-center rounded-r-2xl bg-black/30 p-6">
        <div className="relative aspect-[9/16] h-full max-h-full overflow-hidden rounded-2xl border border-gray-700 bg-black">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            src="/telegram-demo.mp4"
          />
        </div>
      </div>
      </div>
    </dialog>
  );
}
