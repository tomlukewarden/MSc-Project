
export const fairyIntroDialogues = [
    "",
    "Thank goodness you arrived!",
    "The residents are falling ill...",
    "Just look at Paula Nator... she's not herself!",
    "Can you go and check on her?",
    "Come back to me once you've chatted to her."
];

export const fairyHelpDialogues = [
    "",
    "Sounds like some kind of funny heartbeat!",
    "I've heard that Foxglove can be used to help with that",
    "Can you check your journal?",
    "It should give you an idea of the remedy that Paula needs.",
    "I have the foxglove and the teabag.",
    "Head over to that crafting bench up there and combine them.",
];

export const fairyGoodbyeDialogues = [
    "I think you've really helped Paula here!\n I think it's time to head over to the gardens.",
    "Are you ready to go?",
];

export function createFairy(scene, x, y) {
    const fairy = scene.add.sprite(x, y, "fairy")
        .setScale(0.07)
        .setOrigin(-6, 2)
        .setInteractive({ useHandCursor: true });

    return fairy;
}
