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
  
        this.load.image("greenhouseBackground", "/assets/backgrounds/greenhouse/greenhouse.png");
        this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
        this.load.image("elephant", "/assets/npc/elephant/elephant.png");
        this.load.image("talkIcon", "/assets/interact/talk.png");
        this.load.audio("click", "/assets/sound-effects/click.mp3")
        this.load.audio("theme1", "/assets/music/main-theme1.mp3");
        this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
        this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    }

    create() {
        this.scene.stop("OpenJournal");
        this.scene.stop("WeeCairScene");
        this.scene.stop("StartScene");
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        const { width, height } = this.sys.game.config;
        const scaleFactor = 0.175;

        // --- LOAD STATE FROM LOCAL STORAGE ---
        const sceneState = loadFromLocal('greenhouseSceneState') || {};

        if (sceneState.coins !== undefined) {
            coinManager.set(sceneState.coins);
        }
        
        if (sceneState.inventory && Array.isArray(sceneState.inventory) && window.inventoryManager) {
            window.inventoryManager.clear();
            sceneState.inventory.forEach(item => window.inventoryManager.addItem(item));
        }
        

        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);

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

            // 1. Start with elephantIntroDialogues
            this.currentDialogue = elephantIntroDialogues;
            this.currentDialogueIndex = 0;

            const showNextIntro = () => {
                showDialogue(this, this.currentDialogue[this.currentDialogueIndex]);
                this.dialogueOnComplete = () => {
                    this.currentDialogueIndex++;
                    if (this.currentDialogueIndex < this.currentDialogue.length) {
                        showNextIntro();
                    } else {
                        // 2. Option for helping
                        showOption(this, "What would you like to say?", {
                            options: [
                                {
                                    label: "Of course I will help!",
                                    onSelect: () => {
                                        coinManager.add(5);
                                        // 3. If inventory contains jasmine, offer to give it
                                        if (this.inventory && this.inventory.includes("jasmine")) {
                                            showOption(this, "Will you give the jasmine to the elephant?", [
                                                {
                                                    text: "Yes",
                                                    callback: () => {
                                                        // Remove jasmine from inventory
                                                        this.inventory = this.inventory.filter(item => item !== "jasmine");
                                                        // 4. Show thanks dialogue
                                                        this.currentDialogue = elephantThanksDialogues;
                                                        this.currentDialogueIndex = 0;
                                                        showNextThanks();
                                                    }
                                                },
                                                {
                                                    text: "No",
                                                    callback: () => {
                                                        showDialogue(this, "That's okay, let me know if you change your mind.");
                                                        this.currentDialogue = ["That's okay, let me know if you change your mind."];
                                                        this.currentDialogueIndex = 0;
                                                        this.dialogueOnComplete = () => {
                                                            this.dialogueActive = false;
                                                            this.updateHUDState();
                                                        };
                                                    }
                                                }
                                            ]);
                                            this.currentDialogue = null;
                                            this.currentDialogueIndex = 0;
                                            this.dialogueOnComplete = null;
                                        } else {
                                            showDialogue(this, "Thank you so much! I really need your help. (+5c)");
                                            this.currentDialogue = ["Thank you so much! I really need your help. (+5c)"];
                                            this.currentDialogueIndex = 0;
                                            this.dialogueOnComplete = () => {
                                                this.dialogueActive = false;
                                                this.updateHUDState();
                                            };
                                        }
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
                    }
                };
            };

            const showNextThanks = () => {
                showDialogue(this, this.currentDialogue[this.currentDialogueIndex]);
                this.dialogueOnComplete = () => {
                    this.currentDialogueIndex++;
                    if (this.currentDialogueIndex < this.currentDialogue.length) {
                        showNextThanks();
                    } else {
                        this.dialogueActive = false;
                        this.updateHUDState();
                    }
                };
            };

            showNextIntro();
        });

        // --- Advance dialogue on pointerdown ---
        this.input.on("pointerdown", () => {
            this.sound.play("click", { volume: 0.5 });

            destroyDialogueUI(this);

            if (!this.dialogueActive || !this.currentDialogue) return;
            if (this.dialogueBox && this.dialogueBox.optionButtons) return;

            if (this.dialogueOnComplete) this.dialogueOnComplete();
        });

        // No collisions, so pass null for collisionObjects
        const char = createMainChar(this, width, height, null, scaleFactor);

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
            // Add more state here as needed (e.g., quest progress)
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

}

export default GreenhouseScene;
