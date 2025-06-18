
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
    "",
    "You're ready for the gardens!",
    "Do you feel the same?"
];

export function createFairy(scene, x, y) {
    const fairy = scene.add.sprite(x, y, "fairy")
        .setScale(0.13)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true });

    return fairy;
}
