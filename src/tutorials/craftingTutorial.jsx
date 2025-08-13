import Phaser from "phaser";

class CraftingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: "CraftingTutorial" });
  }

  preload() {
    this.load.image("inventoryBg", "/assets/ui-items/overlayBg.png");
    this.load.image("craftTab", "/assets/ui-items/craftTab.png");
    this.load.image("ingredientIcon", "/assets/ui-items/ingredient.png");
    this.load.image("craftBtn", "/assets/ui-items/craftBtn.png");
    this.load.image("arrow", "/assets/ui-items/arrow.png");
    this.load.image("exitBtn", "/assets/ui-items/exitBtn.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, "inventoryBg").setDisplaySize(width - 80, height - 80);

    // Title
    this.add.text(width / 2, 80, "How to Craft Remedies", {
      fontSize: "38px",
      color: "#ffe066",
      fontFamily: "Georgia",
      backgroundColor: "#222",
      padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5);

    // Step 1: Open Inventory
    this.add.text(width / 2, 160, "1. Open your inventory.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Step 2: Switch to Crafting Tab
    this.add.text(width / 2, 220, "2. Click the Crafting tab.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Step 3: Browse Recipes
    this.add.text(width / 2, 300, "3. Browse recipes and check ingredients.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Step 4: Craft Button
  
    this.add.text(width / 2, 380, "4. Click Craft to make the remedy.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Step 5: Feedback
   
    this.add.text(width / 2, 460, "5. If you have all ingredients, you’ll see a success message.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    this.add.text(width / 2, 500, "If not, you’ll see which items are missing.", {
      fontSize: "22px",
      color: "#ffe066",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Step 6: Exit
 
    this.add.text(width / 2, 560, "6. Click Exit to return to the game.", {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Georgia"
    }).setOrigin(0.5);

    // Exit button to leave tutorial
    const exit = this.add.text(width - 60, 40, "Exit", {
      fontSize: "28px",
      color: "#ffe066",
      fontFamily: "Georgia",
      backgroundColor: "#222",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    exit.on("pointerdown", () => {
      this.scene.stop("CraftingTutorial");

      this.scene.start("IntroScene");
    });
  }
}

export default CraftingTutorial;