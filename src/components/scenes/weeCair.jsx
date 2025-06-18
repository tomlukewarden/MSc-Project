class WeeCair extends Phaser.Scene {

    constructor(){
        super({key: "WeeCair", physics: { default: "arcade", arcade: { debug: true } } });
    }
    preload() {
        this.load.tilemapTiledJSON("weeCairMap", "src/assets/maps/weeCairMap.json");
        this.load.image("weeCairBackground", "src/assets/backgrounds/weeCair/weeCair.png");
        this.load.image("defaultFront", "src/assets/char/default/front-default.png");
        this.load.image("defaultBack", "src/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "src/assets/char/default/left-default.png");
        this.load.image("defaultRight", "src/assets/char/default/right-default.png");
    }
    create() {
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        console.log("Entered WeeCair Scene");
        const { width, height } = this.sys.game.config;

        const scaleFactor = 0.175;

        // Add scaled background
        this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

        const map = this.make.tilemap({ key: "weeCairMap" });
        const collisionObjects = map.getObjectLayer("collisions");

        if (!collisionObjects) {
            console.warn("Collision layer not found in Tiled map!");
            return;
        }

        const char = this.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
        char.setOrigin(-8, -0.5);
        char.setCollideWorldBounds(true);

        char.body.setSize(char.width * 0.6, char.height * 0.6);
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
                .setSize(scaledWidth, scaledHeight)
                .setScale(scaleFactor);
            collisionGroup.add(solidArea);
            this.physics.add.collider(char, solidArea);
        });

    }
}

export default WeeCair;