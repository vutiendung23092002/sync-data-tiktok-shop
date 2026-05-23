import * as larkbaseService from "./index.js";
import * as utils from "../../utils/index.js";

function buildFields(fieldMap, typeMap, uiType, currencyCode) {
  return Object.entries(fieldMap).map(([key, label]) =>
    utils.buildField(key, label, typeMap[key], uiType[key], currencyCode),
  );
}

async function getOrCreateTableId(
  client,
  baseId,
  tableName,
  fieldMap,
  typeMap,
  uiType,
  currencyCode,
) {
  const listTb = await larkbaseService.getListTable(client, baseId);
  const table = listTb.find((item) => item.name === tableName);

  if (table) {
    console.log(`[LARK] Bảng '${tableName}' đã tồn tại.`);
    return table.table_id;
  }

  console.log(`[LARK] Tạo bảng '${tableName}' mới...`);

  const fields = buildFields(fieldMap, typeMap, uiType, currencyCode);
  return larkbaseService.ensureLarkBaseTable(
    client,
    baseId,
    tableName,
    fields,
  );
}

function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    !(Array.isArray(value) && value.length === 0)
  );
}

function buildCreateRecords(data, toUpsertIds, larkIdMap, fieldMap, typeMap) {
  return data
    .filter(
      (record) =>
        toUpsertIds.has(String(record.id)) && !larkIdMap[String(record.id)],
    )
    .map((record) => utils.mapFieldsToLark(record, fieldMap, typeMap));
}

function buildUpdateRecords({
  data,
  toUpsertIds,
  larkIdMap,
  existingRecords,
  fieldMap,
  typeMap,
  excludeUpdateField,
}) {
  const excludeList = Array.isArray(excludeUpdateField)
    ? excludeUpdateField
    : excludeUpdateField
      ? [excludeUpdateField]
      : [];

  return data
    .filter(
      (record) =>
        toUpsertIds.has(String(record.id)) && larkIdMap[String(record.id)],
    )
    .map((record) => {
      const recordId = larkIdMap[String(record.id)];
      const fields = utils.mapFieldsToLark(record, fieldMap, typeMap).fields;

      if (excludeList.length > 0) {
        const oldRecordFull = existingRecords.find(
          (oldRecord) => oldRecord.record_id === recordId,
        );

        // Field đã có dữ liệu thủ công trên Lark thì không ghi đè.
        for (const fieldLabel of excludeList) {
          const oldValue = oldRecordFull?.fields?.[fieldLabel];

          if (hasValue(oldValue) && fields[fieldLabel] !== undefined) {
            delete fields[fieldLabel];
          }
        }
      }

      return {
        record_id: recordId,
        fields,
      };
    });
}

export async function syncDataToLarkBaseFilterDate(
  client,
  baseId,
  {
    tableName,
    selectFn,
    records = null,
    fieldMap,
    typeMap,
    uiType,
    currencyCode = "VND",
    idLabel = "ID định danh (TTS)",
    excludeUpdateField = null,
  },
  filterFieldName,
  startDate,
  endDate,
) {
  console.log(`=== Đồng bộ dữ liệu lên LarkBase: ${tableName} ===`);

  const sourceRecords = records ? records : await selectFn?.(startDate, endDate);
  const data = sourceRecords || [];
  console.log(`Tổng số bản ghi cần đồng bộ: ${data.length}`);

  if (!data.length) {
    console.warn("Không có dữ liệu để đồng bộ!");
    return;
  }

  const newDataForDiff = data.map((record) => ({
    id: String(record.id),
    hash: record.hash,
  }));

  const tableId = await getOrCreateTableId(
    client,
    baseId,
    tableName,
    fieldMap,
    typeMap,
    uiType,
    currencyCode,
  );

  console.log("TABLE_ID:", tableId);

  const existingRecords = await larkbaseService.searchLarkRecordsFilterDate(
    client,
    baseId,
    tableId,
    1000,
    filterFieldName,
    startDate,
    endDate,
  );

  console.log(
    `[LARK] Đã lấy ${existingRecords.length} bản ghi hiện có từ LarkBase.`,
  );

  const simplifiedRecords = utils
    .extractLarkIdHash(existingRecords, idLabel)
    .map((record) => ({
      ...record,
      id: String(record.id),
    }));

  const { toUpsert } = utils.diffRecords(
    newDataForDiff,
    simplifiedRecords,
    "id",
    "hash",
    tableName,
  );

  const toUpsertIds = new Set(toUpsert.map((record) => String(record.id)));
  const larkIdMap = Object.fromEntries(
    simplifiedRecords.map((record) => [String(record.id), record.record_id]),
  );

  const toCreate = buildCreateRecords(
    data,
    toUpsertIds,
    larkIdMap,
    fieldMap,
    typeMap,
  );

  const toUpdate = buildUpdateRecords({
    data,
    toUpsertIds,
    larkIdMap,
    existingRecords,
    fieldMap,
    typeMap,
    excludeUpdateField,
  });

  console.log(
    `[LARK] Tạo mới: ${toCreate.length} | Cập nhật: ${toUpdate.length}`,
  );

  await Promise.all([
    toCreate.length
      ? larkbaseService.createLarkRecords(client, baseId, tableId, toCreate)
      : Promise.resolve(),
    toUpdate.length
      ? larkbaseService.updateLarkRecords(client, baseId, tableId, toUpdate)
      : Promise.resolve(),
  ]);

  console.log(`[LARK] Hoàn tất đồng bộ '${tableName}'`);
}
