export function createMainChar(scene, width, height, collisionObjects, scaleFactor) {
    // Create the main character sprite
    const char = scene.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
    char.setOrigin(-8, -0.5);
    char.setCollideWorldBounds(true);

    char.body.setSize(char.width * 0.6, char.height * 0.6);
    char.body.setOffset(char.width * 0.2, char.height * 0.2);

    // Create collision group
    const collisionGroup = scene.physics.add.staticGroup();
    const xOffset = -155;
    const yOffset = 45;

    collisionObjects.objects.forEach((obj) => {
        const centerX = (obj.x + obj.width / 2) * scaleFactor + xOffset;
        const centerY = (obj.y + obj.height / 2) * scaleFactor + yOffset;
        const scaledWidth = obj.width * scaleFactor;
        const scaledHeight = obj.height * scaleFactor;

        const solidArea = scene.physics.add.staticImage(centerX, centerY)
            .setDisplaySize(scaledWidth, scaledHeight)
            .setOrigin(0.5, 0.5);

        solidArea.body.setSize(scaledWidth, scaledHeight);
        solidArea.body.setOffset(-scaledWidth / 2, -scaledHeight / 2);

        collisionGroup.add(solidArea);
    });

    scene.physics.add.collider(char, collisionGroup);

    collisionGroup.getChildren().forEach((solidArea) => {
        solidArea.setVisible(true).setAlpha(0.5);
    });

    const speed = 150;

    // Movement controls
    scene.input.keyboard.on("keydown", (event) => {
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

    scene.input.keyboard.on("keyup", () => {
        char.setVelocity(0);
    });

    return char;
}