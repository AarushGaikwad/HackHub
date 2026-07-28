import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, clearAuth } from '../utils/storage';
 
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.40.124.217:8080';
 
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
 
// Attach JWT on every outgoing request.
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// AuthContext registers a handler here so a 401 anywhere in the app can force
// logout without api/client.js importing AuthContext (which would be circular).
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
 
// Every backend endpoint returns ResponseStatus<T> = { success, message, data }.
// api files call this so screens only ever deal with plain data, never the envelope.
export function unwrap(promise) {
  return promise.then((res) => res.data.data);
}
 
export default apiClient;