// Build field for larkbase

export function buildField(key, label, type, uiType, cuCode) {
  if (uiType === "Currency") {
    const formatter = cuCode === "VND" ? "0" : "0.00";

    return {
      field_name: label,
      type,
      ui_type: "Currency",
      property: {
        formatter,
        currency_code: cuCode,
      },
    };
  }

  return {
    field_name: label,
    type,
  };
}

// =========================
// MAPPING FIELD ORDERS
// =========================

/**
 * Map field của bảng `orders` trong Supabase → tên hiển thị trong Lark Base
 */
export const ORDER_FIELD_MAP = {
  order_id: "Mã đơn hàng",
  tracking_number: "Mã vận đơn",
  create_time: "Ngày tạo đơn",
  paid_time: "Thời gian thanh toán",
  status: "Trạng thái",
  total_amount: "Tổng tiền", // = Tổng phụ + phí vận chuyển + thuế
  sub_total: "Tổng tiền tạm tính", // = Tổng giá gốc sản phẩm - Giảm giá từ người bán - Giảm giá từ Sàn
  platform_discount: "Giảm giá sàn",
  seller_discount: "Giảm giá người bán",
  original_total_product_price: "Tổng giá gốc sản phẩm",
  shipping_fee: "Phí vận chuyển",
  cancel_reason: "Lý do huỷ",
  tax: "Thuế",
  product_tax: "Thuế sản phẩm",
  shop_name: "Tên shop",
  handling_fee: "Phí xử lý", // Phí cho người mua
  fulfillment_type: "Nơi xử lý đơn",
  cancel_order_sla_time: "Thời hạn tự huỷ đơn",
  cancellation_initiator: "Người khởi tạo huỷ",
  packages: "ID gói hàng",
  cancel_time: "Thời gian huỷ",
  delivery_due_time: "Thời hạn giao hàng",
  delivery_time: "Thời gian giao hàng",
  commerce_platform: "Nền tảng thương mại",
  shipping_provider: "Đơn vị VC",
  rts_time: "RTS time", // Thời gian hàng đã sẵn sàng để giao
  id: "ID định danh (TTS)", // ID tổng hợp (order_id_shop_id)
  hash: "hash",
};

/** Map type orders
 * Mỗi field tương ứng 1 type trong Lark:
 * 1 - text, 2 - number, 5 - datetime
 */
export const ORDER_TYPE_MAP = {
  order_id: 1,
  tracking_number: 1,
  create_time: 5,
  paid_time: 5,
  status: 1,
  total_amount: 2, // = Tổng phụ + phí vận chuyển + thuế
  sub_total: 2, // = Tổng giá gốc sản phẩm - Giảm giá từ người bán - Giảm giá từ Sàn
  platform_discount: 2,
  seller_discount: 2,
  original_total_product_price: 2,
  shipping_fee: 2,
  cancel_reason: 1,
  tax: 2,
  product_tax: 2,
  shop_name: 1,
  handling_fee: 2, // Phí cho người mua
  fulfillment_type: 1,
  cancel_order_sla_time: 5,
  cancellation_initiator: 1,
  packages: 1,
  cancel_time: 5,
  delivery_due_time: 5,
  delivery_time: 5,
  commerce_platform: 1,
  shipping_provider: 1,
  rts_time: 5,
  id: 1, // ID tổng hợp (order_id_shop_id)
  hash: 1,
};

export const ORDER_UI_TYPE_MAP = {
  order_id: "TEXT",
  tracking_number: "TEXT",
  create_time: "DateTime",
  paid_time: "DateTime",
  status: "TEXT",
  total_amount: "Currency", // = Tổng phụ + phí vận chuyển + thuế
  sub_total: "Currency", // = Tổng giá gốc sản phẩm - Giảm giá từ người bán - Giảm giá từ Sàn
  platform_discount: "Currency",
  seller_discount: "Currency",
  original_total_product_price: "Currency",
  shipping_fee: "Currency",
  cancel_reason: "TEXT",
  tax: "Currency",
  product_tax: "Currency",
  shop_name: "TEXT",
  handling_fee: "Currency", // Phí cho người mua
  fulfillment_type: "TEXT",
  cancel_order_sla_time: "DateTime",
  cancellation_initiator: "DateTime",
  packages: "TEXT",
  cancel_time: "DateTime",
  delivery_due_time: "DateTime",
  delivery_time: "DateTime",
  commerce_platform: "TEXT",
  shipping_provider: "TEXT",
  rts_time: "DateTime",
  id: "TEXT", // ID tổng hợp (order_id_shop_id)
  hash: "TEXT",
};

// =============================
// MAPPING FIELD ORDER ITEMS
// =============================
export const ORDER_ITEM_FIELD_MAP = {
  order_id: "Mã đơn hàng",
  item_id: "Mã Item",
  tracking_number: "Mã vận đơn",
  create_time: "Ngày tạo đơn",
  sku_id: "Mã SKU",
  seller_sku: "Mã sản phẩm",
  product_name: "Tên sản phẩm",
  is_gift: "Là quà tặng?",
  status: "Trạng thái",
  shop_name: "Tên shop",
  gift_retail_price: "Giá bán lẻ của quà tặng",
  platform_discount: "Giảm giá sàn",
  seller_discount: "Giảm giá người bán",
  original_price: "Giá gốc",
  sale_price: "Giá bán sản phẩm",
  cost: "Giá vốn",
  hash: "hash",
  id: "ID định danh (TTS)",
};
/** Map type order items
 * Mỗi field tương ứng 1 type trong Lark:
 * 1 - text, 2 - number, 5 - datetime
 */
export const ORDER_ITEM_TYPE_MAP = {
  order_id: 1,
  item_id: 1,
  tracking_number: 1,
  create_time: 5,
  sku_id: 1,
  seller_sku: 1,
  product_name: 1,
  is_gift: 1,
  status: 1,
  shop_name: 1,
  gift_retail_price: 2,
  platform_discount: 2,
  seller_discount: 2,
  original_price: 2,
  sale_price: 2,
  cost: 2,
  hash: 1,
  id: 1,
};

export const ORDER_ITEM_UI_TYPE_MAP = {
  order_id: "Text",
  item_id: "Text",
  tracking_number: "Text",
  create_time: "DateTime",
  sku_id: "Text",
  seller_sku: "Text",
  product_name: "Text",
  is_gift: "Text",
  status: "Text",
  shop_name: "Text",
  gift_retail_price: "Currency",
  platform_discount: "Currency",
  seller_discount: "Currency",
  original_price: "Currency",
  sale_price: "Currency",
  cost: "Currency",
  hash: "Text",
  id: "Text",
};

// =============================
// MAPPING FIELD SKUS
// =============================
export const SKU_FIELD_MAP = {
  id_sku: "id_sku",
  seller_sku: "seller_sku",
  sku_name: "sku_name",
  product_id: "product_id",
  product_name: "product_name",
  hash: "hash",
};

export const SKU_TYPE_MAP = {
  id_sku: 1,
  seller_sku: 1,
  sku_name: 1,
  product_id: 1,
  product_name: 1,
  hash: 1,
};

export const SKU_UI_TYPE_MAP = {
  id_sku: "Text",
  seller_sku: "Text",
  sku_name: "Text",
  product_id: "Text",
  product_name: "Text",
  hash: "Text",
};

// =============================
// MAPPING FIELD TRANSACTION
// =============================
export const TRANSACTION_FIELD_MAP = {
  order_create_time: "Ngày tạo đơn",
  statement_time: "Ngày quyết toán",
  statement_id: "Mã statemen",
  order_id: "Mã đơn hàng",
  transaction_id: "Mã giao dịch",
  adjustment_id: "Mã điều chỉnh",
  type: "Loại giao dịch",
  shop_id: "ID Shop",
  shop_name: "Tên Shop",
  revenue_amount: "Doanh thu (Gross)",
  settlement_amount: "Thực thu (Net)",
  fee_tax_amount: "Tổng phí & thuế",
  total_fee: "Tổng phí",
  adjustment_amount: "Số tiền điều chỉnh",
  shipping_cost_amount: "Phí ship người bán",
  customer_payment_amount: "Khách hàng thanh toán",
  customer_refund_amount: "Hoàn tiền cho khách",
  platform_cofunded_discount_amount: "Phí CFV (Sàn)",
  platform_cofunded_discount_refund_amount: "Hoàn phí CFV (Sàn)",
  platform_discount_amount: "Giảm giá sàn",
  platform_discount_refund_amount: "Hoàn giảm giá sàn",
  retail_delivery_fee_amount: "Phí giao hàng bán lẻ",
  retail_delivery_fee_payment_amount: "Thanh toán phí giao hàng bán lẻ",
  retail_delivery_fee_refund_amount: "Hoàn phí giao hàng bán lẻ",
  sales_tax_amount: "Thuế bán hàng",
  sales_tax_payment_amount: "Thanh toán thuế bán hàng",
  sales_tax_refund_amount: "Hoàn thuế bán hàng",
  seller_cofunded_discount_amount: "Phí CFV (Người bán)",
  seller_cofunded_discount_refund_amount: "Hoàn phí CFV (Người bán)",
  subtotal_before_discount_amount: "Tổng tiền tạm tính trước giảm giá",
  refund_subtotal_before_discount_amount: "Hoàn tiền trước giảm giá",
  seller_discount_amount: "Giảm giá người bán",
  seller_discount_refund_amount: "Hoàn giảm giá người bán",
  affiliate_ads_commission_amount: "Hoa hồng Affiliate Ads",
  affiliate_commission_amount: "Hoa hồng Affiliate",
  affiliate_commission_amount_before_pit: "Hoa hồng Affiliate (trước PIT)",
  affiliate_partner_commission_amount: "Hoa hồng đối tác Affiliate",
  live_specials_fee_amount: "Phí Live Specials",
  platform_commission_amount: "Phí nền tảng (Platform Commission)",
  pre_order_service_fee_amount: "Phí đặt trước (Pre-order)",
  transaction_fee_amount: "Phí giao dịch (Transaction Fee)",
  vn_fix_infrastructure_fee: "Phí cơ sở hạ tầng (Infrastructure Fee)",
  voucher_xtra_service_fee_amount: "Phí Voucher Xtra",
  shipping_fee_guarantee_service_fee: "Phí Piship",
  pit_amount: "Thuế thu nhập cá nhân (PIT)",
  vat_amount: "Thuế VAT",
  actual_shipping_fee_amount: "Phí vận chuyển thực tế",
  shipping_fee_discount_amount: "Giảm giá phí vận chuyển",
  platform_shipping_fee_discount_amount: "Giảm phí vận chuyển từ nền tảng",
  hash: "hash",
  id: "ID định danh (TTS)",
};
/** Map type finance transaction
 * Mỗi field tương ứng 1 type trong Lark:
 * 1 - text, 2 - number, 5 - datetime
 */
export const TRANSACTION_TYPE_MAP = {
  order_id: 1,
  transaction_id: 1,
  adjustment_id: 1,
  statement_id: 1,
  order_create_time: 5,
  statement_time: 5,
  type: 1,
  shop_id: 1,
  shop_name: 1,
  customer_payment_amount: 2,
  customer_refund_amount: 2,
  platform_cofunded_discount_amount: 2,
  platform_cofunded_discount_refund_amount: 2,
  platform_discount_amount: 2,
  platform_discount_refund_amount: 2,
  retail_delivery_fee_amount: 2,
  retail_delivery_fee_payment_amount: 2,
  retail_delivery_fee_refund_amount: 2,
  sales_tax_amount: 2,
  sales_tax_payment_amount: 2,
  sales_tax_refund_amount: 2,
  seller_cofunded_discount_amount: 2,
  seller_cofunded_discount_refund_amount: 2,
  revenue_amount: 2,
  settlement_amount: 2,
  fee_tax_amount: 2,
  total_fee: 2,
  subtotal_before_discount_amount: 2,
  refund_subtotal_before_discount_amount: 2,
  seller_discount_amount: 2,
  seller_discount_refund_amount: 2,
  affiliate_ads_commission_amount: 2,
  affiliate_commission_amount: 2,
  affiliate_commission_amount_before_pit: 2,
  affiliate_partner_commission_amount: 2,
  live_specials_fee_amount: 2,
  platform_commission_amount: 2,
  pre_order_service_fee_amount: 2,
  transaction_fee_amount: 2,
  vn_fix_infrastructure_fee: 2,
  voucher_xtra_service_fee_amount: 2,
  shipping_fee_guarantee_service_fee: 2,
  shipping_cost_amount: 2,
  pit_amount: 2,
  vat_amount: 2,
  actual_shipping_fee_amount: 2,
  shipping_fee_discount_amount: 2,
  platform_shipping_fee_discount_amount: 2,
  adjustment_amount: 2,
  hash: 1,
  id: 1,
};

export const TRANSACTION_UI_TYPE_MAP = {
  order_id: "Text",
  transaction_id: "Text",
  adjustment_id: "Text",
  statement_id: "Text",
  order_create_time: "DateTime",
  statement_time: "DateTime",
  type: "Text",
  shop_id: "Text",
  shop_name: "Text",
  customer_payment_amount: "Currency",
  customer_refund_amount: "Currency",
  platform_cofunded_discount_amount: "Currency",
  platform_cofunded_discount_refund_amount: "Currency",
  platform_discount_amount: "Currency",
  platform_discount_refund_amount: "Currency",
  retail_delivery_fee_amount: "Currency",
  retail_delivery_fee_payment_amount: "Currency",
  retail_delivery_fee_refund_amount: "Currency",
  sales_tax_amount: "Currency",
  sales_tax_payment_amount: "Currency",
  sales_tax_refund_amount: "Currency",
  seller_cofunded_discount_amount: "Currency",
  seller_cofunded_discount_refund_amount: "Currency",
  revenue_amount: "Currency",
  settlement_amount: "Currency",
  fee_tax_amount: "Currency",
  total_fee: "Currency",
  subtotal_before_discount_amount: "Currency",
  refund_subtotal_before_discount_amount: "Currency",
  seller_discount_amount: "Currency",
  seller_discount_refund_amount: "Currency",
  affiliate_ads_commission_amount: "Currency",
  affiliate_commission_amount: "Currency",
  affiliate_commission_amount_before_pit: "Currency",
  affiliate_partner_commission_amount: "Currency",
  live_specials_fee_amount: "Currency",
  platform_commission_amount: "Currency",
  pre_order_service_fee_amount: "Currency",
  transaction_fee_amount: "Currency",
  vn_fix_infrastructure_fee: "Currency",
  voucher_xtra_service_fee_amount: "Currency",
  shipping_fee_guarantee_service_fee: "Currency",
  shipping_cost_amount: "Currency",
  pit_amount: "Currency",
  vat_amount: "Currency",
  actual_shipping_fee_amount: "Currency",
  shipping_fee_discount_amount: "Currency",
  platform_shipping_fee_discount_amount: "Currency",
  adjustment_amount: "Currency",
  hash: "Text",
  id: "Text",
};

// =============================
// MAPPING FIELD GMV FOR ALL
// =============================
export const LARK_GMV_FOR_ALL_MAP = {
  advertiser_id: "Id tài khoản QC",
  store_id: "Id cửa hàng",
  stat_time_day: "Ngày",
  cost: "Chi phí quảng cáo",
  cost_per_order: "Chi phí mỗi đơn",
  gross_revenue: "Doanh thu",
  net_cost: "Chi phí thực tế",
  orders: "Số đơn hàng",
  roi: "Hiệu suất ROI",
  hash: "hash",
  id: "ID định danh (TTS)",
};
/** Map type gmv for all
 * Mỗi field tương ứng 1 type trong Lark:
 * 1 - text, 2 - number, 5 - datetime
 */
export const GMVFORALL_TYPE_MAP = {
  advertiser_id: 1,
  store_id: 1,
  stat_time_day: 5,
  cost: 2,
  cost_per_order: 2,
  gross_revenue: 2,
  net_cost: 2,
  orders: 2,
  roi: 2,
  hash: 1,
  id: 1,
};

export const GMVFORALL_UI_TYPE_MAP = {
  advertiser_id: "Text",
  store_id: "Text",
  stat_time_day: "DateTime",
  cost: "Currency",
  cost_per_order: "Currency",
  gross_revenue: "Currency",
  net_cost: "Currency",
  orders: "Currency",
  roi: "Currency",
  hash: "Text",
  id: "Text",
};

// =============================
// MAPPING FIELD GMV FOR PRODUCT
// =============================
export const LARK_GMV_FOR_PRODUCT_MAP = {
  advertiser_id: "Id tài khoản QC",
  store_id: "Id cửa hàng",
  stat_time_day: "Ngày",
  campaign_id: "Id chiến dịch",
  campaign_name: "Tên chiến dịch",
  operation_status: "Trạng thái chiến dịch",
  schedule_type: "Kiểu lịch chạy",
  schedule_start_time: "Thời gian bắt đầu",
  schedule_end_time: "Thời gian kết thúc",
  bid_type: "Kiểu đấu thầu",
  roas_bid: "ROAS bid",
  max_delivery_budget: "Ngân sách tối đa",
  target_roi_budget: "Ngân sách mục tiêu ROI",
  cost: "Chi phí quảng cáo",
  net_cost: "Chi phí thực tế",
  orders: "Số đơn hàng",
  cost_per_order: "Chi phí mỗi đơn",
  gross_revenue: "Doanh thu",
  roi: "Hiệu suất ROI",
  id: "ID định danh (TTS)",
  hash: "hash",
};
/** Map type gmv for product
 * Mỗi field tương ứng 1 type trong Lark:
 * 1 - text, 2 - number, 5 - datetime
 */
export const GMVFORPRODUCT_TYPE_MAP = {
  advertiser_id: 1,
  store_id: 1,
  stat_time_day: 5,
  campaign_id: 1,
  campaign_name: 1,
  operation_status: 1,
  schedule_type: 1,
  schedule_start_time: 5,
  schedule_end_time: 5,
  bid_type: 1,
  roas_bid: 2,
  max_delivery_budget: 2,
  target_roi_budget: 2,
  cost: 2,
  net_cost: 2,
  orders: 2,
  cost_per_order: 2,
  gross_revenue: 2,
  roi: 2,
  id: 1,
  hash: 1,
};

export const GMVFORPRODUCT_UI_TYPE_MAP = {
  advertiser_id: "Text",
  store_id: "Text",
  stat_time_day: "DateTime",
  campaign_id: "Text",
  campaign_name: "Text",
  operation_status: "Text",
  schedule_type: "Text",
  schedule_start_time: "DateTime",
  schedule_end_time: "DateTime",
  bid_type: "Text",
  roas_bid: "Currency",
  max_delivery_budget: "Currency",
  target_roi_budget: "Currency",
  cost: "Currency",
  net_cost: "Currency",
  orders: "Currency",
  cost_per_order: "Currency",
  gross_revenue: "Currency",
  roi: "Currency",
  id: "Text",
  hash: "Text",
};

export const LARK_GMV_FOR_LIVE_MAP = {
  advertiser_id: "Id tài khoản QC",
  store_id: "Id cửa hàng",

  campaign_id: "ID chiến dịch",
  campaign_name: "Tên chiến dịch",
  stat_time_day: "Ngày",

  cost: "Chi phí quảng cáo",
  cost_per_order: "Chi phí mỗi đơn",
  gross_revenue: "Doanh thu",
  net_cost: "Chi phí thực",
  orders: "Đơn hàng",
  roi: "ROI",

  ten_second_live_views: "Lượt xem 10s",
  live_views: "Lượt xem livestream",
  live_follows: "Lượt follow trong live",
  cost_per_live_view: "Chi phí / view",
  cost_per_10_second_live_view: "Chi phí / view 10s",

  bid_type: "Kiểu đấu thầu",
  operation_status: "Trạng thái chạy",
  roas_bid: "ROAS bid",
  max_delivery_budget: "Ngân sách tối đa",
  target_roi_budget: "Ngân sách mục tiêu ROI",

  schedule_type: "Loại lịch chạy",
  schedule_start_time: "Thời gian bắt đầu",
  schedule_end_time: "Thời gian kết thúc",

  identity_id: "ID Creator Live",
  tt_account_name: "Tên Creator Live",
  tt_account_profile_image_url: "Avatar Creator",

  classify: "Loại",
  live_staff: "Người live",

  id: "ID định danh (TTS)",
  hash: "hash",
};

export const GMVFORLIVE_TYPE_MAP = {
  id: 1,
  advertiser_id: 1,
  store_id: 1,
  campaign_id: 1,
  stat_time_day: 5,
  cost: 2,
  cost_per_order: 2,
  gross_revenue: 2,
  net_cost: 2,
  orders: 2,
  roi: 2,
  ten_second_live_views: 2,
  live_views: 2,
  live_follows: 2,
  cost_per_live_view: 2,
  cost_per_10_second_live_view: 2,
  bid_type: 1,
  operation_status: 1,
  roas_bid: 2,
  max_delivery_budget: 2,
  target_roi_budget: 2,
  campaign_name: 1,
  schedule_type: 1,
  schedule_start_time: 5,
  schedule_end_time: 5,
  identity_id: 1,
  tt_account_name: 1,
  tt_account_profile_image_url: 1,
  classify: 1,
  live_staff: 1,
  hash: 1,
};

export const GMVFORLIVE_UI_TYPE_MAP = {
  id: "Text",
  advertiser_id: "Text",
  store_id: "Text",
  campaign_id: "Text",
  stat_time_day: "DateTime",
  cost: "Currency",
  cost_per_order: "Currency",
  gross_revenue: "Currency",
  net_cost: "Currency",
  orders: "Currency",
  roi: "Currency",
  ten_second_live_views: "Currency",
  live_views: "Currency",
  live_follows: "Currency",
  cost_per_live_view: "Currency",
  cost_per_10_second_live_view: "Currency",
  bid_type: "Text",
  operation_status: "Text",
  roas_bid: "Currency",
  max_delivery_budget: "Currency",
  target_roi_budget: "Currency",
  campaign_name: "Text",
  schedule_type: "Text",
  schedule_start_time: "DateTime",
  schedule_end_time: "DateTime",
  identity_id: "Text",
  tt_account_name: "Text",
  tt_account_profile_image_url: "Text",
  classify: "Text",
  live_staff: "Text",
  hash: "Text",
};

export const LARK_TRANSACTION_ADS_MAP = {
  create_time: "Ngày tạo giao dịch",
  transaction_id: "ID giao dịch",
  account_id: "ID tài khoản Ads",
  account_name: "Tên tài khoản Ads",
  serial_number: "Số giao dịch",
  bc_name: "Tên BC",
  billing_type: "Loại thanh toán",
  subtotal: "Tổng phụ", // không bao gồm thuế
  payment_portfolio_id: "ID danh mục thanh toán",
  payment_portfolio_name: "Tên danh mục thanh toán",
  amount: "Số tiền",
  amount_type: "Loại số tiền",
  tax_amount: "Thuế",
  invoice_id: "ID hóa đơn",
  bc_id: "ID Business Center",
  transaction_type: "Loại giao dịch",
  timezone: "Múi giờ",
  currency: "Loại tiền",

  id: "ID định danh (TTS)",
  hash: "hash",
};

export const TRANSACTION_ADS_TYPE_MAP = {
  create_time: 5,
  transaction_id: 1,
  invoice_id: 1,
  payment_portfolio_id: 1,
  payment_portfolio_name: 1,
  account_id: 1,
  bc_id: 1,
  account_name: 1,
  serial_number: 1,
  bc_name: 1,
  billing_type: 1,
  subtotal: 2,
  amount: 2,
  amount_type: 1,
  tax_amount: 2,
  transaction_type: 1,
  timezone: 1,
  currency: 1,

  id: 1,
  hash: 1,
};

export const TRANSACTION_ADS_UI_TYPE_MAP = {
  transaction_id: "Text",
  account_id: "Text",
  account_name: "Text",
  create_time: "DateTime",
  serial_number: "Text",
  bc_name: "Text",
  billing_type: "Text",
  subtotal: "Currency",
  payment_portfolio_id: "Text",
  payment_portfolio_name: "Text",
  amount: "Currency",
  amount_type: "Text",
  tax_amount: "Currency",
  invoice_id: "Text",
  bc_id: "Text",
  transaction_type: "Text",
  timezone: "Text",
  currency: "Text",

  id: "Text",
  hash: "Text",
};

export const RETURN_ORDER_FIELD_MAP = {
  order_id: "Mã đơn hàng",
  return_id: "Mã trả hàng",
  combined_return_id: "Mã trả hàng gộp",
  create_time: "Ngày tạo",
  handover_method: "Phương thức bàn giao",
  is_combined_return: "Trả hàng gộp",
  return_method: "Phương thức trả hàng",
  return_provider_id: "ID đơn vị vận chuyển",
  return_provider_name: "Tên đơn vị vận chuyển",
  // return_reason: "Mã lý do trả hàng",
  return_reason_text: "Lý do trả hàng",
  return_status: "Trạng thái trả hàng",
  return_line_items: "Sản phẩm trả hàng",
  return_tracking_number: "Mã vận đơn trả hàng",
  return_type: "Loại trả hàng",
  role: "Vai trò",
  shipment_type: "Loại vận chuyển",
  update_time: "Thời gian cập nhật",
  shop_id: "ID Shop",
  shop_name: "Tên Shop",

  // Các field tổng trong object refund_amount
  refund_shipping_fee: "Phí ship được refund",
  refund_subtotal: "Subtotal refund",
  refund_tax: "Thuế được refund",
  refund_total: "Tổng refund",

  // discount_amount[]
  product_platform_discount: "Giảm giá nền tảng (sản phẩm)",
  product_seller_discount: "Giảm giá người bán (sản phẩm)",
  shipping_fee_platform_discount: "Giảm giá vận chuyển nền tảng",
  shipping_fee_seller_discount: "Giảm giá vận chuyển người bán",

  // shipping_fee_amount[]
  buyer_paid_return_shipping_fee: "Phí trả hàng do người mua trả",
  platform_paid_return_shipping_fee: "Phí trả hàng nền tảng trả",
  seller_paid_return_shipping_fee: "Phí trả hàng người bán trả",
  id: "ID định danh (TTS)",
  hash: "hash",
};

export const RETURN_ORDER_TYPE_MAP = {
  combined_return_id: 1,
  create_time: 5,
  handover_method: 1,
  is_combined_return: 1,
  order_id: 1,
  return_id: 1,
  return_method: 1,
  return_provider_id: 1,
  return_provider_name: 1,
  // return_reason: 1,
  return_reason_text: 1,
  return_status: 1,
  return_line_items: 1,
  return_tracking_number: 1,
  return_type: 1,
  role: 1,
  shipment_type: 1,
  update_time: 5,
  shop_id: 1,
  shop_name: 1,

  // refund amount
  refund_shipping_fee: 2,
  refund_subtotal: 2,
  refund_tax: 2,
  refund_total: 2,

  // discount_amount
  product_platform_discount: 2,
  product_seller_discount: 2,
  shipping_fee_platform_discount: 2,
  shipping_fee_seller_discount: 2,

  // shipping_fee_amount
  buyer_paid_return_shipping_fee: 2,
  platform_paid_return_shipping_fee: 2,
  seller_paid_return_shipping_fee: 2,

  hash: 1,
  id: 1,
};

export const RETURN_ORDER_UI_TYPE_MAP = {
  create_time: "DateTime",
  update_time: "DateTime",

  refund_shipping_fee: "Currency",
  refund_subtotal: "Currency",
  refund_tax: "Currency",
  refund_total: "Currency",

  product_platform_discount: "Currency",
  product_seller_discount: "Currency",
  shipping_fee_platform_discount: "Currency",
  shipping_fee_seller_discount: "Currency",

  buyer_paid_return_shipping_fee: "Currency",
  platform_paid_return_shipping_fee: "Currency",
  seller_paid_return_shipping_fee: "Currency",
};

export const ORDER_FB_FIELD_MAP = {
  id: "Mã tuỳ chỉnh",
  created_at: "Ngày tạo",
  updated_at: "Thời gian cập nhật",

  assigning_seller_id: "Id người xử lý",
  assigning_seller_name: "Người xử lý",
  assigning_seller_time_assign: "Thời gian xử lý",

  order_source: "Nguồn",
  page_id: "Page Id",
  page_name: "Page",

  total_price: "Tổng tiền hàng gốc",
  total_price_after_discount: "Tổng tiền sau giảm",
  fee_marketplace: "Phí sàn",
  advanced_platform_fee: "Phí nền tảng",

  cod: "COD thực thu",
  charged_by_momo: "Thanh toán Momo",
  transfer_money: "Chuyển khoản",

  shipping_fee: "Phí giao hàng",
  partner_fee: "Phí đối tác vận chuyển",

  partner_cod: "COD vận chuyển",
  partner_cod_amount: "COD DVVC ghi nhận",
  partner_cod_failed_amount: "COD thất bại",
  partner_insurance_value: "Giá trị bảo hiểm",

  status: "Trạng thái cuối",
  status_timeline_text: "Dòng thời gian trạng thái",

  is_livestream: "Đơn livestream",
  is_live_shopping: "Đơn Live Shopping",
  received_at_shop: "Đã nhận tại shop",
  hash: "hash",
};

export const ORDER_FB_TYPE_MAP = {
  id: 1,
  created_at: 5,
  updated_at: 5,

  assigning_seller_id: 1,
  assigning_seller_name: 1,
  assigning_seller_time_assign: 5,

  order_source: 1,
  page_id: 1,
  page_name: 1,

  total_price: 2,
  total_price_after_discount: 2,
  fee_marketplace: 2,
  advanced_platform_fee: 2,

  cod: 2,
  charged_by_momo: 2,
  transfer_money: 2,

  shipping_fee: 2,
  partner_fee: 2,

  partner_cod: 2,
  partner_cod_amount: 2,
  partner_cod_failed_amount: 2,
  partner_insurance_value: 2,

  status: 1,
  status_timeline_text: 1,

  is_livestream: 1,
  is_live_shopping: 1,
  received_at_shop: 1,
  hash: 1,
};

export const ORDER_FB_UI_TYPE_MAP = {
  id: "Text",
  created_at: "DateTime",
  updated_at: "DateTime",

  assigning_seller_id: "Text",
  assigning_seller_name: "Text",
  assigning_seller_time_assign: "DateTime",

  order_source: "Text",
  page_id: "Text",
  page_name: "Text",

  total_price: "Currency",
  total_price_after_discount: "Currency",
  fee_marketplace: "Currency",
  advanced_platform_fee: "Currency",

  cod: "Currency",
  charged_by_momo: "Currency",
  transfer_money: "Currency",

  shipping_fee: "Currency",
  partner_fee: "Currency",

  partner_cod: "Currency",
  partner_cod_amount: "Currency",
  partner_cod_failed_amount: "Currency",
  partner_insurance_value: "Currency",

  status: "Text",
  status_timeline_text: "Text",

  is_livestream: "Text",
  is_live_shopping: "Text",
  received_at_shop: "Text",
  hash: "Text",
};
