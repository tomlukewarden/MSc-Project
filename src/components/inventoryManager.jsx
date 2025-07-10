

export class InventoryManager {
  constructor(initialItems = []) {
    this.items = initialItems; 
    this.toolbarSlots = [null, null, null, null, null, null];
    this.listeners = [];
    this.toolbarListeners = [];
  }

  addItem(item) {
    this.items.push(item);
    this._notify();
    this.addToToolbar(item);
  }

  addToToolbar(item) {
    const idx = this.toolbarSlots.findIndex(slot => slot === null);
    if (idx !== -1) {
      this.toolbarSlots[idx] = item;
      this._notifyToolbar();
      return true;
    }
    return false;
  }

  getToolbarSlots() {
    return [...this.toolbarSlots];
  }

  onToolbarChange(cb) {
    this.toolbarListeners.push(cb);
  }

  _notifyToolbar() {
    this.toolbarListeners.forEach(cb => cb(this.getToolbarSlots()));
  }


  removeItem(itemNameOrKey) {
    let idx = this.items.findIndex(i => i.name === itemNameOrKey);
    if (idx === -1) {
      idx = this.items.findIndex(i => i.key === itemNameOrKey);
    }
    if (idx !== -1) {
      const [removed] = this.items.splice(idx, 1);
      this._notify();
      const slotIdx = this.toolbarSlots.findIndex(slot => slot && (slot.name === itemNameOrKey || slot.key === itemNameOrKey));
      if (slotIdx !== -1) {
        this.toolbarSlots[slotIdx] = null;
        this._notifyToolbar();
      }
      return true;
    }
    return false;
  }

  hasItem(itemNameOrKey) {
    // Check by name (default), but if not found, try by key (for shards)
    return this.items.some(i => i.name === itemNameOrKey || i.key === itemNameOrKey);
  }

    hasItemByKey(itemKey) {
    return this.items.some(i => i.key === itemKey);
  }

  removeItemByKey(itemKey) {
    const idx = this.items.findIndex(i => i.key === itemKey);
    if (idx !== -1) {
      const [removed] = this.items.splice(idx, 1);
      this._notify();
      const slotIdx = this.toolbarSlots.findIndex(slot => slot && slot.key === itemKey);
      if (slotIdx !== -1) {
        this.toolbarSlots[slotIdx] = null;
        this._notifyToolbar();
      }
      return true;
    }
    return false;
  }


  getItems() {
    return [...this.items];
  }

  clear() {
    this.items = [];
    this.toolbarSlots = [null, null, null, null, null, null];
    this._notify();
    this._notifyToolbar();
  }

  onChange(cb) {
    this.listeners.push(cb);
  }

  _notify() {
    this.listeners.forEach(cb => cb(this.getItems()));
  }
}

export const inventoryManager = new InventoryManager();

export default InventoryManager;