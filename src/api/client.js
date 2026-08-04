// Centralized Axios instance — every role's api file (auth/participant/
// organizer/judge) imports this, never creates its own axios instance.
//
// Responsibilities:
//  - Attach the JWT to every outgoing request.
//  - Unwrap the backend's ResponseStatus<T> envelope: { success, message, data }.
//  - Normalize errors into one shape so every screen can render them the same way.
//  - React to 401s by clearing the session (AuthContext hooks into this).
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken, clearAuth } from '../utils/storage';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://10.112.176.82:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every outgoing request.
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[apiClient] No token found in SecureStore for request: ${config.method?.toUpperCase()} ${config.url}`);
    }
  } catch (err) {
    // If SecureStore itself throws (native module not linked, keychain
    // access denied, etc.) we still want the request to go out so the
    // backend's 401 tells us clearly what happened, instead of the app
    // silently hanging on this interceptor.
    console.error('[apiClient] Failed to read token from SecureStore:', err);
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