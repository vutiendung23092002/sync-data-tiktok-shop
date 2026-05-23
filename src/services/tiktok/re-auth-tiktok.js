import * as tiktokAPI from "../../core/tiktok-api.js";
import * as utils from "../../utils/index.js";
import { supabase } from "../../core/supabase-client.js";
import { encrypt, decrypt } from "../../utils/common/AES-256-CBC.js";

export async function reAuthTokenTiktok(
  authCode,
  appKey,
  appSecret,
  idEnvCloud,
  appName,
  web,
) {
  try {
    const params = {
      app_key: appKey,
      app_secret: appSecret,
      auth_code: authCode,
      grant_type: "authorized_code",
    };

    const res = await tiktokAPI.getTikTokAccessToken(params);

    const { data } = await supabase
      .from("envCloud")
      .upsert(
        {
          id: idEnvCloud,
          web,
          app_name: appName,
          token_type: res?.data?.token_type || "",
          access_token: encrypt(res?.data?.access_token || ""),
          access_token_expire_in: res?.data?.access_token_expire_in || "",
          refresh_token: encrypt(res?.data?.refresh_token || ""),
          refresh_token_expire_in: res?.data?.refresh_token_expire_in || "",
          update_at: utils.utcTimestampToVn(Math.floor(Date.now() / 1000)),
        },
        { onConflict: "id" },
      )
      .select()
      .eq("id", idEnvCloud)
      .single();

    return {
      access_token: decrypt(data.access_token),
      access_token_expire_in: data.access_token_expire_in,
      refresh_token: decrypt(data.refresh_token),
      refresh_token_expire_in: data.refresh_token_expire_in,
    };
  } catch (error) {
    console.error("ReAuth thất bại:", utils.formatError(error));
    throw error;
  }
}
