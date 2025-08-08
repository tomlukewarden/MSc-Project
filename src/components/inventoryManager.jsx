import plantData from "../plantData";
import { saveToLocal, loadFromLocal } from "../utils/localStorage";

class InventoryManager {
  constructor(initialItems = []) {
    this.items = [];
    this.listeners = [];
    this.plantNames = new Set([
      'marigold', 'thyme', 'garlic', 'foxglove',
      'aloe', 'jasmine', 'lavender', 'periwinkle', 'willow'
    ]);
    // Load from local storage if available, otherwise use initialItems
    const saved = loadFromLocal("inventoryItems");
    if (saved && Array.isArray(saved)) {
      saved.forEach(item => this.addItem(item));
    } else {
      initialItems.forEach(item => this.addItem(item));
    }
  }

  // Utility method to notify listeners and save to local storage
  _notify() {
    saveToLocal("inventoryItems", this.items);
    this.listeners.forEach(cb => cb([...this.items]));
  }

  _normalizePlantKey(item) {
    const name = item?.name?.toLowerCase();
    if (!name) return;

    if ([...this.plantNames].some(p => name.includes(p))) {
      const baseName = item.name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
      item.key = baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Plant';
    }
  }

  addItem(item) {
    if (!item) return;

    const nameLower = item.name?.toLowerCase();
    const keyLower = item.key?.toLowerCase();
    let plantInfo = null;
    if (nameLower || keyLower) {
      plantInfo = plantData.find(p =>
        p.name.toLowerCase() === nameLower ||
        p.key.toLowerCase() === keyLower
      );
    }
    if (plantInfo) {
      item = { ...plantInfo, ...item };
    } else {
      this._normalizePlantKey(item);
    }

    // Stacking logic
    const stackable = item.stackable !== false; // default true unless explicitly false
    if (stackable) {
      const existing = this.items.find(i => i.key === item.key);
      if (existing) {
        existing.count = (existing.count || 1) + (item.count || 1);
        this._notify();
        return;
      } else {
        item.count = item.count || 1;
      }
    }
    this.items.push(item);
    this._notify();
  }

  removeItem(identifier) {
    // Case-insensitive matching for key and name
    const idLower = identifier?.toLowerCase();
    const idx = this.items.findIndex(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
    if (idx === -1) {
      alert(`Item "${identifier}" not found in inventory!`);
      return false;
    }

    const item = this.items[idx];
    alert(`Removing item: ${JSON.stringify(item)}`);
    if (item.count && item.count > 1) {
      item.count--;
      this._notify();
      alert(`Decremented count. New count: ${item.count}`);
      return true;
    } else {
      const [removed] = this.items.splice(idx, 1);
      this._notify();
      alert(`Removed item completely: ${JSON.stringify(removed)}`);
      return true;
    }
  }

  removeItemByKey(itemKey) {
    return this.removeItem(itemKey);
  }

  hasItem(identifier) {
    const idLower = identifier?.toLowerCase();
    return this.items.some(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
  }

  hasItemByKey(itemKey) {
    return this.hasItem(itemKey);
  }

  getItem(identifier) {
    const idLower = identifier?.toLowerCase();
    return this.items.find(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
  }

  getItems() {
    return this.items.map(item => ({ ...item }));
  }

  clear() {
    this.items = [];
    this._notify();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  clearListeners() {
    this.listeners = [];
  }
}

if (!window.inventoryManager) {
  window.inventoryManager = new InventoryManager();
}
const inventoryManager = window.inventoryManager;
export default InventoryManager;
export { inventoryManager };
