import plantData from "../plantData";

export class InventoryManager {
  constructor(initialItems = []) {
    this.items = [];
    this.toolbarSlots = Array(6).fill(null);
    this.listeners = [];
    this.toolbarListeners = [];
    this.plantNames = new Set([
      'marigold', 'thyme', 'garlic', 'foxglove',
      'aloe', 'jasmine', 'lavender', 'periwinkle', 'willow'
    ]);
    // Add initial items if provided
    initialItems.forEach(item => this.addItem(item));
  }

  // Utility method to notify listeners
  _notify() {
    this.listeners.forEach(cb => cb([...this.items]));
  }

  _notifyToolbar() {
    this.toolbarListeners.forEach(cb => cb([...this.toolbarSlots]));
  }

  _isCoin(item) {
    const key = item?.key?.toLowerCase();
    const name = item?.name?.toLowerCase();
    return key === 'coin' || name === 'coin' || item?.type === 'coin';
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
    if (!item || this._isCoin(item)) return;

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
        this.addToToolbar(existing);
        return;
      } else {
        item.count = item.count || 1;
      }
    }
    this.items.push(item);
    this._notify();
    this.addToToolbar(item);
  }

  addToToolbar(item) {
    const index = this.toolbarSlots.indexOf(null);
    if (index !== -1) {
      this.toolbarSlots[index] = item;
      this._notifyToolbar();
      return true;
    }
    return false;
  }

  removeItem(identifier) {
    const idx = this.items.findIndex(i => i.name === identifier || i.key === identifier);
    if (idx === -1) return false;

    const item = this.items[idx];
    if (item.count && item.count > 1) {
      item.count--;
      this._notify();
      this.addToToolbar(item);
      return true;
    } else {
      const [removed] = this.items.splice(idx, 1);
      this._notify();

      const slotIdx = this.toolbarSlots.findIndex(slot =>
        slot?.name === identifier || slot?.key === identifier
      );

      if (slotIdx !== -1) {
        this.toolbarSlots[slotIdx] = null;
        this._notifyToolbar();
      }
      return true;
    }
  }

  removeItemByKey(itemKey) {
    return this.removeItem(itemKey);
  }

  hasItem(identifier) {
    return this.items.some(i => i.name === identifier || i.key === identifier);
  }

  hasItemByKey(itemKey) {
    return this.hasItem(itemKey);
  }

  getItems() {
    return this.items.map(item => ({ ...item }));
  }

  getToolbarSlots() {
    return [...this.toolbarSlots];
  }

  clear() {
    this.items = [];
    this.toolbarSlots.fill(null);
    this._notify();
    this._notifyToolbar();
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  onToolbarChange(callback) {
    this.toolbarListeners.push(callback);
  }
}

if (!window.inventoryManager) {
  window.inventoryManager = new InventoryManager();
}
export const inventoryManager = window.inventoryManager;
export default InventoryManager;
