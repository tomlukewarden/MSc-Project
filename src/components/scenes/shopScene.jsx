import Phaser from 'phaser';
import { createOptionBox } from '../../dialogue/createOptionBox';
import { CoinManager } from '../coinManager';
import plantData from '../../plantData';
import recipieData from '../../recipieData';

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
    this.coinManager = new CoinManager(200);
  }

  preload() {
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('item1', '/assets/plants/seeds.png');
    this.load.image('item2', '/assets/plants/foxglove.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio("shopTheme", "/assets/music/shop-theme.mp3");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    
  }

  create() {
    this.scene.sleep("HUDScene");
    this.sound.play('shopTheme', { loop: true, volume: 0.1 });
    const { width, height } = this.scale;

    // Main shop background
    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    // Coins text
    const coinText = this.add.text(width - 40, 30, `${this.coinManager.coins}c`, {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffe066",
      backgroundColor: "#222",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setDepth(10);

    this.coinManager.onChange((coins) => coinText.setText(`${coins}c`));

    // Seeds for all plants
    const seedItems = plantData.map(plant => ({
      key: plant.key,
      name: plant.name + ' Seeds',
      price: plant.shopPrice ? plant.shopPrice : 20,
      imageKey: plant.key.includes('seeds') ? plant.key : 'seeds',
      type: 'seed',
      plantKey: plant.key
    }));

    // Extras from recipieData
    const extraItems = recipieData
      .filter(r => r.shopItem)
      .map(r => ({
        key: r.key,
        name: r.name,
        price: r.shopPrice ? r.shopPrice : 40,
        imageKey: r.imageKey || r.key,
        type: 'extra'
      }));

    const items = [...seedItems, ...extraItems];

    // Layout variables
    const itemAreaX = width - 180;
    const itemStartY = 150;
    const itemSpacing = 120;
    const itemBgWidth = 160;
    const itemBgHeight = 100;

    items.forEach((item, idx) => {
      const y = itemStartY + idx * itemSpacing;

      this.add.rectangle(
        itemAreaX, y, itemBgWidth, itemBgHeight, 0x222233, 1
      )
        .setStrokeStyle(2, 0x88ccff)
        .setDepth(1);

      // Item image
      const img = this.add.image(itemAreaX, y - 20, item.imageKey)
        .setScale(0.09)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      img.on('pointerover', () => img.setTint(0x88ccff));
      img.on('pointerout', () => img.clearTint());
      img.on('pointerdown', () => {
        this.sound.play('click', { volume: 0.5 });
        this.showOption(
          `You clicked on ${item.name}.\nPrice: ${item.price} coins.`,
          {
            options: [
              {
                label: 'Buy',
                onSelect: () => {
                  if (this.coinManager.subtract(parseInt(item.price))) {
                    this.destroyDialogueUI();
                    this.showOption(`You bought ${item.name}!`, {
                      options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
                    });
                    // TODO: Add item to inventoryManager here if needed
                  } else {
                    this.destroyDialogueUI();
                    this.showOption("Not enough coins!", {
                      options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
                    });
                  }
                }
              },
              {
                label: 'Cancel',
                onSelect: () => {
                  this.destroyDialogueUI();
                }
              }
            ]
          }
        );
      });

      this.add.text(itemAreaX, y + 35, `${item.name} (${item.price}c)`, {
        fontFamily: "Georgia",
        fontSize: "18px",
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