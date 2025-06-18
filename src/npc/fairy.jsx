
export function createFairy(scene, x, y) {
    const fairy = scene.add.sprite(x, y, "fairy")
        .setScale(0.13)
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

    return fairy;
}