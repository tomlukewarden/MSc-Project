
class SeedPouchLogic {
  static getPouch() {
    if (typeof window !== 'undefined') {
      if (!window.seedPouch) window.seedPouch = [];
      return window.seedPouch;
    }
    return [];
  }

  static addSeed(seedItem, quantity = 1) {
    const pouch = SeedPouchLogic.getPouch();
    // Stack seeds by key
    let existing = pouch.find(s => s.key === seedItem.key);
    if (existing) {
      existing.count = (existing.count || 1) + quantity;
    } else {
      pouch.push({ ...seedItem, count: quantity });
    }
  }

  static removeSeed(seedKey, quantity = 1) {
    const pouch = SeedPouchLogic.getPouch();
    let idx = pouch.findIndex(s => s.key === seedKey);
    if (idx !== -1) {
      if (pouch[idx].count > quantity) {
        pouch[idx].count -= quantity;
      } else {
        pouch.splice(idx, 1);
      }
    }
  }

  static getSeeds() {
    return SeedPouchLogic.getPouch().filter(s => (s.count || 1) > 0);
  }
}

export default SeedPouchLogic;
