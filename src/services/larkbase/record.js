import * as utils from "../../utils/index.js";

const LARK_MAX_RETRIES = 5;
const LARK_BASE_DELAY_MS = 5000;

function createLarkApiError(response) {
  const error = new Error(`Lark API error: ${response?.msg || "unknown error"}`);
  error.code = response?.code || response?.msg;
  error.larkResponse = response;
  error.response = {
    data: response,
    headers: response?.headers,
    status: response?.status,
  };
  return error;
}

function getLarkErrorCode(error) {
  return (
    error?.response?.data?.code ||
    error?.response?.status ||
    error?.code ||
    error?.status ||
    error?.larkResponse?.code ||
    error?.larkResponse?.msg ||
    null
  );
}

function getLarkErrorMessage(error) {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.larkResponse?.msg ||
    error?.message ||
    String(error)
  );
}

function getRetryAfterMs(error) {
  const headers = error?.response?.headers;
  const retryAfter =
    headers?.["retry-after"] ||
    headers?.["Retry-After"] ||
    headers?.get?.("retry-after");

  if (!retryAfter) return null;

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return seconds * 1000;

  const retryAt = new Date(retryAfter).getTime();
  if (!Number.isNaN(retryAt)) return Math.max(retryAt - Date.now(), 0);

  return null;
}

function isRetryableLarkError(error) {
  const errorCode = getLarkErrorCode(error);
  const status = Number(
    error?.response?.status ||
      error?.status ||
      (Number(errorCode) >= 500 && Number(errorCode) < 600
        ? errorCode
        : NaN),
  );
  const code = String(errorCode || "").toLowerCase();
  const message = getLarkErrorMessage(error).toLowerCase();

  const isRateLimit =
    status === 429 ||
    code.includes("toomanyrequests") ||
    code.includes("ratelimit") ||
    code.includes("rate_limit") ||
    message.includes("too many requests") ||
    message.includes("toomanyrequests") ||
    message.includes("rate limit");

  const isServerError = Number.isFinite(status) && status >= 500 && status < 600;
  const isNetworkError =
    error?.code === "ECONNRESET" ||
    error?.code === "ETIMEDOUT" ||
    message.includes("socket hang up");

  return isRateLimit || isServerError || isNetworkError;
}

async function callLarkWithRetry(action, request) {
  let retryAttempt = 0;

  while (true) {
    try {
      return await request();
    } catch (error) {
      if (!isRetryableLarkError(error) || retryAttempt >= LARK_MAX_RETRIES) {
        throw error;
      }

      retryAttempt += 1;
      const delayMs =
        getRetryAfterMs(error) ||
        LARK_BASE_DELAY_MS * 2 ** (retryAttempt - 1);

      console.warn(
        `[LARK_RETRY] ${JSON.stringify({
          action,
          attempt: retryAttempt,
          maxAttempts: LARK_MAX_RETRIES,
          delayMs,
          errorCode: getLarkErrorCode(error),
          errorMessage: getLarkErrorMessage(error),
        })}`,
      );

      await utils.delay(delayMs);
    }
  }
}

export async function searchLarkRecords(
  client,
  baseId,
  tableId,
  pageSize = 1000,
) {
  return callLarkWithRetry("searchLarkRecords", async () => {
    const records = [];

    for await (const page of await client.bitable.appTableRecord.searchWithIterator(
      {
        path: { app_token: baseId, table_id: tableId },
        params: { user_id_type: "open_id", page_size: pageSize },
      },
    )) {
      if (page.items && page.items.length > 0) {
        records.push(...page.items);
      }
    }

    return records;
  });
}

export async function searchLarkRecordsFilterDate(
  client,
  baseId,
  tableId,
  pageSize,
  fieldName,
  from,
  to,
) {
  const records = [];
  let pageToken = undefined;

  while (true) {
    const res = await callLarkWithRetry("searchLarkRecordsFilterDate", async () => {
      const response = await client.bitable.appTableRecord.search({
        path: { app_token: baseId, table_id: tableId },
        params: {
          user_id_type: "open_id",
          page_size: pageSize,
          page_token: pageToken,
        },
        data: {
          filter: {
            conjunction: "and",
            conditions: [
              {
                field_name: fieldName,
                operator: "isGreater",
                value: ["ExactDate", from],
              },
              {
                field_name: fieldName,
                operator: "isLess",
                value: ["ExactDate", to],
              },
            ],
          },
        },
      });

      if (response?.msg !== "success") {
        throw createLarkApiError(response);
      }

      return response;
    });

    const items = res?.data?.items || [];
    records.push(...items);

    pageToken = res?.data?.page_token;
    if (!pageToken) break;
  }

  return records;
}

function getRecordId(record) {
  return (
    record.record_id ||
    record.fields?.["ID định danh (TTS)"] ||
    record.fields?.id_sku ||
    null
  );
}

function createBatchFailure(action, tableId, batchIndex, batch, error) {
  return {
    action,
    tableId,
    batchIndex,
    recordCount: batch.length,
    recordIds: batch.map(getRecordId).filter(Boolean),
    errorCode: getLarkErrorCode(error),
    errorMessage: getLarkErrorMessage(error),
  };
}

async function writeLarkRecordsInBatches({
  tableId,
  listField,
  action,
  request,
  totalLabel,
}) {
  const chunks = utils.chunkArray(listField, 500);
  const failedBatches = [];
  let total = 0;

  console.log(totalLabel(chunks.length));

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    console.log(
      `Gui batch [${action}] ${i + 1}/${chunks.length} (${batch.length} records)`,
    );

    try {
      const res = await callLarkWithRetry(`${action}LarkRecords`, async () => {
        const response = await request(batch);

        if (response?.msg && response.msg !== "success") {
          throw createLarkApiError(response);
        }

        return response;
      });

      if (res?.data?.records?.length) {
        total += res.data.records.length;
      } else {
        console.warn(`Batch ${i + 1}: no records were processed`);
      }

      await utils.delay(100);
    } catch (error) {
      const failure = createBatchFailure(
        action,
        tableId,
        i + 1,
        batch,
        error,
      );
      failedBatches.push(failure);
      console.error(`Lark batch failed ${i + 1}: ${failure.errorMessage}`);
    }
  }

  if (failedBatches.length > 0) {
    const batchError = new Error(
      `Lark batch ${action} failed: ${JSON.stringify(failedBatches)}`,
    );
    batchError.failedBatches = failedBatches;
    throw batchError;
  }

  return total;
}

export async function createLarkRecords(client, baseId, tableId, listField) {
  const total = await writeLarkRecordsInBatches({
    tableId,
    listField,
    action: "create",
    totalLabel: (batchCount) =>
      `Total ${listField.length} records -> ${batchCount} create batches`,
    request: (batch) =>
      client.bitable.appTableRecord.batchCreate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true },
        data: { records: batch },
      }),
  });

  console.log("SUCCESS:", `Created ${total}/${listField.length} records`);
}

export async function updateLarkRecords(client, baseId, tableId, listField) {
  const total = await writeLarkRecordsInBatches({
    tableId,
    listField,
    action: "update",
    totalLabel: (batchCount) =>
      `Total ${listField.length} records -> ${batchCount} update batches`,
    request: (batch) =>
      client.bitable.appTableRecord.batchUpdate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true, user_id_type: "open_id" },
        data: { records: batch },
      }),
  });

  console.log("SUCCESS:", `Updated ${total}/${listField.length} records`);
}
