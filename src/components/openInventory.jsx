
import InventoryManager from "./inventoryManager";
import recipieData from "../recipieData";
export const inventoryManager = new InventoryManager();

class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    this.activeTab = "inventory";
  }

  preload() {
    this.load.image("inventoryBackground", "/assets/ui-items/overlayBg.png");
    this.load.image("baseCream", "/assets/shopItems/cream.png");
    this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');
    // Load all result images from recipieData
    recipieData.forEach(recipe => {
      if (recipe.result && recipe.result.imageKey) {
        this.load.image(recipe.result.imageKey, `/assets/crafting/${recipe.result.imageKey}.png`);
      }
    });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, "inventoryBackground")
      .setDisplaySize(600, 500)
      .setDepth(105);

    // Title
    this.titleText = this.add.text(width / 2, height / 2 - 220, "Inventory", {
      fontFamily: "Georgia",
      fontSize: "38px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // Tabs
    const invTab = this.add.text(width / 2 - 220, height / 2 + 180, "Inventory", {
      fontFamily: "Georgia", fontSize: "20px", color: "#fff", backgroundColor: "#a33", padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setDepth(107).setInteractive({ useHandCursor: true });

    const craftTab = this.add.text(width / 2 - 80, height / 2 + 180, "Crafting", {
      fontFamily: "Georgia", fontSize: "20px", color: "#fff", backgroundColor: "#3e2f1c", padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setDepth(107).setInteractive({ useHandCursor: true });

    invTab.on("pointerdown", () => {
      this.activeTab = "inventory";
      invTab.setBackgroundColor("#a33");
      craftTab.setBackgroundColor("#3e2f1c");
      this.refreshUI();
    });
    craftTab.on("pointerdown", () => {
      this.activeTab = "crafting";
      craftTab.setBackgroundColor("#a33");
      invTab.setBackgroundColor("#3e2f1c");
      this.refreshUI();
    });

    // Exit button
    const exitBtn = this.add.text(width / 2 + 260, height / 2 - 220, "Exit", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#fff",
      backgroundColor: "#a33",
      padding: { left: 10, right: 10, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(120).setInteractive({ useHandCursor: true });

    exitBtn.on("pointerdown", () => {
      this.scene.stop();
    });

    // Container for tab content
    this.contentContainer = this.add.container(0, 0).setDepth(110);

    // Render Inventory
    this.renderItems = () => {
      this.contentContainer.removeAll(true);
      const items = inventoryManager.getItems();
      const cols = 5;
      const cellW = 100;
      const cellH = 110;
      const gridW = cols * cellW;
      const startX = width / 2 - gridW / 2 + cellW / 2;
      const startY = height / 2 - 150;

      items.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = startX + col * cellW;
        const y = startY + row * cellH;

        const itemImg = this.add.image(x, y, item.key).setDisplaySize(60, 60).setInteractive({ useHandCursor: true });
        this.contentContainer.add(itemImg);

        if (item.count > 1) {
          this.contentContainer.add(
            this.add.text(x, y + 30, `${item.count}`, {
              fontFamily: "Georgia",
              fontSize: "16px",
              color: "#fff"
            }).setOrigin(0.5)
          );
        }

        // --- NPC handover logic for all scenes ---
        itemImg.on("pointerdown", () => {

          const weeCairScene = this.scene.get('WeeCairScene');
          if (weeCairScene) {
            if (weeCairScene.awaitingFoxgloveGive && item.key === "foxglovePlant") {
              inventoryManager.removeItemByKey("foxglovePlant");
              weeCairScene.events.emit("foxgloveGiven");
              weeCairScene.awaitingFoxgloveGive = false;
              this.scene.stop();
              return;
            }
          } 
          // GreenhouseScene
          const greenhouseScene = this.scene.get('GreenhouseScene');
          if (greenhouseScene) {
            if (greenhouseScene.awaitingAloeAfterSunCreamGive && item.key === "aloeAfterSunCream") {
              inventoryManager.removeItemByKey("aloeAfterSunCream");
              greenhouseScene.events.emit("aloeAfterSunCreamGiven");
              greenhouseScene.awaitingAloeAfterSunCreamGive = false;
              this.scene.stop();
              return;
            }
            if (greenhouseScene.awaitingLavenderOilGive && item.key === "lavenderOil") {
              inventoryManager.removeItemByKey("lavenderOil");
              greenhouseScene.events.emit("lavenderOilGiven");
              greenhouseScene.awaitingLavenderOilGive = false;
              this.scene.stop();
              return;
            }
          }

          // MiddleGardenScene
          const middleGardenScene = this.scene.get('MiddleGardenScene');
          if (middleGardenScene) {
            if (middleGardenScene.awaitingPeriwinkleExtractGive && item.key === "periwinkleExtract") {
              inventoryManager.removeItemByKey("periwinkleExtract");
              middleGardenScene.events.emit("periwinkleExtractGiven");
              middleGardenScene.awaitingPeriwinkleExtractGive = false;
              this.scene.stop();
              return;
            }
            if (middleGardenScene.awaitingMarigoldSalveGive && item.key === "marigoldSalve") {
              inventoryManager.removeItemByKey("marigoldSalve");
              middleGardenScene.events.emit("marigoldSalveGiven");
              middleGardenScene.awaitingMarigoldSalveGive = false;
              this.scene.stop();
              return;
            }
            if (middleGardenScene.awaitingGarlicPasteGive && item.key === "garlicPaste") {
              inventoryManager.removeItemByKey("garlicPaste");
              middleGardenScene.events.emit("garlicPasteGiven");
              middleGardenScene.awaitingGarlicPasteGive = false;
              this.scene.stop();
              return;
            }
            if (middleGardenScene.awaitingThymeInfusedOilGive && item.key === "thymeInfusedOil") {
              inventoryManager.removeItemByKey("thymeInfusedOil");
              middleGardenScene.events.emit("thymeInfusedOilGiven");
              middleGardenScene.awaitingThymeInfusedOilGive = false;
              this.scene.stop();
              return;
            }
          }

          // WallGardenScene
          const wallGardenScene = this.scene.get('WallGardenScene');
          if (wallGardenScene) {
            if (wallGardenScene.awaitingJasmineTeaGive && item.key === "jasmineTea") {
              inventoryManager.removeItemByKey("jasmineTea");
              wallGardenScene.events.emit("jasmineTeaGiven");
              wallGardenScene.awaitingJasmineTeaGive = false;
              this.scene.stop();
              return;
            }
            if (wallGardenScene.awaitingWillowBarkTeaGive && item.key === "willowBarkTea") {
              inventoryManager.removeItemByKey("willowBarkTea");
              wallGardenScene.events.emit("willowBarkTeaGiven");
              wallGardenScene.awaitingWillowBarkTeaGive = false;
              this.scene.stop();
              return;
            }
          }

          // Add more scenes/NPCs and items as needed, following the same pattern
        });
      });
    };

    // Render Crafting (all recipes, always clickable)
    this.renderCrafting = () => {
      this.contentContainer.removeAll(true);
      const recipes = recipieData;
      const cols = 3;
      const cellW = 140;
      const cellH = 100;
      const gridW = cols * cellW;
      const startX = width / 2 - gridW / 2 + cellW / 2;
      const startY = height / 2 - 120;

      recipes.forEach((recipe, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = startX + col * cellW;
        const y = startY + row * cellH;

        // Recipe background
        const bg = this.add.rectangle(x, y, cellW - 10, cellH - 10, 0x3e2f1c)
          .setStrokeStyle(2, 0xa33)
          .setInteractive({ useHandCursor: true });

        // Recipe image
        let img = null;
        if (recipe.result && recipe.result.imageKey && this.textures.exists(recipe.result.imageKey)) {
          img = this.add.image(x - 30, y, recipe.result.imageKey).setDisplaySize(40, 40);
        }

        // Recipe name
        const nameText = this.add.text(x + 20, y - 20, recipe.result.name, {
          fontFamily: "Georgia", fontSize: "14px", color: "#fff"
        }).setOrigin(0, 0.5);

        // Ingredients
        const ingredientsText = this.add.text(x + 20, y + 10,
          "Needs: " + recipe.ingredients.map(i => `${i.amount}x ${i.key}`).join(", "),
          { fontFamily: "Georgia", fontSize: "11px", color: "#ffb" }).setOrigin(0, 0.5);

        // Craft button
        const craftBtn = this.add.text(x + 20, y + 32, "Craft", {
          fontFamily: "Georgia",
          fontSize: "13px",
          color: "#fff",
          backgroundColor: "#222",
          padding: { left: 6, right: 6, top: 2, bottom: 2 }
        }).setInteractive({ useHandCursor: true });

        craftBtn.on("pointerdown", () => {
          // Check inventory for required items
          const items = inventoryManager.getItems();
          const missing = recipe.ingredients.filter(ingredient => {
            const invItem = items.find(i => i.key === ingredient.key);
            return !invItem || typeof invItem.count !== "number" || invItem.count < ingredient.amount;
          });
          if (missing.length > 0) {
            alert("Not enough items to craft!\nMissing: " + missing.map(i => `${i.amount}x ${i.key}`).join(", "));
            return;
          }
          // Remove ingredients from inventory
          recipe.ingredients.forEach(ingredient => {
            inventoryManager.removeItemByKey &&
              inventoryManager.removeItemByKey(ingredient.key, ingredient.amount);
          });
          inventoryManager.addItem({ key: recipe.result.key, name: recipe.result.name });
          alert(`Crafted: ${recipe.result.name}`);
          this.refreshUI();
        });

        const objectsToAdd = [bg, nameText, ingredientsText, craftBtn];
        if (img) objectsToAdd.push(img);
        this.contentContainer.add(objectsToAdd);
      });
    };

    this.refreshUI();
    inventoryManager.onChange(() => this.refreshUI());
  }

  refreshUI() {
    this.titleText.setText(this.activeTab === "inventory" ? "Inventory" : "Crafting");
    if (this.activeTab === "inventory") {
      this.renderItems();
    } else {
      this.renderCrafting();
    }
  }
}

export default OpenInventory;
