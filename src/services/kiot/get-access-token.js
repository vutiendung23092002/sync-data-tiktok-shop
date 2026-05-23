import * as kiotApi from "../../core/kiot_api.js";
import { supabase } from "../../core/supabase-client.js";
import { encrypt, decrypt } from "../../utils/common/AES-256-CBC.js";
import * as utils from "../../utils/index.js";

export async function getAccessTokenEnvCloud(clientId, clientSecret) {
  const res = await kiotApi.getAccessToken(clientId, clientSecret);

  const { data } = await supabase
    .from("envCloud")
    .upsert(
      {
        id: 100,
        web: "https://www.kiotviet.vn/",
        app_name: "legiahankorea",
        access_token: encrypt(res?.access_token || ""),
        token_type: res?.token_type || "",
        access_token_expire_in: res?.access_token_expire_in || "",
        refresh_token: encrypt(res?.refresh_token || ""),
        refresh_token_expire_in: res?.refresh_token_expire_in || "",
        update_at: utils.utcTimestampToVn(Math.floor(Date.now() / 1000)),
      },
      { onConflict: "id" },
    )
    .select()
    .eq("id", 1)
    .single();

  return decrypt(data.access_token);
}
