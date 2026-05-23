import { refreshTikTokAccessToken } from "../../core/tiktok-api.js";
import { supabase } from "../../core/supabase-client.js";
import * as utils from "../../utils/index.js";

export async function checkAndRefreshAllTokens(appKey, appSecret, dbName, id) {
  const { data: selectedToken } = await supabase
    .from(dbName)
    .select()
    .eq("id", id)
    .single();

  const now = Math.floor(Date.now() / 1000);

  if (
    selectedToken?.access_token_expire_in &&
    Number(selectedToken?.access_token_expire_in) - now > 300
  ) {
    return utils.decrypt(selectedToken.access_token);
  }

  if (
    selectedToken?.refresh_token_expire_in &&
    Number(selectedToken?.refresh_token_expire_in) - now < 0
  ) {
    console.error(
      `[Refresh token của ${selectedToken.app_name} đã hết hạn - cần re-auth.]`,
    );
    return;
  }

  const params = {
    app_key: appKey,
    app_secret: appSecret,
    refresh_token: utils.decrypt(selectedToken?.refresh_token),
    grant_type: "refresh_token",
  };

  const result = await refreshTikTokAccessToken(params);

  const { data: upsertedToken } = await supabase
    .from("envCloud")
    .upsert(
      {
        id,
        access_token: utils.encrypt(result?.data?.access_token || ""),
        access_token_expire_in: result?.data?.access_token_expire_in || "",
        refresh_token: utils.encrypt(result?.data?.refresh_token || ""),
        refresh_token_expire_in: result?.data?.refresh_token_expire_in || "",
        update_at: utils.utcTimestampToVn(Math.floor(Date.now() / 1000)),
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  return utils.decrypt(upsertedToken.access_token);
}
