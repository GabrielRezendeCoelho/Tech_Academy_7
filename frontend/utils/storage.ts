// Cross-platform storage utility: uses AsyncStorage on native and localStorage on web.
import { Platform } from 'react-native';
let AsyncStorage: any;

try {
  // Lazy require to avoid bundling issues if not installed yet
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const isWeb = Platform.OS === 'web';

function warnMissingAsyncStorage() {
  if (!AsyncStorage && !isWeb) {
    // eslint-disable-next-line no-console
    console.warn('[storage] AsyncStorage não instalado. Execute: expo install @react-native-async-storage/async-storage');
  }
}

export async function storageSet(key: string, value: string) {
  if (isWeb) {
    try { window.localStorage.setItem(key, value); } catch {}
    return;
  }
  if (!AsyncStorage) { warnMissingAsyncStorage(); return; }
  await AsyncStorage.setItem(key, value);
}

export async function storageGet(key: string): Promise<string | null> {
  if (isWeb) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  }
  if (!AsyncStorage) { warnMissingAsyncStorage(); return null; }
  return AsyncStorage.getItem(key);
}

export async function storageRemove(key: string) {
  if (isWeb) {
    try { window.localStorage.removeItem(key); } catch {}
    return;
  }
  if (!AsyncStorage) { warnMissingAsyncStorage(); return; }
  await AsyncStorage.removeItem(key);
}

export async function storageClear() {
  if (isWeb) {
    try { window.localStorage.clear(); } catch {}
    return;
  }
  if (!AsyncStorage) { warnMissingAsyncStorage(); return; }
  await AsyncStorage.clear();
}

export async function storageMultiGet(keys: string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  if (isWeb) {
    for (const k of keys) {
      try { out[k] = window.localStorage.getItem(k); } catch { out[k] = null; }
    }
    return out;
  }
  if (!AsyncStorage) { warnMissingAsyncStorage(); keys.forEach(k => out[k] = null); return out; }
  const res = await AsyncStorage.multiGet(keys);
  res.forEach(([k, v]: [string, string | null]) => { out[k] = v; });
  return out;
}

export const USER_NAME_KEY = 'userName';
export const USER_EMAIL_KEY = 'userEmail';
export const USER_TOKEN_KEY = 'userToken';
