import Phaser from 'phaser';

import itemsData from '../../items';
import { showOption } from '../../dialogue/dialogueUIHelpers';
import { receivedItem } from '../recievedItem';
import SeedPouchLogic from '../seedPouchLogic';
// Ensure global inventoryManager instance
import { inventoryManager as globalInventoryManager } from "../inventoryManager";
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = globalInventoryManager;
  }
}

// Removed CoinManager import and all coin logic
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  preload() {
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image("foxgloveSeeds", "/assets/shopItems/seeds/foxgloveSeeds.png");
    this.load.image("marigoldSeeds", "/assets/shopItems/seeds/marigoldSeeds.png");
    this.load.image("jasmineSeeds", "/assets/shopItems/seeds/jasmineSeeds.png");
    this.load.image("aloeSeeds", "/assets/shopItems/seeds/aloeSeeds.png");
    this.load.image("lavenderSeeds", "/assets/shopItems/seeds/lavenderSeeds.png");
    this.load.image("periwinkleSeeds", "/assets/shopItems/seeds/periwinkleSeeds.png");
    this.load.image("garlicSeeds", "/assets/shopItems/seeds/garlicSeeds.png");
    this.load.image("thymeSeeds", "/assets/shopItems/seeds/thymeSeeds.png");
    this.load.image("willowSeeds", "/assets/shopItems/seeds/willowSeeds.png");
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio("shopTheme", "/assets/music/shop-theme.mp3");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image("oilBaseImage", "/assets/shopItems/oil.png");
    this.load.image("creamBaseImage", "/assets/shopItems/cream.png");
    this.load.image("alchoholBaseImage", "/assets/shopItems/alcohol.png");
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
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

    this.scene.stop("HUDScene");
    this.sound.play('shopTheme', { loop: true, volume: 0.1 });
    const { width, height } = this.scale;

    // Main shop background
    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    // --- Coins and coinManager removed ---

    // Seeds from itemsData
    const seedItems = itemsData.filter(item => item.type === 'seed').map(item => ({
      key: item.key,
      name: item.name,
      imageKey: item.imageKey || 'seeds',
      type: 'seed',
      plantKey: item.plantKey
    }));

    // Only show crafting materials as extras
    const craftingMaterialKeys = ["baseCream", "oilBase", "alchoholBase", "creamBase", "oilBaseImage", "creamBaseImage", "alchoholBaseImage"];
    const extraItems = itemsData.filter(item =>
      craftingMaterialKeys.includes(item.key)
    ).map(item => ({
      key: item.key,
      name: item.name,
      imageKey: item.imageKey || item.key,
      type: 'extra'
    }));

    // --- Tab UI ---
    let currentTab = 'seeds';
    let itemSprites = [];

    const tabY = 90;
    const tabW = 120;
    const tabH = 40;
    const tabX1 = width - 400;
    const tabX2 = width - 260;

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

    const itemAreaX = width - 250;
    const itemStartY = 200;
    const itemSpacing = 110;
    const itemBgWidth = 180;
    const itemBgHeight = 100;

    function renderShopItems(tab) {
      itemSprites.forEach(s => s.destroy());
      itemSprites = [];
      let tabItems = [];
      if (tab === 'seeds') tabItems = seedItems;
      else if (tab === 'extras') tabItems = extraItems;
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
        const bg = this.add.rectangle(
          x, y, 90, 90, tab === 'seeds' ? 0x567d46 : 0x222233, 1
        ).setStrokeStyle(2, 0x88ccff).setDepth(1);
        itemSprites.push(bg);
        const img = this.add.image(x, y - 18, item.imageKey)
          .setScale(0.07)
          .setDepth(2)
          .setInteractive({ useHandCursor: true });
        itemSprites.push(img);
        const txt = this.add.text(x, y + 22, item.name, {
          fontFamily: "Georgia", fontSize: "14px", color: "#fff"
        }).setOrigin(0.5, 0.5).setDepth(2);
        itemSprites.push(txt);
       

        img.on('pointerover', () => img.setTint(0x88ccff));
        img.on('pointerout', () => img.clearTint());
        img.on('pointerdown', () => {
          this.sound.play('click', { volume: 0.5 });
          let quantity = 1;
          let quantityPrompt = this.add.dom(width / 2, height / 2).createFromHTML(`
            <div style='background:#222;padding:24px;border-radius:12px;'>
              <h2 style='color:#fff;font-family:Georgia;'>Take ${item.name}</h2>
              <label style='color:#fff;font-family:Georgia;'>How many?</label>
              <input id='qtyInput' type='number' min='1' value='1' style='width:60px;margin:0 12px;' />
              <button id='takeBtn' style='margin-right:12px;'>Take</button>
              <button id='cancelBtn'>Cancel</button>
              <div id='errorMsg' style='color:#ffe066;margin-top:8px;'></div>
            </div>
          `);
          quantityPrompt.setDepth(1000);
          const qtyInput = quantityPrompt.node.querySelector('#qtyInput');
          const takeBtn = quantityPrompt.node.querySelector('#takeBtn');
          const cancelBtn = quantityPrompt.node.querySelector('#cancelBtn');
          const errorMsg = quantityPrompt.node.querySelector('#errorMsg');

          takeBtn.onclick = () => {
            quantity = parseInt(qtyInput.value);
            if (isNaN(quantity) || quantity < 1) {
              errorMsg.textContent = 'Please enter a valid quantity.';
              return;
            }
            // No coins required, just take the item
            if (item.type === 'seed') {
              SeedPouchLogic.addSeed(item, quantity);
              receivedItem(this, item.key, `${item.name} x${quantity}`);
              quantityPrompt.destroy();
              this.destroyDialogueUI();
              showOption(this, `You took ${item.name} x${quantity}!\nCheck your seed pouch.`, {
                options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
              });
            } else if (item.type === 'tool') {
              for (let i = 0; i < quantity; i++) {
                if (typeof globalInventoryManager.addItem === 'function') {
                  globalInventoryManager.addItem({ ...item, color: 0xd2b48c });
                }
              }
              receivedItem(this, item.key, `${item.name} x${quantity}`);
              quantityPrompt.destroy();
              this.destroyDialogueUI();
              showOption(this, `You took ${item.name} x${quantity}!\nCheck your inventory.`, {
                options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
              });
            } else {
              for (let i = 0; i < quantity; i++) {
                if (typeof globalInventoryManager.addItem === 'function') {
                  globalInventoryManager.addItem({ ...item, color: 0xd2b48c });
                }
              }
              receivedItem(this, item.key, `${item.name} x${quantity}`);
              quantityPrompt.destroy();
              this.destroyDialogueUI();
              showOption(this, `You took ${item.name} x${quantity}!\nCheck your inventory.`, {
                options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
              });
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
      renderShopItems.call(this, currentTab);
    });
    extrasTab.on('pointerdown', () => {
      currentTab = 'extras';
      seedsTab.setFillStyle(0x222233, 0.95);
      extrasTab.setFillStyle(0x567d46, 0.95);
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
        this.scene.start("LoaderScene", {
          nextSceneKey: "PersonalGarden",
          nextSceneData: {}
        });
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