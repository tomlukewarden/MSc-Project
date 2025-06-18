
export const beeIntroDialogue = [
    "",
    "...Hey... I don't feel right...",
    "My heart... it’s fluttering all wrong...",
    "......Everything feels fuzzy... can you take a look?"
  ]
  export const beePreDiaglogue =[
    "",
    "...Wow, you work fast... something already?"
  ]
  
  export const beePostDiaglogue =[
    "",
    "Okay, okay, here goes...I feel...",
    "SO MUCH BETTER, OMG!!!",
    "You're amazing! Take this shiny gem I found!"
  ]


export function createBee(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(4, 2.7)
        .setInteractive({ useHandCursor: true });


        
    bee.on("pointerover", (pointer) => {
        talkIcon.setVisible(true);
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });

    bee.on("pointermove", (pointer) => {
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });

    bee.on("pointerout", () => {
        talkIcon.setVisible(false);
    });

    return bee;
}