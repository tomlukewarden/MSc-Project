/**
 * Save the current time of day to localStorage
 * @param {string} timeOfDay
 */
export function saveTimeOfDay(timeOfDay) {
  try {
    localStorage.setItem('timeOfDay', timeOfDay);
    return true;
  } catch (e) {
    console.error('Failed to save timeOfDay:', e);
    return false;
  }
}

/**
 * Load the current time of day from localStorage
 * @returns {string|null}
 */
export function loadTimeOfDay() {
  try {
    return localStorage.getItem('timeOfDay');
  } catch (e) {
    console.error('Failed to load timeOfDay:', e);
    return null;
  }
}
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

export function saveGameStateToDB(nickname, gameState) {
  fetch('http://localhost:3000/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nickname,
      gameState // send as object for json/jsonb column
    })
  })
    .then(res => res.json())
    .then(data => console.log("Saved!", data))
    .catch(err => console.error("Save error:", err));
}
const nickname = localStorage.getItem("characterName");
console.log("Loaded nickname from localStorage:", nickname);
const gameState = {
  inventory: loadFromLocal("inventoryItems"),
  personalGardenSceneState: loadFromLocal("personalGardenSceneState"),
  middleGardenSceneState: loadFromLocal("middleGardenSceneState"),
  wallGardenSceneState: loadFromLocal("wallGardenSceneState"),
  shardGardenSceneState: loadFromLocal("shardGardenSceneState"),
  greenhouseSceneState: loadFromLocal("greenhouseSceneState"),
  timeOfDay: loadFromLocal("timeOfDay"),
  journalState: loadFromLocal("journalState"),
  settings: loadFromLocal("settings"),
  HUDState: loadFromLocal("HUDState"),
};

saveGameStateToDB(nickname, gameState);