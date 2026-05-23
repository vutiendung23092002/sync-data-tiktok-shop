import { env } from "./src/config/env.js";
import { getAllCostMap } from "./src/services/kiot/get-all-cost-map.js";
import {
  syncDataToLarkBaseFilterDate,
  syncSkuDataToLarkBase,
} from "./src/services/larkbase/index.js";
import { createDefaultLarkClient } from "./src/services/larkbase/context.js";
import { getAllOrdersTiktok } from "./src/services/tiktok/get-all-orders.js";
import { getTiktokShopContext } from "./src/services/tiktok/context.js";
import * as utils from "./src/utils/index.js";

async function syncOrdersTiktok(
  baseId,
  tableOrdersName,
  tableOrderItemsName,
  tableSkusName,
  from,
  to,
) {
  console.log(`Đồng bộ đơn hàng từ ngày ${from} đến ${to}`);

  const { merged: mergedCost } = await getAllCostMap();
  const { appKey, appSecret, accessToken, shops } =
    await getTiktokShopContext(env.TIKTOK.shop_han_korea_7561567100864644872);

  const orders = await getAllOrdersTiktok(
    appKey,
    appSecret,
    accessToken,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to),
    shops,
  );

  utils.writeJsonFile("./src/data/all_orders.json", orders);

  const allOrders = orders.map((order) => utils.formatTikTokOrder(order));
  const allOrderItems = orders.flatMap((order) =>
    (order.line_items || []).map((item) =>
      utils.formatTikTokOrderItem(item, order, mergedCost),
    ),
  );

  const rawSkuCount = orders.reduce(
    (total, order) => total + (order.line_items || []).length,
    0,
  );
  const skippedSkuCount = orders.reduce(
    (total, order) =>
      total +
      (order.line_items || []).filter((item) => !item.sku_id).length,
    0,
  );
  const allSkus = utils.formatTikTokSkus(orders);
  const skusForSync = allSkus.map((sku) => ({
    ...sku,
    hash: utils.generateHash(sku),
  }));

  utils.writeJsonFile("./src/data/all_orders_formatted.json", allOrders);
  utils.writeJsonFile(
    "./src/data/all_order_items_formatted.json",
    allOrderItems,
  );
  utils.writeJsonFile("./src/data/all_skus_formatted.json", allSkus);

  console.log(
    `Lấy được ${allOrders.length} đơn hàng | ${allOrderItems.length} item đơn hàng!\n`,
  );
  console.log(
    `[SKUS] Raw line items: ${rawSkuCount} | Unique SKUs: ${allSkus.length} | Skipped missing id_sku: ${skippedSkuCount}`,
  );

  const larkOrdersClient = await createDefaultLarkClient();
  const { timestampFrom, timestampTo } = utils.getLarkDateFilterRange(from, to);

  await syncDataToLarkBaseFilterDate(
    larkOrdersClient,
    baseId,
    {
      tableName: tableOrdersName,
      records: allOrders,
      fieldMap: utils.ORDER_FIELD_MAP,
      typeMap: utils.ORDER_TYPE_MAP,
      uiType: utils.ORDER_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
    },
    "Ngày tạo đơn",
    timestampFrom,
    timestampTo,
  );

  await syncDataToLarkBaseFilterDate(
    larkOrdersClient,
    baseId,
    {
      tableName: tableOrderItemsName,
      records: allOrderItems,
      fieldMap: utils.ORDER_ITEM_FIELD_MAP,
      typeMap: utils.ORDER_ITEM_TYPE_MAP,
      uiType: utils.ORDER_ITEM_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
      excludeUpdateField: ["Giá vốn", "Mã sản phẩm"],
    },
    "Ngày tạo đơn",
    timestampFrom,
    timestampTo,
  );

  await syncSkuDataToLarkBase(larkOrdersClient, baseId, {
    tableName: tableSkusName,
    records: skusForSync,
    fieldMap: utils.SKU_FIELD_MAP,
    typeMap: utils.SKU_TYPE_MAP,
    uiType: utils.SKU_UI_TYPE_MAP,
    currencyCode: "VND",
  });
}

const baseId = process.env.BASE_ID_TMDT;
const tableOrdersName = process.env.TABLE_ORDERS_NAME;
const tableOrderItemsName = process.env.TABLE_ORDER_ITEMS_NAME;
const tableSkusName = process.env.TABLE_SKUS || "SKUS";
const { from, to } = utils.getDateRangeFromEnv();

syncOrdersTiktok(
  baseId,
  tableOrdersName,
  tableOrderItemsName,
  tableSkusName,
  from,
  to,
);
