import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BOT_TOKEN_REGEX } from "@/lib/constants";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token || !BOT_TOKEN_REGEX.test(token.trim())) {
    return NextResponse.json(
      { valid: false, error: "Invalid token format" },
      { status: 400 }
    );
  }

  const trimmed = token.trim();

  const res = await fetch(`https://api.telegram.org/bot${trimmed}/getMe`);
  const data = await res.json();

  if (data.ok && data.result) {
    return NextResponse.json({
      valid: true,
      username: data.result.username,
      firstName: data.result.first_name,
    });
  }

  return NextResponse.json({
    valid: false,
    error: "Token is not valid. Please check and try again.",
  });
}
