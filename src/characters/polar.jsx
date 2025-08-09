export const polarBearIntroDialogues = [
    "",
    "Ugh... is it just me, \n or is it way too warm?",
    "I’ve been feeling kinda off lately. \n My head’s fuzzy and I keep overheating.",
    "It’s weird. I’m a polar bear \n — I *don’t* get warm.",
    "Think you could help? \n I don’t know what’s going on, \n but I’m definitely not at my best."
];
export const polarBearThanksDialogues = [
    "Oh wow, that actually worked! \n I feel so much better now.",
    "I can think clearly again, \n and I’m not sweating buckets.",
    "Thank you so much! Here, take this. \n I don’t know what it is, but it feels special."
];
export function createPolarBear(scene, x, y) {
    const polarBear = scene.add.sprite(x, y, "polarBear")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return polarBear;
}