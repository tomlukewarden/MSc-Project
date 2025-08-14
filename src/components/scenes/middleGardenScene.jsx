import { createMainChar } from "../../characters/mainChar";
import plantData from "../../plantData";
import { inventoryManager } from "../inventoryManager";
// Ensure global inventoryManager instance
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = inventoryManager;
  }
}
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import { createWolf, wolfIntroDialogues, wolfThanksDialogues } from "../../characters/wolf";
import { createMole, moleIntroDialogues, moleThanksDialogues } from "../../characters/mole";
import { createTurtle, turtleIntroDialogues, turtleThanksDialogues } from "../../characters/turtle";
import globalTimeManager from "../../day/timeManager";

class MiddleGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiddleGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.garlicFound = false;
    this.thymeFound = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.transitioning = false;
  }

  preload() {
   this.load.image('finalGardenBackground', '/assets/backgrounds/finalGarden/middleBackground.png');
   this.load.image('folliage1', '/assets/backgrounds/finalGarden/folliage1.png');
   this.load.image('folliage2', '/assets/backgrounds/finalGarden/folliage2.png');
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
    this.load.audio("click", "/assets/sound-effects/click.mp3");
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('wolf', '/assets/npc/wolf/wolf.png')
    this.load.image('wolfHappy', '/assets/npc/wolf/happy.png')
    this.load.image('talk', '/assets/ui-items/talk.png');
    this.load.image('summerShard', '/assets/items/summer.png');
    this.load.image('winterShard', '/assets/items/winter.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
        this.load.image('mole', '/assets/npc/mole/mole.png');
    this.load.image('moleHappy', '/assets/npc/mole/happy.png');
    this.load.image('turtle', '/assets/npc/turtle/turtle.png');
    this.load.image('turtleHappy', '/assets/npc/turtle/happy.png');
    this.load.audio("option", "/assets/sound-effects/option.mp3");
  }

  create() {
    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }
    this.transitioning = false;
    if (typeof window !== "undefined") {
      window.inventoryManager = inventoryManager;
    }
    this.scene.launch("HUDScene");
    this.scene.stop("StartScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // Asset existence check helper
    const safeAddImage = (scene, x, y, key, ...args) => {
      if (!scene.textures.exists(key)) {
        console.warn(`Image asset missing: ${key}`);
        return scene.add.text(x, y, `Missing: ${key}`, { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);
      }
      return scene.add.image(x, y, key, ...args);
    };
    // Background
    safeAddImage(this, width / 2, height / 2, 'finalGardenBackground').setScale(scaleFactor).setDepth(0);
    // Folliage
    safeAddImage(this, width / 2, height / 2, 'folliage1').setScale(scaleFactor).setDepth(1);
    const folliage2Img = safeAddImage(this, width / 2, height / 2, 'folliage2').setScale(scaleFactor).setDepth(2);

    // --- Collision for folliage2 ---
    const collisionGroup = this.physics.add.staticGroup();
    const folliage2Rect = this.add.rectangle(
      width / 2,
      height / 2,
      folliage2Img.width * scaleFactor,
      folliage2Img.height * scaleFactor,
      0x00ff00, 
      0 
    ).setDepth(2); 
    this.physics.add.existing(folliage2Rect, true);
    collisionGroup.add(folliage2Rect);

    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(1).setOrigin(0.5, 0.5);


    // --- Mole NPC ---
    this.mole = createMole(this, width / 2 + 200, height / 2 + 100);
    this.mole
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.09)
      .setOrigin(-3.5, 2);

    // --- Turtle NPC ---
    this.turtle = createTurtle(this, width / 2 - 200, height / 2 + 100);
    this.turtle
      .setInteractive({ useHandCursor: true })
      .setDepth(1)
      .setScale(0.12)
      .setOrigin(-0.2, 1.7);

    // Mole talk icon events
    this.mole.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.mole.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.mole.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // Turtle talk icon events
    this.turtle.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.turtle.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.turtle.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // --- Mole dialogue and gifting logic ---
    this.moleDialogueActive = false;
    this.moleDialogueIndex = 0;
    // Change required item to Garlic Paste
    this.hasGarlicPaste = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("garlicPaste");

    // Listen for garlicPaste handover event from inventory
    this.events.on("garlicPasteGiven", () => {
      this.awaitingGarlicPasteGive = false;
      inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("garlicPaste");
      if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("garlicPaste")) {
        showDialogue(this, "You hand the mole the Garlic Paste...", { imageKey: "mole" });
        this.mole.setTexture && this.mole.setTexture("moleHappy");
        this.time.delayedCall(800, () => {
          this.moleDialogueActive = true;
          this.moleDialogueIndex = 0;
          this.activeMoleDialogues = moleThanksDialogues;
          showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "mole" });
          this.updateHUDState && this.updateHUDState();
        });
        this.moleHasGarlicPaste = true;
      } else {
        showDialogue(this, "You still have the Garlic Paste.", { imageKey: "mole" });
      }
    });

    // Mole click handler
    this.mole.on("pointerdown", () => {
      if (!this.moleIntroDone && !this.moleDialogueActive) {
        this.moleDialogueActive = true;
        this.moleDialogueIndex = 0;
        this.activeMoleDialogues = moleIntroDialogues;
        showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "mole" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.moleIntroDone && !this.moleThanksDone && this.hasGarlicPaste()) {
        showOption(this, "Give the mole the Garlic Paste?", {
          imageKey: "mole",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeGarlicPasteChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingGarlicPasteGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "mole" });
              }
            }
          ]
        });
        return;
      }
      if (this.moleIntroDone && !this.moleThanksDone && !this.hasGarlicPaste()) {
        showDialogue(this, "The mole looks at you expectantly. Maybe you need to find something for them?", { imageKey: "mole" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });
    // Turtle click handler
    this.turtle.on("pointerdown", () => {
      if (!this.turtleIntroDone && !this.turtleDialogueActive) {
        this.turtleDialogueActive = true;
        this.turtleDialogueIndex = 0;
        this.activeTurtleDialogues = turtleIntroDialogues;
        showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { imageKey: "turtle" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.turtleIntroDone && !this.turtleThanksDone && this.hasThymeInfusedOil()) {
        showOption(this, "Give the turtle the Thyme Infused Oil?", {
          imageKey: "turtle",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeThymeInfusedOilChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingThymeInfusedOilGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "turtle" });
              }
            }
          ]
        });
        return;
      }
      if (this.turtleIntroDone && !this.turtleThanksDone && !this.hasThymeInfusedOil()) {
        showDialogue(this, "The turtle looks at you expectantly. Maybe you need to find something for them...", { imageKey: "turtle" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Wolf NPC ---
    this.wolf = createWolf(this, width / 2 + 200, height / 2 + 100);
    this.wolf
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.15)
      .setOrigin(0.5, 0.9);

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(11)
      .setOrigin(0.5);

    // Wolf talk icon events
    this.wolf.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.wolf.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.wolf.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // --- Wolf dialogue and gifting logic ---
    this.wolfDialogueActive = false;
    this.wolfDialogueIndex = 0;
    // Change required item to Periwinkle Extract
    this.hasPeriwinkleExtract = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("periwinkleExtract");

    // Listen for periwinkleExtract handover event from inventory
    this.events.on("periwinkleExtractGiven", () => {
      this.awaitingPeriwinkleExtractGive = false;
      inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinkleExtract");
      if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("periwinkleExtract")) {
        showDialogue(this, "You hand the wolf the Periwinkle Extract...", { imageKey: "wolf" });
        this.wolf.setTexture && this.wolf.setTexture("wolfHappy");
        this.time.delayedCall(800, () => {
          this.wolfDialogueActive = true;
          this.wolfDialogueIndex = 0;
          this.activeWolfDialogues = wolfThanksDialogues;
          showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
          this.updateHUDState && this.updateHUDState();
        });
        this.wolfHasPeriwinkleExtract = true;
      } else {
        showDialogue(this, "You still have the Periwinkle Extract.", { imageKey: "wolf" });
      }
    });

    // Wolf click handler
    this.wolf.on("pointerdown", () => {
      if (!this.wolfIntroDone && !this.wolfDialogueActive) {
        this.wolfDialogueActive = true;
        this.wolfDialogueIndex = 0;
        this.activeWolfDialogues = wolfIntroDialogues;
        showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && this.hasPeriwinkleExtract()) {
        showOption(this, "Give the wolf the Periwinkle Extract?", {
          imageKey: "wolf",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadePeriwinkleExtractChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingPeriwinkleExtractGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "wolf" });
              }
            }
          ]
        });
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && !this.hasPeriwinkleExtract()) {
        showDialogue(this, "The wolf looks at you expectantly. Maybe you need to find something for them?", { imageKey: "wolf" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Wolf dialogue advance on click ---
    this.input.on("pointerdown", () => {
      if (this.wolfDialogueActive) {
        this.wolfDialogueIndex++;
        if (this.activeWolfDialogues && this.wolfDialogueIndex < this.activeWolfDialogues.length) {
          showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.wolfIntroDone && this.activeWolfDialogues === wolfIntroDialogues) {
            this.wolfIntroDone = true;
          }
          if (this.wolfHasPeriwinkleExtract && this.activeWolfDialogues === wolfThanksDialogues) {
            this.wolfThanksDone = true;
            // Automatically give summer shard after thanks dialogue
            receivedItem(this, "summerShard", "Summer Shard");
            // Always remove periwinkleExtract as a failsafe
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinkleExtract");
          }
          this.wolfDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Mole dialogue advance
      if (this.moleDialogueActive) {
        this.moleDialogueIndex++;
        if (this.activeMoleDialogues && this.moleDialogueIndex < this.activeMoleDialogues.length) {
          showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "mole" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.moleIntroDone && this.activeMoleDialogues === moleIntroDialogues) {
            this.moleIntroDone = true;
          }
          if (this.moleHasGarlicPaste && this.activeMoleDialogues === moleThanksDialogues) {
            this.moleThanksDone = true;
            // Automatically give spring shard after thanks dialogue
            receivedItem(this, "springShard", "Spring Shard");
            // Always remove garlicPaste as a failsafe
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("garlicPaste");
          }
          this.moleDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Turtle dialogue advance
      if (this.turtleDialogueActive) {
        this.turtleDialogueIndex++;
        if (this.activeTurtleDialogues && this.turtleDialogueIndex < this.activeTurtleDialogues.length) {
          showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { imageKey: "turtle" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.turtleIntroDone && this.activeTurtleDialogues === turtleIntroDialogues) {
            this.turtleIntroDone = true;
          }
          if (this.turtleHasMarigold && this.activeTurtleDialogues === turtleThanksDialogues) {
            this.turtleThanksDone = true;
            receivedItem(this, "autumnShard", "Autumn Shard");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
          }
          this.turtleDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Plant dialogue advance
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
      this.updateHUDState && this.updateHUDState();
    });

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    // Save on shutdown/stop
    this.events.on('shutdown', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
    this.events.on('destroy', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });

    // --- LOAD SCENE STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('middleGardenSceneState');
    if (sceneState) {
      this.wolfThanksDone = !!sceneState.wolfThanksDone;
      this.deerHasMarigold = !!sceneState.deerHasMarigold;
      if (sceneState.wolfTexture && this.wolf) this.wolf.setTexture(sceneState.wolfTexture);
      if (sceneState.deerTexture && this.deer) this.deer.setTexture(sceneState.deerTexture);
      if (sceneState.timeOfDay) globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 100, y: 300 }, 
      { x: 120, y: 500 }, 
      { x: 1150, y: 250 }, 
      { x: 1200, y: 550 }  
    ];
    const bushCount = bushPositions.length;
    const jasmineIndex = 0;
    const marigoldIndex = 1;
    const periwinkleIndex = 2;
    this.bushDispensed = this.bushDispensed || Array(bushCount).fill(false);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.textures.exists('bush')
        ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

      bush.on("pointerdown", () => {
        this.sound.play("click");
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState && this.updateHUDState();

        // Marigold bush
        if (i === marigoldIndex && !this.marigoldFound) {
          const marigold = plantData.find(p => p.key === "marigoldPlant");
          if (marigold) {
            this.showPlantMinigame(marigold, "marigoldFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // Jasmine bush
        else if (i === jasmineIndex && !this.jasmineFound) {
          const jasmine = plantData.find(p => p.key === "jasminePlant");
          if (jasmine) {
            this.showPlantMinigame(jasmine, "jasmineFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // Periwinkle bush
        else if (i === periwinkleIndex && !this.periwinkleFound) {
          const periwinkle = plantData.find(p => p.key === "periwinklePlant");
          if (periwinkle) {
            this.showPlantMinigame(periwinkle, "periwinkleFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // All other bushes (no coins)
        else {
          showDialogue(this, `You found nothing in the bush this time.`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          this.bushDispensed[i] = true;
        }
      });
    }
  }

  showPlantMinigame(plant, foundFlag) {
    showOption(
      this,
      `You found a ${plant.name} plant! But a cheeky animal is trying to steal it!`,
      {
        options: [
          {
            label: "Play a game to win it!",
            callback: () => {
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
              this.scene.launch("MiniGameScene", {
                onWin: () => {
                  this.scene.stop("MiniGameScene");
                  this.scene.resume();

                  // Award plant for winning minigame
                  receivedItem(this, plant.key, plant.name);
                  inventoryManager.addItem(plant);
                  addPlantToJournal(plant.key);

                  showDialogue(this,
                    `You won the game! The animal reluctantly gives you the ${plant.name} plant.`,
                    { imageKey: plant.imageKey }
                  );

                  this[foundFlag] = true;
                  this.dialogueActive = true;

                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState && this.updateHUDState();
                    this.dialogueOnComplete = null;
                  };
                }
              });
              this.scene.pause();
            }
          },
          {
            label: "Try again later",
            callback: () => {
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
            }
          }
        ],
        imageKey: plant.imageKey
      }
    );
  }

  showPlantMissing() {
    showDialogue(this, "You found a rare plant, but its data is missing!", {});
    this.dialogueOnComplete = () => {
      this.destroyDialogueUI && this.destroyDialogueUI();
      this.dialogueActive = false;
      this.updateHUDState && this.updateHUDState();
      this.dialogueOnComplete = null;
    };
  }

  update() {
    const rightEdge = this.sys.game.config.width - 60;
    const leftEdge = 50; 

    if (this.mainChar) {
      // Right edge
      if (this.mainChar.x >= rightEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("LoaderScene", {
            nextSceneKey: "ShardGardenScene",
            nextSceneData: {}
          });
        }
      }
      // Left edge
      if (this.mainChar.x <= leftEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("LoaderScene", {
            nextSceneKey: "WallGardenScene",
            nextSceneData: {}
          });
        }
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

  saveSceneState() {
    const state = {
      inventory: inventoryManager.getItems ? inventoryManager.getItems() : [],
      garlicFound: !!this.garlicFound,
      thymeFound: !!this.thymeFound,
      wolfIntroDone: !!this.wolfIntroDone,
      wolfThanksDone: !!this.wolfThanksDone,
      wolfHasPeriwinkle: !!this.wolfHasPeriwinkle,
      deerIntroDone: !!this.deerIntroDone,
      deerThanksDone: !!this.deerThanksDone,
      deerHasMarigold: !!this.deerHasMarigold,
      wolfTexture: this.wolf ? this.wolf.texture.key : null,
      deerTexture: this.deer ? this.deer.texture.key : null,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay()
    };
    saveToLocal('middleGardenSceneState', state);
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
export default MiddleGardenScene;