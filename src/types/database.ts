export type SubscriptionStatus =
  | "inactive"
  | "pending"
  | "active"
  | "on_hold"
  | "cancelled"
  | "expired";

export type SandboxStatus =
  | "pending"
  | "provisioning"
  | "running"
  | "standby"
  | "error"
  | "deleted";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  dodo_subscription_id: string | null;
  dodo_customer_id: string | null;
  status: SubscriptionStatus;
  product_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sandbox {
  id: string;
  user_id: string;
  subscription_id: string | null;
  blaxel_sandbox_name: string;
  status: SandboxStatus;
  region: string;
  sandbox_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramConfig {
  id: string;
  user_id: string;
  sandbox_id: string | null;
  bot_token_encrypted: string;
  bot_username: string | null;
  is_connected: boolean;
  webhook_url: string | null;
  created_at: string;
  updated_at: string;
}
