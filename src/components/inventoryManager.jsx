

export class InventoryManager {
  constructor(initialItems = []) {
    this.items = initialItems; 
    this.toolbarSlots = [null, null, null, null, null, null];
    this.listeners = [];
    this.toolbarListeners = [];
  }

  addItem(item) {
    // Do not add coins to inventory
    if (item && (item.key === 'coin' || item.name === 'coin' || item.type === 'coin')) {
      return;
    }
    // Prevent coins from being added to inventory
    if (item && (item.name === 'coin' || item.key === 'coin')) {
      return;
    }
    // Ensure all plants are saved as their name + 'Plant' (e.g., marigoldPlant)
    if (item && item.name && typeof item.name === 'string') {
      // If item is a plant and key does not already end with 'Plant'
      const plantNames = [
        'marigold', 'thyme', 'garlic', 'foxglove', 'aloe', 'jasmine', 'lavender', 'periwinkle', 'willow'
      ];
      const lowerName = item.name.toLowerCase();
      if (plantNames.some(p => lowerName.includes(p))) {
        // Set key to name (lowercase, no spaces) + 'Plant'
        const baseName = item.name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
        item.key = baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Plant';
      }
    }
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