import globalInventoryManager from "./inventoryManager";
import recipieData from "../../../gameData/recipieData";
import achievements from "../../../gameData/achievments";
import { saveToLocal } from "../../../utils/localStorage";

// Remove the old inventoryManager export and use the global one
export const inventoryManager = globalInventoryManager;

class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    this.activeTab = "inventory";
    this.craftedRecipes = new Set(); // Track crafted recipes for achievement
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
    // Load previously crafted recipes
    this.loadCraftedRecipes();

    const { width, height } = this.sys.game.config;

    // Background (increased size)
    this.add.image(width / 2, height / 2, "inventoryBackground")
      .setDisplaySize(800, 600) // Increased from 600x500
      .setDepth(105);

    // Title
    this.titleText = this.add.text(width / 2, height / 2 - 270, "Inventory", { // Adjusted Y position
      fontFamily: "Georgia",
      fontSize: "38px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // Tabs (adjusted Y position)
    const invTab = this.add.text(width / 2 - 220, height / 2 + 230, "Inventory", {
      fontFamily: "Georgia", fontSize: "20px", color: "#fff", backgroundColor: "#a33", padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setDepth(107).setInteractive({ useHandCursor: true });

    const craftTab = this.add.text(width / 2 - 80, height / 2 + 230, "Crafting", {
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

    // Exit button (adjusted position)
    const exitBtn = this.add.text(width / 2 + 360, height / 2 - 270, "Exit", {
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

    this.refreshUI();
    globalInventoryManager.onChange(() => this.refreshUI());
  }

  // Load crafted recipes from localStorage on scene start
  loadCraftedRecipes() {
    const savedCraftedRecipes = localStorage.getItem("craftedRecipes");
    if (savedCraftedRecipes) {
      try {
        const parsed = JSON.parse(savedCraftedRecipes);
        this.craftedRecipes = new Set(parsed);
      } catch (error) {
        console.log("Error loading crafted recipes:", error);
        this.craftedRecipes = new Set();
      }
    }
  }

  // Save crafted recipes to localStorage
  saveCraftedRecipes() {
    localStorage.setItem("craftedRecipes", JSON.stringify([...this.craftedRecipes]));
  }

  // Helper method to show crafting messages
  showCraftingMessage(message, backgroundColor) {
    const { width, height } = this.sys.game.config;
    
    this.add.text(width / 2, height / 2 + 250, message, {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#fff",
      backgroundColor: backgroundColor,
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5).setDepth(200)
      .setAlpha(0.95)
      .setScrollFactor(0)
      .setInteractive()
      .on("pointerdown", function () { this.destroy(); });
  }

  // Check and complete crafting-related achievements
  checkCraftingAchievements() {
    // Check if all recipes have been crafted for "Master of Your Craft" achievement
    if (this.craftedRecipes.size >= recipieData.length) {
      const masterCrafterAchievement = achievements.find(a => a.title === "Master of Your Craft");
      if (masterCrafterAchievement && !masterCrafterAchievement.completed) {
        masterCrafterAchievement.completed = true;
        saveToLocal("achievements", achievements);
        console.log("Achievement 'Master of Your Craft' completed!");
        
        // Show achievement notification
        this.showAchievementNotification("Master of Your Craft");
      }
    }
  }

  // Show achievement completion notification
  showAchievementNotification(achievementTitle) {
    const { width, height } = this.sys.game.config;
    
    const notification = this.add.text(width / 2, height / 2 + 200, `🏆 Achievement Unlocked!\n${achievementTitle}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#fff",
      backgroundColor: "#d4851f",
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
      align: "center"
    }).setOrigin(0.5).setDepth(250);

    // Auto-hide notification after 3 seconds
    this.time.delayedCall(3000, () => {
      if (notification && !notification.destroyed) {
        notification.destroy();
      }
    });

    // Allow manual dismissal
    notification.setInteractive().on("pointerdown", () => {
      notification.destroy();
    });
  }

  // Render Inventory
  renderItems() {
    this.contentContainer.removeAll(true);
    const items = globalInventoryManager.getItems(); // Use global manager
    const cols = 5;
    const cellW = 100;
    const cellH = 110;
    const gridW = cols * cellW;
    const { width, height } = this.sys.game.config;
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
            globalInventoryManager.removeItemByKey("foxglovePlant");
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
            globalInventoryManager.removeItemByKey("aloeAfterSunCream");
            greenhouseScene.events.emit("aloeAfterSunCreamGiven");
            greenhouseScene.awaitingAloeAfterSunCreamGive = false;
            this.scene.stop();
            return;
          }
          if (greenhouseScene.awaitingLavenderOilGive && item.key === "lavenderOil") {
            globalInventoryManager.removeItemByKey("lavenderOil");
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
            globalInventoryManager.removeItemByKey("periwinkleExtract");
            middleGardenScene.events.emit("periwinkleExtractGiven");
            middleGardenScene.awaitingPeriwinkleExtractGive = false;
            this.scene.stop();
            return;
          }
          if (middleGardenScene.awaitingMarigoldSalveGive && item.key === "marigoldSalve") {
            globalInventoryManager.removeItemByKey("marigoldSalve");
            middleGardenScene.events.emit("marigoldSalveGiven");
            middleGardenScene.awaitingMarigoldSalveGive = false;
            this.scene.stop();
            return;
          }
          if (middleGardenScene.awaitingGarlicPasteGive && item.key === "garlicPaste") {
            globalInventoryManager.removeItemByKey("garlicPaste");
            middleGardenScene.events.emit("garlicPasteGiven");
            middleGardenScene.awaitingGarlicPasteGive = false;
            this.scene.stop();
            return;
          }
          if (middleGardenScene.awaitingThymeInfusedOilGive && item.key === "thymeInfusedOil") {
            globalInventoryManager.removeItemByKey("thymeInfusedOil");
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
            globalInventoryManager.removeItemByKey("jasmineTea");
            wallGardenScene.events.emit("jasmineTeaGiven");
            wallGardenScene.awaitingJasmineTeaGive = false;
            this.scene.stop();
            return;
          }
          if (wallGardenScene.awaitingWillowBarkTeaGive && item.key === "willowBarkTea") {
            globalInventoryManager.removeItemByKey("willowBarkTea");
            wallGardenScene.events.emit("willowBarkTeaGiven");
            wallGardenScene.awaitingWillowBarkTeaGive = false;
            this.scene.stop();
            return;
          }
        }

        // Add more scenes/NPCs and items as needed, following the same pattern
      });
    });
  }

  // Render Crafting
  renderCrafting() {
    this.contentContainer.removeAll(true);
    const recipes = recipieData;
    const cols = 3;
    const cellW = 200;
    const cellH = 150;
    const gridW = cols * cellW;
    const { width, height } = this.sys.game.config;
    const startX = width / 2 - gridW / 2 + cellW / 2;
    const startY = height / 2 - 150;

    recipes.forEach((recipe, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;

      // Recipe background (bigger)
      const bg = this.add.rectangle(x, y, cellW - 10, cellH - 10, 0x3e2f1c)
        .setStrokeStyle(2, 0xa33)
        .setInteractive({ useHandCursor: true });

      // Recipe image (larger and centered)
      let img = null;
      if (recipe.result && recipe.result.imageKey && this.textures.exists(recipe.result.imageKey)) {
        img = this.add.image(x, y - 40, recipe.result.imageKey).setDisplaySize(60, 60);
      }

      // Recipe name (centered below image)
      const nameText = this.add.text(x, y - 5, recipe.result.name, {
        fontFamily: "Georgia", 
        fontSize: "16px",
        color: "#fff",
        align: "center"
      }).setOrigin(0.5);

      // Ingredients (centered below name)
      const ingredientsText = this.add.text(x, y + 20,
        recipe.ingredients.map(i => `${i.amount}x ${i.key}`).join("\n"),
        { 
          fontFamily: "Georgia", 
          fontSize: "12px", 
          color: "#ffb",
          align: "center",
          lineSpacing: 2
        }).setOrigin(0.5);

      // Craft functionality on background click
      bg.on("pointerdown", () => {
        // Check inventory for required items
        const items = globalInventoryManager.getItems();
        const missing = recipe.ingredients.filter(ingredient => {
          const invItem = items.find(i => i.key === ingredient.key);
          return !invItem || typeof invItem.count !== "number" || invItem.count < ingredient.amount;
        });
        
        if (missing.length > 0) {
          // Show missing items message
          const msg = "Not enough items to craft!\nMissing: " + missing.map(i => `${i.amount}x ${i.key}`).join(", ");
          this.showCraftingMessage(msg, "#a33");
          return;
        }

        // Remove ingredients from inventory
        recipe.ingredients.forEach(ingredient => {
          globalInventoryManager.removeItemByKey &&
            globalInventoryManager.removeItemByKey(ingredient.key, ingredient.amount);
        });
        
        // Add crafted item to inventory
        globalInventoryManager.addItem({ key: recipe.result.key, name: recipe.result.name });

        // Track this recipe as crafted
        this.craftedRecipes.add(recipe.id);

        // Save crafted recipes
        this.saveCraftedRecipes();

        // Check and complete achievements
        this.checkCraftingAchievements();

        // Show crafted message
        const craftedMsg = `Crafted: ${recipe.result.name}`;
        this.showCraftingMessage(craftedMsg, "#567d46");

        this.refreshUI();
      });

      const objectsToAdd = [bg, nameText, ingredientsText];
      if (img) objectsToAdd.push(img);
      this.contentContainer.add(objectsToAdd);
    });
  }

  refreshUI() {
    this.titleText.setText(this.activeTab === "inventory" ? "Inventory" : "Crafting");
    if (this.activeTab === "inventory") {
      this.renderItems();
    } else {
      this.renderCrafting();
    }
  }

  // Override scene shutdown to save progress
  shutdown() {
    this.saveCraftedRecipes();
    super.shutdown();
  }
}

export default OpenInventory;
