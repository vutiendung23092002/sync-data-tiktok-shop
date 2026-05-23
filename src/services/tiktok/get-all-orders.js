import { getOrdersList } from "../../core/tiktok-api.js";
import { API_PATHS_TIKTOK } from "../../config/constants.js";
import {
  createShopPageParams,
  createTikTokHeaders,
  signTikTokParams,
} from "./request-options.js";

export async function getAllOrdersTiktok(
  appKey,
  appSecret,
  accessToken,
  from,
  to,
  shops
) {
  let allOrders = [];
  let nextPageToken = null;
  const path = API_PATHS_TIKTOK.TIKTOK_ORDER_SEARCH;

  for (const shop of shops) {
    do {
      const params = createShopPageParams({
        appKey,
        shop,
        pageSize: 100,
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
      const resOrders = await getOrdersList(path, params, headers, body);

      const ordersWithShopName = resOrders?.data?.orders.map((o) => ({
        ...o,
        shop_id: shop.id,
        shop_name: shop.name,
      }));
      allOrders.push(...ordersWithShopName);
      nextPageToken = resOrders?.data?.next_page_token || null;
    } while (nextPageToken);
  }

  return allOrders;
}
