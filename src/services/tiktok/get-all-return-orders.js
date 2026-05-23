import { searchReturns } from "../../core/tiktok-api.js";
import { API_PATHS_TIKTOK } from "../../config/constants.js";
import {
  createShopPageParams,
  createTikTokHeaders,
  signTikTokParams,
} from "./request-options.js";

export async function getAllOrdersReturn(
  appKey,
  appSecret,
  accessToken,
  from,
  to,
  shops
) {
  let allOrdersReturn = [];
  let nextPageToken = null;
  const path = API_PATHS_TIKTOK.TIKTOK_SEARCH_RETURNS_REFUND;
  for (const shop of shops) {
    do {
      const params = createShopPageParams({
        appKey,
        shop,
        pageSize: 50,
        sortField: "create_time",
        nextPageToken,
      });

      const body = {
        create_time_ge: from,
        create_time_lt: to,
      };

      signTikTokParams({
        appSecret,
        path,
        params,
        body,
        method: "POST",
      });

      const headers = createTikTokHeaders(accessToken, true);

      const res = await searchReturns(path, params, headers, body);

      const return_orders = res?.data?.return_orders || [];
      const mapped = return_orders.map((o) => ({
        ...o,
        shop_name: shop.name,
        shop_id: shop.id,
      }));
      allOrdersReturn.push(...mapped);

      nextPageToken = res?.data?.next_page_token || null;
    } while (nextPageToken);
  }

  return allOrdersReturn;
}
