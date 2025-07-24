export class InventoryManager {
  constructor(initialItems = []) {
    this.items = initialItems;
    this.toolbarSlots = Array(6).fill(null);
    this.listeners = [];
    this.toolbarListeners = [];
    this.plantNames = new Set([
      'marigold', 'thyme', 'garlic', 'foxglove',
      'aloe', 'jasmine', 'lavender', 'periwinkle', 'willow'
    ]);
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

    this._normalizePlantKey(item);
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
    return [...this.items];
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

export const inventoryManager = new InventoryManager();
export default InventoryManager;
