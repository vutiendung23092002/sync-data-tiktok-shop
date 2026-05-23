# Sync Data TikTok K

Project Node.js dùng để đồng bộ dữ liệu TikTok Shop của shop K/Han sang LarkBase.

## Chức năng chính

```json
{
  "sync_orders": {
    "entry": "sync-orders-k.js",
    "source": ["TikTok Shop Orders API", "KiotViet Products API"],
    "target": ["LarkBase bảng Orders", "LarkBase bảng Order Items", "LarkBase bảng SKUS"],
    "description": "Lấy đơn hàng TikTok theo khoảng ngày, format dữ liệu đơn, item và SKU; lấy giá vốn theo SKU từ KiotViet rồi upsert vào LarkBase."
  },
  "sync_finance": {
    "entry": "sync-finance-k.js",
    "source": "TikTok Shop Finance Statement API",
    "target": "LarkBase bảng Finance",
    "description": "Lấy statement và transaction tài chính theo khoảng ngày, format các khoản doanh thu/phí/thuế/hoàn tiền rồi upsert vào LarkBase."
  },
  "sync_return_refund": {
    "entry": "sync-return-refun.js",
    "source": "TikTok Shop Return Refund API",
    "target": "LarkBase bảng Return Refund",
    "description": "Lấy danh sách yêu cầu trả hàng/hoàn tiền theo khoảng ngày, format thông tin refund, phí ship, lý do trả hàng rồi upsert vào LarkBase."
  },
  "re_auth_token": {
    "entry": "re-auth-token-tiktok.js",
    "source": "TikTok auth_code",
    "target": "Supabase envCloud",
    "description": "Đổi auth_code lấy access_token/refresh_token mới và lưu token đã mã hoá vào Supabase."
  }
}
```

## Luồng xử lý

1. Đọc cấu hình từ `.env`.
2. Refresh TikTok access token từ token đang lưu ở Supabase.
3. Lấy danh sách shop đã uỷ quyền từ TikTok Shop.
4. Gọi API TikTok theo từng shop và phân trang đến hết dữ liệu.
5. Chuẩn hoá dữ liệu qua các formatter trong `src/utils/tiktok`.
6. Tạo `id` định danh và `hash` để so sánh dữ liệu mới/cũ.
7. Tìm hoặc tạo bảng LarkBase theo field map.
8. Lấy record hiện có trong khoảng ngày cần sync.
9. Chỉ tạo mới/cập nhật record có thay đổi.

## Entrypoint

```json
{
  "orders": "node sync-orders-k.js",
  "finance": "node sync-finance-k.js",
  "return_refund": "node sync-return-refun.js",
  "re_auth": "node re-auth-token-tiktok.js"
}
```

## Biến môi trường

```json
{
  "common": [
    "DATABASE_SERVICE_KEY",
    "AES_256_CBC_APP_SECRET_KEY",
    "BASE_ID_TMDT",
    "FROM",
    "TO"
  ],
  "tiktok_han_shop": [
    "TIKTOK_PARTNER_APP_KEY_7561567100864644872",
    "TIKTOK_PARTNER_APP_SECRET_7561567100864644872"
  ],
  "tiktok_k_shop_reauth": [
    "TIKTOK_PARTNER_APP_KEY_7527154834987157254",
    "TIKTOK_PARTNER_APP_SECRET_7527154834987157254"
  ],
  "lark": [
    "LARK_TIKTOK_K_ORDER_ITEMS_APP_ID",
    "LARK_TIKTOK_K_ORDER_ITEMS_APP_SECRET"
  ],
  "kiotviet": [
    "KIOTVIET_RETAILER",
    "KIOT_CLIENT_ID",
    "KIOT_SECRET",
    "KIOTVIET_RETAILER_OLD",
    "KIOT_CLIENT_ID_OLD",
    "KIOT_SECRET_OLD"
  ],
  "orders_only": [
    "TABLE_ORDERS_NAME",
    "TABLE_ORDER_ITEMS_NAME",
    "TABLE_SKUS"
  ],
  "finance_or_return_refund": [
    "TABLE_NAME"
  ],
  "reauth_only": [
    "AUTH_CODE",
    "CHOICE"
  ]
}
```

`FROM` và `TO` dùng format `YYYY/MM/DD`. Script tự thêm giờ:

```json
{
  "FROM": "YYYY/MM/DD 00:00:00",
  "TO": "YYYY/MM/DD 23:59:59",
  "timezone": "Asia/Bangkok / Vietnam time"
}
```

## Chạy local

```bash
npm install
```

Đồng bộ đơn hàng:

```bash
$env:BASE_ID_TMDT="..."
$env:TABLE_ORDERS_NAME="Orders"
$env:TABLE_ORDER_ITEMS_NAME="Order Items"
$env:TABLE_SKUS="SKUS"
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-orders-k.js
```

Đồng bộ tài chính:

```bash
$env:BASE_ID_TMDT="..."
$env:TABLE_NAME="Finance"
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-finance-k.js
```

Đồng bộ hoàn trả:

```bash
$env:BASE_ID_TMDT="..."
$env:TABLE_NAME="Return Refund"
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-return-refun.js
```

Re-auth TikTok token:

```bash
$env:AUTH_CODE="..."
$env:CHOICE="2"
node re-auth-token-tiktok.js
```

```json
{
  "CHOICE=1": "Shop K Lady Care",
  "CHOICE=2": "Shop Han Korea"
}
```

## GitHub Actions

```json
{
  "sync_orders": {
    "workflow": ".github/workflows/sync-orders-tiktok-k.yml",
    "schedule": "*/20 * * * *",
    "environment": "sync-order"
  },
  "sync_finance": {
    "workflow": ".github/workflows/sync-finance-titkok-k.yml",
    "schedule": "*/20 * * * *",
    "environment": "sync-finance"
  },
  "sync_return_refund": {
    "workflow": ".github/workflows/sync-return-refun.yml",
    "schedule": "*/20 * * * *",
    "environment": "sync-return-refun"
  },
  "re_auth_token": {
    "workflow": ".github/workflows/re-auth-token-tiktok.yml",
    "trigger": "workflow_dispatch",
    "environment": "sync-data-tiktok-k"
  }
}
```

## Cấu trúc thư mục

```json
{
  "src/config": "URL API, path API, biến môi trường",
  "src/core": "client gọi TikTok, LarkBase, KiotViet, Supabase",
  "src/services/tiktok": "service lấy orders, statements, returns, token",
  "src/services/larkbase": "service tạo bảng, tìm record, tạo/cập nhật record",
  "src/services/kiot": "service lấy access token và danh sách sản phẩm KiotViet",
  "src/utils/tiktok": "format dữ liệu TikTok và tạo chữ ký API",
  "src/utils/larkbase": "field map và helper build field LarkBase",
  "src/utils/common": "helper ngày giờ, hash, retry, diff, file"
}
```

## Ghi chú vận hành

- Đồng bộ LarkBase dùng `id` làm khóa định danh và `hash` để phát hiện record thay đổi.
- Bảng LarkBase chưa tồn tại sẽ được tạo tự động theo field map tương ứng.
- `sync-orders-k.js` có ghi file debug JSON vào `src/data`.
- Khi update order items, các field `Giá vốn` và `Mã sản phẩm` không bị ghi đè nếu LarkBase đã có dữ liệu cũ.
- Workflow đang chạy định kỳ mỗi 20 phút và cũng hỗ trợ chạy tay bằng `workflow_dispatch`.
