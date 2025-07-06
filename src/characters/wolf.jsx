export const wolfIntroDialogues = [
"Well, if it isn’t the newest addition to the gardens! Nice to see ya, how’ve you bee-OWW... ugh, sorry.",
"That one hit the fang. This tooth’s been giving me grief for days now.",
"Think it’s messing with my favourite K9... literally. ",
"You wouldn’t happen to have something for a killer toothache, would you? I’m trying to keep the howling to a minimum.",
];

export const wolfThanksDialogues = [
"You really think this will help? I hope to DOG you’re right…",
"AWOOOOOO and not in pain! This is awesome buddy. You always come through.",
"Here, take this gem thingy. I’ve been holding onto it, but honestly? I’ve got no clue what it’s for. You’re the smart one. Probably better off with you anyway."
];

export function createWolf(scene, x, y) {
    const mole = scene.add.sprite(x, y, "wolf")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return wolf;
}
