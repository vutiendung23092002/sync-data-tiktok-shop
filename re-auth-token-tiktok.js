import { env } from "./src/config/env.js";
import { reAuthTokenTiktok } from "./src/services/tiktok/re-auth-tiktok.js";

const RE_AUTH_SHOP_BY_CHOICE = {
  1: {
    label: "Re-auth cho app K",
    config: env.TIKTOK.shop_k_lady_care_7527154834987157254,
  },
  2: {
    label: "Re-auth cho app Han",
    config: env.TIKTOK.shop_han_korea_7561567100864644872,
  },
};

async function reAuthTiktok(authCode, choice) {
  const selectedShop = RE_AUTH_SHOP_BY_CHOICE[choice];
  if (!selectedShop) return;

  const { config } = selectedShop;
  console.log(selectedShop.label);

  await reAuthTokenTiktok(
    authCode,
    config.app_key,
    config.app_secret,
    config.id_env_cloud,
    config.app_name,
    config.web,
  );
}

const authCode = process.env.AUTH_CODE;
const choice = process.env.CHOICE;

reAuthTiktok(authCode, choice);
