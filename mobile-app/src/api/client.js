import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, clearAuth } from '../utils/storage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.0.107:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[apiClient] No token found in SecureStore for request: ${config.method?.toUpperCase()} ${config.url}`);
    }
  } catch (err) {
    console.error('[apiClient] Failed to read token from SecureStore:', err);
  }
  return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      await clearAuth();
      if (onUnauthorized) onUnauthorized();
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject({ status, message, raw: error });
  }
);

export function unwrap(promise) {
  return promise.then((res) => res.data.data);
}

export default apiClient;