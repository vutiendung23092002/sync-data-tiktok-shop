import {
  getStatements,
  getTransactionByStatement,
} from "../../core/tiktok-api.js";
import { API_PATHS_TIKTOK } from "../../config/constants.js";
import * as utils from "../../utils/index.js";
import {
  createShopPageParams,
  createTikTokHeaders,
  signTikTokParams,
} from "./request-options.js";

export async function getAllStatement(
  appKey,
  appSecret,
  accessToken,
  from,
  to,
  shops
) {
  let allStatements = [];
  let nextPageToken = null;
  const path = API_PATHS_TIKTOK.TIKTOK_FINANCE_STATEMENT;

  for (const shop of shops) {
    do {
      const params = createShopPageParams({
        appKey,
        shop,
        pageSize: 100,
        sortField: "statement_time",
        nextPageToken,
      });

      Object.assign(params, {
        statement_time_ge: from,
        statement_time_lt: to,
      });

      signTikTokParams({
        appSecret,
        path,
        params,
        method: "GET",
      });

      const headers = createTikTokHeaders(accessToken);
      const res = await getStatements(path, params, headers);
      nextPageToken = res?.data?.next_page_token || null;

      const statements = (res?.data?.statements || []).map((statement) => ({
        ...statement,
        shop_id: shop.id,
        shop_name: shop.name,
        shop_cipher: shop.cipher,
      }));
      allStatements.push(...statements);
    } while (nextPageToken);
  }

  return allStatements;
}

export async function getAllTransactionsByStatement(
  appKey,
  appSecret,
  accessToken,
  shops,
  statements = [],
  from,
  to
) {
  if (!Array.isArray(statements) || statements.length === 0) {
    console.warn("statement list rỗng hoặc không hợp lệ!");
    return [];
  }
  let transactions = [];

  for (const statement of statements) {
    const statementId = statement.id;
    const path =
      API_PATHS_TIKTOK.TIKTOK_FINANCE_TRANSACTION_BY_STATEMENT.replace(
        "{statement_id}",
        statementId
      );
    let nextPageToken = null;

    do {
      const params = createShopPageParams({
        appKey,
        shop: { cipher: statement.shop_cipher },
        pageSize: 100,
        sortField: "order_create_time",
        nextPageToken,
      });

      signTikTokParams({
        appSecret,
        path,
        params,
        method: "GET",
      });

      const headers = createTikTokHeaders(accessToken);
      const res = await utils.callWithRetry(
        () => getTransactionByStatement(path, params, headers),
        10,
        1000
      );

      nextPageToken = res?.data?.next_page_token || null;

      const withStatement = (res?.data?.transactions || []).map(
        (transaction) => ({
          ...transaction,
          statement_id: statementId,
          statement_time: statement.statement_time,
          shop_id: statement.shop_id,
          shop_name: statement.shop_name,
        })
      );

      transactions.push(...withStatement);
    } while (nextPageToken);
  }

  const filteredTransactions = transactions.filter((item) => {
    const orderTs = Number(item.statement_time);
    return orderTs >= from && orderTs <= to;
  });

  return filteredTransactions;
}
