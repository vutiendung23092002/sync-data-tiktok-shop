import * as utils from "../../utils/index.js";

export async function searchLarkRecords(
  client,
  baseId,
  tableId,
  pageSize = 1000,
) {
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
    const res = await client.bitable.appTableRecord.search({
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

    if (res?.msg !== "success") {
      throw new Error(`Lark API error: ${res?.msg || "unknown error"}`);
    }

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
    errorCode:
      error?.response?.data?.code ||
      error?.code ||
      error?.response?.status ||
      null,
    errorMessage: utils.formatError(error),
  };
}

async function writeLarkRecordsInBatches({
  client,
  baseId,
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
      `Gửi batch [${action}] ${i + 1}/${chunks.length} (${batch.length} bản ghi)`,
    );

    try {
      const res = await request(batch);

      if (res?.data?.records?.length) {
        total += res.data.records.length;
      } else {
        console.warn(`Batch ${i + 1}: Không có bản ghi nào được xử lý`);
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
      console.error(`Lỗi batch ${i + 1}: ${failure.errorMessage}`);
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
    client,
    baseId,
    tableId,
    listField,
    action: "create",
    totalLabel: (batchCount) =>
      `Tổng ${listField.length} bản ghi -> chia thành ${batchCount} batch`,
    request: (batch) =>
      client.bitable.appTableRecord.batchCreate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true },
        data: { records: batch },
      }),
  });

  console.log(
    "SUCCESS:",
    `Tổng cộng đã tạo mới ${total}/${listField.length} bản ghi`,
  );
}

export async function updateLarkRecords(client, baseId, tableId, listField) {
  const total = await writeLarkRecordsInBatches({
    client,
    baseId,
    tableId,
    listField,
    action: "update",
    totalLabel: (batchCount) =>
      `Tổng ${listField.length} bản ghi cần update -> chia thành ${batchCount} batch`,
    request: (batch) =>
      client.bitable.appTableRecord.batchUpdate({
        path: { app_token: baseId, table_id: tableId },
        params: { ignore_consistency_check: true, user_id_type: "open_id" },
        data: { records: batch },
      }),
  });

  console.log(
    "SUCCESS:",
    `Tổng cộng đã update ${total}/${listField.length} bản ghi`,
  );
}
