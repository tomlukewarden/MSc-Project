/**
 * @param {string} key
 * @param {object} data
 */
export function saveToLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    return false;
  }
}

/**
 * @param {string} key
 * @returns {object|null}
 */
export function loadFromLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return null;
  }
}

/**
 * @param {string} key
 */
export function removeFromLocal(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("Failed to remove from localStorage:", e);
    return false;
  }
}