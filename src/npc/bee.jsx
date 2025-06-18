export function createBee(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

    bee.on("pointerover", (pointer) => {
        talkIcon.setVisible(true);
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });

    bee.on("pointermove", (pointer) => {
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });

    bee.on("pointerout", () => {
        talkIcon.setVisible(false);
    });

    return bee;
}