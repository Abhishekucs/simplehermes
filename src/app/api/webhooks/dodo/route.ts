import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  const wh = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);
  let payload: Record<string, unknown>;

  try {
    payload = wh.verify(body, headers) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = payload.type as string;
  const data = payload.data as Record<string, unknown>;
  const supabase = createAdminClient();

  switch (eventType) {
    case "subscription.created": {
      const metadata = data.metadata as Record<string, string> | undefined;
      const userId = metadata?.user_id;
      if (!userId) break;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          dodo_subscription_id: data.subscription_id as string,
          dodo_customer_id: data.customer_id as string,
          status: "pending",
          product_id: data.product_id as string,
        },
        { onConflict: "dodo_subscription_id" }
      );
      break;
    }

    case "subscription.active": {
      const subscriptionId = data.subscription_id as string;

      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: data.current_period_start as string,
          current_period_end: data.current_period_end as string,
          updated_at: new Date().toISOString(),
        })
        .eq("dodo_subscription_id", subscriptionId);

      // Trigger sandbox provisioning via internal API call
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("dodo_subscription_id", subscriptionId)
        .single();

      if (sub) {
        const { data: existingSandbox } = await supabase
          .from("sandboxes")
          .select("id")
          .eq("user_id", sub.user_id)
          .neq("status", "deleted")
          .single();

        if (!existingSandbox) {
          // Call provision endpoint internally
          await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/sandbox/provision`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: sub.user_id }),
            }
          );
        }
      }
      break;
    }

    case "subscription.on_hold": {
      const subscriptionId = data.subscription_id as string;
      await supabase
        .from("subscriptions")
        .update({ status: "on_hold", updated_at: new Date().toISOString() })
        .eq("dodo_subscription_id", subscriptionId);
      break;
    }

    case "subscription.cancelled": {
      const subscriptionId = data.subscription_id as string;
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("dodo_subscription_id", subscriptionId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
