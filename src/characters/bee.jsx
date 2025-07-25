
export const beeIntroDialogues = [
  "",
    "...Hey... I don't feel right...",
    "My heart... \nit’s fluttering all wrong...",
    "......Everything feels fuzzy... \n can you take a look?"
  ]
  export const beeThanksDialogues =[
    "...Wow, you work fast... \n something already?",
    "Okay, okay, here goes...\n I feel...",
    "SO MUCH BETTER, OMG!!!",
    "You're amazing! Take this shiny gem I found!"
  ]


export function createBee(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(7, 3)
        .setInteractive({ useHandCursor: true });



    return bee;
}