import Phaser from "phaser";
import { elephantIntroDialogues, elephantThanksDialogues } from "../../characters/elephant";
import { createElephant } from "../../characters/elephant";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";
import { inventoryManager } from "../inventoryManager";

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
        this.load.image("elephant", "/assets/npc/elephant/elephant.png");
        this.load.image("talkIcon", "/assets/interact/talk.png");
        this.load.audio("click", "/assets/sound-effects/click.mp3")
        this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
        this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
        this.load.image('coin', '/assets/misc/coin.png');
        this.load.image("talk", "/assets/interact/talk.png");
        this.load.image("jasminePlant", "/assets/plants/jasmine.png");
        this.load.image("autumnShard", "/assets/items/autumn.png");
    }

    create() {
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

        const elephant = createElephant(this, width / 2 + 200, height / 2 + 100);
        elephant
            .setInteractive({ useHandCursor: true })
            .setDepth(10)
            .setScale(0.1)
            .setOrigin(3, 1);

        // --- Talk icon ---
        const talkIcon = this.add
            .image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(11)
            .setOrigin(0.5);

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

        this.elephantDialogueActive = false;
        this.elephantDialogueIndex = 0;

        this.hasJasmine = () => {
            const inv = window.inventoryManager;
            if (!inv || !inv.getToolbarSlots) return false;
            const slots = inv.getToolbarSlots();
            return slots.some(item => item && item.key === "jasminePlant");
        };

        elephant.on("pointerdown", () => {
            // Debug: log inventory contents and keys
            if (window.inventoryManager && window.inventoryManager.getItems) {
                const items = window.inventoryManager.getItems();
                console.log("Inventory items:", items.map(i => ({ key: i.key, name: i.name })));
            }
            // If intro not done, start intro dialogue
            if (!this.elephantIntroDone && !this.elephantDialogueActive) {
                this.elephantDialogueActive = true;
                this.elephantDialogueIndex = 0;
                this.activeElephantDialogues = elephantIntroDialogues;
                showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
                this.updateHUDState && this.updateHUDState();
                return;
            }
            // If intro done, thanks not done, and has jasmine, move directly to thanks dialogue
            if (this.elephantIntroDone && !this.elephantThanksDone && this.hasJasmine()) {
                // Remove jasmine from global inventory and start thanks dialogue
                window.inventoryManager.removeItemByKey && window.inventoryManager.removeItemByKey("jasminePlant");
                this.elephantHasJasmine = true;
                this.destroyDialogueUI();
                this.updateHUDState && this.updateHUDState();
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
                return;
            }
            // If intro done, thanks not done, and no jasmine
            if (this.elephantIntroDone && !this.elephantThanksDone && !this.hasJasmine()) {
                showDialogue(this, "Tia looks really stressed, maybe something soothing will help...", { imageKey: "elephant" });
                this.time.delayedCall(1800, () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState && this.updateHUDState();
                });
                return;
            }
        });

        this.input.on("pointerdown", () => {
            if (this.elephantDialogueActive) {
                this.elephantDialogueIndex++;
                if (this.activeElephantDialogues && this.elephantDialogueIndex < this.activeElephantDialogues.length) {
                    showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
                } else {
                    this.destroyDialogueUI();
                    this.updateHUDState && this.updateHUDState();
                    if (!this.elephantIntroDone && this.activeElephantDialogues === elephantIntroDialogues) {
                        this.elephantIntroDone = true;
                    }
                    if (this.elephantHasJasmine && this.activeElephantDialogues === elephantThanksDialogues) {
                        this.elephantThanksDone = true;
                        // Give autumn shard after thanks dialogue
                        receivedItem(this, "autumnShard", "Autumn Shard");
                    }
                    this.elephantDialogueActive = false;
                }
                return;
            }
            // Plant/coin dialogue advance
            if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
                this.dialogueOnComplete();
            }
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
        // Save coins and inventory (customize as needed)
        const state = {
            coins: coinManager.get ? coinManager.get() : 0,
            inventory: (window.inventoryManager && window.inventoryManager.getItems) ? window.inventoryManager.getItems() : [],
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
