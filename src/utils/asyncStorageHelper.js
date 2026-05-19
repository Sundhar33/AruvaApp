import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility wrapper for AsyncStorage with better error handling
 * Retries on initialization errors and falls back to an in-memory store
 * when the native module isn't available (e.g. web or unlinked native module).
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 500;

const inMemoryStore = new Map();
let useInMemory = false;

function isNativeModuleError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return msg.includes('native module is null') || msg.includes('cannot access legacy storage');
}

export const safeAsyncStorage = {
  async getItem(key) {
    if (useInMemory) return inMemoryStore.has(key) ? inMemoryStore.get(key) : null;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const value = await AsyncStorage.getItem(key);
        return value;
      } catch (error) {
        if (isNativeModuleError(error)) {
          console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
          useInMemory = true;
          return inMemoryStore.has(key) ? inMemoryStore.get(key) : null;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.warn(`Failed to get AsyncStorage item '${key}':`, error.message);
          return null;
        }
      }
    }
  },

  async setItem(key, value) {
    if (useInMemory) {
      inMemoryStore.set(key, value);
      return true;
    }

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (error) {
        if (isNativeModuleError(error)) {
          console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
          useInMemory = true;
          inMemoryStore.set(key, value);
          return true;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.warn(`Failed to set AsyncStorage item '${key}':`, error.message);
          return false;
        }
      }
    }
  },

  async removeItem(key) {
    if (useInMemory) {
      inMemoryStore.delete(key);
      return true;
    }

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (error) {
        if (isNativeModuleError(error)) {
          console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
          useInMemory = true;
          inMemoryStore.delete(key);
          return true;
        }

        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.warn(`Failed to remove AsyncStorage item '${key}':`, error.message);
          return false;
        }
      }
    }
  },

  async multiGet(keys) {
    if (useInMemory) return keys.map(k => [k, inMemoryStore.get(k) || null]);
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      if (isNativeModuleError(error)) {
        console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
        useInMemory = true;
        return keys.map(k => [k, inMemoryStore.get(k) || null]);
      }
      console.warn('Failed to multiGet AsyncStorage items:', error.message);
      return keys.map(k => [k, null]);
    }
  },

  async multiSet(keyValuePairs) {
    if (useInMemory) {
      keyValuePairs.forEach(([k, v]) => inMemoryStore.set(k, v));
      return true;
    }
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      if (isNativeModuleError(error)) {
        console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
        useInMemory = true;
        keyValuePairs.forEach(([k, v]) => inMemoryStore.set(k, v));
        return true;
      }
      console.warn('Failed to multiSet AsyncStorage items:', error.message);
      return false;
    }
  },

  async clear() {
    if (useInMemory) {
      inMemoryStore.clear();
      return true;
    }
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      if (isNativeModuleError(error)) {
        console.warn('AsyncStorage native module unavailable, switching to in-memory store.');
        useInMemory = true;
        inMemoryStore.clear();
        return true;
      }
      console.warn('Failed to clear AsyncStorage:', error.message);
      return false;
    }
  },
};
