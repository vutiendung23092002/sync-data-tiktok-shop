function countPopulatedFields(sku) {
  return Object.values(sku).filter(
    (value) => value !== undefined && value !== null && value !== "",
  ).length;
}

export function formatTikTokSkus(orders = []) {
  const skuById = new Map();

  for (const order of orders) {
    for (const lineItem of order.line_items || []) {
      const sku = {
        id_sku: lineItem.sku_id,
        seller_sku: lineItem.seller_sku,
        sku_name: lineItem.sku_name,
        product_id: lineItem.product_id,
        product_name: lineItem.product_name,
      };

      if (!sku.id_sku) continue;

      const existingSku = skuById.get(sku.id_sku);
      if (
        !existingSku ||
        countPopulatedFields(sku) > countPopulatedFields(existingSku)
      ) {
        skuById.set(sku.id_sku, sku);
      }
    }
  }

  return [...skuById.values()];
}

