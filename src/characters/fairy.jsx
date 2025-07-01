
export const fairyIntroDialogues = [
    "",
    "Thank goodness you arrived!",
    "The residents are falling ill...",
    "Just look at Paula Nator... she's not herself!",
    "Please, help her!"
];

export const fairyHelpDialogues = [
    "",
    "Foxglove helps with heart stuff, right?",
    "I just so happen to have some!",
    "Can you make the remedy?"
];

export const fairyGoodbyeDialogues = [
    "I think you've really helped Paula here! I think it's time to head over to the gardens.",
    "What do you think?"
];

export function createFairy(scene, x, y) {
    const fairy = scene.add.sprite(x, y, "fairy")
        .setScale(0.07)
        .setOrigin(-6, 2)
        .setInteractive({ useHandCursor: true });

    return fairy;
}
