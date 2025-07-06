import { CoinManager } from "../components/coinManager";
import { loadFromLocal } from "../utils/localStorage";
import InventoryManager from "./inventoryManager";

const startingCoins = loadFromLocal("coins") || 0;
const coinManager = new CoinManager(startingCoins);

// Use a global or scene-level inventory manager
export const inventoryManager = new InventoryManager();

class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    this.coinText = null;
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];
  }

  create() {
    const { width, height } = this.sys.game.config;
    this.add.rectangle(width / 2, height / 2, 420, 320, 0x567d46)
      .setStrokeStyle(4, 0x3e2f1c)
      .setAlpha(0.95)
      .setDepth(105);

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

    coinManager.onChange((coins) => {
      if (this.coinText) this.coinText.setText(`${coins}c`);
    });

    // Render inventory items
    const renderItems = (items) => {
      // Remove old
      this.itemRects.forEach(r => r.destroy());
      this.itemTexts.forEach(t => t.destroy());
      this.itemImages && this.itemImages.forEach(img => img.destroy());
      this.itemRects = [];
      this.itemTexts = [];
      this.itemImages = [];
      // Draw new
      items.forEach((item, idx) => {
        const x = width / 2 - 100 + idx * 110;
        const y = height / 2;

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

        const text = this.add.text(
          x, y + 35, item.name, {
            fontFamily: "Georgia",
            fontSize: "18px",
            color: "#222"
          }
        ).setOrigin(0.5).setDepth(108);

        // Example: Remove item on click
        rect.on("pointerdown", () => {
          inventoryManager.removeItem(item.name);
        });

        this.itemRects.push(rect);
        this.itemTexts.push(text);
      });
    };

    renderItems(inventoryManager.getItems());
    inventoryManager.onChange(renderItems);

    // Click anywhere else to exit inventory
    this.input.once("pointerdown", (pointer, currentlyOver) => {
      // Only exit if not clicking on an item
      if (!currentlyOver.length) {
        this.scene.stop("OpenInventory");
      }
    });
  }
}

export default OpenInventory;