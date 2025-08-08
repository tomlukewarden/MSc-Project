import Phaser from "phaser";
import { createRabbit, rabbitIntroDialogues, rabbitThanksDialogues } from "../../characters/rabbit";
import { createPig, pigIntroDialogues, pigThanksDialogues } from "../../characters/pig";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";
import { inventoryManager } from "../inventoryManager";
import { receivedItem } from "../recievedItem";
import globalTimeManager from "../../day/timeManager";

// Ensure global inventoryManager instance
if (typeof window !== "undefined") {
  if (!window.inventoryManager) {
    window.inventoryManager = inventoryManager;
  }
}

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: false } } });
        this.dialogueActive = false;
        this.dialogueBox = null;
    }

    preload() {
        this.load.image("greenhouseBackground", "/assets/backgrounds/greenhouse/greenhouse.png");
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
        this.load.audio("click", "/assets/sound-effects/click.mp3")
        this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
        this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
        this.load.image("autumnShard", "/assets/items/autumn.png");
        this.load.image('rabbit', '/assets/npc/rabbit/rabbit.png');
        this.load.image('rabbitHappy', '/assets/npc/rabbit/happy.png');
        this.load.image("pig", "/assets/npc/pig/pig.png");
        this.load.image("pigHappy", "/assets/npc/pig/happy.png");
    }

    create() {
        this.transitioning = false;
        globalTimeManager.init(this);
        if (!globalTimeManager.startTimestamp) {
            globalTimeManager.start();
        }
        // --- LOAD STATE FROM LOCAL STORAGE ---
        const sceneState = loadFromLocal('greenhouseSceneState') || {};
        // Restore inventory
        if (sceneState.inventory) {
            if (window.inventoryManager && window.inventoryManager.setItems) {
                window.inventoryManager.setItems(sceneState.inventory);
            }
        }
        // Restore time of day
        if (sceneState.timeOfDay) {
            globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
        }
        this.scene.stop("OpenJournal");
        this.scene.stop("WeeCairScene");
        this.scene.stop("StartScene");
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        const { width, height } = this.sys.game.config;
        const scaleFactor = 0.175;

        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);

        // --- Talk icon ---
        const talkIcon = this.add
            .image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(11)
            .setOrigin(0.5);

        // --- Collision objects (example: invisible wall at left edge) ---
        const collisionGroup = this.physics.add.staticGroup();
        const leftWall = this.add.rectangle(0, height / 2, 10, height, 0x000000, 0);
        this.physics.add.existing(leftWall, true);
        collisionGroup.add(leftWall);

        // Spawn player at center to avoid immediate right edge transition
        this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);

        // --- Rabbit NPC ---
        this.rabbit = createRabbit(this, width / 2 + 200, height / 2 + 100);
        this.rabbit
          .setInteractive({ useHandCursor: true })
          .setDepth(10)
          .setScale(0.1)
          .setOrigin(0.2, 3.2);

        // --- Pig NPC ---
        this.pig = createPig(this, width / 2 - 200, height / 2 + 100);
        this.pig
          .setInteractive({ useHandCursor: true })
          .setDepth(1)
          .setScale(0.12)
          .setOrigin(2, 1.7);

        // --- Talk icon events ---
        this.rabbit.on("pointerover", (pointer) => {
          talkIcon.setVisible(true);
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.rabbit.on("pointermove", (pointer) => {
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.rabbit.on("pointerout", () => {
          talkIcon.setVisible(false);
        });

        this.pig.on("pointerover", (pointer) => {
          talkIcon.setVisible(true);
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.pig.on("pointermove", (pointer) => {
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.pig.on("pointerout", () => {
          talkIcon.setVisible(false);
        });

        // --- Rabbit dialogue and gifting logic ---
        this.rabbitDialogueActive = false;
        this.rabbitDialogueIndex = 0;
        this.hasPeriwinkle = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("periwinklePlant");

        // --- Pig dialogue and gifting logic ---
        this.pigDialogueActive = false;
        this.pigDialogueIndex = 0;
        this.hasMarigold = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("marigoldPlant");

        // Listen for periwinkle and marigold handover events from inventory
        this.events.on("periwinkleGiven", () => {
          this.awaitingPeriwinkleGive = false;
          inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
          if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("periwinklePlant")) {
            showDialogue(this, "You hand the rabbit the Periwinkle...", { imageKey: "rabbit" });
            this.rabbit.setTexture && this.rabbit.setTexture("rabbitHappy");
            this.time.delayedCall(800, () => {
              this.rabbitDialogueActive = true;
              this.rabbitDialogueIndex = 0;
              this.activeRabbitDialogues = rabbitThanksDialogues;
              showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
              this.updateHUDState && this.updateHUDState();
            });
            this.rabbitHasPeriwinkle = true;
          } else {
            showDialogue(this, "You still have the Periwinkle.", { imageKey: "rabbit" });
          }
        });
        this.events.on("marigoldGiven", () => {
          this.awaitingMarigoldGive = false;
          inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
          if (!inventoryManager.hasItemByKey || !inventoryManager.hasItemByKey("marigoldPlant")) {
            showDialogue(this, "You hand the pig the Marigold...", { imageKey: "pig" });
            this.pig.setTexture && this.pig.setTexture("pigHappy");
            this.time.delayedCall(800, () => {
              this.pigDialogueActive = true;
              this.pigDialogueIndex = 0;
              this.activePigDialogues = pigThanksDialogues;
              showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pig" });
              this.updateHUDState && this.updateHUDState();
            });
            this.pigHasMarigold = true;
          } else {
            showDialogue(this, "You still have the Marigold.", { imageKey: "pig" });
          }
        });

        // Rabbit click handler
        this.rabbit.on("pointerdown", () => {
          if (!this.rabbitIntroDone && !this.rabbitDialogueActive) {
            this.rabbitDialogueActive = true;
            this.rabbitDialogueIndex = 0;
            this.activeRabbitDialogues = rabbitIntroDialogues;
            showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
            this.updateHUDState && this.updateHUDState();
            return;
          }
          if (this.rabbitIntroDone && !this.rabbitThanksDone && this.hasPeriwinkle()) {
            showOption(this, "Give the rabbit the Periwinkle?", {
              imageKey: "rabbit",
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
                    showDialogue(this, "You decide to hold off for now.", { imageKey: "rabbit" });
                  }
                }
              ]
            });
            return;
          }
          if (this.rabbitIntroDone && !this.rabbitThanksDone && !this.hasPeriwinkle()) {
            showDialogue(this, "The rabbit looks at you expectantly. Maybe you need to find something for them?", { imageKey: "rabbit" });
            this.time.delayedCall(1800, () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
            });
            return;
          }
        });
        // Pig click handler
        this.pig.on("pointerdown", () => {
          if (!this.pigIntroDone && !this.pigDialogueActive) {
            this.pigDialogueActive = true;
            this.pigDialogueIndex = 0;
            this.activePigDialogues = pigIntroDialogues;
            showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pig" });
            this.updateHUDState && this.updateHUDState();
            return;
          }
          if (this.pigIntroDone && !this.pigThanksDone && this.hasMarigold()) {
            showOption(this, "Give the pig the Marigold?", {
              imageKey: "pig",
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
                    showDialogue(this, "You decide to hold off for now.", { imageKey: "pig" });
                  }
                }
              ]
            });
            return;
          }
          if (this.pigIntroDone && !this.pigThanksDone && !this.hasMarigold()) {
            showDialogue(this, "The pig looks at you expectantly. Maybe you need to find something for them...", { imageKey: "pig" });
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
          // Rabbit dialogue advance
          if (this.rabbitDialogueActive) {
            this.rabbitDialogueIndex++;
            if (this.activeRabbitDialogues && this.rabbitDialogueIndex < this.activeRabbitDialogues.length) {
              showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
            } else {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();

              if (!this.rabbitIntroDone && this.activeRabbitDialogues === rabbitIntroDialogues) {
                this.rabbitIntroDone = true;
              }
              if (this.rabbitHasPeriwinkle && this.activeRabbitDialogues === rabbitThanksDialogues) {
                this.rabbitThanksDone = true;
                // Automatically give autumn shard after thanks dialogue
                receivedItem(this, "autumnShard", "Autumn Shard");
                // Always remove periwinkle as a failsafe
                inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
              }
              this.rabbitDialogueActive = false;
              this.updateHUDState && this.updateHUDState();
            }
            return;
          }
          // Pig dialogue advance
          if (this.pigDialogueActive) {
            this.pigDialogueIndex++;
            if (this.activePigDialogues && this.pigDialogueIndex < this.activePigDialogues.length) {
              showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pig" });
            } else {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              
              if (!this.pigIntroDone && this.activePigDialogues === pigIntroDialogues) {
                this.pigIntroDone = true;
              }
              if (this.pigHasMarigold && this.activePigDialogues === pigThanksDialogues) {
                this.pigThanksDone = true;
                // Automatically give winter shard after thanks dialogue
                receivedItem(this, "winterShard", "Winter Shard");
              }
              this.pigDialogueActive = false;
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
          this.pigThanksDone = !!sceneState.pigThanksDone;
          this.rabbitHasPeriwinkle = !!sceneState.rabbitHasPeriwinkle;
          if (sceneState.rabbitTexture && this.rabbit) this.rabbit.setTexture(sceneState.rabbitTexture);
          if (sceneState.pigTexture && this.pig) this.pig.setTexture(sceneState.pigTexture);
          if (sceneState.timeOfDay) globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
        }
    }

    // Save relevant state to localStorage
    saveSceneState() {
        // Save inventory and time of day only
        const state = {
            inventory: (window.inventoryManager && window.inventoryManager.getItems) ? window.inventoryManager.getItems() : [],
            timeOfDay: globalTimeManager.getCurrentTimeOfDay()
        };
        saveToLocal('greenhouseSceneState', state);
    }

    updateHUDState() {
        if (this.dialogueActive) {
            this.scene.sleep("HUDScene");
        } else {
            this.scene.wake("HUDScene");
        }
    }

    update() {
        if (this.mainChar) {
            const charRight = this.mainChar.x + this.mainChar.displayWidth * (1 - this.mainChar.originX);
            const sceneWidth = this.sys.game.config.width;

            // Only right edge transition (with buffer)
            if (charRight >= sceneWidth - 5 && !this.transitioning) {
                this.transitioning = true;
                this.scene.start("LoaderScene", {
                    nextSceneKey: "WallGardenScene",
                    nextSceneData: {}
                });
            }
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

export default GreenhouseScene;