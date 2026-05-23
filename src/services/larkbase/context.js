import { env } from "../../config/env.js";
import { createLarkClient } from "../../core/larkbase-client.js";

export function createDefaultLarkClient() {
  return createLarkClient(
    env.LARK.tiktok_k_orders_items.app_id,
    env.LARK.tiktok_k_orders_items.app_secret,
  );
}

