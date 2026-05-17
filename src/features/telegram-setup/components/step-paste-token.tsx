"use client";

import { useWizardStore } from "@/stores/wizard-store";

export function StepPasteToken() {
  const { botToken, telegramUserId, isValidating, error, setToken, setTelegramUserId, validateToken, setStep } =
    useWizardStore();

  const handleValidate = async () => {
    const valid = await validateToken();
    if (valid) {
      setStep("connecting");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Paste Your Bot Token
      </h2>
      <p className="text-sm text-gray-600">
        Paste the API token you received from @BotFather
      </p>

      <input
        type="text"
        value={botToken}
        onChange={(e) => setToken(e.target.value)}
        placeholder="123456789:ABCdefGHI-jklMNOpqrsTUVwxyz12345678"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={isValidating}
      />

      <div className="pt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your Telegram User ID
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Send a message to{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono">@userinfobot</code>{" "}
          on Telegram to get your numeric ID
        </p>
        <input
          type="text"
          value={telegramUserId}
          onChange={(e) => setTelegramUserId(e.target.value)}
          placeholder="123456789"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isValidating}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => setStep("create-bot")}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleValidate}
          disabled={!botToken.trim() || !telegramUserId.trim() || isValidating}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? "Validating..." : "Validate & Connect"}
        </button>
      </div>
    </div>
  );
}
