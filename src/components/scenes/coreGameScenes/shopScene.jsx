import Phaser from 'phaser';
import itemsData from '../../../items';
import { showOption } from '../../../dialogue/dialogueUIHelpers';
import { receivedItem } from '../../recievedItem';
import SeedPouchLogic from '../../seedPouchLogic';
import globalInventoryManager from '../inventoryManager';
import quests from '../../../quests/quests';
import { saveToLocal } from '../../../utils/localStorage';

class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
    
    // Use the global inventory manager
    this.inventoryManager = globalInventoryManager;
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
    this.load.image("baseCream", "/assets/shopItems/cream.png");
    this.load.image("oilBase", "/assets/shopItems/oil.png");
    this.load.image("alcoholBase", "/assets/shopItems/alcohol.png");
    this.load.image("teaBag", "/assets/shopItems/teabag.png");
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.image("summerShard", "/assets/items/summer.png");
    this.load.image("autumnShard", "/assets/items/autumn.png");
    this.load.image("winterShard", "/assets/items/winter.png");
    this.load.audio("option", "/assets/sound-effects/option.mp3");
  }

  create() {
    this.scene.stop("HUDScene");
    
    // Stop main theme
    if (this.sound.get('theme1')) {
      this.sound.stopByKey('theme1');
    }
    alert("If you are struggling to collect shards. Just grab them in the extras tab of the shop! :)");
    
    // Play shop theme music
    this.sound.play('shopTheme', { loop: true, volume: 0.2 });

    const { width, height } = this.scale;

    // Main shop background
    this.add.image(width / 2, height / 2, 'shopBackground').setDepth(0).setScale(0.225);

    // Seeds from itemsData
    const seedItems = itemsData.filter(item => item.type === 'seed').map(item => ({
      key: item.key,
      name: item.name,
      imageKey: item.imageKey || 'seeds',
      type: 'seed',
      plantKey: item.plantKey
    }));

    const extraItems = itemsData.filter(item => item.type === 'extra').map(item => ({
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

    const renderShopItems = (tab) => {
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

        // Set scale for images, baseCream is smaller
        let imgScale = 0.07;
        if (item.key === "baseCream") imgScale = 0.02;

        const img = this.add.image(x, y - 18, item.imageKey)
          .setScale(imgScale)
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
            
            // Handle different item types
            if (item.type === 'seed') {
              // Add to seed pouch
              SeedPouchLogic.addSeed(item, quantity);
              receivedItem(this, item.key, `${item.name} x${quantity}`);
              quantityPrompt.destroy();
              this.destroyDialogueUI();
              showOption(this, `You took ${item.name} x${quantity}!\nCheck your seed pouch.`, {
                options: [{ label: "OK", onSelect: () => this.destroyDialogueUI() }]
              });

              // --- Activate "Plant your first crop" quest if not already active or completed ---
              const cropQuest = quests.find(q => q.title === "Plant your first crop");
              if (cropQuest && !cropQuest.active && !cropQuest.completed) {
                cropQuest.active = true;
                saveToLocal("quests", quests);
                console.log("Quest 'Plant your first crop' is now active!");
              }
            } else {
              // Add to main inventory using global inventory manager
              for (let i = 0; i < quantity; i++) {
                this.inventoryManager.addItem({ 
                  ...item, 
                  color: 0xd2b48c 
                });
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
      });
    };

    // Initial render
    renderShopItems('seeds');

    seedsTab.on('pointerdown', () => {
      currentTab = 'seeds';
      seedsTab.setFillStyle(0x567d46, 0.95);
      extrasTab.setFillStyle(0x222233, 0.95);
      renderShopItems(currentTab);
    });
    
    extrasTab.on('pointerdown', () => {
      currentTab = 'extras';
      seedsTab.setFillStyle(0x222233, 0.95);
      extrasTab.setFillStyle(0x567d46, 0.95);
      renderShopItems(currentTab);
    });

    // Back to Garden button
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
        this.sound.stopByKey && this.sound.stopByKey("shopTheme");
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