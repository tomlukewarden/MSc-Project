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
import globalTimeManager from "../../day/timeManager";

class PersonalGarden extends Phaser.Scene {
  constructor() {
    super("PersonalGarden", { physics: { default: 'arcade', arcade: { debug: false } } });
    this.plotSize = 64;
    this.rows = 3;
    this.cols = 5;
    this.plots = [];
    this.currentTool = "hoe";
    // Ensure global inventoryManager is always set and valid
    if (typeof window !== "undefined") {
      if (!window.inventoryManager) {
        window.inventoryManager = inventoryManager;
      }
      this.inventoryManager = window.inventoryManager;
    } else {
      this.inventoryManager = inventoryManager;
    }
  }

  preload() {
    // Load all required assets for the garden scene
    const assets = [
      ["defaultFront", "/assets/char/default/front-default.png"],
      ["defaultBack", "/assets/char/default/back-default.png"],
      ["defaultLeft", "/assets/char/default/left-default.png"],
      ["defaultRight", "/assets/char/default/right-default.png"],
      ["defaultFrontWalk1", "/assets/char/default/front-step-1.PNG"],
      ["defaultFrontWalk2", "/assets/char/default/front-step-2.PNG"],
      ["defaultBackWalk1", "/assets/char/default/back-step-1.PNG"],
      ["defaultBackWalk2", "/assets/char/default/back-step-2.PNG"],
      ["defaultLeftWalk1", "/assets/char/default/left-step-1.PNG"],
      ["defaultLeftWalk2", "/assets/char/default/left-step-2.PNG"],
      ["defaultRightWalk1", "/assets/char/default/right-step-1.PNG"],
      ["defaultRightWalk2", "/assets/char/default/right-step-2.PNG"],
      ["hoe", "/assets/tools/hoe.png"],
      ["wateringCan", "/assets/tools/wateringCan.png"],
      ["sign", "/assets/misc/sign.png"],
      ["gardenBackground", "/assets/backgrounds/personal/personalBackground.png"],
      ["tent", "/assets/backgrounds/personal/tent.png"],
      ["fence", "/assets/backgrounds/personal/fence.png"],
      ["seeds", "/assets/plants/seeds.png"]
    ];
    assets.forEach(([key, path]) => this.load.image(key, path));
  }

  create() {
    // Minimal plot system: one plot for testing seed planting from inventory
    // --- UI and gameplay setup ---
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
      // Debug info
      alert('Plot state: ' + this.plot.state + '\nSelected tool: ' + this.selectedTool + '\nSelected seed: ' + (this.selectedSeedType ? JSON.stringify(this.selectedSeedType) : 'none'));
      console.log('Plot state:', this.plot.state);
      console.log('Selected tool:', this.selectedTool);
      console.log('Selected seed:', this.selectedSeedType);
      switch (this.selectedTool) {
        case 'hoe':
          result = this.plot.prepare();
          break;
        case 'seeds':
          if (this.selectedSeedType) {
            result = this.plot.plant(this.selectedSeedType);
            if (result.success) {
              this.selectedSeedType = null;
            }
          } else {
            result = { success: false, message: 'Select a seed from inventory first.' };
          }
          break;
        case 'wateringCan':
          result = this.plot.water();
          break;
        case 'harvestGlove':
          result = this.plot.harvest();
          if (result.success && result.item) {
            const inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
            if (Array.isArray(inventory.items)) inventory.items.push(result.item);
          }
          break;
        default:
          result = { success: false, message: 'Unknown tool.' };
      }
      if (result && result.message) {
        alert(result.message);
        console.log(result.message);
      }
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
    };
    window.localStorage.setItem('personalGardenSceneState', JSON.stringify(state));
  }

  useToolOnPlot(plot) {
    const inventory = this.inventoryManager.getInventory ? this.inventoryManager.getInventory() : this.inventoryManager.inventory;
    if (this.currentTool === 'hoe' && inventory.tools.includes('hoe')) {
      return plot.prepare();
    }
    if (this.currentTool === 'seed' && inventory.tools.includes('seed')) {
      return plot.plant(this.currentTool);
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

        if (tool.key === 'seeds') {
          // Store callback for when a seed is selected
          window.onSeedSelected = (seedItem) => {
            this.selectedSeedType = seedItem; // Store the full object!
            alert('Selected seed: ' + (seedItem.name || seedItem.type));
            window.onSeedSelected = null;
          };
          this.scene.launch('OpenInventory', {
            mode: 'selectSeed',
            filter: item => item.type === 'seed',
            onSelect: window.onSeedSelected
          });
        } else {
          this.selectedSeedType = null;
        }
      });
      // Default highlight for hoe
      if (i === 0) bg.setFillStyle(0x4caf50, 0.95);
      this.toolIconSprites.push({ bg, img });
    });
  }
}

export default PersonalGarden;
