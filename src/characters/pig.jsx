export const pigIntroDialogues = [
    "",
    "Oink—ow! Careful! \n My back is *so* sunburnt \n I can’t even roll over properly.",
    "I thought I was just getting a healthy glow… \n turns out pigs aren’t built for beach days.",
    "Could you maybe help? \n I’m kinda sizzling over here."
];


export const pigThanksDialogues = [
    "Oooooh... that cream is a *miracle* \n My skin finally stopped screaming.",
    "You really know your stuff. \n I feel way less crispy now.",
    "Thanks, pal. Here—take this. \n I was saving it for a hot day, \n but you’ve earned it."
];

export function createPig(scene, x, y) {
    const pig = scene.add.sprite(x, y, "pig")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return pig;
}