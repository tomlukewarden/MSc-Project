import { saveToLocal, loadFromLocal } from "../utils/localStorage";
import plantData from "../gameData/plantData";

class GlobalInventoryManager {
  constructor() {
    this.inventory = {
      items: [],
      tools: [],
      seeds: []
    };
    this.listeners = [];
    this.plantNames = new Set([
      'marigold', 'thyme', 'garlic', 'foxglove',
      'aloe', 'jasmine', 'lavender', 'periwinkle', 'willow'
    ]);
    this.loadInventory();
  }

  // Load inventory from localStorage
  loadInventory() {
    const savedInventory = loadFromLocal("inventory");
    if (savedInventory) {
      this.inventory = {
        items: savedInventory.items || [],
        tools: savedInventory.tools || [],
        seeds: savedInventory.seeds || []
      };
    }
    // Also check for legacy inventoryItems
    const legacyItems = loadFromLocal("inventoryItems");
    if (legacyItems && Array.isArray(legacyItems) && this.inventory.items.length === 0) {
      this.inventory.items = legacyItems;
      this.saveInventory();
    }
  }

  // Save inventory to localStorage
  saveInventory() {
    saveToLocal("inventory", this.inventory);
    // Also save to legacy key for backward compatibility
    saveToLocal("inventoryItems", this.inventory.items);
    this._notify();
  }

  // Notify listeners
  _notify() {
    this.listeners.forEach(cb => cb(this.inventory));
  }

  // Normalize plant keys
  _normalizePlantKey(item) {
    const name = item?.name?.toLowerCase();
    if (!name) return;

    if ([...this.plantNames].some(p => name.includes(p))) {
      const baseName = item.name.replace(/\s+/g, '').replace(/[^a-zA-Z]/g, '');
      item.key = baseName.charAt(0).toLowerCase() + baseName.slice(1) + 'Plant';
    }
  }

  // Get the full inventory
  getInventory() {
    return this.inventory;
  }

  // Get all items (for backward compatibility)
  getItems() {
    return this.inventory.items || [];
  }

  // Add item to inventory
  addItem(item, quantity = 1) {
    if (!item || !item.key) return false;

    // Check plantData for additional info
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
    const stackable = item.stackable !== false;
    if (stackable) {
      const existingItem = this.inventory.items.find(i => i.key === item.key);
      if (existingItem) {
        existingItem.count = (existingItem.count || 1) + quantity;
        this.saveInventory();
        return true;
      }
    }

    this.inventory.items.push({
      ...item,
      count: quantity
    });
    this.saveInventory();
    return true;
  }

  // Remove item from inventory
  removeItem(identifier, quantity = 1) {
    const idLower = identifier?.toLowerCase();
    const itemIndex = this.inventory.items.findIndex(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
    
    if (itemIndex === -1) return false;

    const item = this.inventory.items[itemIndex];
    if (item.count && item.count > quantity) {
      item.count -= quantity;
    } else {
      this.inventory.items.splice(itemIndex, 1);
    }
    this.saveInventory();
    return true;
  }

  // Remove item by key (removes all quantities)
  removeItemByKey(itemKey) {
    const idLower = itemKey?.toLowerCase();
    const itemIndex = this.inventory.items.findIndex(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
    
    if (itemIndex === -1) return false;

    this.inventory.items.splice(itemIndex, 1);
    this.saveInventory();
    return true;
  }

  // Check if inventory has item
  hasItem(identifier, quantity = 1) {
    const idLower = identifier?.toLowerCase();
    const item = this.inventory.items.find(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
    return item && (item.count || 1) >= quantity;
  }

  // Check if inventory has item by key
  hasItemByKey(itemKey) {
    return this.hasItem(itemKey);
  }

  // Get item by key
  getItem(identifier) {
    const idLower = identifier?.toLowerCase();
    return this.inventory.items.find(i =>
      (i.name && i.name.toLowerCase() === idLower) ||
      (i.key && i.key.toLowerCase() === idLower)
    );
  }

  getItemByKey(itemKey) {
    return this.getItem(itemKey);
  }

  // Get item quantity
  getItemQuantity(itemKey) {
    const item = this.getItem(itemKey);
    return item ? (item.count || 1) : 0;
  }

  // Tool management
  addTool(toolKey) {
    if (!this.inventory.tools.includes(toolKey)) {
      this.inventory.tools.push(toolKey);
      this.saveInventory();
      return true;
    }
    return false;
  }

  hasTool(toolKey) {
    return this.inventory.tools.includes(toolKey);
  }

  getTools() {
    return this.inventory.tools || [];
  }

  // Seed management
  addSeed(seedItem, quantity = 1) {
    if (!seedItem || !seedItem.key) return false;

    const existingSeed = this.inventory.seeds.find(s => s.key === seedItem.key);
    if (existingSeed) {
      existingSeed.quantity = (existingSeed.quantity || 1) + quantity;
    } else {
      this.inventory.seeds.push({
        ...seedItem,
        quantity: quantity
      });
    }
    this.saveInventory();
    return true;
  }

  removeSeed(seedKey, quantity = 1) {
    const seedIndex = this.inventory.seeds.findIndex(s => s.key === seedKey);
    if (seedIndex === -1) return false;

    const seed = this.inventory.seeds[seedIndex];
    if (seed.quantity <= quantity) {
      this.inventory.seeds.splice(seedIndex, 1);
    } else {
      seed.quantity -= quantity;
    }
    this.saveInventory();
    return true;
  }

  getSeeds() {
    return this.inventory.seeds || [];
  }

  hasSeed(seedKey, quantity = 1) {
    const seed = this.inventory.seeds.find(s => s.key === seedKey);
    return seed && seed.quantity >= quantity;
  }

  // Clear entire inventory
  clear() {
    this.inventory = {
      items: [],
      tools: [],
      seeds: []
    };
    this.saveInventory();
  }

  // Initialize with default tools
  initializeDefaultTools() {
    const defaultTools = ['hoe', 'wateringCan', 'shovel'];
    defaultTools.forEach(tool => {
      this.addTool(tool);
    });
  }

  // Event listeners
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

// Create and export the global instance
const globalInventoryManager = new GlobalInventoryManager();

// Ensure it's available globally
if (typeof window !== "undefined") {
  window.inventoryManager = globalInventoryManager;
}

export default globalInventoryManager;
export { globalInventoryManager as inventoryManager };
