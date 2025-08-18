import { Plot } from "../../../logicHandlers/farmingLogic";
import { createMainChar } from "../../../characters/mainChar";
import { saveToLocal, loadFromLocal } from "../../../utils/localStorage";
import { showDialogue, showOption } from "../../../dialogue/dialogueUIHelpers";
import globalTimeManager from "../../../stateManagers/timeManager";
import { receivedItem } from "../../../logicHandlers/recievedItem";
import itemsData from "../../../gameData/items";
import plantData from "../../../gameData/plantData";
import quests from "../../../gameData/quests";
import achievements from "../../../gameData/achievments";
import globalInventoryManager from "../../../stateManagers/inventoryManager";

class PersonalGarden extends Phaser.Scene {
  constructor() {
    super("PersonalGarden", { physics: { default: 'arcade', arcade: { debug: false } } }); 
    this.plotSize = 64;
    this.rows = 3;
    this.cols = 5;
    this.plots = [];
    this.currentTool = "hoe";
    
    // Use the global inventory manager
    this.inventoryManager = globalInventoryManager;
    
    // Track achievement progress
    this.hasPlantedFirstCrop = false;
    this.hasHarvestedFirstCrop = false;
    this.harvestedPlantTypes = new Set();
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
      ["preoparedPlot", "/assets/farming/prepared.PNG"],
      ["foxgloveSeeds", "/assets/shopItems/seeds/foxgloveSeeds.png"],
      ["marigoldSeeds", "/assets/shopItems/seeds/marigoldSeeds.png"],
      ["jasmineSeeds", "/assets/shopItems/seeds/jasmineSeeds.png"],
      ["aloeSeeds", "/assets/shopItems/seeds/aloeSeeds.png"],
      ["lavenderSeeds", "/assets/shopItems/seeds/lavenderSeeds.png"],
      ["periwinkleSeeds", "/assets/shopItems/seeds/periwinkleSeeds.png"],
      ["garlicSeeds", "/assets/shopItems/seeds/garlicSeeds.png"],
      ["thymeSeeds", "/assets/shopItems/seeds/thymeSeeds.png"],
      ["willowSeeds", "/assets/shopItems/seeds/willowSeeds.png"],
      ["foxglovePlant", "/assets/plants/foxglove.png"],
      ["marigoldPlant", "/assets/plants/marigold.PNG"],
      ["jasminePlant", "/assets/plants/jasmine.PNG"],
      ["aloePlant", "/assets/plants/aloe.PNG"],
      ["lavenderPlant", "/assets/plants/lavender.PNG"],
      ["periwinklePlant", "/assets/plants/periwinkle.png"],
      ["garlicPlant", "/assets/plants/garlic.PNG"],
      ["thymePlant", "/assets/plants/thyme.PNG"],
      ["willowPlant", "/assets/plants/willow.PNG"],

      ["hedgeArch", "/assets/backgrounds/personal/hedgeArchway.png"],
      ["hedgeArchShadow", "/assets/backgrounds/personal/hedgeArchwayShadow.png"],
      ["plotPreparedImg", "/assets/farming/prepared.PNG"],
      ["plotPlantedImg", "/assets/farming/planted.png"],
      ["plotWateredImg", "/assets/farming/water2.png"],
      ["plant", "/assets/interact/plant.png"],
      ["harvest", "/assets/interact/harvest.png"],
    
    ];
    assets.forEach(([key, path]) => this.load.image(key, path));
    this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
    this.load.audio("dig", "/assets/sound-effects/dig.mp3");
    this.load.audio("water", "/assets/sound-effects/water.mp3");
    this.load.audio("harvest", "/assets/sound-effects/harvest.mp3");
    this.load.audio("option", "/assets/sound-effects/option.mp3");
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.image("summerShard", "/assets/items/summer.png");
    this.load.image("autumnShard", "/assets/items/autumn.png");
    this.load.image("winterShard", "/assets/items/winter.png");
    this.load.tilemapTiledJSON("personalGardenMap", "/assets/maps/personalGarden.json");
  }

  create() {
    // Load achievement progress
    this.loadAchievementProgress();

    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }

    // Stop shop theme and play main theme
    if (this.sound.get('shopTheme')) {
      this.sound.stopByKey('shopTheme');
    }
    if (!this.sound.get('theme1')) {
      this.sound.play('theme1', { loop: true, volume: 0.2 });
    }

    this.dayText = this.add.text(40, 100, `Day: ${globalTimeManager.getDayNumber()}`, {
      fontSize: '20px',
      color: '#ffe066',
      fontFamily: 'Georgia',
      backgroundColor: '#222',
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    }).setOrigin(0, 0).setDepth(99999);

    // Add the triangle button for advancing to next day
    const triangleButton = this.add.triangle(40 + 120, 100 + 15, 0, 20, 15, 0, 30, 20, 0x4caf50)
      .setInteractive({ useHandCursor: true })
      .setDepth(99999)
      .setScale(0.6);

    triangleButton.on('pointerdown', () => {
      globalTimeManager.advanceDay();
      this.dayText.setText(`Day: ${globalTimeManager.getDayNumber()}`);
      
      // Update all plots for new day
      this.plots.forEach(({ plot }) => {
        plot.updateForNewDay(globalTimeManager.getDayNumber());
      });
      
      // Refresh plot displays
      this.plots.forEach(({ plot, plotText, plotRect }) => {
        this.updatePlotText(plotText, plot);
        this.updatePlotColor(plotRect, plot);
        this.updatePlotStageImage(plot);
      });
      
      console.log(`Advanced to day ${globalTimeManager.getDayNumber()}`);
    });

    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.14;

    // Create the tilemap with extensive debugging
    console.log('Creating tilemap...');
    this.map = this.make.tilemap({ key: 'personalGardenMap' });
    
    // Create obstacle group first
    this.obstacleGroup = this.physics.add.staticGroup();
    
 
    this.map.layers.forEach((layer, index) => {
      console.log(`Layer ${index}:`, layer);
      if (layer.tilemapLayer) {
        layer.tilemapLayer.setScale(scaleFactor);
      }
    });

    // Handle collision objects from the tilemap with detailed debugging
    console.log('Looking for object layers...');
    console.log('Available object layers:', this.map.objects);
    
    const objectLayer = this.map.getObjectLayer('Object Layer 1');
    console.log('Object Layer 1 found:', objectLayer);
    

    const tilemapOffsetX = 8;
    const tilemapOffsetY = 0;
    
    const collisionScale = 0.22; 
    
    if (objectLayer) {
      console.log(`Found ${objectLayer.objects.length} objects in layer`);
      
      objectLayer.objects.forEach((obj, index) => {
        console.log(`Object ${index}:`, {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          properties: obj.properties,
          type: obj.type,
          name: obj.name
        });
        
        // Check for collision property (try multiple ways)
        const hasCollision = obj.properties && obj.properties.find(prop => 
          (prop.name === 'collisions' && prop.value === true) ||
          (prop.name === 'collision' && prop.value === true) ||
          prop.name === 'collides'
        );
        
        console.log(`Object ${index} has collision:`, !!hasCollision);
        
        if (hasCollision || obj.type === 'collision' || obj.name === 'collision') {
          console.log(`Creating collision rectangle for object ${index}`);
          
          // Use collision scale instead of the tiny scaleFactor
          const rectX = (obj.x * collisionScale) + (obj.width * collisionScale) / 2 + tilemapOffsetX;
          const rectY = (obj.y * collisionScale) + (obj.height * collisionScale) / 2 + tilemapOffsetY;
          const rectWidth = obj.width * collisionScale;
          const rectHeight = obj.height * collisionScale;
          
          console.log(`Collision rect ${index} - Position: (${rectX}, ${rectY}), Size: ${rectWidth}x${rectHeight}`);
          
          // Create invisible collision rectangle
          const collisionRect = this.add.rectangle(
            rectX,
            rectY,
            rectWidth,
            rectHeight,
            0x000000, // Color doesn't matter since it's invisible
            0 // Completely transparent
          );
          
          this.physics.add.existing(collisionRect, true);
          this.obstacleGroup.add(collisionRect);
          
          console.log(`Successfully created invisible collision rectangle ${index}`);
        }
      });
    } else {
      console.log('No Object Layer 1 found. Available object layers:');
      if (this.map.objects) {
        this.map.objects.forEach((layer, index) => {
          console.log(`Object layer ${index}:`, layer.name || 'unnamed');
        });
      } else {
        console.log('No object layers found in tilemap');
      }
    }

    // Remove physics debug rendering
    // this.physics.world.createDebugGraphic();
    // this.physics.world.debugGraphic.setDepth(9999);

    this.rows = 3;
    this.cols = 5;
    this.plots = [];

    // --- LOAD SAVED STATE FIRST ---
    const loadedState = loadFromLocal('personalGardenSceneState');
    
    const plotSpacing = 80;
    const plotSize = 60;
    const gridWidth = this.cols * plotSpacing;
    const gridHeight = this.rows * plotSpacing;
    const startX = width / 2 - gridWidth / 2 + plotSpacing / 2;
    const startY = height / 2 - gridHeight / 2 + 160;

    // Create plots and restore their state
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const plotIndex = row * this.cols + col;
        const plot = new Plot();
        
        // --- RESTORE PLOT STATE FROM SAVED DATA ---
        if (loadedState && loadedState.plots && loadedState.plots[plotIndex]) {
          const savedPlot = loadedState.plots[plotIndex];
          plot.watered = savedPlot.watered || false;
          plot.waterCount = savedPlot.waterCount || 0;
          plot.lastWateredDay = savedPlot.lastWateredDay || 0;
          plot.seedType = savedPlot.seedType || null;
          plot.state = savedPlot.state || 'empty';
          plot.growthStage = savedPlot.growthStage || 0;
          
          console.log(`Restored plot ${plotIndex}:`, {
            state: plot.state,
            seedType: plot.seedType,
            waterCount: plot.waterCount,
            growthStage: plot.growthStage
          });
        }

        const plotX = startX + col * plotSpacing;
        const plotY = startY + row * plotSpacing;

        // Create the stage image sprite for this plot
        const stageImg = this.add.image(plotX, plotY, plot.getStageImageKey())
          .setOrigin(0.5)
          .setDepth(102)
          .setDisplaySize(0.03 * plotSize, 0.03 * plotSize);

        // Rectangle for interaction and color
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

        plot.stageImageSprite = stageImg;
        this.plots.push({ plot, plotRect, plotText, stageImg });

        // Update plot display based on restored state
        this.updatePlotText(plotText, plot);
        this.updatePlotColor(plotRect, plot);
        this.updatePlotStageImage(plot);

        // --- Add hover images for prepared and grown plots ---
        let hoverImg = null;
        plotRect.on('pointerover', () => {
          if (plot.state === 'prepared') {
            if (!hoverImg) {
              hoverImg = this.add.image(plotX, plotY - 32, 'plant')
                .setScale(0.08)
                .setDepth(200);
            }
          } else if (plot.state === 'grown') {
            if (!hoverImg) {
              hoverImg = this.add.image(plotX, plotY - 32, 'harvest')
                .setScale(0.08)
                .setDepth(200);
            }
          }
        });
        plotRect.on('pointerout', () => {
          if (hoverImg) {
            hoverImg.destroy();
            hoverImg = null;
          }
        });

        plotRect.on('pointerdown', () => {
          let result;
          let shouldUpdateImage = false;
          switch (plot.state) {
            case 'empty':
              if (this.currentTool === 'hoe') {
                this.sound.play('dig');
                result = plot.prepare();
                shouldUpdateImage = result.success;
              }
              break;
            case 'prepared':
              this.scene.launch('OpenSeedPouch', {
                onSelect: (seedItem) => {
                  result = plot.plant(seedItem);
                  shouldUpdateImage = result.success;
                  this.updatePlotText(plotText, plot);
                  this.updatePlotColor(plotRect, plot);
                  this.updatePlotStageImage(plot);

                  if (result.success) {
                    // Mark "Plant your first crop" quest as complete
                    const cropQuest = quests.find(q => q.title === "Plant your first crop");
                    if (cropQuest && cropQuest.active && !cropQuest.completed) {
                      cropQuest.active = false;
                      cropQuest.completed = true;
                      saveToLocal("quests", quests);
                      console.log("Quest 'Plant your first crop' completed!");
                    }

                    // Complete "Green Thumb" achievement on first plant
                    if (!this.hasPlantedFirstCrop) {
                      this.hasPlantedFirstCrop = true;
                      this.saveAchievementProgress();
                      
                      const greenThumbAchievement = achievements.find(a => a.title === "Green Thumb");
                      if (greenThumbAchievement && !greenThumbAchievement.completed) {
                        greenThumbAchievement.completed = true;
                        saveToLocal("achievements", achievements);
                        console.log("Achievement 'Green Thumb' completed!");
                        this.showAchievementNotification("Green Thumb");
                      }
                    }
                  }
                }
              });
              break;
            case 'planted':
            case 'watered':
              if (this.currentTool === 'wateringCan') {
                this.sound.play('water');
                result = plot.water();
                shouldUpdateImage = result.success;
              }
              break;
            case 'grown':
              if (this.currentTool === 'shovel') {
                this.sound.play('harvest');
                result = plot.harvest();
                shouldUpdateImage = result.success;
                if (result.success && result.item) {
                  let plantKey = result.item;
                  const plantEntry = plantData.find(p => p.seedKey === result.item);
                  if (plantEntry && plantEntry.key) {
                    plantKey = plantEntry.key;
                  }
                  const plantItem = itemsData.find(i => i.key === plantKey);
                  if (plantItem) {
                    receivedItem(this, plantItem.key, plantItem.name);
                    
                    // Track harvested plant types for Master Gardener achievement
                    this.harvestedPlantTypes.add(plantKey);
                    this.saveAchievementProgress();
                    
                    // Complete achievements related to harvesting
                    this.checkHarvestAchievements(plantKey);
                  }
                }
                // Reset plot to empty after harvest
                if (result.success) {
                  plot.reset();
                  this.updatePlotText(plotText, plot);
                  this.updatePlotColor(plotRect, plot);
                  this.updatePlotStageImage(plot);
                }
              }
              break;
            case 'harvested':
              shouldUpdateImage = true;
              break;
            default:
              break;
          }
          this.updatePlotText(plotText, plot);
          this.updatePlotColor(plotRect, plot);
          if (shouldUpdateImage) {
            this.updatePlotStageImage(plot);
          }
        });
      }
    }

    // Add static environment objects to obstacle group
    const fenceImg = this.add.image(0, 0, "fence").setOrigin(0).setScale(scaleFactor).setDepth(10);
    // Removed: this.physics.add.existing(fenceImg, true);
    // Removed: this.obstacleGroup.add(fenceImg);

    const archScale = 0.2;
    const archWidth = this.textures.exists('hedgeArch') ? this.textures.get('hedgeArch').getSourceImage().width * archScale : 180;
    const archHeight = this.textures.exists('hedgeArch') ? this.textures.get('hedgeArch').getSourceImage().height * archScale : 220;
    const archX = startX + gridWidth + archWidth / 2 - 40;
    const archY = startY + gridHeight / 2 - 120;
    
    const shadowArch = this.add.image(archX, archY + archHeight * 0.18, "hedgeArchShadow")
      .setOrigin(0.5)
      .setScale(archScale)
      .setDepth(archY + 1);
      
    const archway = this.add.image(archX, archY + archHeight * 0.18, "hedgeArch")
      .setOrigin(0.5)
      .setScale(archScale)
      .setDepth(archY + 2);
    
    // Removed: this.physics.add.existing(archway, true);
    // Removed: this.obstacleGroup.add(archway);

    const charStartX = startX + gridWidth / 2;
    const charStartY = startY + gridHeight / 2;

    this.mainChar = createMainChar(this, charStartX, charStartY, scaleFactor, this.obstacleGroup);
    this.mainChar.setDepth(101).setOrigin(0.5, 0.5);

    // Only collide with tilemap collision objects
    this.physics.add.collider(this.mainChar, this.obstacleGroup);

    // Initialize default tools using the global manager
    this.inventoryManager.initializeDefaultTools();

    this.add.image(0, 0, "gardenBackground").setOrigin(0).setScale(0.221);

    const tentImg = this.add.image(0, 0, "tent").setOrigin(0).setScale(scaleFactor).setDepth(5);
 
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
        this.plots.forEach(({ plot }) => {
          plot.watered = false;
        });
        if (this.dayText) {
          this.dayText.setText(`Day: ${globalTimeManager.getDayNumber()}`);
        }
        this.scene.resume();
      });
    });

    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    const backBtnX = width - 40;
    const backBtnY = height / 2;
    const backButton = this.add.text(backBtnX, backBtnY, "Back", {
      fontSize: "24px",
      color: "#fff",
      fontFamily: "Georgia",
      backgroundColor: "#3bb273",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    })
      .setOrigin(1, 3.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.scene.stop("PersonalGarden");
        this.scene.start("WallGardenScene");
        this.scene.resume("HUDScene");
      });

    backButton.setDepth(10);

    // Load other saved state including achievement progress
    if (loadedState?.currentTool) this.currentTool = loadedState.currentTool;
    if (loadedState?.hasPlantedFirstCrop) this.hasPlantedFirstCrop = loadedState.hasPlantedFirstCrop;
    if (loadedState?.hasHarvestedFirstCrop) this.hasHarvestedFirstCrop = loadedState.hasHarvestedFirstCrop;
    if (loadedState?.harvestedPlantTypes) {
      this.harvestedPlantTypes = new Set(loadedState.harvestedPlantTypes);
    }

    // Shop button
    const shopBtnX = 120;
    const shopBtnY = height - 80;
    const shopButtonBg = this.add.rectangle(shopBtnX, shopBtnY, 140, 50, 0x567d46, 0.95)
      .setStrokeStyle(2, 0x88ccff)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    const shopButtonText = this.add.text(shopBtnX, shopBtnY, "Shop", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(21);

    shopButtonBg.on("pointerdown", () => {
      showOption(this, "Would you like to go to the shop?", {
        options: [
          {
            text: "Yes",
            callback: () => {
              if (this.destroyDialogueUI) this.destroyDialogueUI();
              this.sound.stopByKey && this.sound.stopByKey("theme1");
              this.scene.start("LoaderScene", {
                nextSceneKey: "ShopScene",
                nextSceneData: {}
              });
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

    // Auto-save every 8 seconds
    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    // Save on scene shutdown/destroy
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
      plots: this.plots.map(({ plot }) => ({
        watered: plot.watered,
        waterCount: plot.waterCount,
        lastWateredDay: plot.lastWateredDay,
        seedType: plot.seedType,
        state: plot.state,
        growthStage: plot.growthStage
      })),
      inventory: this.inventoryManager.getItems(),
      currentTool: this.currentTool,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay(),
      currentDay: globalTimeManager.getDayNumber(),
      hasPlantedFirstCrop: this.hasPlantedFirstCrop,
      hasHarvestedFirstCrop: this.hasHarvestedFirstCrop,
      harvestedPlantTypes: [...this.harvestedPlantTypes]
    };
    saveToLocal('personalGardenSceneState', state);
    console.log('Personal Garden state saved:', state);
  }

  updatePlotText(text, plot) {
    let display = plot.state.charAt(0).toUpperCase() + plot.state.slice(1);
    if (plot.state !== "planted") {
      if (plot.seedType) display += `\n${plot.seedType}`;
    }
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
      case 'watered':
        rect.setFillStyle(0x4caf50, 0.9);
        break;
      case 'grown':
        rect.setFillStyle(0x4caf50, 0.9);
        break;
    }
  }

  updatePlotStageImage(plot) {
    if (plot.stageImageSprite) {
      // Always show prepared plot as the base
      plot.stageImageSprite.setTexture("plotPreparedImg").setScale(0.07).setDepth(102);

      // Remove previous overlay if present
      if (plot.stageOverlaySprite) {
        plot.stageOverlaySprite.destroy();
        plot.stageOverlaySprite = null;
      }

      let overlayKey = null;
      let overlayScale = 0.03; // Default scale

      if (plot.state === "grown") {
        // Show the grown plant image, larger
        let plantKey = plot.seedType;
        const plantEntry = plantData.find(p => p.seedKey === plantKey || p.key === plantKey);
        overlayKey = plantEntry ? plantEntry.key : "";
        overlayScale = 0.06; // Larger for grown
      } else if (plot.state === "planted" && plot.waterCount >= 2) {
        overlayKey = "plotWateredImg";
        overlayScale = 0.06; // Larger for watered
      } else if (plot.state === "planted") {
        overlayKey = "plotPlantedImg";
        overlayScale = 0.02; // Smaller for planted
      } else if (plot.state === "watered") {
        overlayKey = "plotWateredImg";
        overlayScale = 0.06; // Larger for watered
      } else if (plot.state === "empty") {
        overlayKey = "";
        overlayScale = 0.03;
      }

      if (overlayKey) {
        plot.stageOverlaySprite = this.add.image(
          plot.stageImageSprite.x,
          plot.stageImageSprite.y,
          overlayKey
        )
          .setOrigin(0.5)
          .setScale(overlayScale)
          .setDepth(plot.stageImageSprite.depth + 1);
      }
    }
  }

  createToolButtons() {
    const hoeBg = this.add.rectangle(40, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const hoeImg = this.add.image(40, 40, 'hoe')
      .setScale(0.03)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);
    const canBg = this.add.rectangle(100, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const canImg = this.add.image(100, 40, 'wateringCan')
      .setScale(0.03)
      .setInteractive({ useHandCursor: true })
      .setDepth(203);
    const shovelBg = this.add.rectangle(160, 40, 48, 48, 0x222233, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(199);
    const shovelImg = this.add.image(160, 40, 'shovel')
      .setScale(0.03)
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

  // Check harvest-related achievements
  checkHarvestAchievements(plantKey) {
    // Check if this is the first harvest for any achievement that requires first harvest
    if (!this.hasHarvestedFirstCrop) {
      this.hasHarvestedFirstCrop = true;
      this.saveAchievementProgress();

    }

    // Check Master Gardener achievement - if all plant types have been harvested
    const allPlantKeys = plantData.map(plant => plant.key);
    const hasHarvestedAllPlants = allPlantKeys.every(key => this.harvestedPlantTypes.has(key));
    
    if (hasHarvestedAllPlants) {
      const masterGardenerAchievement = achievements.find(a => a.title === "Master Gardener");
      if (masterGardenerAchievement && !masterGardenerAchievement.completed) {
        masterGardenerAchievement.completed = true;
        saveToLocal("achievements", achievements);
        console.log("Achievement 'Master Gardener' completed!");
        this.showAchievementNotification("Master Gardener");
      }
    }
  }

  // Show achievement completion notification
  showAchievementNotification(achievementTitle) {
    const { width, height } = this.sys.game.config;
    
    const notification = this.add.text(width / 2, height / 2 - 100, `🏆 Achievement Unlocked!\n${achievementTitle}`, {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#fff",
      backgroundColor: "#d4851f",
      padding: { left: 16, right: 16, top: 8, bottom: 8 },
      align: "center"
    }).setOrigin(0.5).setDepth(9999);

    // Auto-hide notification after 4 seconds
    this.time.delayedCall(4000, () => {
      if (notification && !notification.destroyed) {
        notification.destroy();
      }
    });

    // Allow manual dismissal
    notification.setInteractive().on("pointerdown", () => {
      notification.destroy();
    });
  }

  // Load achievement progress from localStorage
  loadAchievementProgress() {
    const savedProgress = localStorage.getItem("personalGardenAchievements");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        this.hasPlantedFirstCrop = parsed.hasPlantedFirstCrop || false;
        this.hasHarvestedFirstCrop = parsed.hasHarvestedFirstCrop || false;
        this.harvestedPlantTypes = new Set(parsed.harvestedPlantTypes || []);
      } catch (error) {
        console.log("Error loading achievement progress:", error);
        this.resetAchievementProgress();
      }
    }
  }

  // Save achievement progress to localStorage
  saveAchievementProgress() {
    const progress = {
      hasPlantedFirstCrop: this.hasPlantedFirstCrop,
      hasHarvestedFirstCrop: this.hasHarvestedFirstCrop,
      harvestedPlantTypes: [...this.harvestedPlantTypes]
    };
    localStorage.setItem("personalGardenAchievements", JSON.stringify(progress));
  }

  // Reset achievement progress (for debugging or new games)
  resetAchievementProgress() {
    this.hasPlantedFirstCrop = false;
    this.hasHarvestedFirstCrop = false;
    this.harvestedPlantTypes = new Set();
  }
}

export default PersonalGarden;
