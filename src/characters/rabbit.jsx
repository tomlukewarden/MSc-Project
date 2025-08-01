export const rabbitIntroDialogues = [
    "Hi... sorry, \n I’m just really tired.",
    "I usually find lavender calming, \n but lately I just can’t seem to relax.",
    "No matter what I try, I can’t sleep.\n  It’s like my thoughts won’t stop hopping around.",
    "Do you think you could help me?\n I don’t know what else to do."
];

export const rabbitThanksDialogues = [
    "Oh… I feel so much better. \n Like my whole body finally exhaled.",
    "The tension’s gone. \n Even the lavender smells gentle again.",
    "Thank you. Really. I think I might actually sleep tonight. \n Here—this is for you."
];
export function createRabbit(scene, x, y) {
    const rabbit = scene.add.sprite(x, y, "rabbit")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return rabbit;
}