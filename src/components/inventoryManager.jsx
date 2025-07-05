// Simple Inventory Manager for Phaser scenes

export class InventoryManager {
  constructor(initialItems = []) {
    this.items = initialItems; 
    this.listeners = [];
  }

  addItem(item) {
    this.items.push(item);
    this._notify();
  }

  removeItem(itemName) {
    const idx = this.items.findIndex(i => i.name === itemName);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this._notify();
      return true;
    }
    return false;
  }

  hasItem(itemName) {
    return this.items.some(i => i.name === itemName);
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

export default InventoryManager;