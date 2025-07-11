export const elephantIntroDialogues = [
  "",
     "Hi… Did the Fairy send you? \n She always knows when something’s off.",
   " I’ve just... I don’t know. \n I can’t seem to settle.",
   "My thoughts keep stomping around in my head and \n I can’t get them to calm down." ,
   "Do you think maybe... \n you could help? Even just a little?"
  ]
  export const elephantThanksDialogues =[
 "That smells incredible... \n Is that for me? Really? I do hope this helps.",
 "My thoughts have been stomping around all day...",
 "Wow... what a difference...",
 "I feel, slower. \n Like the world finally took a deep breath with me.",
 "Everything feels softer, \n like I’m walking on moss instead of pebbles.",
 "Thank you. Truly. Oh please, take this. \n I don’t know why, but something told me to keep a hold of it... just in case."
  ]


export function createElephant(scene, x, y) {
    const elephant = scene.add.sprite(x, y, "elephant")
        .setScale(0.09)
        .setOrigin(5, -1)
        .setInteractive({ useHandCursor: true });
    return elephant;
}