import http from "./http-client.js";
import {
  TIKTOK_AUTH_URL,
  TIKTOK_BASE_URL,
  API_PATHS_TIKTOK,
} from "../config/constants.js";

function requestTikTokShopApi(method, path, { params, headers, body } = {}) {
  const requestConfig = {
    baseURL: TIKTOK_BASE_URL,
    headers,
    params,
  };

  if (method === "POST") {
    return http.post(path, body, requestConfig);
  }

  return http.get(path, requestConfig);
}

/**
 * Lấy access_token TikTok Shop bằng auth_code (bước cuối OAuth).
 * @param { JSON } params 
 * {
      app_key:  Authorization code trả về từ TikTok OAuth,
      app_secret: App Key TikTok Shop.,
      auth_code: App Secret TikTok Shop.,
      grant_type: "authorized_code",
    };
 * @returns {Promise<Object>} Dữ liệu token: access_token, refresh_token, expiry,...
 */
export async function getTikTokAccessToken(params) {
  const res = await http.get(API_PATHS_TIKTOK.TIKTOK_GET_TOKEN, {
    baseURL: TIKTOK_AUTH_URL,
    params,
  });

  return res;
}

/**
 * Làm mới access_token TikTok Shop bằng refresh_token.
 * @param {JSON} params = {
    app_key: App Key TikTok Shop.,
    app_secret: App Secret TikTok Shop,
    refresh_token: Refresh token hiện tại,
    grant_type: "refresh_token",
  };
 * @returns {Promise<Object>} Token mới.
 */
export async function refreshTikTokAccessToken(params) {
  const res = await http.get(API_PATHS_TIKTOK.TIKTOK_REFRESH_TOKEN, {
    baseURL: TIKTOK_AUTH_URL,
    params,
  });

  return res;
}

/**
 * Lấy danh sách shop mà app đang được uỷ quyền (TikTok Partner API).
 * @param {string} appSecret - App Secret TikTok.
 * @param {JSON} params = {
    app_key: App Key TikTok,
    timestamp, - Thời điểm hiện tại curent time
  };
 * @param {JSON} headers = {
    "x-tts-access-token": x-tts-access-token của shop,
  };
 * @returns {Promise<Object>} Danh sách shop: id, cipher, name,...
 */
export async function getAuthorizedShops(headers, params, path) {
  return requestTikTokShopApi("GET", path, { headers, params });
}

/**
 * Tìm kiếm danh sách đơn hàng (order/search).
 *
 * @param {string} path - path của endpoint get order list.
 * @param {JSON} params
 *               app_key: App Key TikTok Shop,
 *               timestamp: current time,
 *               sort_order: "DESC" sắp xếp theo sort_field từ lớn - bé (ASC ngc lại),
 *               sort_field: "create_time" - chỉ định sắp xếp theo create time,
 *               shop_cipher: shop.cipher - mã cipher của shop,
 *               page_token: id của trang cần lấy (100 order 1 trang)
 *               sign: chữ ký
 * @param {JSON} headers
 *               "x-tts-access-token": access_token tiktok shop,
 *               "Content-Type": "application/json",
 * @param {JSON} body
 *               create_time_ge: lấy từ thời gian (from) - timestamp
 *               create_time_lt: đến thời gian (to) - timestamp
 * @returns {Promise<Object>} Danh sách đơn hàng.
 */
export async function getOrdersList(path, params, headers, body) {
  return requestTikTokShopApi("POST", path, { headers, params, body });
}

/**
 * Lấy danh sách bảng kê (statements) của shop.
 *
 * @param {string} path - path get statement.
 * @param {JSON} params - params.
 * @param {JSON} headers - headers.
 * @returns {Promise<Object>} Danh sách statement.
 */
export async function getStatements(path, params, headers) {
  return requestTikTokShopApi("GET", path, { headers, params });
}

/**
 * Lấy danh sách giao dịch thuộc một statement.
 *
 * @param {string} path - path get transaction by statement.
 * @param {JSON} params - params.
 * @param {JSON} headers - headers.
 * @returns {Promise<Object>} Transaction listing.
 */
export async function getTransactionByStatement(path, params, headers) {
  return requestTikTokShopApi("GET", path, { headers, params });
}

/**
 * Lấy danh sách giao dịch thuộc một statement.
 *
 * @param {string} path - path get transaction by statement.
 * @param {JSON} params - params.
 * @param {JSON} headers - headers.
 * @param {JSON} body - body.
 * @returns {Promise<Object>} Transaction listing.
 */
export async function searchReturns(path, params, headers, body) {
  return requestTikTokShopApi("POST", path, { headers, params, body });
}
