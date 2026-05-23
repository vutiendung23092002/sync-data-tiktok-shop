import * as larkbaseService from "./index.js";
import * as utils from "../../utils/index.js";

async function getOrCreateSkuTableId(
  client,
  baseId,
  tableName,
  fieldMap,
  typeMap,
  uiType,
  currencyCode,
) {
  const tables = await larkbaseService.getListTable(client, baseId);
  const existingTable = tables.find((table) => table.name === tableName);

  if (existingTable) return existingTable.table_id;

  const fields = Object.entries(fieldMap).map(([key, label]) =>
    utils.buildField(key, label, typeMap[key], uiType[key], currencyCode),
  );

  return larkbaseService.ensureLarkBaseTable(
    client,
    baseId,
    tableName,
    fields,
  );
}

export async function syncSkuDataToLarkBase(
  client,
  baseId,
  {
    tableName = "SKUS",
    records = [],
    fieldMap,
    typeMap,
    uiType,
    currencyCode = "VND",
  },
) {
  console.log(`=== Dong bo du lieu len LarkBase: ${tableName} ===`);

  if (!records.length) {
    console.warn("Khong co du lieu SKU de dong bo!");
    return;
  }

  const tableId = await getOrCreateSkuTableId(
    client,
    baseId,
    tableName,
    fieldMap,
    typeMap,
    uiType,
    currencyCode,
  );

  const existingRecords = await larkbaseService.searchLarkRecords(
    client,
    baseId,
    tableId,
    1000,
  );
  const existingSkus = utils
    .extractLarkIdHash(existingRecords, "id_sku")
    .map((record) => ({
      id_sku: String(record.id),
      hash: record.hash,
      record_id: record.record_id,
    }));

  const { toUpsert } = utils.diffRecords(
    records,
    existingSkus,
    "id_sku",
    "hash",
    tableName,
  );
  const toUpsertIds = new Set(
    toUpsert.map((record) => String(record.id_sku)),
  );
  const larkIdMap = Object.fromEntries(
    existingSkus.map((record) => [record.id_sku, record.record_id]),
  );

  const toCreate = records
    .filter(
      (record) =>
        toUpsertIds.has(String(record.id_sku)) &&
        !larkIdMap[String(record.id_sku)],
    )
    .map((record) => utils.mapFieldsToLark(record, fieldMap, typeMap));

  const toUpdate = records
    .filter(
      (record) =>
        toUpsertIds.has(String(record.id_sku)) &&
        larkIdMap[String(record.id_sku)],
    )
    .map((record) => ({
      record_id: larkIdMap[String(record.id_sku)],
      fields: utils.mapFieldsToLark(record, fieldMap, typeMap).fields,
    }));

  console.log(
    `[LARK] SKUS create: ${toCreate.length} | update: ${toUpdate.length}`,
  );

  try {
    await Promise.all([
      toCreate.length
        ? larkbaseService.createLarkRecords(client, baseId, tableId, toCreate)
        : Promise.resolve(),
      toUpdate.length
        ? larkbaseService.updateLarkRecords(client, baseId, tableId, toUpdate)
        : Promise.resolve(),
    ]);
  } catch (error) {
    throw new Error(`Sync LarkBase table ${tableName} failed: ${error.message}`);
  }

  console.log(`[LARK] Completed sync '${tableName}'`);
}

