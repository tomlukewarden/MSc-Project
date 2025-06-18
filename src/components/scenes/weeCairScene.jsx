import Phaser from "phaser";
import { createTextBox } from "../../dialogue/dialogueManager";
import { beeDialogues } from "../../dialogue/beeDialogue";
import { bee } from "../../sprites/bee";
import {fairyDialogues} from "../../dialogue/fairyDialogue";
import { fairy } from "../../sprites/fairy";

class WeeCairScene extends Phaser.Scene {
    constructor() {
        super({ key: "WeeCairScene", physics: { default: "arcade", arcade: { debug: false } } });
    }

    preload() {
        this.load.tilemapTiledJSON("weeCairMap", "/assets/maps/weeCairMap.json");
        this.load.image("weeCairBackground", "/assets/backgrounds/weecair/weecair.png");
        this.load.image("weeCairArch", "/assets/backgrounds/weecair/archway.png");
        this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
        this.load.image("fairy", "/assets/npc/fairy/fairy.png");
        this.load.image("talk", "/assets/interact/talk.png");
        this.load.image("bee", "/assets/npc/bee/bee-sad.png");
    }

    create() {
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        console.log("Entered WeeCair");
        const { width, height } = this.sys.game.config;
        const scaleFactor = 0.175;

        // Add scaled background
        this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);
        const map = this.make.tilemap({ key: "weeCairMap" });
        const collisionObjects = map.getObjectLayer("wee-cair-collisions");

        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }

        const collisionGroup = this.physics.add.staticGroup();
        const xOffset = -80;
        const yOffset = 0;

        collisionObjects.objects.forEach((obj) => {
            const centerX = (obj.x + obj.width / 2) * scaleFactor + xOffset;
            const centerY = (obj.y + obj.height / 2) * scaleFactor + yOffset;
            const scaledWidth = obj.width * scaleFactor;
            const scaledHeight = obj.height * scaleFactor;

            const solidArea = this.physics.add.staticImage(centerX, centerY)
                .setSize(scaledWidth, scaledHeight)
                .setOrigin(0.5, 0.5);

            collisionGroup.add(solidArea);
        });

        // Create player
        const char = this.physics.add.sprite(width / 2, 99, "defaultFront")
            .setScale(0.05)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        char.setOrigin(-8, -0.5);
        char.setCollideWorldBounds(true);
        char.body.setSize(char.width * 0.6, char.height * 0.6);
        char.body.setOffset(char.width * 0.2, char.height * 0.2);

        const speed = 150;

        this.input.keyboard.on("keydown", (event) => {
            char.setVelocity(0);
            if (event.key === "w") {
                char.setVelocityY(-speed);
                char.setTexture("defaultBack");
            } else if (event.key === "s") {
                char.setVelocityY(speed);
                char.setTexture("defaultFront");
            } else if (event.key === "a") {
                char.setVelocityX(-speed);
                char.setTexture("defaultLeft");
            } else if (event.key === "d") {
                char.setVelocityX(speed);
                char.setTexture("defaultRight");
            }
        });

        this.input.keyboard.on("keyup", () => {
            char.setVelocity(0);
        });

        this.physics.add.collider(char, collisionGroup);
        collisionGroup.getChildren().forEach((solidArea) => {
            solidArea.setVisible(true).setAlpha(0.5);
        });

        const arch = this.add.image(width / 2, height / 2, "weeCairArch")
            .setScale(scaleFactor)
            .setOrigin(0.5, 0.5)
            .setDepth(20);
    

        const talkIcon = this.add.image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(10);


       
        this.currentDialogueSet = 0; // Tracks which array you're on
        this.currentDialogueIndex = 0;
        this.dialogueActive = false;

        fairy.on("pointerdown", () => {
            if (!this.dialogueActive && this.currentDialogueSet < this.fairyDialogues.length) {
                this.activeDialogue = this.fairyDialogues[this.currentDialogueSet];
                this.currentDialogueIndex = 0;
                this.dialogueActive = true;
                this.scene.sleep("HUDScene");
                this.showFairyDialogue(this.activeDialogue[this.currentDialogueIndex]);
            }
        });

        // 3. Advance through lines and sets in your input handler
        this.input.on("pointerdown", () => {
            if (!this.dialogueActive || !this.activeDialogue) return;

            if (this.fairyDialogueBox) this.fairyDialogueBox.destroy();
            if (this.fairyDialogueText) this.fairyDialogueText.destroy();

            this.currentDialogueIndex++;
            if (this.currentDialogueIndex < this.activeDialogue.length) {
                // Next line in current set
                this.showFairyDialogue(this.activeDialogue[this.currentDialogueIndex]);
            } else {
                // Finished this set, move to next
                this.currentDialogueSet++;
                this.dialogueActive = false;
                this.scene.wake("HUDScene");

                if (this.currentDialogueSet < this.fairyDialogues.length) {
                } else {
                    this.dialogueActive = false;
                    this.scene.wake("HUDScene");
                    this.showFairyDialogue("What would you like to do?", [
                        this.scene.sleep("HUDScene"),
                        {
                            label: "Go to the gardens",
                            onSelect: () => {
                                this.scene.stop("weeCair");
                                this.scene.start("GreenhouseScene");
                            }
                        },
                        {
                            label: "Stay here",
                            onSelect: () => {
                                if (this.fairyDialogueBox) this.fairyDialogueBox.destroy();
                                if (this.fairyDialogueText) this.fairyDialogueText.destroy();
                                if (this.fairyOptionButtons) this.fairyOptionButtons.forEach(btn => btn.destroy());
                                this.scene.wake("HUDScene");
                            }
                        }
                    ]);
                }
            }
        });

        // Dialogue display function (no input handler here)
        this.showFairyDialogue = (text, options = null) => {
            const { width, height } = this.scale;
            const boxWidth = width * 0.5;
            const boxHeight = height * 0.13;
            const boxY = height - boxHeight / 2 - height * 0.03;

            // Clean up previous dialogue and buttons
            if (this.fairyDialogueBox) this.fairyDialogueBox.destroy();
            if (this.fairyDialogueText) this.fairyDialogueText.destroy();
            if (this.fairyDialogueImage) this.fairyDialogueImage.destroy();
            if (this.fairyOptionButtons) {
                this.fairyOptionButtons.forEach(btn => btn.destroy());
                this.fairyOptionButtons = null;
            }

            // Use your dialogueManager to create the box, text, and optional image
            const { box, textObj, image } = createTextBox(this, text, {
                width: boxWidth,
                height: boxHeight,
                y: boxY,
                imageKey: options && options.imageKey ? options.imageKey : undefined,
                imageScale: options && options.imageScale ? options.imageScale : undefined
            });

            this.fairyDialogueBox = box;
            this.fairyDialogueText = textObj;
            this.fairyDialogueImage = image;

            // Render options if provided (as before)
            if (options && Array.isArray(options.options)) {
                this.fairyOptionButtons = [];
                const optionStartX = width / 2 + boxWidth / 2 + 30;
                const optionStartY = boxY - ((options.options.length - 1) * 30) / 2;

                options.options.forEach((option, idx) => {
                    const btn = this.add.text(optionStartX, optionStartY + idx * 30, option.label, {
                        font: "18px Arial",
                        color: "#0077cc",
                        backgroundColor: "#e0e0e0",
                        padding: { left: 10, right: 10, top: 4, bottom: 4 }
                    })
                        .setOrigin(0, 0.5)
                        .setInteractive({ useHandCursor: true })
                        .setDepth(102)
                        .on("pointerdown", () => {
                            if (this.fairyDialogueBox) this.fairyDialogueBox.destroy();
                            if (this.fairyDialogueText) this.fairyDialogueText.destroy();
                            if (this.fairyDialogueImage) this.fairyDialogueImage.destroy();
                            if (this.fairyOptionButtons) this.fairyOptionButtons.forEach(b => b.destroy());
                            this.scene.wake("HUDScene");
                            if (option.onSelect) option.onSelect();
                        });

                    this.fairyOptionButtons.push(btn);
                });
            }
        };

        const boxWidth = 400;
        const boxHeight = 100;
        const boxY = height - boxHeight / 2 - 20;

        this.dialogueBox = this.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xffffff, 0.9)
            .setStrokeStyle(2, 0x000000)
            .setDepth(20)
            .setVisible(false);

        this.dialogueText = this.add.text(width / 2, boxY, "", {
            font: "20px Arial",
            color: "#222",
            align: "center",
            wordWrap: { width: boxWidth - 20 }
        })
            .setOrigin(0.5)
            .setDepth(21)
            .setVisible(false);
    }

    showFairyDialogue(text, options = []) {
        // Hide HUD
        this.scene.sleep("HUDScene");

        // Remove previous dialogue and options if they exist
        if (this.fairyDialogueBox) this.fairyDialogueBox.destroy();
        if (this.fairyDialogueText) this.fairyDialogueText.destroy();
        if (this.fairyOptionButtons) {
            this.fairyOptionButtons.forEach(btn => btn.destroy());
        }

        const { width, height } = this.scale;
        const boxWidth = 400;
        const boxHeight = 100;
        const boxY = height - boxHeight / 2 - 20;

        this.fairyDialogueBox = this.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xffffff, 0.9)
            .setStrokeStyle(2, 0x000000)
            .setDepth(100);

        this.fairyDialogueText = this.add.text(width / 2, boxY, text, {
            font: "20px Arial",
            color: "#222",
            align: "center",
            wordWrap: { width: boxWidth - 20 }
        })
            .setOrigin(0.5)
            .setDepth(101);


       
    }
}


export default WeeCairScene;
