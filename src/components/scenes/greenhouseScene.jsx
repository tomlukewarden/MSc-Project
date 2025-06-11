import Phaser from "phaser";

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: true } } });
    }

    preload() {
        this.load.tilemapTiledJSON("map", "src/assets/maps/greenhouseMap.json");
        this.load.image("greenhouseBackground", "src/assets/backgrounds/greenhouse.png");
        this.load.image("defaultFront", "src/assets/char/default/front-default.png");
        this.load.image("defaultBack", "src/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "src/assets/char/default/left-default.png");
        this.load.image("defaultRight", "src/assets/char/default/right-default.png");
    }

    create() {
        console.log("Entered GreenhouseScene");
        const { width, height } = this.sys.game.config;

        const scaleFactor = 0.225;

        // Add scaled background
        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);


        const map = this.make.tilemap({ key: "map" });

        const collisionObjects = map.getObjectLayer("collisions"); 

        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }

        const char = this.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.06);
        char.setOrigin(-7, -0.5); 
        char.setCollideWorldBounds(true);

        const collisionGroup = this.physics.add.staticGroup();
        collisionObjects.objects.forEach((obj) => {
            const solidArea = this.physics.add.staticImage(
                obj.x * scaleFactor, obj.y * scaleFactor
            ).setSize(obj.width * scaleFactor, obj.height * scaleFactor)
            .setOrigin(0.5, 0.5); // Ensures proper positioning

            collisionGroup.add(solidArea);
        });

        // Enable physics collision with player
        this.physics.add.collider(char, collisionGroup);

        // Debug: Visualize collision areas
        collisionGroup.getChildren().forEach((solidArea) => {
            solidArea.setVisible(true).setAlpha(0.5);
        });

        // Define movement speed
        const speed = 150;

        // Create keyboard input
        this.input.keyboard.on("keydown", (event) => {
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
}

export default GreenhouseScene;
