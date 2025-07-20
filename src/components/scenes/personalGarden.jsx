import { Plot } from "../farmingLogic";
import { createMainChar } from "../../characters/mainChar";
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
    this.inventory = {
      tools: ['hoe', 'wateringCan', 'harvestGlove'],
      seeds: ['carrotSeed', 'thymeSeed', 'garlicSeed'],
      items: []
    };
  }
  preload() {
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
    this.load.image("hoe", "/assets/tools/hoe.png");
    this.load.image("wateringCan", "/assets/tools/wateringCan.png");
    this.load.image("sign", "/assets/misc/sign.png")
  }

  create() {
      globalTimeManager.init(this);
  if (!globalTimeManager.startTimestamp) {
    globalTimeManager.start();
  }
    const { width, height } = this.sys.game.config;
    // --- Launch HUD ---
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    // --- Create collision groups ---
    if (this.physics && this.physics.add) {
      this.plotGroup = this.physics.add.staticGroup();
      this.charGroup = this.physics.add.group();

      // --- Add main character ---
      this.mainChar = createMainChar(this, width / 2, height / 2, 0.18, this.charGroup);
      this.mainChar.setDepth(1).setOrigin(0.5, 0.5);
      this.charGroup.add(this.mainChar);

      // --- Create grid of plots ---
      const startX = width / 2 - (this.cols / 2) * this.plotSize;
      const startY = height / 2 - (this.rows / 2) * this.plotSize;
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const px = startX + x * this.plotSize;
          const py = startY + y * this.plotSize;

          const plot = new Plot();
          // Create a physics-enabled static rectangle for collision
          const rect = this.add.rectangle(px, py, this.plotSize - 4, this.plotSize - 4, 0x8bc34a, 0.85)
            .setStrokeStyle(2, 0x4caf50)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
          this.physics.add.existing(rect, true); // true = static body
          this.plotGroup.add(rect);

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
          });

          this.plots.push({ plot, rect, text });
          this.updatePlotText(text, plot);
        }
      }

      // --- Enable collision between main character and plots ---
      this.physics.add.collider(this.charGroup, this.plotGroup);
    } else {
      // Fallback: no physics available
      this.mainChar = createMainChar(this, width / 2, height / 2, 0.18);
      this.mainChar.setDepth(1).setOrigin(0.5, 0.5);

      // --- Create grid of plots ---
      const startX = width / 2 - (this.cols / 2) * this.plotSize;
      const startY = height / 2 - (this.rows / 2) * this.plotSize;
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const px = startX + x * this.plotSize;
          const py = startY + y * this.plotSize;

          const plot = new Plot();
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
          });

          this.plots.push({ plot, rect, text });
          this.updatePlotText(text, plot);
        }
      }
    }

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
  }

  useToolOnPlot(plot) {
    if (this.currentTool === 'hoe' && this.inventory.tools.includes('hoe')) {
      return plot.prepare();
    }
    if (this.currentTool === 'wateringCan' && this.inventory.tools.includes('wateringCan')) {
      return plot.water();
    }
    if (this.currentTool === 'harvestGlove' && this.inventory.tools.includes('harvestGlove')) {
      const result = plot.harvest();
      if (result.success && result.item) {
        this.inventory.items.push(result.item);
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
    const tools = ['hoe', 'wateringCan', 'harvestGlove'];
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
    this.children.list.forEach((child, i) => {
      if (child.style && tools.includes(child.text.toLowerCase())) {
        child.setStyle({
          backgroundColor: i - 1 === selectedIndex ? '#4caf50' : '#333'
        });
      }
    });
  }
}

export default PersonalGarden;
