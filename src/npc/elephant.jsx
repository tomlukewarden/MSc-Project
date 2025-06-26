
export const elephantIntroDialogues = [
  "",
     "Hi… Did Butterfly send you? She always knows when something’s off.",
   " I’ve just... I don’t know. I can’t seem to settle.",
   "My thoughts keep stomping around in my head and I can’t get them to calm down." ,
   "Do you think maybe... you could help? Even just a little?"
  ]
  export const elephantThanksDialogues =[
 "That smells incredible... Is that for me? Really? I do hope this helps.",
 "My thoughts have been stomping around all day...",
 "Wow... what a difference...",
 "I feel, slower.Like the world finally took a deep breath with me.",
 "Everything feels softer, like I’m walking on moss instead of pebbles.",
 "Thank you. Truly. Oh please, take this. I don’t know why, but something told me to keep a hold of it... just in case."
  ]


export function createElephant(scene, x, y) {
    const bee = scene.add.sprite(x, y, "bee")
        .setScale(0.1)
        .setOrigin(7, 3)
        .setInteractive({ useHandCursor: true });



    return bee;
}