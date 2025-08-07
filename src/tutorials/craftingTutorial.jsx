import Phaser from 'phaser';

class CraftingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'CraftingTutorial' });
  }

  preload() {
    // Load the personal garden background
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('craftingBench', '/assets/crafting/bench.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('baseCream', '/assets/shopItems/cream.png');
    this.load.image('arrow', '/assets/ui-items/arrow.png');
    this.load.image('marigoldSalve', '/assets/ui-items/arrow.png'); 
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Add the personal garden background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Semi-transparent overlay for readability
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);

    // Title
    this.add.text(width / 2, 100, 'How to Craft', {
      fontFamily: 'Georgia',
      fontSize: '38px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Step 1: Select Ingredients
    this.add.text(width / 2, 180, '1. Select 2 Marigold and 1 Base Cream from your inventory.', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Show ingredient icons
    this.add.image(width / 2 - 80, 230, 'marigoldPlant').setScale(0.18).setDepth(2);
    this.add.image(width / 2, 230, 'baseCream').setScale(0.18).setDepth(2);
    this.add.image(width / 2 + 80, 230, 'marigoldPlant').setScale(0.18).setDepth(2);

    // Step 2: Place Ingredients in Crafting Slots (show pattern)
    this.add.text(width / 2, 290, '2. Place them in this pattern:', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Crafting slots visual
    const slotY = 340;
    this.add.image(width / 2 - 100, slotY, 'marigoldPlant').setScale(0.14).setDepth(2);
    this.add.image(width / 2, slotY, 'baseCream').setScale(0.14).setDepth(2);
    this.add.image(width / 2 + 100, slotY, 'marigoldPlant').setScale(0.14).setDepth(2);

    // Arrows to show order
    this.add.image(width / 2 - 50, slotY, 'arrow').setScale(0.08).setAngle(0).setDepth(2);
    this.add.image(width / 2 + 50, slotY, 'arrow').setScale(0.08).setAngle(0).setDepth(2);

    // Step 3: Click "Craft!" to create Marigold Salve
    this.add.text(width / 2, 390, '3. Click "Craft!" to make your potion.', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Crafting bench icon
    this.add.image(width / 2, 430, 'craftingBench').setScale(0.18).setDepth(2);

    // Step 4: Take your crafted item
    this.add.text(width / 2, 480, '4. Take your Marigold Salve and use it!', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Show result
    this.add.image(width / 2, 530, 'marigoldSalve').setScale(0.18).setDepth(2);

    // Back button
    const backBtn = this.add.text(width / 2, height - 60, "Back", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#145214" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("PersonalGarden");
      });
  }
}

export default CraftingTutorial;