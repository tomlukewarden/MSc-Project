
export const fairy = this.add.sprite(width / 2 + 100, height / 2, "fairy")
    .setScale(0.05)
    .setOrigin(-3, 0.5)
    .setInteractive({ useHandCursor: true });

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
