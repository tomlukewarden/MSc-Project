import Phaser from "phaser";
import { elephantIntroDialogues, elephantThanksDialogues } from "../../characters/elephant";
import { createElephant } from "../../characters/elephant";
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
}

export default GreenhouseScene;
