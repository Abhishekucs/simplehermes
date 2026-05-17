import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { provisionSandbox } from "@/lib/blaxel";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: existingSandbox } = await admin
    .from("sandboxes")
    .select("id, blaxel_sandbox_name, sandbox_url, status")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .single();

  if (existingSandbox) {
    return NextResponse.json({
      sandboxName: existingSandbox.blaxel_sandbox_name,
      sandboxUrl: existingSandbox.sandbox_url,
      status: existingSandbox.status,
    });
  }

  try {
    const { sandboxName, sandboxUrl: baseUrl } = await provisionSandbox(user.id);
    const sandboxUrl = `${baseUrl}/port/8443`;

    const { error: insertError } = await admin.from("sandboxes").insert({
      user_id: user.id,
      blaxel_sandbox_name: sandboxName,
      status: "running",
      sandbox_url: sandboxUrl,
    });

    if (insertError) {
      console.error("[sandbox/provision] DB insert failed:", insertError);
      return NextResponse.json(
        { error: `DB insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ sandboxName, sandboxUrl, status: "running" });
  } catch (error) {
    console.error("[sandbox/provision]", error);

    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Provisioning failed: ${message}` },
      { status: 500 }
    );
  }
}
