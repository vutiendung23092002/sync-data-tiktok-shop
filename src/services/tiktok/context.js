import { env } from "../../config/env.js";
import { checkAndRefreshAllTokens } from "./refresh-access-token.js";
import { getTiktokShopInfo } from "./get-all-shop-info.js";

const TOKEN_TABLE_NAME = "envCloud";

export const DEFAULT_TIKTOK_SHOP =
  env.TIKTOK.shop_han_korea_7561567100864644872;

export async function getTiktokShopContext(shopConfig = DEFAULT_TIKTOK_SHOP) {
  const accessToken = await checkAndRefreshAllTokens(
    shopConfig.app_key,
    shopConfig.app_secret,
    TOKEN_TABLE_NAME,
    shopConfig.id_env_cloud,
  );

  const shops = await getTiktokShopInfo(
    shopConfig.app_key,
    shopConfig.app_secret,
    accessToken,
  );

  return {
    appKey: shopConfig.app_key,
    appSecret: shopConfig.app_secret,
    accessToken,
    shops,
  };
}

