import * as utils from "../../utils/index.js";

export function createTikTokHeaders(accessToken, hasJsonBody = false) {
  const headers = {
    "x-tts-access-token": accessToken,
  };

  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function createShopPageParams({
  appKey,
  shop,
  pageSize,
  sortField,
  nextPageToken,
}) {
  const params = {
    app_key: appKey,
    timestamp: Math.floor(Date.now() / 1000),
    page_size: pageSize,
    sort_order: "DESC",
    sort_field: sortField,
    shop_cipher: shop.cipher,
  };

  if (nextPageToken) params.page_token = nextPageToken;

  return params;
}

export function signTikTokParams({
  appSecret,
  path,
  params,
  body = null,
  method = "GET",
}) {
  const sign = utils.generateTikTokSignSmart({
    appSecret,
    path,
    params,
    body,
    method,
  });

  if (sign) params.sign = sign;

  return params;
}

