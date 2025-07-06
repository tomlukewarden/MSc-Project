let collectedPlantKeys = [];

export function addPlantToJournal(key) {
  if (!collectedPlantKeys.includes(key)) {
    collectedPlantKeys.push(key);
  }
}

export function getCollectedPlants() {
  return [...collectedPlantKeys];
}