import Phaser from "phaser";
import { elephantIntroDialogues, elephantThanksDialogues } from "../../characters/elephant";
import { createElephant } from "../../characters/elephant";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";
import { inventoryManager } from "../inventoryManager";
import { receivedItem } from "../recievedItem";
import globalTimeManager from "../../day/timeManager";

const coinManager = CoinManager.load();

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
        this.load.image("elephant", "/assets/npc/elephant/elephant.PNG");
        this.load.image("talkIcon", "/assets/interact/talk.PNG");
        this.load.audio("click", "/assets/sound-effects/click.mp3")
        this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
        this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
        this.load.image('coin', '/assets/misc/coin.png');
        this.load.image("talk", "/assets/interact/talk.png");
        this.load.image("jasminePlant", "/assets/plants/jasmine.png");
        this.load.image("autumnShard", "/assets/items/autumn.png");
    }

    create() {
        globalTimeManager.init(this);
        if (!globalTimeManager.startTimestamp) {
            globalTimeManager.start();
        }
        // --- LOAD STATE FROM LOCAL STORAGE ---
        const sceneState = loadFromLocal('greenhouseSceneState') || {};
        // Restore coins if present
        if (sceneState.coins !== undefined) {
            coinManager.set(sceneState.coins);
        }
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

      
        if (typeof window !== "undefined") {
            if (!window.inventoryManager) {
                window.inventoryManager = inventoryManager;
            }
        }


        // --- Elephant NPC ---
        const elephant = createElephant(this, width / 2 + 200, height / 2 + 100);
        elephant
            .setInteractive({ useHandCursor: true })
            .setDepth(10)
            .setScale(0.1)
            .setOrigin(0.5, 0.9);

        // --- Talk icon ---
        const talkIcon = this.add
            .image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(11)
            .setOrigin(0.5);

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
                showOption(this, "Give the elephant the Jasmine?", {
                    imageKey: "elephant",
                    options: [
                        {
                            label: "Yes",
                            onSelect: () => {
                                this.destroyDialogueUI();
                                this.updateHUDState && this.updateHUDState();
                                inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("jasminePlant");
                                this.elephantHasJasmine = true;
                                elephant.setTexture && elephant.setTexture("elephantHappy");
                                showDialogue(this, "You hand the elephant the Jasmine...", { imageKey: "elephant" });
                                this.time.delayedCall(800, () => {
                                    this.destroyDialogueUI();
                                    this.updateHUDState && this.updateHUDState();
                                    this.elephantDialogueActive = true;
                                    this.elephantDialogueIndex = 0;
                                    this.activeElephantDialogues = elephantThanksDialogues;
                                    showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
                                    this.updateHUDState && this.updateHUDState();
                                });
                            }
                        },
                        {
                            label: "No",
                            onSelect: () => {
                                this.destroyDialogueUI();
                                this.updateHUDState && this.updateHUDState();
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




        // --- Collision objects (example: invisible wall at left edge) ---
        const collisionGroup = this.physics.add.staticGroup();
        const leftWall = this.add.rectangle(0, height / 2, 10, height, 0x000000, 0);
        this.physics.add.existing(leftWall, true);
        collisionGroup.add(leftWall);

        const char = createMainChar(this, width, height, scaleFactor, collisionGroup);

        this.events.on('update', () => {
            if (char.x - char.displayWidth / 2 < 5) {
                this.exitToNextScene();
            }
        });

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
        // Save coins, inventory, and time of day
        const state = {
            coins: coinManager.get ? coinManager.get() : 0,
            inventory: (window.inventoryManager && window.inventoryManager.getItems) ? window.inventoryManager.getItems() : [],
            timeOfDay: globalTimeManager.getCurrentTimeOfDay()
        };
        saveToLocal('greenhouseSceneState', state);
    }

    // Add this method to your class:
    exitToNextScene() {
        // Prevent multiple triggers
        if (this.exiting) return;
        this.exiting = true;
        this.cameras.main.fadeOut(600, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start("WeeCairScene");
            this.scene.get("WeeCairScene")?.cameras?.main?.fadeIn?.(600, 0, 0, 0);
        });
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

export default GreenhouseScene;
