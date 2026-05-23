# TikTok Shop to LarkBase Sync

Project Node.js đồng bộ dữ liệu từ TikTok Shop và hệ thống quản lý sản phẩm sang LarkBase.

## Chức Năng

```json
{
  "sync_orders": {
    "entry": "sync-orders-k.js",
    "target": ["Orders", "Order Items", "SKUS"],
    "description": "Đồng bộ đơn hàng, chi tiết sản phẩm trong đơn và danh mục SKU."
  },
  "sync_finance": {
    "entry": "sync-finance-k.js",
    "target": ["Finance"],
    "description": "Đồng bộ statement và transaction tài chính."
  },
  "sync_return_refund": {
    "entry": "sync-return-refun.js",
    "target": ["Return Refund"],
    "description": "Đồng bộ yêu cầu trả hàng và hoàn tiền."
  },
  "re_auth_token": {
    "entry": "re-auth-token-tiktok.js",
    "description": "Cập nhật token uỷ quyền TikTok cho shop được chọn."
  }
}
```

## Luồng Xử Lý

1. Đọc cấu hình từ biến môi trường.
2. Lấy token truy cập hợp lệ cho TikTok Shop.
3. Lấy dữ liệu theo từng shop được uỷ quyền và phân trang đến hết.
4. Chuẩn hoá dữ liệu bằng formatter tương ứng.
5. So sánh định danh và hash để chỉ tạo mới/cập nhật record thay đổi.
6. Ghi dữ liệu vào các bảng LarkBase.

## Shop Mẫu

```json
{
  "CHOICE=1": "SHOP_A",
  "CHOICE=2": "SHOP_B"
}
```

## Biến Môi Trường

Tên biến dưới đây là mẫu public-safe. Khi triển khai, ánh xạ chúng sang secret/config tương ứng của môi trường chạy.

```json
{
  "credentials": [
    "TIKTOK_APP_KEY",
    "TIKTOK_APP_SECRET",
    "LARK_APP_ID",
    "LARK_APP_SECRET",
    "KIOT_CLIENT_ID",
    "KIOT_CLIENT_SECRET",
    "DATABASE_SERVICE_KEY",
    "AES_SECRET_KEY"
  ],
  "sync_config": [
    "BASE_ID",
    "TABLE_ORDERS_NAME",
    "TABLE_ORDER_ITEMS_NAME",
    "TABLE_SKUS",
    "TABLE_FINANCE_NAME",
    "TABLE_RETURN_REFUND_NAME",
    "FROM",
    "TO"
  ],
  "reauth_config": [
    "AUTH_CODE",
    "CHOICE"
  ]
}
```

`FROM` và `TO` dùng format `YYYY/MM/DD`:

```json
{
  "FROM": "YYYY/MM/DD",
  "TO": "YYYY/MM/DD"
}
```

## Chạy Local

Cài dependency:

```powershell
npm install
```

Tạo file `.env` local hoặc thiết lập biến môi trường cần thiết bằng tên secret/config của hệ thống triển khai.

Đồng bộ đơn hàng, order items và SKUS:

```powershell
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-orders-k.js
```

Đồng bộ tài chính:

```powershell
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-finance-k.js
```

Đồng bộ trả hàng/hoàn tiền:

```powershell
$env:FROM="2026/05/01"
$env:TO="2026/05/23"
node sync-return-refun.js
```

Re-auth token:

```powershell
$env:AUTH_CODE="..."
$env:CHOICE="1"
node re-auth-token-tiktok.js
```

## Tự Động Hoá

Project có thể chạy bằng GitHub Actions theo lịch hoặc chạy thủ công qua `workflow_dispatch`. Secrets và environments cần được cấu hình trực tiếp trong repository/deployment, không lưu trong source code.

## Cấu Trúc Thư Mục

```json
{
  "src/config": "Cấu hình endpoint và biến môi trường",
  "src/core": "API client",
  "src/services/tiktok": "Dịch vụ lấy dữ liệu TikTok và token",
  "src/services/larkbase": "Dịch vụ đồng bộ LarkBase",
  "src/services/kiot": "Dịch vụ lấy thông tin sản phẩm/giá vốn",
  "src/utils/tiktok": "Formatter và helper TikTok",
  "src/utils/larkbase": "Field map và helper LarkBase",
  "src/utils/common": "Helper dùng chung"
}
```

## Ghi Chú Vận Hành

- Dữ liệu được đồng bộ theo cơ chế định danh/hash để giảm cập nhật không cần thiết.
- Dữ liệu SKU được deduplicate trước khi đồng bộ.
- Khi update order items, dữ liệu được quản lý thủ công trên LarkBase được bảo toàn theo cấu hình hiện tại.
- Không commit file `.env`, token, secret hoặc file debug chứa dữ liệu thực tế.
