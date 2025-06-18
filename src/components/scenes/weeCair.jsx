import Phaser from "phaser";


class WeeCairScene extends Phaser.Scene {
    constructor() {
        super({ key: "WeeCairScene", physics: { default: "arcade", arcade: { debug: true } } });
    }

    preload() {
       this.load.tilemapTiledJSON("map", "src/assets/maps/weeCairMap.json");
        this.load.image("weeCairBackground", "src/assets/backgrounds/weecair/weecair.png");
        this.load.image("weeCairArch", "src/assets/backgrounds/weecair/archway.png");
        this.load.image("defaultFront", "src/assets/char/default/front-default.png");
        this.load.image("defaultBack", "src/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "src/assets/char/default/left-default.png");
        this.load.image("defaultRight", "src/assets/char/default/right-default.png");
        this.load.image("fairy", "src/assets/npc/fairy/fairy.png");
        this.load.image("talk", "src/assets/interact/talk.png");
    }

    create() {
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        console.log("Entered GreenhouseScene");
        const { width, height } = this.sys.game.config;


        const scaleFactor = 0.175;

        // Add scaled background
        this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);
        const map = this.make.tilemap({ key: "map" });
        const collisionObjects = map.getObjectLayer("collisions");
        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }
        const collisionGroup = this.physics.add.staticGroup();
        const xOffset = -80; // Adjust as needed
        const yOffset = 0;  // Adjust as needed
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

       
        // Create player first
        const char = this.physics.add.sprite(width / 2, 99, "defaultFront")
            .setScale(0.05)
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        char.setOrigin(-8, -0.5); 
        char.setCollideWorldBounds(true);


        char.body.setSize(char.width * 0.6, char.height * 0.6);
        // Center the hitbox
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

        // Stop movement when keys are released
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
    

        // Create the fairy sprite (use your actual fairy image key)
        const fairy = this.add.sprite(width / 2 + 100, height / 2, "fairy")
            .setScale(0.08)
            .setOrigin(-3, 1)
            .setInteractive({ useHandCursor: true });

        // Create the talk icon, hidden by default
        const talkIcon = this.add.image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(10);

        // Show and follow the talk icon when hovering over the fairy
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
        fairy.on("pointerdown", () => {
            fairy.setScale(0.08);
            talkIcon.setVisible(false);
            this.add.text(fairy.x, fairy.y - 50, "Hello! Welcome to Wee Cair!", {
                fontSize: '16px',
                fill: '#fff',
                backgroundColor: '#000',
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5, 0.5);
            // Add your interaction logic here
        });
    }
    shutdown() {
        this.scene.stop("HUDScene");
    }
}

export default WeeCairScene;
