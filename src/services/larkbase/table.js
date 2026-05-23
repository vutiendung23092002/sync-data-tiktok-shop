import { formatError } from "../../utils/index.js";

export async function getListTable(client, baseId) {
  let pageToken = undefined;
  const tables = [];

  try {
    do {
      const res = await client.bitable.appTable.list({
        path: { app_token: baseId },
        params: {
          page_size: 100,
          page_token: pageToken,
        },
      });

      const data = res.data;
      tables.push(...(data.items || []));
      pageToken = data.page_token;

      if (!data.has_more) break;
    } while (true);

    return tables;
  } catch (error) {
    console.error("Lỗi Lark API:", formatError(error));
    return null;
  }
}

export async function ensureLarkBaseTable(client, baseId, tableName, fields) {
  try {
    const res = await client.bitable.appTable.create({
      path: { app_token: baseId },
      data: { table: { name: tableName, default_view_name: "Grid", fields } },
    });

    console.log(
      "SUCCESS:",
      `Đã tạo bảng '${tableName}' (ID: ${res.data.table_id})`,
    );
    return res.data.table_id;
  } catch (error) {
    console.log("ERROR:", `Lỗi tạo bảng '${tableName}': ${formatError(error)}`);
    throw error;
  }
}
