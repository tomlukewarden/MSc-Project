export function createMainChar(scene, width, height, scaleFactor, collisionGroup) {
    // Create the main character sprite
    const char = scene.physics.add.sprite(width / 2, height / 2, "defaultFront").setScale(0.04);
    char.setOrigin(-8, -0.5);
    char.setCollideWorldBounds(true);

    char.body.setSize(char.width * 0.6, char.height * 0.6);
    char.body.setOffset(char.width * 0.2, char.height * 0.2);

    scene.physics.add.collider(char, collisionGroup);

    collisionGroup.getChildren().forEach((solidArea) => {
        solidArea.setVisible(true).setAlpha(0.5);
    });

    const speed = 200;

    // Movement controls
    scene.input.keyboard.on("keydown", (event) => {
        char.setVelocity(0);
        if (event.key === "w" || event.key === "W") {
            char.setVelocityY(-speed);
            char.setTexture("defaultBack");
        } else if (event.key === "s" || event.key === "S") {
            char.setVelocityY(speed);
            char.setTexture("defaultFront");
        } else if (event.key === "a" || event.key === "A") {
            char.setVelocityX(-speed);
            char.setTexture("defaultLeft");
        } else if (event.key === "d" || event.key === "D") {
            char.setVelocityX(speed);
            char.setTexture("defaultRight");
        } else if (event.key === "e" || event.key === "E") {
            scene.scene.launch("OpenInventory");
        } else if (event.key === "q" || event.key === "Q") {
            scene.scene.launch("OpenJournal");
        } else if (event.key === "Escape") {
            scene.scene.launch("OpenSettings");
        }
    });

    scene.input.keyboard.on("keyup", () => {
        char.setVelocity(0);
    });

    return char;
}