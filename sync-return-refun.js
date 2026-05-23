import { syncDataToLarkBaseFilterDate } from "./src/services/larkbase/index.js";
import { createDefaultLarkClient } from "./src/services/larkbase/context.js";
import { getAllOrdersReturn } from "./src/services/tiktok/get-all-return-orders.js";
import { getTiktokShopContext } from "./src/services/tiktok/context.js";
import * as utils from "./src/utils/index.js";

async function syncReturnRefunTiktok(baseId, tableReturnRefun, from, to) {
  console.log(`Đồng bộ đơn hàng hoàn trả từ ngày ${from} đến ${to}`);

  const { appKey, appSecret, accessToken, shops } =
    await getTiktokShopContext();

  const returnOrders = await getAllOrdersReturn(
    appKey,
    appSecret,
    accessToken,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to),
    shops,
  );

  const returnOrderFormated = returnOrders.map((tx) =>
    utils.formatTikTokReturnOrder(tx),
  );

  const larkFinanceClient = await createDefaultLarkClient();
  const { timestampFrom, timestampTo } = utils.getLarkDateFilterRange(from, to);

  await syncDataToLarkBaseFilterDate(
    larkFinanceClient,
    baseId,
    {
      tableName: tableReturnRefun,
      records: returnOrderFormated,
      fieldMap: utils.RETURN_ORDER_FIELD_MAP,
      typeMap: utils.RETURN_ORDER_TYPE_MAP,
      uiType: utils.RETURN_ORDER_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
      excludeUpdateField: [],
    },
    "Ngày tạo",
    timestampFrom,
    timestampTo,
  );
}

const baseId = process.env.BASE_ID_TMDT;
const tableReturnRefun = process.env.TABLE_NAME;
const { from, to } = utils.getDateRangeFromEnv();

syncReturnRefunTiktok(baseId, tableReturnRefun, from, to);
