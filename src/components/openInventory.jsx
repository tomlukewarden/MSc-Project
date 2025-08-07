import { CoinManager } from "../components/coinManager";
import { loadFromLocal } from "../utils/localStorage";
import InventoryManager from "./inventoryManager";
import { saveToLocal } from "../utils/localStorage";


const coinManager = typeof window !== "undefined" && window.coinManager ? window.coinManager : new CoinManager(loadFromLocal("coins") || 0);

export const inventoryManager = new InventoryManager();

class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    this.coinText = null;
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];
    this.renderItems = null;
  }

  preload() {
    this.load.image("inventoryBackground", "/assets/ui-items/overlayBg.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Use inventoryBackground image instead of rectangle
    this.add.image(width / 2, height / 2, "inventoryBackground")
      .setDisplaySize(420, 320)
      .setDepth(105)
      .setAlpha(0.95);

    this.add.text(width / 2, height / 2 - 120, "Inventory", {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // --- COINS ---
    this.coinText = this.add.text(width / 2 + 170, height / 2 - 140, `${coinManager.coins}c`, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#ffe066",
      backgroundColor: "#222",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setDepth(106);

    // Subscribe to coin changes, store unsubscribe
    this._coinUnsub = coinManager.onChange((coins) => {
      if (this.coinText && !this.coinText.destroyed) {
        this.coinText.setText(`${coins}c`);
      }
    });
    // Unsubscribe on shutdown/destroy to prevent memory leaks and errors
    this.events.on('shutdown', () => {
      if (this._coinUnsub) this._coinUnsub();
    });
    this.events.on('destroy', () => {
      if (this._coinUnsub) this._coinUnsub();
    });

    // Render inventory items in a grid
    this.renderItems = (items) => {
      // Remove old
      this.itemRects.forEach(r => r.destroy());
      this.itemTexts.forEach(t => t.destroy());
      this.itemImages && this.itemImages.forEach(img => img.destroy());
      this.itemRects = [];
      this.itemTexts = [];
      this.itemImages = [];
      // Grid settings
      const cols = 4;
      const rows = Math.ceil(items.length / cols);
      const cellW = 100;
      const cellH = 110;
      const gridW = cols * cellW;
      const gridH = rows * cellH;
      const startX = width / 2 - gridW / 2 + cellW / 2;
      const startY = height / 2 - gridH / 2 + cellH / 2 + 20;
      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = startX + col * cellW;
        const y = startY + row * cellH;

        const rect = this.add.rectangle(
          x, y, 90, 90, item.color
        ).setStrokeStyle(3, 0x3e2f1c).setDepth(106).setInteractive();

        // Draw image if item.key exists and is loaded as a texture
        let img = null;
        if (item.key && this.textures.exists(item.key)) {
          img = this.add.image(x, y - 10, item.key)
            .setDisplaySize(60, 60)
            .setDepth(107);
          this.itemImages.push(img);
        }

        // Name (top)
        let displayName = item.name;
        if (item.count && item.count > 1) {
          displayName += ` x${item.count}`;
        }
        const nameText = this.add.text(
          x, y - 38, displayName, {
            fontFamily: "Georgia",
            fontSize: "16px",
            color: "#222",
            fontStyle: "bold"
          }
        ).setOrigin(0.5).setDepth(108);

        // Enable drag for seeds in selectSeed mode
        if (this.scene.settings.data && this.scene.settings.data.mode === 'selectSeed' && item.type === 'seed') {
          rect.setInteractive({ draggable: true });
          rect.on('dragstart', (pointer) => {
            this.input.setDefaultCursor('grabbing');
          });
          rect.on('drag', (pointer, dragX, dragY) => {
            rect.x = dragX;
            rect.y = dragY;
            if (img) { img.x = dragX; img.y = dragY - 10; }
            nameText.x = dragX; nameText.y = dragY - 38;
          });
          rect.on('dragend', (pointer, dragX, dragY, dropped) => {
            this.input.setDefaultCursor('default');
            if (!dropped) {
              // Snap back to grid
              rect.x = x;
              rect.y = y;
              if (img) { img.x = x; img.y = y - 10; }
              nameText.x = x; nameText.y = y - 38;
            }
          });
        }

        rect.on("pointerdown", () => {
          // Seed selection mode: call onSelect and close inventory
          if (this.scene.settings.data && this.scene.settings.data.mode === 'selectSeed' && typeof this.scene.settings.data.onSelect === 'function') {
            this.scene.settings.data.onSelect(item);
            this.scene.stop();
            return;
          }
          // Crafting slot selection mode
          if (this.scene.settings.data && this.scene.settings.data.mode === 'selectItemForCraft' && typeof this.scene.settings.data.onSelect === 'function') {
            this.scene.settings.data.onSelect(item);
            this.scene.stop();
            return;
          }
          // ...existing code for NPC gifting and item removal...
          const middleGardenScene = this.scene.get('MiddleGardenScene');
          if (middleGardenScene && middleGardenScene.awaitingPeriwinkleGive && item.key === "periwinklePlant") {
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
            this.scene.stop(); // Close inventory
            middleGardenScene.events.emit("periwinkleGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (middleGardenScene && middleGardenScene.awaitingMarigoldGive && item.key === "marigoldPlant") {
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
            this.scene.stop(); // Close inventory
            middleGardenScene.events.emit("marigoldGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          const wallGardenScene = this.scene.get('WallGardenScene');
          if (wallGardenScene && wallGardenScene.awaitingJasmineGive && item.key === "jasminePlant") {
            if (typeof inventoryManager.removeItemByKey === "function") {
              inventoryManager.removeItemByKey("jasminePlant");
            }
            wallGardenScene.awaitingJasmineGive = false;
            this.scene.stop(); // Close inventory
            wallGardenScene.events.emit("jasmineGiven");
            wallGardenScene.events.emit("inventoryClosed");
            return;
          }
          const mainScene = this.scene.get('WeeCairScene');
          if (mainScene && mainScene.awaitingFoxgloveGive && item.key === "foxglovePlant") {
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("foxglovePlant");
            this.scene.stop(); // Close inventory
            mainScene.events.emit("foxgloveGiven");
            return;
          }
          inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(item.key);
        });

        this.itemRects.push(rect);
        this.itemTexts.push(nameText);
      });
    };

    this.renderItems(inventoryManager.getItems());
    inventoryManager.onChange((items) => this.renderItems(items));

    // Click anywhere else to exit inventory
    this.input.once("pointerdown", (pointer, currentlyOver) => {
      // Only exit if not clicking on an item
      if (!currentlyOver.length) {
        this.scene.stop("OpenInventory");
      }
    });
  }

  // --- Add this method for external UI refresh ---
  refreshInventoryUI() {
    if (typeof this.renderItems === 'function') {
      this.renderItems(inventoryManager.getItems());
    }
  }
}

export default OpenInventory;