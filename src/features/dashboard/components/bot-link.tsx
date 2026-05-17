"use client";

import { useState } from "react";

export function BotLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://t.me/${username}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-[#111111] p-5">
      <h3 className="text-sm font-medium text-gray-400">Your Bot</h3>
      <div className="mt-2 flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#D77655] hover:underline"
        >
          @{username}
        </a>
        <button
          onClick={handleCopy}
          className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-white/5 hover:text-gray-300"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
