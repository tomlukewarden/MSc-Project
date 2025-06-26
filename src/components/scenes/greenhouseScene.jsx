import Phaser from "phaser";


class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: false } } });
    }

    preload() {
        this.load.tilemapTiledJSON("greenhouseMap", "/assets/maps/greenhouseMap.json");
        this.load.image("greenhouseBackground", "/assets/backgrounds/greenhouse/greenhouse.png");
        this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
    }

    create() {
        this.scene.stop("OpenJournal");
        this.scene.stop("WeeCairScene");
        this.scene.stop("StartScene");
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        console.log("Entered GreenhouseScene");
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

        const char = this.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
        char.setOrigin(-8, -0.5); 
        char.setCollideWorldBounds(true);


        char.body.setSize(char.width * 0.6, char.height * 0.6);
        // Center the hitbox
        char.body.setOffset(char.width * 0.2, char.height * 0.2);

        const collisionGroup = this.physics.add.staticGroup();
        const xOffset = -155; 
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
    }

    
    shutdown() {
        this.scene.stop("HUDScene");
    }
}

export default GreenhouseScene;
