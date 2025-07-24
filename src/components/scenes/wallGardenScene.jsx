import Phaser from 'phaser';
import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, destroyDialogueUI, showOption } from '../../dialogue/dialogueUIHelpers';
import { CoinManager } from '../coinManager';
import { createMainChar } from '../../characters/mainChar';
import ChestLogic from '../chestLogic';
import { saveToLocal, loadFromLocal } from '../../utils/localStorage';
import plantData from "../../plantData";
import { inventoryManager } from "../inventoryManager";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { createElephant, elephantIntroDialogues, elephantThanksDialogues } from '../../characters/elephant';
import globalTimeManager from "../../day/timeManager";


const coinManager = CoinManager.load();

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.chestLogic = new ChestLogic();
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.mainChar = null;
    this.transitioning = false;
  }

  preload() {
    this.load.tilemapTiledJSON("wallGardenMap", "/assets/maps/wallGardenMap.json");
    this.load.image('wall1', '/assets/backgrounds/wallGarden/wall1.png');
    this.load.image('wall2', '/assets/backgrounds/wallGarden/wall2.png');
    this.load.image('trees', '/assets/backgrounds/wallGarden/trees.png');
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
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
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('talk', '/assets/interact/talk.png');
    this.load.image('chestClosed', '/assets/misc/chest-closed.png');
    this.load.image('chestOpen', '/assets/misc/chest-open.png');
    this.load.image("foxglovePlant", "/assets/plants/foxglove.png");
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('elephant', '/assets/npc/elephant/elephant.png');
    this.load.image('elephantHappy', '/assets/npc/elephant/happy.png');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('autumnShard', '/assets/items/autumn.png');
    

  }

  create() {
    // Reset transitioning flag on scene creation
    this.transitioning = false;
    // --- Personal Garden Button (above bushes) ---
    const btnX = 220;
    const btnY = 300;
    const btnWidth = 180;
    const btnHeight = 48;
    const personalBtnBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x3e7d3a, 0.95)
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });
    const personalBtnText = this.add.text(btnX, btnY, 'Go to Personal Garden', {
      fontFamily: 'Georgia',
      fontSize: '22px',
      color: '#fff',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#4caf50',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(101);

    personalBtnText.setInteractive({ useHandCursor: true });
    personalBtnText.on('pointerdown', () => {
      personalBtnBg.emit('pointerdown');
    });
    personalBtnBg.on('pointerover', () => {
      personalBtnBg.setFillStyle(0x4caf50, 0.98);
      personalBtnText.setColor('#ffffcc');
    });
    personalBtnBg.on('pointerout', () => {
      personalBtnBg.setFillStyle(0x3e7d3a, 0.95);
      personalBtnText.setColor('#fff');
    });
    personalBtnBg.on('pointerdown', () => {
      if (!this.transitioning) {
        this.transitioning = true;
        this.scene.start("PersonalGarden");
      }
    });
  globalTimeManager.init(this);
  if (!globalTimeManager.startTimestamp) {
    globalTimeManager.start();
  }
    const craftBtnX = 120;
    const craftBtnY = 80;
    const craftBtnWidth = 140;
    const craftBtnHeight = 48;
    const craftBtnBg = this.add.rectangle(craftBtnX, craftBtnY, craftBtnWidth, craftBtnHeight, 0x3e7d3a, 0.95)
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });
    const craftBtnText = this.add.text(craftBtnX, craftBtnY, '🛠️ Craft', {
      fontFamily: 'Georgia',
      fontSize: '26px',
      color: '#fff',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#4caf50',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(101);

    craftBtnText.setInteractive({ useHandCursor: true });
    craftBtnText.on('pointerdown', () => {
      craftBtnBg.emit('pointerdown');
    });
    craftBtnBg.on('pointerover', () => {
      craftBtnBg.setFillStyle(0x4caf50, 0.98);
      craftBtnText.setColor('#ffffcc');
    });
    craftBtnBg.on('pointerout', () => {
      craftBtnBg.setFillStyle(0x3e7d3a, 0.95);
      craftBtnText.setColor('#fff');
    });
    craftBtnBg.on('pointerdown', () => {
      // Remove any existing CraftUI overlay
      if (this.craftUIOverlay) {
        this.craftUIOverlay.destroy(true);
        this.craftUIOverlay = null;
      }
      // Get inventory items (as objects)
      const items = inventoryManager.getItems ? inventoryManager.getItems() : [];
      // Center overlay
      const { width, height } = this.sys.game.config;
      // Dynamically import the CraftUI class
      import('../../components/craftUI').then(({ default: CraftUI }) => {
        this.craftUIOverlay = new CraftUI(this, width / 2, height / 2);
        this.craftUIOverlay.setDepth && this.craftUIOverlay.setDepth(200);
        // Set inventory items as ingredients (first 3 for demo)
        this.craftUIOverlay.setIngredients(items.slice(0, 3));
    
        const closeBtn = this.add.text(width / 2 + 140, height / 2 - 90, '✕', {
          fontFamily: 'Georgia',
          fontSize: '28px',
          color: '#a33',
          backgroundColor: '#fff5',
          padding: { left: 10, right: 10, top: 2, bottom: 2 }
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(201);
        closeBtn.on('pointerdown', () => {
          this.craftUIOverlay.destroy(true);
          closeBtn.destroy();
          this.craftUIOverlay = null;
        });
      });
    });
    
    if (typeof window !== "undefined") {
    window.inventoryManager = inventoryManager;
}
    this.scene.launch('HUDScene');
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('wallGardenSceneState') || {};
    // Restore coins if present
    if (sceneState.coins !== undefined) {
      coinManager.set(sceneState.coins);
    }
    // Restore inventory if present (assumes inventoryManager is imported)
    if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
      inventoryManager.clear();
      sceneState.inventory.forEach(item => inventoryManager.addItem(item));
    }
    // Restore periwinkleFound (for bush logic)
    let periwinkleFound = !!sceneState.periwinkleFound;
    // Restore butterfly dialogue state
    this.butterflyDialogueIndex = sceneState.butterflyDialogueIndex || 0;
    this.butterflyDialogueActive = !!sceneState.butterflyDialogueActive;
    this.dialogueActive = !!sceneState.dialogueActive;
    // Restore time of day
    if (sceneState.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }

    // --- Restore dialogue UI if needed ---
    // Only restore if dialogue was active when leaving
    if (this.butterflyDialogueActive) {
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
        } else {
          showOption(this, "Would you like to move on?", {
            imageKey: "butterfly",
            options: [
              {
                text: "Yes",
                callback: () => {
                  this.destroyDialogueUI();
                  this.butterflyDialogueActive = false;
                  this.saveSceneState(periwinkleFound);
                  this.scene.start("ShardGardenScene");
                }
              },
              {
                text: "No",
                callback: () => {
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.", { imageKey: "butterflyHappy" });
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.butterflyDialogueActive = false;
                    this.saveSceneState(periwinkleFound);
                  };
                }
              }
            ]
          });
        }
      };
    }

      // --- Elephant NPC ---
            const elephant = createElephant(this, width / 2 + 200, height / 2 + 100);
            elephant
                .setInteractive({ useHandCursor: true })
                .setDepth(10)
                .setScale(0.1)
                .setOrigin(4, 0.9);
    
            // Elephant talk icon events
            elephant.on("pointerover", (pointer) => {
                talkIcon.setVisible(true);
                talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
            });
            elephant.on("pointermove", (pointer) => {
                talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
            });
            elephant.on("pointerout", () => {
                talkIcon.setVisible(false);
            });
    
            // --- Elephant dialogue and gifting logic ---
            this.elephantDialogueActive = false;
            this.elephantDialogueIndex = 0;
            this.hasJasmine = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("jasminePlant");

    // Listen for jasmine handover event from inventory
    this.events.on("jasmineGiven", () => {
      this.elephantHasJasmine = false;
      // Confirm jasmine is removed from inventory
      if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("jasminePlant")) {
        showDialogue(this, "You hand the elephant the Jasmine...", { imageKey: "elephant" });
        this.elephant.setTexture && this.elephant.setTexture("elephantHappy");
        this.time.delayedCall(800, () => {
          this.elephantDialogueActive = true;
          this.elephantDialogueIndex = 0;
          this.activeElephantDialogues = elephantThanksDialogues;
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
          this.updateHUDState && this.updateHUDState();
        });
      } else {
        showDialogue(this, "You still have the Jasmine.", { imageKey: "elephant" });
      }
    });

    // Elephant click handler
    elephant.on("pointerdown", () => {
      if (!this.elephantIntroDone && !this.elephantDialogueActive) {
        this.elephantDialogueActive = true;
        this.elephantDialogueIndex = 0;
        this.activeElephantDialogues = elephantIntroDialogues;
        showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.elephantIntroDone && !this.elephantThanksDone && this.hasJasmine()) {
        this.awaitingJasmineGive = true;
        showOption(this, "Give the elephant the Jasmine?", {
          imageKey: "elephant",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeJasmineChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                // Set flag to await jasmine handover
                this.awaitingJasmineGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "elephant" });
              }
            }
          ]
        });
        return;
      }
      if (this.elephantIntroDone && !this.elephantThanksDone && !this.hasJasmine()) {
        showDialogue(this, "The elephant looks at you expectantly. Maybe you need to find something for them...", { imageKey: "elephant" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });
    
            // --- Dialogue advance on click ---
            this.input.on("pointerdown", () => {
                // Elephant dialogue advance
                if (this.elephantDialogueActive) {
                    this.elephantDialogueIndex++;
                    if (this.activeElephantDialogues && this.elephantDialogueIndex < this.activeElephantDialogues.length) {
                        showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
                    } else {
                        this.destroyDialogueUI();
                        this.dialogueActive = false;
                        this.updateHUDState && this.updateHUDState();
    
                        if (!this.elephantIntroDone && this.activeElephantDialogues === elephantIntroDialogues) {
                            this.elephantIntroDone = true;
                        }
                        if (this.elephantHasJasmine && this.activeElephantDialogues === elephantThanksDialogues) {
                            this.elephantThanksDone = true;
                            // Automatically give autumn shard after thanks dialogue
                            receivedItem(this, "autumnShard", "Autumn Shard");
                        }
                        this.elephantDialogueActive = false;
                        this.updateHUDState && this.updateHUDState();
                    }
                    return;
                }
                // Plant/coin dialogue advance
                if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
                    this.dialogueOnComplete();
                }
                // Always update HUD after any dialogue completes
                this.updateHUDState && this.updateHUDState();
            });
    
    
    

    // --- Map and background ---
    const map = this.make.tilemap({ key: "wallGardenMap" });
    this.add.image(width / 2, height / 2, "wallGardenBackground").setScale(scaleFactor).setDepth(0);
    this.add.image(width / 2, height / 2, "wall1").setScale(scaleFactor).setDepth(9);
    this.add.image(width / 2, height / 2, "wall2").setScale(scaleFactor).setDepth(103);
    this.add.image(width / 2, height / 2, "trees").setScale(scaleFactor).setDepth(10);

    // --- Collision objects from the object layer ---
    const collisionGroup = this.physics.add.staticGroup();
    const collisionObjects = map.getObjectLayer && map.getObjectLayer("wall-garden-collision");
    const xOffset = -160;
    const yOffset = 0;

    if (collisionObjects && collisionObjects.objects) {
      collisionObjects.objects.forEach((obj) => {
        const hasCollisionProp = obj.properties && obj.properties.some(
          (prop) => prop.name === "collision" && prop.value === true
        );
        if (!hasCollisionProp) return;

        const solid = this.add.rectangle(
          (obj.x + obj.width / 2) * scaleFactor + xOffset,
          (obj.y + obj.height / 2) * scaleFactor + yOffset,
          obj.width * scaleFactor,
          obj.height * scaleFactor,
          0xff0000,
          0.3
        );
        this.physics.add.existing(solid, true);
        collisionGroup.add(solid);
      });
    }

    // --- Place chest in the scene ---
    this.setupChest(width, height);

    // --- Main Character ---
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(1, -5);

    // --- Butterfly NPC ---
    this.butterfly = createButterfly(this, width / 2 + 100, height / 2 - 50);
    this.butterfly.setDepth(20).setScale(0.09).setInteractive();

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(110)
      .setOrigin(0.5);

    // --- Talk icon hover logic ---
    this.butterfly.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.butterfly.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.butterfly.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    this.butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      // Do not reset index if restoring
      if (!this.dialogueBox) this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
        } else {
          showOption(this, "Would you like to move on?", {
            imageKey: "butterfly",
            options: [
              {
                text: "Yes",
                callback: () => {
                  this.destroyDialogueUI();
                  this.butterflyDialogueActive = false;
                  this.scene.start("ShardGardenScene");
                }
              },
              {
                text: "No",
                callback: () => {
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.", { imageKey: "butterflyHappy" });
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.butterflyDialogueActive = false;
                    this.dialogueActive = false;
                    this.updateHUDState();
                    this.dialogueOnComplete = null;
                  };
                }
              }
            ]
          });
        }
      };
    });

    // --- Placeholder bushes: random rectangles ---
    this.setupBushes(width, height, periwinkleFound);

    this.input.on("pointerdown", () => {
      this.sound.play("click");
      // Only advance/close if a dialogue is active and a completion callback is set
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
    });

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState(periwinkleFound);
    }, 8000);

    // Save on shutdown/stop
    this.events.on('shutdown', () => {
      this.saveSceneState(periwinkleFound);
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
    this.events.on('destroy', () => {
      this.saveSceneState(periwinkleFound);
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
  }

  // Save relevant state to localStorage
  saveSceneState(periwinkleFound) {
    const state = {
      coins: coinManager.get ? coinManager.get() : 0,
      inventory: inventoryManager.getItems ? inventoryManager.getItems() : [],
      periwinkleFound: !!periwinkleFound,
      butterflyDialogueIndex: this.butterflyDialogueIndex,
      butterflyDialogueActive: !!this.butterflyDialogueActive,
      dialogueActive: !!this.dialogueActive,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay()
    };
    saveToLocal('wallGardenSceneState', state);
  }

  setupChest(width, height) {
    const chestItemsArray = [
      { name: "Spring Shard", color: 0x88cc88, key: "springShard" },
      {name: "Summer Shard", color: 0x88cc88, key: "summerShard"},
      {name: "Autumn Shard", color: 0x88cc88, key: "autumnShard"},
      {name: "Winter Shard", color: 0x88cc88, key: "winterShard"},
    ];
    const chest = this.add.image(width / 2 + 200, height / 2 - 40, 'chestClosed')
      .setScale(2)
      .setDepth(15)
      .setInteractive();

    this.chestLogic.scene = this;
    this.chestLogic.setChest(chest);

    chest.on("pointerdown", () => {
      chest.setTexture('chestOpen');
      this.chestLogic.openChest(chestItemsArray);

      this.scene.get("ChestUI").events.once("shutdown", () => {
        chest.setTexture('chestClosed');
      });
    });
  }

  setupBushes(width, height, periwinkleFound) {
    const bushPositions = [
      { x: 180, y: 400 },
      { x: 260, y: 500 },
      { x: 340, y: 450 },
      { x: 420, y: 350 }
    ];
    const bushCount = bushPositions.length;
    // Randomly pick which bush will have the periwinkle
    const periwinkleBushIndex = Phaser.Math.Between(0, bushCount - 1);
    // Track dispensed state for each bush
    this.bushDispensed = this.bushDispensed || Array(bushCount).fill(false);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.add.image(x, y, 'bush')
        .setScale(1.8)
        .setDepth(1)
        .setInteractive({ useHandCursor: true });

      bush.on("pointerdown", () => {
        this.sound.play("click");
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState();

        // If already dispensed, show empty dialogue
        if (this.bushDispensed[i]) {
          showDialogue(this, "This bush is empty!");
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          return;
        }

        if (i === periwinkleBushIndex && !periwinkleFound) {
          // Give periwinkle plant (after minigame)
          const periwinkle = plantData.find(p => p.key === "periwinklePlant");
          if (periwinkle) {
            showOption(
              this,
              "You found a Periwinkle plant hidden in the bush... But a cheeky little animal is trying to steal it!",
              {
                options: [
                  {
                    label: "Play a game to win it!",
                    callback: () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState();
                      this.dialogueOnComplete = null;
                      this.scene.launch("MiniGameScene", {
                        onWin: () => {
                          this.scene.stop("MiniGameScene");
                          this.scene.resume();
                          receivedItem(this, periwinkle.key, periwinkle.name);
                          inventoryManager.addItem(periwinkle);
                          addPlantToJournal(periwinkle.key);
                          showDialogue(this,
                            "You won the game! The animal reluctantly gives you the Periwinkle plant.",
                            { imageKey: periwinkle.imageKey }
                          );
                          periwinkleFound = true;
                          this.dialogueActive = true;
                          this.dialogueOnComplete = () => {
                            this.destroyDialogueUI();
                            this.dialogueActive = false;
                            this.updateHUDState();
                            this.dialogueOnComplete = null;
                          };
                          this.bushDispensed[i] = true;
                        }
                      });
                      this.scene.pause();
                    }
                  },
                  {
                    label: "Try again later",
                    callback: () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState();
                      this.dialogueOnComplete = null;
                    }
                  }
                ],
                imageKey: periwinkle.imageKey
              }
            );
          } else {
            showDialogue(this, "You found a rare plant, but its data is missing!", {});
            this.dialogueOnComplete = () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
            };
            this.bushDispensed[i] = true;
          }
          // periwinkleFound is set only after winning the minigame!
        } else {
          // Give coins
          const coins = Phaser.Math.Between(10, 30);
          coinManager.add(coins);
          saveToLocal("coins", coinManager.coins);
          receivedItem(this, "coin", `${coins} Coins`, { scale: 0.15 });
          showDialogue(this, `You found ${coins} coins hidden in the bush!`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          this.bushDispensed[i] = true;
        }
      });
    }
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 90;

    if (this.mainChar) {
      // Right edge
      if (this.mainChar.x >= rightEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("MiddleGardenScene");
      }
      // Left edge
      if (this.mainChar.x <= leftEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("GreenhouseScene");
      }
    }
  }

  updateHUDState() {
    if (this.dialogueActive) {
      this.scene.sleep("HUDScene");
    } else {
      this.scene.wake("HUDScene");
    }
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

export default WallGardenScene;