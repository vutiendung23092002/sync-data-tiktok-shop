import * as kiotApi from "../../core/kiot_api.js";

export async function fetchAllProducts(
  accessToken,
  filters = {},
  pageSize = 100,
  retailer,
) {
  let cursor = 0;
  const all = [];

  while (true) {
    const params = {
      pageSize,
      ...filters,
    };

    if (cursor) params.currentItem = cursor;

    const res = await kiotApi.getProducts(accessToken, params, retailer);

    if (!res?.data || res.data.length === 0) break;

    all.push(...res.data);

    console.log(
      `Fetched ${res.data.length}, total: ${all.length}, cursor=${cursor}`,
    );

    cursor = all.length;

    if (res.data.length < pageSize) break;
  }

  return all;
}
