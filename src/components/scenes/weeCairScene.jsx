import Phaser from "phaser";
import { createTextBox } from "../../dialogue/createTextbox";
import {
  createBee,
  beeIntroDialogues,
  beePreDialogues,
  beePostDialogues
} from "../../npc/bee";
import {
  createFairy,
  fairyIntroDialogues,
  fairyHelpDialogues,
  fairyGoodbyeDialogues
} from "../../npc/fairy";


class WeeCairScene extends Phaser.Scene {
  constructor() {
    super({
      key: "WeeCairScene",
      physics: { default: "arcade", arcade: { debug: false } }
    });
  }

  preload() {
    this.load.tilemapTiledJSON("weeCairMap", "/assets/maps/weeCairMap.json");
    this.load.image("weeCairBackground", "/assets/backgrounds/weecair/weecair.png");
    this.load.image("weeCairArch", "/assets/backgrounds/weecair/archway.png");

    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");

    this.load.image("fairy", "/assets/npc/fairy/fairy.png");
    this.load.image("fairySad", "/assets/npc/fairy/fairy-sad.PNG");
    this.load.image("fairyHappy", "/assets/npc/fairy/fairy-happy.PNG");
    this.load.image("fairyConfused", "/assets/npc/fairy/fairy-aaaa.PNG");
    this.load.image("bee", "/assets/npc/bee/bee-sad.png");

    this.load.image("talk", "/assets/interact/talk.png");
  }

  create() {
    // this.scene.launch("HUDScene");
   //  this.scene.bringToTop("HUDScene");

    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

    const map = this.make.tilemap({ key: "weeCairMap" });
    const collisionObjects = map.getObjectLayer("wee-cair-collisions");
    const collisionGroup = this.physics.add.staticGroup();
    const xOffset = -80;
    const yOffset = 0;

    if (collisionObjects) {
      collisionObjects.objects.forEach((obj) => {
        const solid = this.physics.add.staticImage(
          (obj.x + obj.width / 2) * scaleFactor + xOffset,
          (obj.y + obj.height / 2) * scaleFactor + yOffset
        )
          .setSize(obj.width * scaleFactor, obj.height * scaleFactor)
          .setOrigin(0.5);
        collisionGroup.add(solid);
      });
    }

    const char = this.physics.add.sprite(width / 2, 99, "defaultFront")
      .setScale(0.05)
      .setDepth(10)
      .setOrigin(-8, -0.5);

    char.setCollideWorldBounds(true);
    char.body.setSize(char.width * 0.6, char.height * 0.6);
    char.body.setOffset(char.width * 0.2, char.height * 0.2);

    const speed = 150;

    this.input.keyboard.on("keydown", (event) => {
      char.setVelocity(0);
      switch (event.key) {
        case "w": char.setVelocityY(-speed); char.setTexture("defaultBack"); break;
        case "s": char.setVelocityY(speed); char.setTexture("defaultFront"); break;
        case "a": char.setVelocityX(-speed); char.setTexture("defaultLeft"); break;
        case "d": char.setVelocityX(speed); char.setTexture("defaultRight"); break;
      }
    });

    this.input.keyboard.on("keyup", () => char.setVelocity(0));
    this.physics.add.collider(char, collisionGroup);

    this.add.image(width / 2, height / 2, "weeCairArch")
      .setScale(scaleFactor)
      .setOrigin(0.5)
      .setDepth(20);

    const talkIcon = this.add.image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(10)
      .setOrigin(0.5);

    const bee = createBee(this, width / 2 + 200, height / 2 + 100);
    const fairy = createFairy(this, width / 2 - 200, height / 2 + 100);

    [bee, fairy].forEach(npc => {
      npc.setInteractive();
      npc.on("pointerover", (pointer) => {
        talkIcon.setVisible(true);
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
      });
      npc.on("pointermove", (pointer) => {
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
      });
      npc.on("pointerout", () => {
        talkIcon.setVisible(false);
      });
    });

  
  this.dialogueSequence = [
  { lines: fairyIntroDialogues, imageKey: "fairySad" },
  { lines: beeIntroDialogues, imageKey: "bee" },
  { lines: fairyHelpDialogues, imageKey: "fairySad" },
  { lines: beePreDialogues, imageKey: "bee" },
  { lines: beePostDialogues, imageKey: "bee" },
  { lines: fairyGoodbyeDialogues, imageKey: "fairyHappy" }
];

this.currentSet = 0;
this.currentDialogueIndex = 0;
this.dialogueActive = false;

this.startDialogueSequence = () => {
  if (this.currentSet >= this.dialogueSequence.length) return;
  this.activeDialogue = this.dialogueSequence[this.currentSet].lines;
  this.activeImageKey = this.dialogueSequence[this.currentSet].imageKey;
  this.currentDialogueIndex = 0;
  this.dialogueActive = true;

  this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
    imageKey: this.activeImageKey
  });
};

this.input.on("pointerdown", () => {
  if (!this.dialogueActive) {
    this.startDialogueSequence(); // Start next set when ready
    return;
  }

  this.currentDialogueIndex++;

  if (this.currentDialogueIndex < this.activeDialogue.length) {
    this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
      imageKey: this.activeImageKey
    });
  } else {
    this.destroyDialogueUI();
    this.dialogueActive = false;
    this.currentSet++;

    // If done with all sets
    if (this.currentSet >= this.dialogueSequence.length) {
      this.showDialogue("What would you like to do?", {
        imageKey: "fairyHappy",
        options: [
          { label: "Go to the greenhouse", onSelect: () => this.scene.start("GreenhouseScene") },
          { label: "Stay here", onSelect: () => {/* optional idle state */} }
        ]
      });
    }
  }
});
  }
  
showDialogue(text, optionsConfig = {}) {
  this.destroyDialogueUI(); // Clean up old box before showing a new one
  this.dialogueBox = createTextBox(this, text, optionsConfig);
}

destroyDialogueUI() {

  if (this.dialogueBox) {
    this.dialogueBox.box?.destroy();
    this.dialogueBox.textObj?.destroy();
    this.dialogueBox.image?.destroy();
    if (this.dialogueBox.optionButtons) {
      this.dialogueBox.optionButtons.forEach(btn => btn.destroy());
    }
    this.dialogueBox = null;
  }
}
}

export default WeeCairScene;
