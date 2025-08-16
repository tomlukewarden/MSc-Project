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

/**
 * Wipe all game data from localStorage
 * @param {boolean} confirmWipe - Safety check to prevent accidental wipes
 * @returns {boolean} - Success status
 */
export function wipeAllGameData(confirmWipe = false) {
  if (!confirmWipe) {
    console.warn("wipeAllGameData() called without confirmation. Pass true to confirm.");
    return false;
  }

  const gameDataKeys = [
    'inventory',
    'personalGardenSceneState',
    'middleGardenSceneState', 
    'wallGardenSceneState',
    'shardGardenSceneState',
    'greenhouseSceneState',
    'timeOfDay',
    'journalState',
    'settings',
    'HUDState',
    'quests',
    'characterName'
  ];

  let successCount = 0;
  let failCount = 0;

  console.log("🗑️ Starting complete game data wipe...");

  gameDataKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
      successCount++;
    } catch (e) {
      console.error(`❌ Failed to remove ${key}:`, e);
      failCount++;
    }
  });

  // Also clear any scene-specific minigame data that might exist
  const additionalKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('Scene') || key.includes('minigame') || key.includes('bush'))) {
      additionalKeys.push(key);
    }
  }

  additionalKeys.forEach(key => {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Removed additional: ${key}`);
      successCount++;
    } catch (e) {
      console.error(`❌ Failed to remove additional ${key}:`, e);
      failCount++;
    }
  });

  console.log(`🧹 Wipe complete! Success: ${successCount}, Failed: ${failCount}`);
  
  return failCount === 0;
}

/**
 * Wipe specific scene data only
 * @param {string} sceneName - Name of the scene to wipe
 * @param {boolean} confirmWipe - Safety check
 * @returns {boolean} - Success status
 */
export function wipeSceneData(sceneName, confirmWipe = false) {
  if (!confirmWipe) {
    console.warn(`wipeSceneData("${sceneName}") called without confirmation. Pass true to confirm.`);
    return false;
  }

  const sceneKey = `${sceneName}SceneState`;
  
  try {
    localStorage.removeItem(sceneKey);
    console.log(`✅ Wiped scene data: ${sceneKey}`);
    return true;
  } catch (e) {
    console.error(`❌ Failed to wipe scene data ${sceneKey}:`, e);
    return false;
  }
}

/**
 * Get current game data size in localStorage
 * @returns {object} - Statistics about stored data
 */
export function getGameDataStats() {
  const gameDataKeys = [
    'inventory',
    'personalGardenSceneState',
    'middleGardenSceneState', 
    'wallGardenSceneState',
    'shardGardenSceneState',
    'greenhouseSceneState',
    'timeOfDay',
    'journalState',
    'settings',
    'HUDState',
    'quests',
    'characterName'
  ];

  const stats = {
    totalKeys: 0,
    totalSize: 0,
    keyDetails: {}
  };

  gameDataKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      stats.totalKeys++;
      stats.totalSize += data.length;
      stats.keyDetails[key] = {
        size: data.length,
        sizeKB: (data.length / 1024).toFixed(2)
      };
    }
  });

  stats.totalSizeKB = (stats.totalSize / 1024).toFixed(2);
  
  return stats;
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

// Only run this auto-save code if not being imported as a module
if (typeof window !== 'undefined' && window.location) {
  const nickname = localStorage.getItem("characterName");
  console.log("Loaded nickname from localStorage:", nickname);
  const gameState = {
    inventory: loadFromLocal("inventory"), 
    personalGardenSceneState: loadFromLocal("personalGardenSceneState"),
    middleGardenSceneState: loadFromLocal("middleGardenSceneState"),
    wallGardenSceneState: loadFromLocal("wallGardenSceneState"),
    shardGardenSceneState: loadFromLocal("shardGardenSceneState"),
    greenhouseSceneState: loadFromLocal("greenhouseSceneState"),
    timeOfDay: loadFromLocal("timeOfDay"),
    journalState: loadFromLocal("journalState"),
    settings: loadFromLocal("settings"),
    HUDState: loadFromLocal("HUDState"),
    quests: loadFromLocal("quests"),
  };

  saveGameStateToDB(nickname, gameState);
}