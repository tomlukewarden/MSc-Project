import { Plot } from "../farmingLogic";

class PersonalGarden extends Phaser.Scene {
  constructor() {
    super("PersonalGarden");
    this.plotSize = 64;
    this.rows = 3;
    this.cols = 5;
    this.plots = [];
    this.currentTool = "hoe";
    this.inventory = {
      tools: ['hoe', 'wateringCan', 'harvestGlove'],
      seeds: ['carrotSeed', 'thymeSeed', 'garlicSeed'],
      items: [] // harvested items
    };
  }

  create() {
    const { width, height } = this.sys.game.config;
    // --- Launch HUD ---
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    // --- Add main character ---
    if (this.createMainChar) {
      this.mainChar = this.createMainChar(this, width / 2, height - 100, 0.18);
    } else {
      this.mainChar = this.add.circle(width / 2, height - 100, 24, 0x2196f3).setDepth(10);
    }

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

  useToolOnPlot(plot) {
    // Only handle via inventory
    // Tool logic uses inventory
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
