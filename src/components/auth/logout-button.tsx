"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("wizard-store");
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 transition-colors hover:text-white"
    >
      Sign out
    </button>
  );
}
