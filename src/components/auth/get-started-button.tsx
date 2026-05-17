"use client";

import { createClient } from "@/lib/supabase/client";

export function GetStartedButton() {
  const handleGetStarted = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/callback?next=/dashboard`,
      },
    });
  };

  return (
    <button
      onClick={handleGetStarted}
      className="mt-6 block w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-black transition-colors hover:bg-gray-200"
    >
      Get Started
    </button>
  );
}
