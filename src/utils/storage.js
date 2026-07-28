import * as SecureStore from 'expo-secure-store';
 
const TOKEN_KEY = 'hackhub_auth_token';
const USER_KEY = 'hackhub_auth_user';
 
export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
 
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
 
export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
 
export async function saveUser(user) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}
 
export async function getUser() {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}
 
export async function deleteUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}
 
export async function clearAuth() {
  await Promise.all([deleteToken(), deleteUser()]);
}