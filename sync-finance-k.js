import { syncDataToLarkBaseFilterDate } from "./src/services/larkbase/index.js";
import { createDefaultLarkClient } from "./src/services/larkbase/context.js";
import {
  getAllStatement,
  getAllTransactionsByStatement,
} from "./src/services/tiktok/get-all-statements.js";
import { getTiktokShopContext } from "./src/services/tiktok/context.js";
import * as utils from "./src/utils/index.js";

async function syncFinanceTiktok(baseId, tableFinanceName, from, to) {
  console.log(`Đồng bộ tài chính từ ngày ${from} đến ${to}`);

  const { appKey, appSecret, accessToken, shops } =
    await getTiktokShopContext();
  const { start: startFi, end: endFi } = utils.expandDateRangeByDay(
    from,
    to,
    5,
    5,
  );

  console.log(startFi, endFi);

  const statements = await getAllStatement(
    appKey,
    appSecret,
    accessToken,
    utils.vnTimeToUtcTimestamp(startFi),
    utils.vnTimeToUtcTimestamp(endFi),
    shops,
  );

  console.log(statements.length);

  const transactions = await getAllTransactionsByStatement(
    appKey,
    appSecret,
    accessToken,
    shops,
    statements,
    utils.vnTimeToUtcTimestamp(from),
    utils.vnTimeToUtcTimestamp(to),
  );

  console.log(transactions.length);

  utils.writeJsonFile(
    "./src/data/all_transactions_statements.json",
    transactions,
  );

  const txFormated = transactions.map((tx) =>
    utils.formatTikTokTransactionFull(tx),
  );

  utils.writeJsonFile("./src/data/all_transactions_formatted.json", txFormated);

  const larkFinanceClient = await createDefaultLarkClient();
  const { timestampFrom, timestampTo } = utils.getLarkDateFilterRange(from, to);

  await syncDataToLarkBaseFilterDate(
    larkFinanceClient,
    baseId,
    {
      tableName: tableFinanceName,
      records: txFormated,
      fieldMap: utils.TRANSACTION_FIELD_MAP,
      typeMap: utils.TRANSACTION_TYPE_MAP,
      uiType: utils.TRANSACTION_UI_TYPE_MAP,
      currencyCode: "VND",
      idLabel: "ID định danh (TTS)",
      excludeUpdateField: [],
    },
    "Ngày quyết toán",
    timestampFrom,
    timestampTo,
  );
}

const baseId = process.env.BASE_ID_TMDT;
const tableFinanceName = process.env.TABLE_NAME;
const { from, to } = utils.getDateRangeFromEnv();

syncFinanceTiktok(baseId, tableFinanceName, from, to);
