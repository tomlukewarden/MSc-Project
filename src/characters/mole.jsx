export const moleIntroDialogues = [
    "Hey there… uh, quick question. \n Are mushrooms supposed to grow on moles?",
    "I’ve been digging like usual, \n but lately these little fungi keep popping up \n all over me.",
    "They’re not itchy or anything, just... weird. I don’t know what’s going on.",
    "Maybe you know something I don’t? \n I’d really appreciate any help."
];


export const moleThanksDialogues = [
    "Oh—oh wow! The mushrooms are falling off!\n I didn’t think that would actually work!",
    "I feel… clearer? Lighter? \n Like I can finally burrow without bumping \n into weird squishy stuff.",
    "Thank you so much. Here—take this. \n I don’t know what it is exactly, \n but it feels kinda special now."
];


export function createMole(scene, x, y) {
    const mole = scene.add.sprite(x, y, "mole")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return mole;
}