import { Plot } from "../farmingLogic";
import { createMainChar } from "../../characters/mainChar";
import { inventoryManager } from "../inventoryManager";
// Ensure global inventoryManager instance
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = inventoryManager;
  }
}
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import ChestLogic from "../chestLogic";
import globalTimeManager from "../../day/timeManager";

class PersonalGarden extends Phaser.Scene {
  constructor() {
    super("PersonalGarden", { physics: { default: 'arcade', arcade: { debug: false } } });
    this.plotSize = 64;
    this.rows = 3;
    this.cols = 5;
    this.plots = [];
    this.currentTool = "hoe";
    this.inventoryManager = window.inventoryManager;
    if (!window.chestItems) window.chestItems = [];
    this.chestLogic = new ChestLogic();
    this.chestLogic.scene = this;
  }

  preload() {
        this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
        this.load.image("defaultFrontWalk1", "/assets/char/default/front-step-1.PNG");
        this.load.image("defaultFrontWalk2", "/assets/char/default/front-step-2.PNG");
        this.load.image("defaultBackWalk1", "/assets/char/default/back-step-1.PNG");
        this.load.image("defaultBackWalk2", "/assets/char/default/back-step-2.PNG");
        this.load.image("defaultLeftWalk1", "/assets/char/default/left-step-1.PNG");
        this.load.image("defaultLeftWalk2", "/assets/char/default/left-step-2.PNG");
        this.load.image("defaultRightWalk1", "/assets/char/default/right-step-1.PNG");
        this.load.image("defaultRightWalk2", "/assets/char/default/right-step-2.PNG");
    this.load.image("hoe", "/assets/tools/hoe.png");
    this.load.image("wateringCan", "/assets/tools/wateringCan.png");
    this.load.image("sign", "/assets/misc/sign.png");
    this.load.image("gardenBackground", "/assets/backgrounds/personal/personalBackground.png");
    this.load.image("tent", "/assets/backgrounds/personal/tent.png");
    this.load.image("fence", "/assets/backgrounds/personal/fence.png");
    this.load.image("chest", "/assets/misc/chest-closed.png");
    this.load.image("seeds", "/assets/plants/seeds.png");

  }

  create() {
    // Minimal plot system: one plot for testing seed planting from inventory
    const { width, height } = this.sys.game.config;
    this.plot = new Plot();
    const plotX = width / 2;
    const plotY = height / 2 + 100;
    // Draw plot rectangle
    this.plotRect = this.add.rectangle(plotX, plotY, 60, 60, 0x8bc34a, 0.85)
      .setStrokeStyle(2, 0x4caf50)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    this.plotText = this.add.text(plotX, plotY, '', {
      fontSize: '14px',
      color: '#fff',
      fontFamily: 'Georgia',
      align: 'center'
    }).setOrigin(0.5).setDepth(101);

    // Update plot display
    this.updatePlotText(this.plotText, this.plot);
    this.updatePlotColor(this.plotRect, this.plot);

    // Plot interaction: use current tool
    this.plotRect.on('pointerdown', () => {
      let result;
      if (this.selectedTool === 'hoe') {
        result = this.plot.prepare();
      } else if (this.selectedTool === 'seeds') {
        // Only plant if a seed type is selected
        if (this.selectedSeedType) {
          result = this.plot.plant(this.selectedSeedType);
          if (result.success) {
            this.selectedSeedType = null;
            // Remove seed picker UI if open
            if (this.seedPickerDom) {
              this.seedPickerDom.destroy();
              this.seedPickerDom = null;
            }
          }
        } else {
          result = { success: false, message: 'Select a seed from inventory first.' };
        }
      } else if (this.selectedTool === 'wateringCan') {
        result = this.plot.water();
      } else if (this.selectedTool === 'harvestGlove') {
        result = this.plot.harvest();
        if (result.success && result.item) {
          const inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
          if (Array.isArray(inventory.items)) inventory.items.push(result.item);
        }
      } else {
        result = { success: false, message: 'Unknown tool.' };
      }
      if (result && result.message) console.log(result.message);
      this.updatePlotText(this.plotText, this.plot);
      this.updatePlotColor(this.plotRect, this.plot);
    });
    // Ensure player always has basic tools in inventory
    const defaultTools = ['hoe', 'wateringCan', 'harvestGlove', 'seeds'];
    let inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
    if (!inventory || typeof inventory !== 'object') {
      inventory = {};
      this.inventoryManager.inventory = inventory;
    }
    if (!Array.isArray(inventory.tools)) inventory.tools = [];
    defaultTools.forEach(tool => {
      if (!inventory.tools.includes(tool)) {
        inventory.tools.push(tool);
      }
    });
    // Add chest sprite (ensure only one image is created)
    const chestX = 120;
    const chestY = 440; // Move chest further down
    if (!this.textures.exists("chest")) {
      this.load.image("chest", "/assets/misc/chest-closed.png");
      this.load.once('complete', () => {
        this.createChestSprite(chestX, chestY);
      });
      this.load.start();
    } else {
      this.createChestSprite(chestX, chestY);
    }

  }

  createChestSprite(x, y) {
    const chestSprite = this.add.image(x, y, "chest")
      .setScale(1.8)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });
    chestSprite.on("pointerdown", () => {
      this.chestLogic.openChest(window.chestItems);
      this.scene.launch("ChestUI", { items: window.chestItems });
      this.scene.bringToTop("ChestUI");

    });

        const scaleFactor = 0.175;
    this.add.image(0, 0, "gardenBackground").setOrigin(0).setScale(scaleFactor);

   // Tent image (not interactive)
   const tentImg = this.add.image(0, 0, "tent").setOrigin(0).setScale(scaleFactor).setDepth(5);

   // Triangle icon above tent for next day
   const tentTriangleX = tentImg.x + tentImg.displayWidth / 2;
   const tentTriangleY = tentImg.y + 60; 
   const triangleSize = 32;
   const triangle = this.add.triangle(
     tentTriangleX,
     tentTriangleY,
     0, triangleSize,
     triangleSize / 2, 0,
     triangleSize, triangleSize,
     0xffe066
   ).setDepth(10)
    .setInteractive({ useHandCursor: true });

   // Tooltip text
   const nextDayText = this.add.text(tentTriangleX, tentTriangleY - 24, "Next Day", {
     fontFamily: "Georgia",
     fontSize: "16px",
     color: "#fff",
     backgroundColor: "#222",
     padding: { left: 8, right: 8, top: 4, bottom: 4 }
   }).setOrigin(0.5).setDepth(11).setAlpha(0);

   triangle.on("pointerover", () => nextDayText.setAlpha(1));
   triangle.on("pointerout", () => nextDayText.setAlpha(0));
   triangle.on("pointerdown", () => {
     this.scene.pause();
     this.scene.launch("DayEndScene", { day: globalTimeManager.getDayNumber() });
     this.scene.get("DayEndScene").events.once("dayEnded", () => {
       globalTimeManager.nextDay();
       this.scene.resume();
     });
   });

    this.add.image(0, 0, "fence").setOrigin(0).setScale(scaleFactor).setDepth(10);

    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }

    const { width, height } = this.sys.game.config;
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    const sceneState = window.localStorage.getItem('personalGardenSceneState');
    let loadedState = null;
    if (sceneState) {
      try {
        loadedState = JSON.parse(sceneState);
      } catch (e) {
        loadedState = null;
      }
    }

    const backBtnX = width - 40;
    const backBtnY = height / 2;
    const backButton = this.add.text(backBtnX, backBtnY, "Back", {
      fontSize: "24px",
      color: "#fff",
      fontFamily: "Georgia",
      backgroundColor: "#3bb273",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.stop("PersonalGarden");
        this.scene.start("WallGardenScene");
        this.scene.resume("HUDScene");
      });

    backButton.setDepth(10);


    // Restore tool and time only
    if (loadedState?.currentTool) this.currentTool = loadedState.currentTool;
    if (loadedState?.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(loadedState.timeOfDay);
    }

    // Sign to enter shop
    const signX = 80;
    const signY = height - 80;
    const sign = this.add.image(signX, signY, "sign")
      .setScale(1.5)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    sign.on("pointerdown", () => {
      showOption(this, "Would you like to go to the shop?", {
        imageKey: "sign",
        options: [
          {
            text: "Yes",
            callback: () => {
              if (this.destroyDialogueUI) this.destroyDialogueUI();
              this.scene.start("ShopScene");
            }
          },
          {
            text: "No",
            callback: () => {
              if (this.destroyDialogueUI) this.destroyDialogueUI();
            }
          }
        ]
      });
    });

    this.createToolButtons();

    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    this.events.on('shutdown', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
    });

    this.events.on('destroy', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
    });
  }

  saveSceneState() {
    const state = {
      plots: this.plots.map(({ plot }) => ({ ...plot })),
      inventory: this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory,
      currentTool: this.currentTool,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay(),
      chestItems: window.chestItems
    };
    window.localStorage.setItem('personalGardenSceneState', JSON.stringify(state));
  }

  useToolOnPlot(plot) {
    const inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
    if (this.currentTool === 'hoe' && inventory.tools.includes('hoe')) {
      return plot.prepare();
    }
    if (this.currentTool === 'wateringCan' && inventory.tools.includes('wateringCan')) {
      return plot.water();
    }
    if (this.currentTool === 'harvestGlove' && inventory.tools.includes('harvestGlove')) {
      const result = plot.harvest();
      if (result.success && result.item) {
        inventory.items.push(result.item);
      }
      return result;
    }
    return { success: false, message: 'Unknown tool or missing from inventory.' };
  }

  updatePlotText(text, plot) {
    let display = plot.state.charAt(0).toUpperCase() + plot.state.slice(1);
    if (plot.seedType) display += `\n${plot.seedType}`;
    text.setText(display);
  }

  updatePlotColor(rect, plot) {
    switch (plot.state) {
      case 'empty':
        rect.setFillStyle(0x8bc34a, 0.6);
        break;
      case 'prepared':
        rect.setFillStyle(0x795548, 0.9);
        break;
      case 'planted':
        rect.setFillStyle(0x33691e, 0.9);
        break;
      case 'grown':
        rect.setFillStyle(0x4caf50, 0.9);
        break;
      case 'harvested':
        rect.setFillStyle(0x9e9e9e, 0.8);
        break;
    }
  }

  createToolButtons() {
    const tools = [
      { key: 'hoe', x: 40, y: 40 },
      { key: 'seeds', x: 100, y: 40 },
      { key: 'wateringCan', x: 160, y: 40 },
      { key: 'harvestGlove', x: 220, y: 40 }
    ];
    this.selectedTool = this.selectedTool || 'hoe';
    this.toolIconSprites = [];
    tools.forEach((tool, i) => {
      // Draw square background
      const bg = this.add.rectangle(tool.x, tool.y, 48, 48, 0x222233, 0.95)
        .setStrokeStyle(2, 0x4caf50)
        .setDepth(199);
      // Draw tool image
      const img = this.add.image(tool.x, tool.y, tool.key)
        .setScale(0.05)
        .setInteractive({ useHandCursor: true })
        .setDepth(200);
      img.on('pointerdown', () => {
        this.selectedTool = tool.key;
        // Highlight selected tool background
        this.toolIconSprites.forEach((sprite, j) => {
          sprite.bg.setFillStyle(j === i ? 0x4caf50 : 0x222233, 0.95);
        });
        // If seeds, open inventory picker
        if (tool.key === 'seeds') {
          this.openSeedPicker();
        } else {
          this.selectedSeedType = null;
        }
      });
      // Default highlight for hoe
      if (i === 0) bg.setFillStyle(0x4caf50, 0.95);
      this.toolIconSprites.push({ bg, img });
    });
  }

  // Inventory seed picker UI
  openSeedPicker() {
    // Remove previous picker if open
    if (this.seedPickerDom) {
      this.seedPickerDom.destroy();
      this.seedPickerDom = null;
    }
    const { width } = this.sys.game.config;
    const inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
    // Find all seeds in inventory.items
    const seeds = Array.isArray(inventory.items) ? inventory.items.filter(item => item && (item.type === 'seed' || item === 'seeds')) : [];
    if (seeds.length === 0) {
      this.seedPickerDom = this.add.dom(width / 2, 80).createFromHTML(`
        <div style='background:#222;padding:18px;border-radius:10px;'>
          <h3 style='color:#fff;font-family:Georgia;'>No seeds in inventory</h3>
          <button id='closeSeedPicker'>Close</button>
        </div>
      `);
      this.seedPickerDom.setDepth(500);
      this.seedPickerDom.node.querySelector('#closeSeedPicker').onclick = () => {
        this.seedPickerDom.destroy();
        this.seedPickerDom = null;
      };
      return;
    }
    // Show seed options
    let seedOptionsHtml = seeds.map((seed, i) => {
      const seedName = typeof seed === 'string' ? seed : (seed.name || seed.type);
      return `<button class='seedOpt' data-seed='${seedName}' style='margin:6px 12px 6px 0;padding:8px 16px;border-radius:6px;background:#567d46;color:#fff;font-family:Georgia;'>${seedName}</button>`;
    }).join('');
    this.seedPickerDom = this.add.dom(width / 2, 80).createFromHTML(`
      <div style='background:#222;padding:18px;border-radius:10px;'>
        <h3 style='color:#fff;font-family:Georgia;'>Select a seed to plant</h3>
        ${seedOptionsHtml}
        <button id='closeSeedPicker' style='margin-left:12px;'>Close</button>
      </div>
    `);
    this.seedPickerDom.setDepth(500);
    // Add click listeners for seed buttons
    Array.from(this.seedPickerDom.node.querySelectorAll('.seedOpt')).forEach(btn => {
      btn.onclick = () => {
        this.selectedSeedType = btn.getAttribute('data-seed');
        // Highlight selected button
        Array.from(this.seedPickerDom.node.querySelectorAll('.seedOpt')).forEach(b => b.style.background = '#567d46');
        btn.style.background = '#ffe066';
      };
    });
    this.seedPickerDom.node.querySelector('#closeSeedPicker').onclick = () => {
      this.seedPickerDom.destroy();
      this.seedPickerDom = null;
    };
  }
}

export default PersonalGarden;
