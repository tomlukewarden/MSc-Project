
export const bee = this.add.sprite(width / 2 - 100, height / 2, "bee")
            .setScale(0.1)
            .setOrigin(4, 2.5)
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