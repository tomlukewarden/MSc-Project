
export class InventoryManager {
  constructor(initialItems = []) {
    this.items = initialItems; 
    this.listeners = [];
  }

  addItem(item) {
    this.items.push(item);
    this._notify();
  }


  removeItem(itemNameOrKey) {
    // Remove by name (default), but if not found, try by key (for shards)
    let idx = this.items.findIndex(i => i.name === itemNameOrKey);
    if (idx === -1) {
      idx = this.items.findIndex(i => i.key === itemNameOrKey);
    }
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this._notify();
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
      this.items.splice(idx, 1);
      this._notify();
      return true;
    }
    return false;
  }


  getItems() {
    return [...this.items];
  }

  clear() {
    this.items = [];
    this._notify();
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