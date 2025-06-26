
export function createButterfly(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(7, 3)
        .setInteractive({ useHandCursor: true });

    return butterfly;
}