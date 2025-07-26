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

    // Move plots down and to the right
    const plotOffsetX = 60;
    const plotOffsetY = 40;

    if (this.physics && this.physics.add) {
      this.plotGroup = this.physics.add.staticGroup();
      this.charGroup = this.physics.add.group();

      this.mainChar = createMainChar(this, width / 2, height / 2, 0.18, this.charGroup);
      this.mainChar.setDepth(1).setOrigin(0.5);
      this.charGroup.add(this.mainChar);

      // Move plots down and to the right
      const plotOffsetX = 60;
      const plotOffsetY = 40;
      const startX = width / 2 - (this.cols / 2) * this.plotSize + plotOffsetX;
      const startY = height / 2 - (this.rows / 2) * this.plotSize + plotOffsetY;

      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const px = startX + x * this.plotSize;
          const py = startY + y * this.plotSize;

          const plot = new Plot();
          if (loadedState?.plots?.[y * this.cols + x]) {
            Object.assign(plot, loadedState.plots[y * this.cols + x]);
          }

          const rect = this.add.rectangle(px, py, this.plotSize - 4, this.plotSize - 4, 0x8bc34a, 0.85)
            .setStrokeStyle(2, 0x4caf50)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
          const text = this.add.text(px, py, '', {
            fontSize: '14px',
            color: '#fff',
            fontFamily: 'Georgia',
            align: 'center'
          }).setOrigin(0.5);

          rect.on('pointerdown', () => {
            const result = this.useToolOnPlot(plot);
            if (result.message) console.log(result.message);
            this.updatePlotText(text, plot);
            this.updatePlotColor(rect, plot);
            this.saveSceneState();
          });

          this.plots.push({ plot, rect, text });
          this.updatePlotText(text, plot);
        }
      }

      this.physics.add.collider(this.charGroup, this.plotGroup);
    } else {
      // fallback if physics isn't available
      this.mainChar = createMainChar(this, width / 2, height / 2, 0.18);
      this.mainChar.setDepth(1).setOrigin(0.5);

      const startX = width / 2 - (this.cols / 2) * this.plotSize + plotOffsetX;
      const startY = height / 2 - (this.rows / 2) * this.plotSize + plotOffsetY;

      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const px = startX + x * this.plotSize;
          const py = startY + y * this.plotSize;

          const plot = new Plot();
          if (loadedState?.plots?.[y * this.cols + x]) {
            Object.assign(plot, loadedState.plots[y * this.cols + x]);
          }

          const rect = this.add.rectangle(px, py, this.plotSize - 4, this.plotSize - 4, 0x8bc34a, 0.85)
            .setStrokeStyle(2, 0x4caf50)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

          const text = this.add.text(px, py, '', {
            fontSize: '14px',
            color: '#fff',
            fontFamily: 'Georgia',
            align: 'center'
          }).setOrigin(0.5);

          rect.on('pointerdown', () => {
            const result = this.useToolOnPlot(plot);
            if (result.message) console.log(result.message);
            this.updatePlotText(text, plot);
            this.updatePlotColor(rect, plot);
            this.saveSceneState();
          });

          this.plots.push({ plot, rect, text });
          this.updatePlotText(text, plot);
        }
      }
    }

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
    const tools = ['hoe', 'seeds', 'wateringCan', 'harvestGlove'];
    tools.forEach((tool, i) => {
      const btn = this.add.text(20, 20 + i * 30, tool.toUpperCase(), {
        fontSize: '16px',
        backgroundColor: '#333',
        color: '#fff',
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.currentTool = tool;
        this.highlightSelectedTool(tools, i);
      });

      if (i === 0) btn.setStyle({ backgroundColor: '#4caf50' });
    });
  }

  highlightSelectedTool(tools, selectedIndex) {
    tools.forEach((tool, i) => {
      const label = tool.toUpperCase();
      this.children.list.forEach(child => {
        if (child.text === label) {
          child.setStyle({
            backgroundColor: i === selectedIndex ? '#4caf50' : '#333'
          });
        }
      });
    });
  }
}

export default PersonalGarden;
