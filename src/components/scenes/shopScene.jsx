import Phaser from 'phaser';

import { CoinManager } from '../coinManager';
import itemsData from '../../items';
import { showOption } from '../../dialogue/dialogueUIHelpers';
import { receivedItem } from '../recievedItem';
// Ensure global inventoryManager instance
import { inventoryManager as globalInventoryManager } from "../inventoryManager";
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = globalInventoryManager;
  }
}

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
    this.coinManager = new CoinManager(this.coinManager ? this.coinManager.coins : 200); // Default to 200 if no previous coins
    if (!window.inventoryManager) {
      window.inventoryManager = new InventoryManager();
    }
    this.inventoryManager = window.inventoryManager;
  }

  preload() {
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('seeds', '/assets/plants/seeds.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio("shopTheme", "/assets/music/shop-theme.mp3");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image("oilBaseImage", "/assets/shopItems/oil.png");
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');

  }

  create() {
    // --- Tools Data ---
    const toolItems = [
      {
        key: 'hoe',
        name: 'Hoe',
        price: 60,
        imageKey: 'hoe',
        type: 'tool'
      },
      {
        key: 'wateringCan',
        name: 'Watering Can',
        price: 50,
        imageKey: 'wateringCan',
        type: 'tool'
      },
      {
        key: 'harvestGlove',
        name: 'Harvest Glove',
        price: 40,
        imageKey: 'harvestGlove',
        type: 'tool'
      }
    ];
    this.scene.stop("HUDScene");
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


    // Seeds from itemsData
    const seedItems = itemsData.filter(item => item.type === 'seed').map(item => ({
      key: item.key,
      name: item.name,
      price: item.shopPrice ? item.shopPrice : 20,
      imageKey: item.imageKey || 'seeds',
      type: 'seed',
      plantKey: item.plantKey
    }));

    // Extras from itemsData
    const extraItems = itemsData.filter(item => item.type !== 'seed').map(item => ({
      key: item.key,
      name: item.name,
      price: item.shopPrice ? item.shopPrice : 40,
      imageKey: item.imageKey || item.key,
      type: item.type || 'extra'
    }));

    // --- Tab UI ---
    let currentTab = 'seeds';
    let itemSprites = [];

    const tabY = 90;
    const tabW = 120;
    const tabH = 40;
    const tabX1 = width - 400;
    const tabX2 = width - 260;
    const tabX3 = width - 120;

    const seedsTab = this.add.rectangle(tabX1, tabY, tabW, tabH, 0x567d46, 0.95)
      .setStrokeStyle(3, 0x88ccff)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    const seedsText = this.add.text(tabX1, tabY, 'Seeds', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff'
    }).setOrigin(0.5).setDepth(21);

    const extrasTab = this.add.rectangle(tabX2, tabY, tabW, tabH, 0x222233, 0.95)
      .setStrokeStyle(3, 0x88ccff)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    const extrasText = this.add.text(tabX2, tabY, 'Extras', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff'
    }).setOrigin(0.5).setDepth(21);

    const toolsTab = this.add.rectangle(tabX3, tabY, tabW, tabH, 0x3bb273, 0.95)
      .setStrokeStyle(3, 0x88ccff)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    const toolsText = this.add.text(tabX3, tabY, 'Tools', {
      fontFamily: 'Georgia', fontSize: '22px', color: '#fff'
    }).setOrigin(0.5).setDepth(21);

    const itemAreaX = width - 250;
    const itemStartY = 200; // Moved grid down from 150 to 200
    const itemSpacing = 110;
    const itemBgWidth = 180;
    const itemBgHeight = 100;

    function renderShopItems(tab) {
      // Remove previous sprites
      itemSprites.forEach(s => s.destroy());
      itemSprites = [];
      let tabItems = [];
      if (tab === 'seeds') tabItems = seedItems;
      else if (tab === 'extras') tabItems = extraItems;
      else if (tab === 'tools') tabItems = toolItems;
      // Grid settings
      const cols = 3;
      const cellW = 110;
      const cellH = 110;
      const gridStartX = itemAreaX - cellW;
      const gridStartY = itemStartY;
      tabItems.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = gridStartX + col * cellW;
        const y = gridStartY + row * cellH;
        // Background
        const bg = this.add.rectangle(
          x, y, 90, 90, tab === 'seeds' ? 0x567d46 : 0x222233, 1
        ).setStrokeStyle(2, 0x88ccff).setDepth(1);
        itemSprites.push(bg);
        // Image
        const img = this.add.image(x, y - 18, item.imageKey)
          .setScale(0.07)
          .setDepth(2)
          .setInteractive({ useHandCursor: true });
        itemSprites.push(img);
        // Name & price
        const txt = this.add.text(x, y + 22, item.name, {
          fontFamily: "Georgia", fontSize: "14px", color: "#fff"
        }).setOrigin(0.5, 0.5).setDepth(2);
        itemSprites.push(txt);
        const priceTxt = this.add.text(x, y + 38, `${item.price}c`, {
          fontFamily: "Georgia", fontSize: "13px", color: "#ffe066"
        }).setOrigin(0.5, 0.5).setDepth(2);
        itemSprites.push(priceTxt);

        img.on('pointerover', () => img.setTint(0x88ccff));
        img.on('pointerout', () => img.clearTint());
        img.on('pointerdown', () => {
          this.sound.play('click', { volume: 0.5 });
          // Prompt for quantity
          let quantity = 1;
          let quantityPrompt = this.add.dom(width / 2, height / 2).createFromHTML(`
            <div style='background:#222;padding:24px;border-radius:12px;'>
              <h2 style='color:#fff;font-family:Georgia;'>Buy ${item.name}</h2>
              <label style='color:#fff;font-family:Georgia;'>How many?</label>
              <input id='qtyInput' type='number' min='1' value='1' style='width:60px;margin:0 12px;' />
              <button id='buyBtn' style='margin-right:12px;'>Buy</button>
              <button id='cancelBtn'>Cancel</button>
              <div id='errorMsg' style='color:#ffe066;margin-top:8px;'></div>
            </div>
          `);
          quantityPrompt.setDepth(1000);
          const qtyInput = quantityPrompt.node.querySelector('#qtyInput');
          const buyBtn = quantityPrompt.node.querySelector('#buyBtn');
          const cancelBtn = quantityPrompt.node.querySelector('#cancelBtn');
          const errorMsg = quantityPrompt.node.querySelector('#errorMsg');

          buyBtn.onclick = () => {
            quantity = parseInt(qtyInput.value);
            if (isNaN(quantity) || quantity < 1) {
              errorMsg.textContent = 'Please enter a valid quantity.';
              return;
            }
            const totalPrice = quantity * parseInt(item.price);
            if (this.coinManager.subtract(totalPrice)) {
              if (!window.chestItems) window.chestItems = [];
              for (let i = 0; i < quantity; i++) {
                window.chestItems.push({ ...item, color: 0xd2b48c });
              }
              // Show receivedItem popup for seeds and tools
              if (item.type === 'seed') {
                receivedItem(this, "seeds", `${item.name} x${quantity}`);
              } else if (item.type === 'tool') {
                receivedItem(this, item.key, `${item.name} x${quantity}`);
              } else {
                receivedItem(this, item.key, `${item.name} x${quantity}`);
              }
              quantityPrompt.destroy();
              this.destroyDialogueUI();
              showOption(this, `You bought ${item.name} x${quantity}!\nCheck your chest in the garden.`, {
                options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
              });
            } else {
              errorMsg.textContent = 'Not enough coins!';
            }
          };
          cancelBtn.onclick = () => {
            quantityPrompt.destroy();
            this.destroyDialogueUI();
          };
        });
      }, this);
    }

    // Initial render
    renderShopItems.call(this, currentTab);

    seedsTab.on('pointerdown', () => {
      currentTab = 'seeds';
      seedsTab.setFillStyle(0x567d46, 0.95);
      extrasTab.setFillStyle(0x222233, 0.95);
      toolsTab.setFillStyle(0x3bb273, 0.95);
      renderShopItems.call(this, currentTab);
    });
    extrasTab.on('pointerdown', () => {
      currentTab = 'extras';
      seedsTab.setFillStyle(0x222233, 0.95);
      extrasTab.setFillStyle(0x567d46, 0.95);
      toolsTab.setFillStyle(0x3bb273, 0.95);
      renderShopItems.call(this, currentTab);
    });
    toolsTab.on('pointerdown', () => {
      currentTab = 'tools';
      seedsTab.setFillStyle(0x222233, 0.95);
      extrasTab.setFillStyle(0x222233, 0.95);
      toolsTab.setFillStyle(0x567d46, 0.95);
      renderShopItems.call(this, currentTab);
    });

    // Back to Menu button
    const backBtn = this.add.text(width / 2, height - 60, "Back to Garden", {
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
        this.scene.start("PersonalGarden");
      });
  }

  showOption(text, config = {}) {
    this.destroyDialogueUI();
    showOption(this, text, config);
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