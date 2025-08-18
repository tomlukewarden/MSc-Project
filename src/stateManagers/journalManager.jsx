import { saveToLocal, loadFromLocal } from "../utils/localStorage";

export function addPlantToJournal(key) {
  const keys = loadFromLocal("collectedPlantKeys") || [];
  if (!keys.includes(key)) {
    keys.push(key);
    saveToLocal("collectedPlantKeys", keys);
  }
}

export function getCollectedPlants() {
  return loadFromLocal("collectedPlantKeys") || [];
}