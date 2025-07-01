import Phaser from "phaser";
import { elephantIntroDialogues, elephantThanksDialogues } from "../../characters/elephant";
import { createElephant } from "../../characters/elephant";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";

const coinManager = CoinManager.load();

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: false } } });
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

            showDialogue(this, elephantIntroDialogues[0]);
            this.currentDialogue = elephantIntroDialogues;
            this.currentDialogueIndex = 0;
            this.dialogueOnComplete = () => {
                showOption(this, "What would you like to say?", {
                    options: [
                        {
                            label: "Of course I will help!",
                            onSelect: () => {
                                coinManager.add(5);
                                showDialogue(this, "Thank you so much! I really need your help. (+5c)");
                                this.currentDialogue = ["Thank you so much! I really need your help. (+5c)"];
                                this.currentDialogueIndex = 0;
                                this.dialogueOnComplete = () => {
                                    this.dialogueActive = false;
                                    this.updateHUDState();
                                };
                            }
                        },
                        {
                            label: "I am not quite ready yet.",
                            onSelect: () => {
                                showDialogue(this, "Okay, come back when you are ready.");
                                this.currentDialogue = ["Okay, come back when you are ready."];
                                this.currentDialogueIndex = 0;
                                this.dialogueOnComplete = () => {
                                    this.dialogueActive = false;
                                    this.updateHUDState();
                                };
                            }
                        }
                    ]
                });
                this.currentDialogue = null;
                this.currentDialogueIndex = 0;
                this.dialogueOnComplete = null;
            };
        });

        // --- Advance dialogue on pointerdown ---
        this.input.on("pointerdown", () => {
            this.sound.play("click", { volume: 0.5 });

            // Always destroy any existing dialogue UI before advancing or showing new dialogue
            destroyDialogueUI(this);

            if (!this.dialogueActive || !this.currentDialogue) return;
            // Don't advance if option box is open
            if (this.dialogueBox && this.dialogueBox.optionButtons) return;

            this.currentDialogueIndex++;
            if (this.currentDialogueIndex < this.currentDialogue.length) {
                showDialogue(this, this.currentDialogue[this.currentDialogueIndex]);
            } else {
                // Dialogue finished, clean up
                this.currentDialogue = null;
                this.currentDialogueIndex = 0;
                if (this.dialogueOnComplete) this.dialogueOnComplete();
            }
        });

        const char = createMainChar(this, width, height, collisionObjects, scaleFactor);

        this.events.on('update', () => {
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

    updateHUDState() {
        if (this.dialogueActive) {
            this.scene.sleep("HUDScene");
        } else {
            this.scene.wake("HUDScene");
        }
    }

}

export default GreenhouseScene;
