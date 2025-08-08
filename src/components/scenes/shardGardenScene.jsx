import { createButterfly, butterflyPillarDialogues, butterflyShardDialogues, butterflyGoodbyeDialogues } from "../../characters/butterfly";
import { createMainChar } from "../../characters/mainChar";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import plantData from "../../plantData";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import {shardLogic} from "../shardLogic";
import { inventoryManager } from "../openInventory";
// Ensure global inventoryManager instance
import { inventoryManager as globalInventoryManager } from "../inventoryManager";
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = globalInventoryManager;
  }
}
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { createMole, moleIntroDialogues, moleThanksDialogues } from "../../characters/mole";
import { createTurtle, turtleIntroDialogues, turtleThanksDialogues } from "../../characters/turtle";
import globalTimeManager from "../../day/timeManager";

class ShardGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShardGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.dialogueActive = false;
    this.dialogueBox = null;
    this.dialogueStage = 0;
    this.activeDialogue = [];
    this.activeDialogueIndex = 0;
    this.shardCounts = {
      spring: 1,
      summer: 1,
      autumn: 1,
      winter: 1
    };
    this.happySprites = {
      spring: false,
      summer: false,
      autumn: false,
      winter: false
    };
    this.winDialogueActive = false;
  }

  preload() {
    this.load.image('shardBackground', '/assets/backgrounds/shardGarden/shardBackground.png');
    this.load.image('folliage', '/assets/backgrounds/shardGarden/folliage.png');
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
    this.load.image("elephant", "/assets/npc/elephant/elephant.png");
    this.load.image('spring', '/assets/backgrounds/shardGarden/spring/sad.png');
    this.load.image('springHappy', '/assets/backgrounds/shardGarden/spring/happy.png');
    this.load.image('summer', '/assets/backgrounds/shardGarden/summer/sad.png');
    this.load.image('summerHappy', '/assets/backgrounds/shardGarden/summer/happy.png');
    this.load.image('autumnHappy', '/assets/backgrounds/shardGarden/autumn/happy.png');
    this.load.image('winterHappy', '/assets/backgrounds/shardGarden/winter/happy.png');
    this.load.image('autumn', '/assets/backgrounds/shardGarden/autumn/sad.png');
    this.load.image('winter', '/assets/backgrounds/shardGarden/winter/sad.png');
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
    this.load.image('butterflySad', '/assets/npc/butterfly/sad-butterfly-dio.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('talk', '/assets/interact/talk.png');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('mole', '/assets/npc/mole/mole.png');
    this.load.image('moleHappy', '/assets/npc/mole/happy.png');
    this.load.image('turtle', '/assets/npc/turtle/turtle.png');
    this.load.image('turtleHappy', '/assets/npc/turtle/happy.png');
  }

  create() {
    // DEBUG: Show all loaded texture keys and highlight missing ones
    const debugY = 30;
    const loadedKeys = this.textures.getTextureKeys();
    const expectedKeys = [
      'shardBackground', 'folliage', 'butterfly', 'defaultFront', 'defaultBack', 'defaultLeft', 'defaultRight',
      'defaultFrontWalk1', 'defaultFrontWalk2', 'defaultBackWalk1', 'defaultBackWalk2', 'defaultLeftWalk1', 'defaultLeftWalk2',
      'defaultRightWalk1', 'defaultRightWalk2', 'elephant', 'spring', 'springHappy', 'summer', 'summerHappy',
      'autumnHappy', 'winterHappy', 'autumn', 'winter', 'butterflyHappy', 'butterflySad', 'periwinklePlant',
      'marigoldPlant', 'dialogueBoxBg', 'talk', 'jasminePlant', 'bush'
    ];
    let missingKeys = expectedKeys.filter(k => !loadedKeys.includes(k));
    let debugText = `Loaded textures: ${loadedKeys.join(', ')}\nMissing: ${missingKeys.join(', ')}`;
    this.add.text(20, debugY, debugText, { fontSize: '14px', color: missingKeys.length ? '#f00' : '#080', backgroundColor: '#fff', wordWrap: { width: 800 } }).setDepth(-1);
    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }
    if (typeof window !== "undefined") {
      window.inventoryManager = inventoryManager;
    }
    this.scene.launch("HUDScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('shardGardenSceneState') || {};
    // Restore shard counts, happySprites, and dialogue stage
    if (sceneState.shardCounts) {
      this.shardCounts = { ...this.shardCounts, ...sceneState.shardCounts };
    }
    if (sceneState.happySprites) {
      this.happySprites = { ...this.happySprites, ...sceneState.happySprites };
    }
    if (sceneState.dialogueStage !== undefined) {
      this.dialogueStage = sceneState.dialogueStage;
    }
    this.dialogueActive = !!sceneState.dialogueActive;
    this.activeDialogueIndex = sceneState.activeDialogueIndex || 0;
    // Restore time of day
    if (sceneState.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }

    // Asset existence check helper
    const safeAddImage = (scene, x, y, key, ...args) => {
      if (!scene.textures.exists(key)) {
        console.warn(`Image asset missing: ${key}`);
      }
      return scene.add.image(x, y, key, ...args);
    };
    safeAddImage(this, width / 2, height / 2, "shardBackground").setScale(scaleFactor);
    const foliageImg = safeAddImage(this, width / 2, height / 2, "folliage").setScale(scaleFactor);

    const collisionGroup = this.physics.add.staticGroup();

    const foliageRect = this.add.rectangle(
      width / 2,
      height / 2,
      foliageImg.width * scaleFactor,
      foliageImg.height * scaleFactor,
      0x00ff00,
      0.2
    ).setDepth(1);
    this.physics.add.existing(foliageRect, true);
    collisionGroup.add(foliageRect);

    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonScale = 0.09;
    const spacing = 800 * scaleFactor;
    const startX = width / 2 - ((seasons.length - 1) * spacing) / 2;
    const y = height * scaleFactor + 100;

    seasons.forEach((season, i) => {
      let seasonImg;
      if (this.textures.exists(season)) {
        seasonImg = this.add.image(startX + i * spacing, y, season)
          .setScale(seasonScale)
          .setDepth(10)
          .setInteractive({ useHandCursor: true });
      } else {
        console.warn(`Image asset missing: ${season}`);
        seasonImg = this.add.text(startX + i * spacing, y, `Missing: ${season}`, { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);
      }
      this[season + 'ShardSprite'] = seasonImg;

      if (seasonImg.setInteractive) {
        seasonImg.on("pointerover", () => seasonImg.setTint && seasonImg.setTint(0x88ccff));
        seasonImg.on("pointerout", () => seasonImg.clearTint && seasonImg.clearTint());
        seasonImg.on("pointerup", () => {
          const shardKey = season + "Shard";
          const hasShard = inventoryManager.hasItemByKey && inventoryManager.hasItemByKey(shardKey);
          if (hasShard) {
            if (this.shardCounts[season] > 0) {
              this.shardCounts[season]--;
              inventoryManager.removeItemByKey && inventoryManager.removeItemByKey(shardKey);
              showDialogue(this, `You returned a ${season} shard! (${this.shardCounts[season]} left)`);
              shardLogic(this);
            } else {
              showDialogue(this, `No ${season} shards left to return!`);
            }
          } else {
            showDialogue(this, `You don't have a ${season} shard in your inventory.`,  { imageKey: {shardKey} });
          }
          this.updateHUDState();
        });
      }
    });

    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(0.5, 0.5);
    const butterfly = createButterfly(this, width / 2, height / 2);
    butterfly.setScale(0.09).setOrigin(-2, 0.3).setDepth(20).setInteractive();

    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(110)
      .setOrigin(0.5);

    // --- Mole NPC ---
    this.mole = createMole(this, width / 2 + 200, height / 2 + 100);
    this.mole
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.15)
      .setOrigin(0.5, 0.9);

    // --- Turtle NPC ---
    this.turtle = createTurtle(this, width / 2 - 200, height / 2 + 100);
    this.turtle
      .setInteractive({ useHandCursor: true })
      .setDepth(1)
      .setScale(0.15)
      .setOrigin(0.5, 0.2);

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
    this.hasPeriwinkle = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("periwinklePlant");

    // --- Turtle dialogue and gifting logic ---
    this.turtleDialogueActive = false;
    this.turtleDialogueIndex = 0;
    this.hasMarigold = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("marigoldPlant");

    // Listen for periwinkle and marigold handover events from inventory
    this.events.on("periwinkleGiven", () => {
      this.awaitingPeriwinkleGive = false;
      inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
      if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("periwinklePlant")) {
        showDialogue(this, "You hand the mole the Periwinkle...", { imageKey: "mole" });
        this.mole.setTexture && this.mole.setTexture("moleHappy");
        this.time.delayedCall(800, () => {
          this.moleDialogueActive = true;
          this.moleDialogueIndex = 0;
          this.activeMoleDialogues = moleThanksDialogues;
          showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "mole" });
          this.updateHUDState && this.updateHUDState();
        });
        this.moleHasPeriwinkle = true;
      } else {
        showDialogue(this, "You still have the Periwinkle.", { imageKey: "mole" });
      }
    });
    this.events.on("marigoldGiven", () => {
      this.awaitingMarigoldGive = false;
      inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
      if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("marigoldPlant")) {
        showDialogue(this, "You hand the turtle the Marigold...", { imageKey: "turtle" });
        this.turtle.setTexture && this.turtle.setTexture("turtleHappy");
        this.time.delayedCall(800, () => {
          this.turtleDialogueActive = true;
          this.turtleDialogueIndex = 0;
          this.activeTurtleDialogues = turtleThanksDialogues;
          showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { imageKey: "turtle" });
          this.updateHUDState && this.updateHUDState();
        });
        this.turtleHasMarigold = true;
      } else {
        showDialogue(this, "You still have the Marigold.", { imageKey: "turtle" });
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
      if (this.moleIntroDone && !this.moleThanksDone && this.hasPeriwinkle()) {
        showOption(this, "Give the mole the Periwinkle?", {
          imageKey: "mole",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadePeriwinkleChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingPeriwinkleGive = true;
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
      if (this.moleIntroDone && !this.moleThanksDone && !this.hasPeriwinkle()) {
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
      if (this.turtleIntroDone && !this.turtleThanksDone && this.hasMarigold()) {
        showOption(this, "Give the turtle the Marigold?", {
          imageKey: "turtle",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeMarigoldChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingMarigoldGive = true;
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
      if (this.turtleIntroDone && !this.turtleThanksDone && !this.hasMarigold()) {
        showDialogue(this, "The turtle looks at you expectantly. Maybe you need to find something for them...", { imageKey: "turtle" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Bushes/Flowerbeds logic ---
    this.setupBushes(width, height);

    // --- Dialogue advance on click ---
    this.input.on("pointerdown", () => {
      this.sound.play("click");
      // Wolf dialogue advance
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
          if (this.wolfHasPeriwinkle && this.activeWolfDialogues === wolfThanksDialogues) {
            this.wolfThanksDone = true;
            // Automatically give summer shard after thanks dialogue
            receivedItem(this, "summerShard", "Summer Shard");
            // Always remove periwinkle as a failsafe
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
          }
          this.wolfDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Deer dialogue advance
      if (this.deerDialogueActive) {
        this.deerDialogueIndex++;
        if (this.activeDeerDialogues && this.deerDialogueIndex < this.activeDeerDialogues.length) {
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          
          if (!this.deerIntroDone && this.activeDeerDialogues === deerIntroDialogues) {
            this.deerIntroDone = true;
          }
          if (this.deerHasMarigold && this.activeDeerDialogues === deerThanksDialogues) {
            this.deerThanksDone = true;
            // Automatically give winter shard after thanks dialogue
            receivedItem(this, "winterShard", "Winter Shard");
          }
          this.deerDialogueActive = false;
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
          if (this.moleHasPeriwinkle && this.activeMoleDialogues === moleThanksDialogues) {
            this.moleThanksDone = true;
            // Automatically give summer shard after thanks dialogue
            receivedItem(this, "summerShard", "Summer Shard");
            // Always remove periwinkle as a failsafe
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
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
            // Automatically give winter shard after thanks dialogue
            receivedItem(this, "winterShard", "Winter Shard");
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
      // Always update HUD after any dialogue completes
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

    if (sceneState) {
      this.wolfThanksDone = !!sceneState.wolfThanksDone;
      this.deerHasMarigold = !!sceneState.deerHasMarigold;
      if (sceneState.wolfTexture && this.wolf) this.wolf.setTexture(sceneState.wolfTexture);
      if (sceneState.deerTexture && this.deer) this.deer.setTexture(sceneState.deerTexture);
      if (sceneState.timeOfDay) globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }
  

    // --- Talk icon hover logic ---
    butterfly.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    butterfly.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    butterfly.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    this.setActiveDialogue();

    butterfly.on("pointerdown", () => {
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.activeDialogueIndex = 0;
      showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey: "butterflySad" });
      this.updateHUDState();
    });

    // Play click sound on any pointerdown
    this.input.on("pointerdown", (pointer, currentlyOver) => {
      this.sound.play("click");
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
      if (!this.dialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;
      this.activeDialogueIndex++;
      if (this.activeDialogueIndex < this.activeDialogue.length) {
        showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey: "butterflySad" });
      } else {
        // Dialogue finished, ask if player wants to move on
        this.dialogueActive = false;
        this.updateHUDState();
        this.destroyDialogueUI();
        if (this.dialogueStage < 2) {
          this.dialogueStage++;
          this.setActiveDialogue();
        } else {
          // Show move on question
          this.showMoveOnQuestion();
        }
      }
    });

    // Add move on question method
    this.showMoveOnQuestion = () => {
      showOption(this, "Would you like to move on?", {
        imageKey: "butterfly",
        options: [
          {
            text: "Yes",
            callback: () => {
              this.destroyDialogueUI();
              this.scene.start("PersonalGarden");
            }
          },
          {
            text: "No",
            callback: () => {
              this.dialogueOnComplete = () => {
                this.destroyDialogueUI();
                this.dialogueActive = false;
                this.updateHUDState();
                this.dialogueOnComplete = null;
              };
              // Ensure HUD reappears immediately
              this.dialogueActive = false;
              this.updateHUDState();
            }
          }
        ]
      });
    };

    // Add bushes with garlic and thyme only (removed coins)
    this.setupBushes(width, height);

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    // Save on shutdown/stop
    this.events.on('shutdown', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
    });
    this.events.on('destroy', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
    });
  }

  // Save relevant state to localStorage
  saveSceneState() {
    const state = {
      shardCounts: { ...this.shardCounts },
      happySprites: { ...this.happySprites },
      dialogueStage: this.dialogueStage,
      dialogueActive: !!this.dialogueActive,
      activeDialogueIndex: this.activeDialogueIndex,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay()
    };
    saveToLocal('shardGardenSceneState', state);
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 50;

    if (this.mainChar && this.mainChar.x <= leftEdge && !this.transitioning) {
      this.transitioning = true;
      this.scene.start("MiddleGardenScene");
    }
  }

  setActiveDialogue() {
    if (this.dialogueStage === 0) {
      this.activeDialogue = butterflyPillarDialogues;
    } else if (this.dialogueStage === 1) {
      this.activeDialogue = butterflyShardDialogues;
    } else {
      this.activeDialogue = butterflyGoodbyeDialogues;
    }
    this.activeDialogueIndex = 0;
  }

  updateHUDState() {
    this.scene[this.dialogueActive ? 'sleep' : 'wake']("HUDScene");
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      this.dialogueBox.optionButtons?.forEach((btn) => btn.destroy());
      this.dialogueBox = null;
    }
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 300 }, // Garlic
      { x: 260, y: 400 }, // Thyme
    ];
    const bushCount = bushPositions.length;
    const garlicIndex = 0;
    const thymeIndex = 1;
    // Track dispensed state for each bush
    this.bushDispensed = this.bushDispensed || Array(bushCount).fill(false);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      // Asset existence check for bush
      const bush = this.textures.exists('bush')
        ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

      bush.on("pointerdown", () => {
        this.sound.play("click");
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState && this.updateHUDState();

        // If already dispensed, show empty dialogue
        if (this.bushDispensed[i]) {
          showDialogue(this, "This bush is empty!");
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          return;
        }

        if (i === garlicIndex && !this.garlicFound) {
          const garlic = plantData.find(p => p.key === "garlicPlant");
          if (garlic) {
            this.showPlantMinigame(garlic, "garlicFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        else if (i === thymeIndex && !this.thymeFound) {
          const thyme = plantData.find(p => p.key === "thymePlant");
          if (thyme) {
            this.showPlantMinigame(thyme, "thymeFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
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

                  const alreadyHas = inventoryManager.hasItemByKey && inventoryManager.hasItemByKey(plant.key);
                  if (!alreadyHas) {
                    addPlantToJournal(plant.key);
                    receivedItem(this, plant.key, plant.name);
                  }

                  showDialogue(this,
                    alreadyHas
                      ? `You already have the ${plant.name} plant.`
                      : `You won the game! The animal reluctantly gives you the ${plant.name} plant.`,
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

}

export default ShardGardenScene;
