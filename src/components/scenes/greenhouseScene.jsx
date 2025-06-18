import Phaser from "phaser";


class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: true } } });
    }

    preload() {
        this.load.tilemapTiledJSON("map", "src/assets/maps/greenhouseMap.json");
        this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse/greenhouse.png");
        this.load.image("defaultFront", "src/assets/char/default/front-default.png");
        this.load.image("defaultBack", "src/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "src/assets/char/default/left-default.png");
        this.load.image("defaultRight", "src/assets/char/default/right-default.png");
        this.load.image("butterflyFront", "src/assets/npc/butterfly/front-butterfly.png");
        this.load.image("talk", "src/assets/interact/talk.png");
        this.load.image("butterflyHappy", "src/assets/npc/butterfly/happy-butterfly-dio.png");
    }

    create() {
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        console.log("Entered GreenhouseScene");
        const { width, height } = this.sys.game.config;

        const scaleFactor = 0.175;

        // Add scaled background
        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);

        const map = this.make.tilemap({ key: "map" });
        const collisionObjects = map.getObjectLayer("collisions"); 

        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }

        const char = this.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
        char.setOrigin(-8, -0.5); 
        char.setCollideWorldBounds(true);


        char.body.setSize(char.width * 0.6, char.height * 0.6);
        // Center the hitbox
        char.body.setOffset(char.width * 0.2, char.height * 0.2);

        const collisionGroup = this.physics.add.staticGroup();
        const xOffset = -75; 
        const yOffset = 45;  

        collisionObjects.objects.forEach((obj) => {
            const centerX = (obj.x + obj.width / 2) * scaleFactor + xOffset;
            const centerY = (obj.y + obj.height / 2) * scaleFactor + yOffset;
            const scaledWidth = obj.width * scaleFactor;
            const scaledHeight = obj.height * scaleFactor;

            const solidArea = this.physics.add.staticImage(centerX, centerY)
                .setDisplaySize(scaledWidth, scaledHeight)
                .setOrigin(0.5, 0.5);

            // Set the physics body size to match the display size
            solidArea.body.setSize(scaledWidth, scaledHeight);
            solidArea.body.setOffset(-scaledWidth / 2, -scaledHeight / 2);

            collisionGroup.add(solidArea);
        });

        this.physics.add.collider(char, collisionGroup);

        collisionGroup.getChildren().forEach((solidArea) => {
            solidArea.setVisible(true).setAlpha(0.5);
        });

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

        // Stop movement when keys are released
        this.input.keyboard.on("keyup", () => {
            char.setVelocity(0);
        });

        const butterfly = this.add.sprite(width / 2 + 100, height / 2, "butterflyFront")
            .setScale(0.08)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true });

        const talkIcon = this.add.image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(10); 

        butterfly.on("pointerover", (pointer) => {
            talkIcon.setVisible(true);
            talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });

        butterfly.on("pointermove", (pointer) => {
            talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });

        butterfly.on("pointerout", () => {
            butterfly.setScale(0.05);
            talkIcon.setVisible(false);
        });
        butterfly.on("pointerdown", () => {
            butterfly.setScale(0.08);
            talkIcon.setVisible(false);
            this.showButterflyDialogue();
        });
    }

    
    shutdown() {
        this.scene.stop("HUDScene");
    }
}

export default GreenhouseScene;
