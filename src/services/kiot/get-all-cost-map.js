import { env } from "../../config/env.js";
import { getAccessTokenEnvCloud } from "./get-access-token.js";
import { fetchAllProducts } from "./fetch-all-products.js";
import * as utils from "../../utils/index.js";

async function fetchCostMap(clientId, clientSecret, retailer) {
  const accessToken = await utils.callWithRetry(() =>
    getAccessTokenEnvCloud(clientId, clientSecret),
  );

  const products = await utils.callWithRetry(
    () =>
      fetchAllProducts(
        accessToken,
        { includeInventory: true },
        100,
        retailer,
      ),
    100,
    1000,
  );

  const costMap = {};
  for (const product of products) {
    if (product.code && product.inventories?.length > 0) {
      costMap[product.code] = product.inventories[0].cost ?? 0;
    }
  }

  return costMap;
}

function mergeCostMaps(newMap, oldMap) {
  const merged = { ...newMap };

  // Ưu tiên giá vốn từ Kiot mới, chỉ fallback sang Kiot cũ khi SKU chưa có.
  for (const [sku, cost] of Object.entries(oldMap)) {
    if (!merged[sku]) merged[sku] = cost;
  }

  return Object.fromEntries(Object.entries(merged).sort());
}

export async function getAllCostMap() {
  const newMap = await fetchCostMap(
    env.KIOT.kiot_new.client_id,
    env.KIOT.kiot_new.client_secret,
    env.KIOT.kiot_new.retailer,
  );

  let oldMap = {};

  try {
    oldMap = await fetchCostMap(
      env.KIOT.kiot_old.client_id,
      env.KIOT.kiot_old.client_secret,
      env.KIOT.kiot_old.retailer,
    );
  } catch (error) {
    console.log("Không lấy được oldMap:", utils.formatError(error));
    oldMap = {};
  }

  return { newMap, oldMap, merged: mergeCostMaps(newMap, oldMap) };
}
