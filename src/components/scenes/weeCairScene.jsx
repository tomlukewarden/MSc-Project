import Phaser from "phaser";
import GreenhouseScene from "./greenhouseScene";

class WeeCairScene extends Phaser.Scene {
    constructor() {
        super({ key: "WeeCairScene", physics: { default: "arcade", arcade: { debug: true } } });
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

        // Create the fairy sprite
        const fairy = this.add.sprite(width / 2 + 100, height / 2, "fairy")
            .setScale(0.08)
            .setOrigin(-3, 0.5)
            .setInteractive({ useHandCursor: true });

        // Create the talk icon, hidden by default
        const talkIcon = this.add.image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(10);

        fairy.on("pointerover", (pointer) => {
            talkIcon.setVisible(true);
            talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });

        fairy.on("pointermove", (pointer) => {
            talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });

        fairy.on("pointerout", () => {
            talkIcon.setVisible(false);
        });

        this.fairyIntroDialogues = [
            "Thank goodness you arrived so quickly! We're in quite the bind.",
            "The residents of the gardens are falling ill, one by one, and were in desperate need of your remedies!",
            "Just look at our dear friend Bee... shes simply not herself!",
            "Please, speak with her and see if you can uncover what's wrong.",

        ];

        this.fairyHelpDialogues = [
            "Oh dear… this isn’t good. I believe Foxglove is known to help with irregular heart rhythms, is it not?",
            "I just so happen to have a sprig with me. ",
            "Would you be willing to brew a remedy for our poor friend?"
        ];

        this.fairyGoodbyeDialogues = [
            "I believe you are ready for the gardens friend, do you feel the same?"
        ];

        // 1. Define your arrays in order
        this.fairyDialogues = [
            this.fairyIntroDialogues,
            this.fairyHelpDialogues,
            this.fairyGoodbyeDialogues
        ];
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
                    // Optionally, you can auto-start the next set or wait for another click
                } else {
                    // All dialogues done, show options
                    this.dialogueActive = false; // Prevent further dialogue advancement
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
        this.showFairyDialogue = (text) => {
            const { width, height } = this.scale;
            const boxWidth = width * 0.5;
            const boxHeight = height * 0.13;
            const boxY = height - boxHeight / 2 - height * 0.03;

            this.fairyDialogueBox = this.add.rectangle(width / 2, boxY, boxWidth, boxHeight, 0xffffff, 0.9)
                .setStrokeStyle(2, 0x000000)
                .setDepth(100);

            this.fairyDialogueText = this.add.text(width / 2, boxY, text, {
                font: `${Math.round(height * 0.03)}px Arial`,
                color: "#222",
                align: "center",
                wordWrap: { width: boxWidth - 20 }
            })
                .setOrigin(0.5)
                .setDepth(101);
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

             // --- PLAYER OPTIONS ---
        this.fairyOptionButtons = [];
        const optionStartX = width / 2 + boxWidth / 2 + 30;
        const optionStartY = boxY - ((options.length - 1) * 30) / 2;

        options.forEach((option, idx) => {
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
                    // Clean up dialogue and options
                    this.fairyDialogueBox.destroy();
                    this.fairyDialogueText.destroy();
                    this.fairyOptionButtons.forEach(b => b.destroy());
                    // Show HUD again
                    this.scene.wake("HUDScene");
                    // Call the option's callback
                    if (option.onSelect) option.onSelect();
                });

            this.fairyOptionButtons.push(btn);
        });
    }
}


export default WeeCairScene;
