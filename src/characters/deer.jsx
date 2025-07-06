export const deerIntroDialogues = [
    "Ugh… these mosquitoes have been *relentless* lately.",
    "I’ve got bites in places I didn’t even know could itch.",
    "Any chance you could help me out? I’m one more bite away from losing my cool."
];

export const deerThanksDialogues = [
    "Ohhh yeah… that’s the good stuff. The itching’s already easing up.",
    "I feel like I can finally stop scratching and just *exist* again.",
    "Thanks, friend. You’re a lifesaver. Here—take this. I owe you one."
];
export function createDeer(scene, x, y) {
    const deer = scene.add.sprite(x, y, "deer")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return deer;
}