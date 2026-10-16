/**
 * Safe JSON parsing helper that never throws
 */
export const safeJsonParse = (value, fallback = null) => {
  if (value === null || value === undefined || value === '' || value === 'undefined' || value === 'null') {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('[SafeStorage] Failed to parse JSON value:', value, err);
    return fallback;
  }
};

/**
 * Safe localStorage reader with default fallback
 */
export const getStoredItem = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return safeJsonParse(raw, fallback);
  } catch (err) {
    console.warn(`[SafeStorage] Error reading localStorage key "${key}":`, err);
    return fallback;
  }
};

/**
 * Safe localStorage writer
 */
export const setStoredItem = (key, value) => {
  try {
    if (value === undefined || value === null) {
      localStorage.removeItem(key);
    } else if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`[SafeStorage] Error writing localStorage key "${key}":`, err);
  }
};

/**
 * Safe localStorage remover
 */
export const removeStoredItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SafeStorage] Error removing localStorage key "${key}":`, err);
  }
};
