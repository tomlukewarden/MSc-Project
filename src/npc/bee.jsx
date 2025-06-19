
export const beeIntroDialogues = [
    "...Hey... I don't feel right...",
    "My heart... it’s fluttering all wrong...",
    "......Everything feels fuzzy... can you take a look?"
  ]
  export const beePreDialogues =[
    "...Wow, you work fast... something already?"
  ]

  export const beePostDialogues =[
    "Okay, okay, here goes...I feel...",
    "SO MUCH BETTER, OMG!!!",
    "You're amazing! Take this shiny gem I found!"
  ]


export function createBee(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(4, 2.7)
        .setInteractive({ useHandCursor: true });



    return bee;
}