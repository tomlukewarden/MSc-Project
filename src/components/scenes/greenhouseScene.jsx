import Phaser from "phaser";
import { elephantIntroDialogues, elephantThanksDialogues } from "../../characters/elephant";
import { createElephant } from "../../characters/elephant";
import { createTextBox } from "../../dialogue/createTextbox";
import { createOptionBox } from "../../dialogue/createOptionBox";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";

const coinManager = CoinManager.load();

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: true } } });
        this.dialogueActive = false;
        this.dialogueBox = null;
    }

    preload() {
        this.load.tilemapTiledJSON("greenhouseMap", "/assets/maps/greenhouseMap.json");
        this.load.image("greenhouseBackground", "/assets/backgrounds/greenhouse/greenhouse.png");
        this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
        this.load.image("elephant", "/assets/npc/elephant/elephant.png");
        this.load.image("talkIcon", "/assets/interact/talk.png");
        this.load.audio("click", "/assets/sound-effects/click.mp3")
    } 

    create() {
        this.scene.stop("OpenJournal");
        this.scene.stop("WeeCairScene");
        this.scene.stop("StartScene");
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        const { width, height } = this.sys.game.config;
        const scaleFactor = 0.175;

        // Add scaled background
        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);

        const map = this.make.tilemap({ key: "greenhouseMap" });
        const collisionObjects = map.getObjectLayer("greenhouse-collisions"); 

        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }

        // Place a smaller elephant in the center
        const elephant = createElephant(this, width / 2, height / 2);
        elephant.setScale(0.09).setOrigin(0.5, 0.5);

        // --- TALK ICON ---
        const talkIcon = this.add
            .image(0, 0, "talkIcon")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(20)
            .setOrigin(0.5);

        elephant.on("pointerover", (pointer) => {
            if (!this.dialogueActive) {
                talkIcon.setVisible(true);
                talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
            }
        });
        elephant.on("pointermove", (pointer) => {
            if (!this.dialogueActive) {
                talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
            }
        });
        elephant.on("pointerout", () => {
            talkIcon.setVisible(false);
        });

        // --- Dialogue logic ---
        elephant.on("pointerdown", () => {
            if (this.dialogueActive) return;
            this.dialogueActive = true;
            this.updateHUDState();
            talkIcon.setVisible(false);

            this.startDialogue(elephantIntroDialogues, () => {
                this.showOption(
                    "What would you like to say?",
                    [
                        {
                            label: "Of course I will help!",
                            onSelect: () => {
                                coinManager.add(5); // Award 5 coins for helping
                                saveToLocal("coins", coinManager.coins); // Save to local storage
                                this.startDialogue(
                                    ["Thank you so much! I really need your help. (+5c)"],
                                    () => { this.dialogueActive = false; this.updateHUDState(); }
                                );
                            }
                        },
                        {
                            label: "I am not quite ready yet.",
                            onSelect: () => {
                                this.startDialogue(
                                    ["Okay, come back when you are ready."],
                                    () => { this.dialogueActive = false; this.updateHUDState(); }
                                );
                            }
                        }
                    ]
                );
            });
        });

        // --- Advance dialogue on pointerdown ---
        this.input.on("pointerdown", () => {
            if (!this.dialogueActive || !this.currentDialogue) return;
            // Don't advance if option box is open
            if (this.dialogueBox && this.dialogueBox.optionButtons) return;

            this.currentDialogueIndex++;
            if (this.currentDialogueIndex < this.currentDialogue.length) {
                this.showDialogueLine(this.currentDialogue[this.currentDialogueIndex]);
            } else {
                // End of dialogue
                this.destroyDialogueUI();
                this.currentDialogue = null;
                this.currentDialogueIndex = 0;
                if (this.dialogueOnComplete) this.dialogueOnComplete();
            }
        });

        const char = createMainChar(this, width, height, collisionObjects, scaleFactor);

        this.events.on('update', () => {
            // FAR LEFT: trigger when player's left edge is near 0
            if (char.x - char.displayWidth / 2 < 5) { 
                this.exitToNextScene();
            }
        });
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

    // --- Dialogue helpers ---

    startDialogue(dialogueArray, onComplete) {
        this.dialogueActive = true;
        this.updateHUDState();
        this.currentDialogue = dialogueArray;
        this.currentDialogueIndex = 0;
        this.dialogueOnComplete = onComplete;
        this.showDialogueLine(this.currentDialogue[0]);
    }

    showDialogueLine(text) {
        this.destroyDialogueUI();
        const { width, height } = this.sys.game.config;
        const boxWidth = Math.min(600, width * 0.8);
        const boxHeight = Math.min(180, height * 0.25);

        this.dialogueBox = createTextBox(this, text, {
            boxWidth,
            boxHeight,
            x: width / 2,
            y: height - boxHeight / 2 - 30
        });
    }

    showOption(prompt, options) {
        this.dialogueActive = true;
        this.updateHUDState();
        this.destroyDialogueUI();
        const { width, height } = this.sys.game.config;
        const boxWidth = Math.min(600, width * 0.8);
        const boxHeight = Math.min(220, height * 0.3);

        this.dialogueBox = createOptionBox(this, prompt, {
            options,
            boxWidth,
            boxHeight,
            x: width / 2,
            y: height - boxHeight / 2 - 30
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
