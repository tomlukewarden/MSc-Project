import Phaser from 'phaser';
import { createOptionBox } from '../../dialogue/createOptionBox';

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  preload() {
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('item1', '/assets/plants/seeds.png');
    this.load.image('item2', '/assets/plants/foxglove.png');
  }

  create() {
    const { width, height } = this.scale;

    // Main shop background
    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    // Shop items data
    const items = [
      { key: 'item1', name: 'Seeds', price: '20' },
      { key: 'item2', name: 'Foxglove', price: '100' },
    ];

    // Layout variables
    const itemAreaX = width - 180; // Right side of the screen
    const itemStartY = 150;
    const itemSpacing = 160;
    const itemBgWidth = 160;
    const itemBgHeight = 120;

    items.forEach((item, idx) => {
      const y = itemStartY + idx * itemSpacing;

      // Background rectangle for each item
      this.add.rectangle(
        itemAreaX, y, itemBgWidth, itemBgHeight, 0x222233, 1
      )
        .setStrokeStyle(2, 0x88ccff)
        .setDepth(1);

      // Item image
      const img = this.add.image(itemAreaX, y - 20, item.key)
        .setScale(0.7)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      img.on('pointerover', () => img.setTint(0x88ccff));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', () => {
        this.showOption(
          `You clicked on ${item.name}.\nPrice: ${item.price} coins.`,
          {
            options: [
              {
                label: 'Buy',
                onSelect: () => {
                  this.destroyDialogueUI();
                  console.log(`Buying ${item.name} for ${item.price} coins.`);
                  // Add your purchase logic here
                }
              },
              {
                label: 'Cancel',
                onSelect: () => {
                  this.destroyDialogueUI();
                  console.log('Purchase cancelled.');
                }
              }
            ]
          }
        );
      });

      // Item name and price below the image
      this.add.text(itemAreaX, y + 35, `${item.name} (${item.price}c)`, {
        fontFamily: "Georgia",
        fontSize: "20px",
        color: "#ffffff"
      })
        .setOrigin(0.5)
        .setDepth(2);
    });

    // Back to Menu button
    const backBtn = this.add.text(width / 2, height - 60, "Back to Menu", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#222",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#444" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#222" }))
      .on("pointerdown", () => {
        this.scene.start("Menu");
      });
  }

  showOption(text, config = {}) {
    this.destroyDialogueUI();
    this.dialogueBox = createOptionBox(this, text, config);
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn) => btn.destroy());
      }
      this.dialogueBox = null;
    }
  }
}

export default ShopScene;