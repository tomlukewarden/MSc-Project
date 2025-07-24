export const turtleIntroDialogues = [
    "Oh dear… I’ve caught a dreadful chill.",
    "No matter how many scarves I wear,\n I just can’t seem to shake this cold.",
    "Would you mind \n helping an old shell like me?"
];

export const turtleThanksDialogues = [
    "Oh my… that thyme tea warmed me right up!",
    "The sniffles are fading already. \n You’ve got a real gift, dear.",
    "Thank you kindly. Here—take this little something. \n It’s been in my satchel for ages."
];

export function createTurtle(scene, x, y) {
    const turtle = scene.add.sprite(x, y, "turtle")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return turtle;
}