import http from "./http-client.js";
import {
  KIOT_PUBLIC_URL,
  KIOT_AUTH_URL,
  API_PATHS_KIOT,
} from "../config/constants.js";

export async function getAccessToken(clientId, clientSecret) {
  const params = {
    scopes: "PublicApi.Access",
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  };

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const res = await http.post(
    API_PATHS_KIOT.GET_ACCESS_TOKEN,
    new URLSearchParams(params),
    {
      baseURL: KIOT_AUTH_URL,
      headers,
    }
  );
  return res;
}


export async function getProducts(accessToken, params, retailer) {
  const headers = {
    Retailer: retailer,
    Authorization: `Bearer ${accessToken}`,
  };

  return await http.get(API_PATHS_KIOT.GET_PRODUCTS, {
    baseURL: KIOT_PUBLIC_URL,
    headers,
    params,
  });
}
