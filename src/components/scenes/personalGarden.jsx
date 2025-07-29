import { Plot } from "../farmingLogic";
import { createMainChar } from "../../characters/mainChar";
import { inventoryManager } from "../inventoryManager";
import SeedPouchLogic from "../seedPouchLogic";
// Ensure global inventoryManager instance
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = inventoryManager;
  }
}
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import globalTimeManager from "../../day/timeManager";
import { receivedItem } from "../recievedItem";
import itemsData from "../../items";

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
      ["shovel", "/assets/tools/shovel.png"],
      ["sign", "/assets/misc/sign.png"],
      ["gardenBackground", "/assets/backgrounds/personal/personalBackground.png"],
      ["tent", "/assets/backgrounds/personal/tent.png"],
      ["fence", "/assets/backgrounds/personal/fence.png"],
      ["seeds", "/assets/plants/seeds.png"],
      ["preoparedPlot", "/assets/farming/prepared.PNG"]
    ];
    assets.forEach(([key, path]) => this.load.image(key, path));
  }

  create() {
    // --- UI and gameplay setup ---
    const { width, height } = this.sys.game.config;
    // Create a grid of plots
    this.rows = 3;
    this.cols = 5;
    this.plots = [];
    const plotSpacing = 80;
    const plotSize = 60;
    const gridWidth = this.cols * plotSpacing;
    const gridHeight = this.rows * plotSpacing;
    const startX = width / 2 - gridWidth / 2 + plotSpacing / 2;
    const startY = height / 2 - gridHeight / 2 + 100;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const plot = new Plot();
        const plotX = startX + col * plotSpacing;
        const plotY = startY + row * plotSpacing;
        const plotRect = this.add.rectangle(plotX, plotY, plotSize, plotSize, 0x8bc34a, 0.85)
          .setStrokeStyle(2, 0x4caf50)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(100);
        const plotText = this.add.text(plotX, plotY, '', {
          fontSize: '14px',
          color: '#fff',
          fontFamily: 'Georgia',
          align: 'center'
        }).setOrigin(0.5).setDepth(101);

        // Prepared plot image (hidden by default)
        const preparedPlotImg = this.add.image(plotX, plotY, 'preoparedPlot')
          .setOrigin(0.5)
          .setDepth(102)
          .setVisible(false)
          .setDisplaySize(plotSize, plotSize);

        // Store plot, rect, and text for later reference
        this.plots.push({ plot, plotRect, plotText, preparedPlotImg });

        // Initial update
        this.updatePlotText(plotText, plot);
        this.updatePlotColor(plotRect, plot);

        // Plot interaction: clean logic for hoe, seed pouch, water, harvest
        plotRect.on('pointerdown', () => {
          let result;
          switch (plot.state) {
            case 'empty':
              if (this.currentTool === 'hoe') {
                result = plot.prepare();
                this.updatePlotText(plotText, plot);
                this.updatePlotColor(plotRect, plot);
                preparedPlotImg.setVisible(true);
                if (result && result.message) {
                  alert(result.message);
                  console.log(result.message);
                }
              } else {
                alert('Use the hoe to prepare the ground first.');
              }
              break;
            case 'prepared':
              this.scene.launch('OpenSeedPouch', {
                onSelect: (seedItem) => {
                  result = plot.plant(seedItem);
                  this.updatePlotText(plotText, plot);
                  this.updatePlotColor(plotRect, plot);
                  preparedPlotImg.setVisible(true);
                  if (result && result.message) {
                    alert(result.message);
                    console.log(result.message);
                  }
                }
              });
              break;
            case 'planted':
              if (this.currentTool === 'wateringCan') {
                result = plot.water();
                this.updatePlotText(plotText, plot);
                this.updatePlotColor(plotRect, plot);
                preparedPlotImg.setVisible(false);
                if (result && result.message) {
                  if (result.message === 'Already watered today.') {
                    alert('Already watered! Water again tomorrow.');
                  } else {
                    alert(result.message);
                  }
                  console.log(result.message);
                }
              } else {
                alert('Use the watering can to water the plant.');
              }
              break;
            case 'grown':
              if (this.currentTool === 'shovel') {
                result = plot.harvest();
                this.updatePlotText(plotText, plot);
                this.updatePlotColor(plotRect, plot);
                preparedPlotImg.setVisible(false);
                if (result.success && result.item) {
                  const plantItem = itemsData.find(i => i.key === result.item);
                  if (plantItem) {
                    receivedItem(plantItem, this.inventoryManager);
                  }
                }
                if (result && result.message) {
                  alert(result.message);
                  console.log(result.message);
                }
              } else {
                alert('Use the shovel to harvest the plant.');
              }
              break;
            case 'harvested':
              preparedPlotImg.setVisible(false);
              alert('This plot has already been harvested. Reset or wait for next cycle.');
              break;
            default:
              alert('Unknown plot state.');
          }
        });
      }
    }
    // Ensure player always has basic tools in inventory
    const defaultTools = ['hoe', 'wateringCan', 'shovel', 'seeds'];
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

    const scaleFactor = 0.14;
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
    if (this.currentTool === 'shovel' && inventory.tools.includes('shovel')) {
      const result = plot.harvest();
      if (result.success && result.item) {
        receivedItem(result.item, this.inventoryManager);
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
    // Hoe
    const hoeBg = this.add.rectangle(40, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const hoeImg = this.add.image(40, 40, 'hoe')
      .setScale(1.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);
    // Watering Can
    const canBg = this.add.rectangle(100, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const canImg = this.add.image(100, 40, 'wateringCan')
      .setScale(1.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);
    // Shovel
    const shovelBg = this.add.rectangle(160, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const shovelImg = this.add.image(160, 40, 'shovel')
      .setScale(1.8)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);

    this.toolIconSprites = [
      { bg: hoeBg, img: hoeImg, key: 'hoe' },
      { bg: canBg, img: canImg, key: 'wateringCan' },
      { bg: shovelBg, img: shovelImg, key: 'shovel' }
    ];

    this.currentTool = 'hoe';
    hoeBg.setFillStyle(0x4caf50, 0.95);

    hoeImg.on('pointerdown', () => {
      this.currentTool = 'hoe';
      this.toolIconSprites.forEach((sprite) => {
        sprite.bg.setFillStyle(sprite.key === 'hoe' ? 0x4caf50 : 0x222233, 0.95);
      });
    });
    canImg.on('pointerdown', () => {
      this.currentTool = 'wateringCan';
      this.toolIconSprites.forEach((sprite) => {
        sprite.bg.setFillStyle(sprite.key === 'wateringCan' ? 0x4caf50 : 0x222233, 0.95);
      });
    });
    shovelImg.on('pointerdown', () => {
      this.currentTool = 'shovel';
      this.toolIconSprites.forEach((sprite) => {
        sprite.bg.setFillStyle(sprite.key === 'shovel' ? 0x4caf50 : 0x222233, 0.95);
      });
    });
  }
}

export default PersonalGarden;
