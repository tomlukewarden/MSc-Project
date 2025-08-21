export const butterflyIntroDialogues = [
  "",
  "Ah! You came! Oh, I knew you would.",
  "I cannot thank you enough,\n your presence means more than you know.",
  "We need your help if \nwe’re going to save the seasons.",
  "Come now, follow me. \n There’s much to show you."
];

export const butterflyPillarDialogues = [
  "These are the Season Pillars.",
  "They’re the heartbeat of our gardens,\n the very rhythm of the land.",
  "But they’re broken, missing pieces\n scattered far and wide.",
  "That’s where you come in.",
  "With your help, we can find the shards\n and bring the gardens back to life."
];

export const butterflyShardDialogues = [
  "There’s something else...",
  "Around the same time the shards vanished \n the garden folk began to fall ill. ",
  "I don’t believe it’s a coincidence.",
  "No... something connects these happenings.", 
  "If we can restore the Pillars, \n I believe we can heal the people too.",
  "How marvellous! \n You already have a shard!",
  "Go on, place it into one of \n the shard slots.",
  "I had a feeling about you. \n You’re the one we’ve been waiting for.",
  "Let’s begin with Spring. \n Its magic is delicate,\n the easiest to nudge back into balance."
];

export const butterflyGoodbyeDialogues = [
  "Ah yes, one last thing...",
  "Head to your personal garden, \n here you can access the shop and \n do some farming!",
  "Good luck, and remember,\n the seasons are counting on you.",
];

export function createButterfly(scene, x, y) {
  const butterfly = scene.add.sprite(x, y, "butterfly")
    .setScale(0.1)
    .setOrigin(-1.5, 1.1)
    .setInteractive({ useHandCursor: true });
  butterfly.setDepth(101);

  return butterfly;
}