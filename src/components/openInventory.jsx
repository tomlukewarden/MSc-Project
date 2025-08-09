import { loadFromLocal } from "../utils/localStorage";
import InventoryManager from "./inventoryManager";
import { saveToLocal } from "../utils/localStorage";

// Removed CoinManager import and all coin logic

export const inventoryManager = new InventoryManager();

class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    // Removed coinText property
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];
    this.renderItems = null;
  }

  preload() {
    this.load.image("inventoryBackground", "/assets/ui-items/overlayBg.png");
    this.load.image("baseCream", "/assets/shopItems/cream.png");
    this.load.image("aloeAfterSunCream", )
 this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');  
}

  create() {
    const { width, height } = this.sys.game.config;

    // Use inventoryBackground image instead of rectangle
    const bg = this.add.image(width / 2, height / 2, "inventoryBackground")
      .setDisplaySize(600, 500)
      .setDepth(105); // Background depth

    this.add.text(width / 2, height / 2 - 220, "Inventory", {
      fontFamily: "Georgia",
      fontSize: "38px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // --- COINS REMOVED ---

    // Scrollable container for items
    const scrollMask = this.add.graphics().fillRect(width / 2 - 280, height / 2 - 180, 560, 400);
    const itemContainer = this.add.container(width / 2, height / 2).setMask(scrollMask.createGeometryMask());
    itemContainer.setDepth(110); // <-- Bring items in front of background

    let scrollY = 0;
    let maxScroll = 0;

    this.renderItems = (items) => {
      itemContainer.removeAll(true);
      const cols = 5;
      const cellW = 100;
      const cellH = 110;
      const gridW = cols * cellW;
      const startX = -gridW / 2 + cellW / 2;
      const startY = -180 + cellH / 2;
      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = startX + col * cellW;
        const y = startY + row * cellH;

        const rect = this.add.rectangle(
          x, y, 90, 90, item.color
        ).setStrokeStyle(3, 0x3e2f1c).setDepth(111).setInteractive();

        let img = null;
        if (item.key && this.textures.exists(item.key)) {
          img = this.add.image(x, y - 10, item.key)
            .setDisplaySize(60, 60)
            .setDepth(112);
        }

        // Show item count below the image if count > 1
        let countText = null;
        if (item.count && item.count > 1) {
          countText = this.add.text(
            x, y + 32, `${item.count}`,
            {
              fontFamily: "Georgia",
              fontSize: "18px",
              color: "#222",
              backgroundColor: "#fff8",
              padding: { left: 6, right: 6, top: 2, bottom: 2 }
            }
          ).setOrigin(0.5).setDepth(113);
        }

        // Only show name on hover
        let nameText = null;
        rect.on("pointerover", () => {
          nameText = this.add.text(
            x, y - 38, item.name, {
              fontFamily: "Georgia",
              fontSize: "16px",
              color: "#222",
              fontStyle: "bold",
              backgroundColor: "#fff8",
              padding: { left: 6, right: 6, top: 2, bottom: 2 }
            }
          ).setOrigin(0.5).setDepth(1000);
        });
        rect.on("pointerout", () => {
          if (nameText) {
            nameText.destroy();
            nameText = null;
          }
        });

        rect.on("pointerdown", () => {
          // Crafting slot selection mode
          if (
            this.scene.settings.data &&
            this.scene.settings.data.mode === 'selectItemForCraft' &&
            typeof this.scene.settings.data.onSelect === 'function'
          ) {
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(item.key);
            this.refreshInventoryUI();
            this.scene.settings.data.onSelect(item);
            this.scene.stop();
            return;
          }

          // --- MiddleGardenScene handovers ---
          const middleGardenScene = this.scene.get('MiddleGardenScene');
          if (middleGardenScene && middleGardenScene.awaitingPeriwinkleExtractGive && item.key === "periwinkleExtract") {
            alert("Handing over Periwinkle Extract to Wolf (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinkleExtract");
            this.scene.stop();
            middleGardenScene.events.emit("periwinkleExtractGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (middleGardenScene && middleGardenScene.awaitingMarigoldSalveGive && item.key === "marigoldSalve") {
            alert("Handing over Marigold Salve to Deer (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldSalve");
            this.scene.stop();
            middleGardenScene.events.emit("marigoldSalveGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (middleGardenScene && middleGardenScene.awaitingGarlicPasteGive && item.key === "garlicPaste") {
            alert("Handing over Garlic Paste to Mole (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("garlicPaste");
            this.scene.stop();
            middleGardenScene.events.emit("garlicPasteGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (middleGardenScene && middleGardenScene.awaitingThymeInfusedOilGive && item.key === "thymeInfusedOil") {
            alert("Handing over Thyme Infused Oil to Turtle (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("thymeInfusedOil");
            this.scene.stop();
            middleGardenScene.events.emit("thymeInfusedOilGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }

          // --- GreenhouseScene handovers ---
          const greenhouseScene = this.scene.get('GreenhouseScene');
          if (greenhouseScene && greenhouseScene.awaitingLavenderOilGive && item.key === "lavenderOil") {
            alert("Handing over Lavender Oil to Rabbit (GreenhouseScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("lavenderOil");
            this.scene.stop();
            greenhouseScene.events.emit("lavenderOilGiven");
            greenhouseScene.events.emit("inventoryClosed");
            return;
          }
          if (greenhouseScene && greenhouseScene.awaitingAloeAfterSunCreamGive && item.key === "aloeAfterSunCream") {
            alert("Handing over Aloe After-Sun Cream to Pig (GreenhouseScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("aloeAfterSunCream");
            this.scene.stop();
            greenhouseScene.events.emit("aloeAfterSunCreamGiven");
            greenhouseScene.events.emit("inventoryClosed");
            return;
          }

          // --- WallGardenScene handovers ---
          const wallGardenScene = this.scene.get('WallGardenScene');
          if (wallGardenScene && wallGardenScene.awaitingJasmineTeaGive && item.key === "jasmineTea") {
            alert("Handing over Jasmine Tea to Elephant (WallGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("jasmineTea");
            this.scene.stop();
            wallGardenScene.events.emit("jasmineTeaGiven");
            wallGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (wallGardenScene && wallGardenScene.awaitingWillowBarkTeaGive && item.key === "willowBarkTea") {
            alert("Handing over Willow Bark Tea to Polar Bear (WallGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("willowBarkTea");
            this.scene.stop();
            wallGardenScene.events.emit("willowBarkTeaGiven");
            wallGardenScene.events.emit("inventoryClosed");
            return;
          }

          // --- Legacy/other handovers ---
          if (middleGardenScene && middleGardenScene.awaitingPeriwinkleGive && item.key === "periwinklePlant") {
            alert("Handing over Periwinkle Plant (legacy) to Wolf (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
            this.scene.stop();
            middleGardenScene.events.emit("periwinkleGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (middleGardenScene && middleGardenScene.awaitingMarigoldGive && item.key === "marigoldPlant") {
            alert("Handing over Marigold Plant (legacy) to Deer (MiddleGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
            this.scene.stop();
            middleGardenScene.events.emit("marigoldGiven");
            middleGardenScene.events.emit("inventoryClosed");
            return;
          }
          if (wallGardenScene && wallGardenScene.awaitingJasmineGive && item.key === "jasminePlant") {
            alert("Handing over Jasmine Plant (legacy) to Elephant (WallGardenScene)");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("jasminePlant");
            wallGardenScene.awaitingJasmineGive = false;
            this.scene.stop();
            wallGardenScene.events.emit("jasmineGiven");
            wallGardenScene.events.emit("inventoryClosed");
            return;
          }
          const mainScene = this.scene.get('WeeCairScene');
          if (mainScene && mainScene.awaitingFoxgloveGive && item.key === "foxglovePlant") {
            alert("Handing over Foxglove Plant to Main Scene");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("foxglovePlant");
            this.scene.stop();
            mainScene.events.emit("foxgloveGiven");
            return;
          }

          // Default: remove item but no handover event
          alert("No matching NPC handover found for item: " + item.key);
          inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(item.key);
        });

        itemContainer.add([rect, img, countText].filter(Boolean));
      });

      // Calculate max scroll
      const rows = Math.ceil(items.length / cols);
      maxScroll = Math.max(0, rows * cellH - 400);
      itemContainer.y = height / 2 - scrollY;
    };

    this.renderItems(inventoryManager.getItems());
    inventoryManager.onChange((items) => this.renderItems(items));

    // Scroll wheel support
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      scrollY = Phaser.Math.Clamp(scrollY + deltaY, 0, maxScroll);
      itemContainer.y = height / 2 - scrollY;
    });

    // Click anywhere else to exit inventory
    this.input.once("pointerdown", (pointer, currentlyOver) => {
      if (!currentlyOver.length) {
        this.scene.stop("OpenInventory");
      }
    });

    // Add "Clear Inventory" button
    const clearBtn = this.add.text(width / 2 + 220, height / 2 - 220, "Clear Inventory", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#fff",
      backgroundColor: "#a33",
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    })
      .setOrigin(0.5)
      .setDepth(106)
      .setInteractive({ useHandCursor: true });

    clearBtn.on("pointerdown", () => {
      inventoryManager.clear && inventoryManager.clear();
      this.refreshInventoryUI();
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