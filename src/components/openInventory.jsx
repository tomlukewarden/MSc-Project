import { CoinManager } from "../components/coinManager";
import { loadFromLocal } from "../utils/localStorage";
import InventoryManager from "./inventoryManager";
import { showDialogue } from "../dialogue/dialogueUIHelpers";
import { saveToLocal } from "../utils/localStorage";


const startingCoins = loadFromLocal("coins") || 0;
const coinManager = new CoinManager(startingCoins);

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
        const nameText = this.add.text(
          x, y - 38, item.name, {
            fontFamily: "Georgia",
            fontSize: "16px",
            color: "#222",
            fontStyle: "bold"
          }
        ).setOrigin(0.5).setDepth(108);

        rect.on("pointerdown", () => {
          const middleGardenScene = this.scene.get('MiddleGardenScene');
          // Periwinkle handover logic for wolf
          if (middleGardenScene && middleGardenScene.wolfIntroDone && !middleGardenScene.wolfThanksDone && middleGardenScene.hasPeriwinkle && item.key === "periwinklePlant") {
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
            this.scene.stop(); // Close inventory
            middleGardenScene.events.emit("periwinkleGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          // Marigold handover logic for deer
          if (middleGardenScene && middleGardenScene.awaitingMarigoldGive && item.key === "marigoldPlant") {
            inventoryManager.removeItem("marigoldPlant");
            this.scene.stop(); // Close inventory
            middleGardenScene.events.emit("marigoldGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          // Jasmine handover logic for elephant
          const wallGardenScene = this.scene.get('WallGardenScene');
          if (wallGardenScene && wallGardenScene.awaitingJasmineGive && item.key === "jasminePlant") {
            inventoryManager.removeItem("jasminePlant");
            this.scene.stop(); // Close inventory
            wallGardenScene.events.emit("jasmineGiven");
            wallGardenScene.events.emit("inventoryClosed");
            return;
          }
          // Foxglove handover logic for bee
          const mainScene = this.scene.get('WeeCairScene');
          if (mainScene && mainScene.awaitingFoxgloveGive && item.key === "foxglovePlant") {
            inventoryManager.removeItem("foxglovePlant");
            this.scene.stop(); // Close inventory
            mainScene.events.emit("foxgloveGiven");
            return;
          }
          // Default: remove item
          inventoryManager.removeItem(item.name);
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
}

export default OpenInventory;