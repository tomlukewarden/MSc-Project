import Phaser from "phaser";
import { createTextBox } from "../../dialogue/createTextbox";
import { createOptionBox } from "../../dialogue/createOptionBox";
import {
  createBee,
  beeIntroDialogues,
  beeThanksDialogues
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
      physics: {
        default: "arcade",
        arcade: { debug: false }
      }
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
    this.load.image("beeHappy", "/assets/npc/bee/bee-happy.png");
    
    this.load.image("talk", "/assets/interact/talk.png");

    this.load.image("foxglovePlant", "/assets/plants/foxglove.png");
  }

  create() {

    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

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
        const solid = this.physics.add
          .staticImage(
            (obj.x + obj.width / 2) * scaleFactor + xOffset,
            (obj.y + obj.height / 2) * scaleFactor + yOffset
          )
          .setSize(obj.width * scaleFactor, obj.height * scaleFactor)
          .setOrigin(0.5);
        collisionGroup.add(solid);
      });
    }

    const char = this.physics.add
      .sprite(width / 2, 99, "defaultFront")
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
        case "w":
          char.setVelocityY(-speed);
          char.setTexture("defaultBack");
          break;
        case "s":
          char.setVelocityY(speed);
          char.setTexture("defaultFront");
          break;
        case "a":
          char.setVelocityX(-speed);
          char.setTexture("defaultLeft");
          break;
        case "d":
          char.setVelocityX(speed);
          char.setTexture("defaultRight");
          break;
      }
    });

    this.input.keyboard.on("keyup", () => char.setVelocity(0));
    this.physics.add.collider(char, collisionGroup);

    this.add
      .image(width / 2, height / 2, "weeCairArch")
      .setScale(scaleFactor)
      .setOrigin(0.5)
      .setDepth(20);

    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(10)
      .setOrigin(0.5);

    const bee = createBee(this, width / 2 + 200, height / 2 + 100);
    const fairy = createFairy(this, width / 2 - 200, height / 2 + 100);

    [bee, fairy].forEach((npc) => {
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
      { lines: beeThanksDialogues, imageKey: "beeHappy" },
      { lines: fairyGoodbyeDialogues, imageKey: "fairyHappy" }
    ];

    this.currentSet = 0;
    this.currentDialogueIndex = 0;
    this.dialogueActive = false;
    this.currentNPC = null;
    this.foxglovePlantReceived = false;

    this.startDialogueSequence = () => {
      if (this.currentSet >= this.dialogueSequence.length) return;
      this.activeDialogue = this.dialogueSequence[this.currentSet].lines;
      this.activeImageKey = this.dialogueSequence[this.currentSet].imageKey;
      this.currentDialogueIndex = 0;
      this.dialogueActive = true;
      this.updateHUDState();
      const isFinalLine =
  this.activeDialogue === fairyHelpDialogues &&
  this.currentDialogueIndex === this.activeDialogue.length - 1;

this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
  imageKey: this.activeImageKey
});

if (isFinalLine) {
  this.time.delayedCall(2000, () => {
    this.destroyDialogueUI();
    this.dialogueActive = false;
    this.updateHUDState();
    this.currentSet++;
    this.currentNPC = null;

    this.receivedItem("foxglovePlant", "Foxglove");
  });
}

    };

    fairy.on("pointerdown", () => {
      const currentImage = this.dialogueSequence[this.currentSet]?.imageKey;
      if (
        !this.dialogueActive &&
        (currentImage === "fairySad" || currentImage === "fairyHappy")
      ) {
        this.currentNPC = fairy;
        this.startDialogueSequence();
      }
    });

bee.on("pointerdown", () => {
  const currentImage = this.dialogueSequence[this.currentSet]?.imageKey;

  if (this.dialogueActive && currentImage === "bee") {

    if (this.dialogueBox?.optionButtons?.length > 0) return;

    this.currentDialogueIndex++;

    if (this.currentDialogueIndex < this.activeDialogue.length) {
      this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
        imageKey: this.activeImageKey
      });
    } else {
      this.destroyDialogueUI();
      this.dialogueActive = false;
      this.updateHUDState();
      this.currentSet++;
      this.currentNPC = null;

      const justCompletedSet = this.currentSet - 1;

      if (
        this.dialogueSequence[justCompletedSet] &&
        this.dialogueSequence[justCompletedSet].lines === fairyHelpDialogues
      ) {
       this.receivedItem("foxglovePlant", "Foxglove");
      }

      if (this.currentSet >= this.dialogueSequence.length) {
        this.showOption("What would you like to do?", {
          imageKey: "fairyHappy",
          options: [
            {
              label: "Go to the greenhouse",
              onSelect: () => {
                this.scene.start("GreenhouseScene");
              }
            },
            {
              label: "Stay here",
              onSelect: () => {
                this.showDialogue("You decide to wait a bit longer...");
              }
            }
          ]
        });
      }
    }

    return;
  }

  if (this.foxglovePlantReceived) {
    this.dialogueActive = true;
    this.updateHUDState();
    this.showOption("Give Paula the Foxglove?", {
      imageKey: "bee",
      options: [
        {
          label: "Yes",
          onSelect: () => {
            this.hasMadeFoxgloveChoice = true;
            this.destroyDialogueUI();
            this.dialogueActive = true;
            this.foxgloveReceived = true;

            this.showDialogue("You hand her the plant...", {
              imageKey: "bee"
            });

            this.time.delayedCall(800, () => {
              this.activeDialogue = beeThanksDialogues;
              this.activeImageKey = "bee";
              this.currentDialogueIndex = 0;
              this.dialogueActive = true;
              this.updateHUDState();
              this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
                imageKey: this.activeImageKey
              });
            });
          }
        },
        {
          label: "No",
          onSelect: () => {
            this.destroyDialogueUI();
            this.dialogueActive = true;
            this.showDialogue("You decide to hold off for now.", {
              imageKey: "bee"
            });
          }
        }
      ]
    });
    return;
  }
  if (!this.dialogueActive && currentImage === "bee") {
    this.currentNPC = bee;
    this.startDialogueSequence();
  }
});


   this.input.on("pointerdown", (pointer, gameObjects) => {
  if (!this.dialogueActive) return;
  if (this.dialogueBox?.optionButtons?.length > 0) return;

  this.currentDialogueIndex++;

  if (this.currentDialogueIndex < this.activeDialogue.length) {
    this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
      imageKey: this.activeImageKey
    });
  } else {
    this.destroyDialogueUI();
    this.dialogueActive = false;
    this.updateHUDState();
    this.currentSet++;
    this.currentNPC = null;

    const justCompletedSet = this.currentSet - 1;

    if (
      this.dialogueSequence[justCompletedSet] &&
      this.dialogueSequence[justCompletedSet].lines === fairyHelpDialogues
    ) {
      this.receivedItem("foxglovePlant", "Foxglove");
    }

    if (this.currentSet >= this.dialogueSequence.length) {
      this.showOption("What would you like to do?", {
        imageKey: "fairyHappy",
        options: [
          {
            label: "Go to the greenhouse",
            onSelect: () => {
              this.scene.start("GreenhouseScene");
            }
          },
          {
            label: "Stay here",
            onSelect: () => {
              this.showDialogue("You decide to wait a bit longer...");
            }
          }
        ]
      });
    }
  }
});
  }

  receivedItem(itemKey, itemName, options = {}) {
  if (!itemKey || !itemName) {
    console.warn("receivedItem called without itemKey or itemName");
    return;
  }
  const { width, height } = this.sys.game.config;
  const scale = options.scale || 0.1;
  const borderPadding = options.borderPadding || 20;
  const borderColor = options.borderColor || 0x88cc88;
  const textColor = options.textColor || "#ffffff";

  const itemTexture = this.textures.get(itemKey).getSourceImage();
  const itemWidth = itemTexture.width * scale;
  const itemHeight = itemTexture.height * scale;

  const container = this.add.container(width / 2, height / 2).setDepth(103);

  const border = this.add
    .rectangle(0, 0, itemWidth + borderPadding, itemHeight + borderPadding, 0xffffff)
    .setStrokeStyle(2, borderColor);

  const itemImage = this.add
    .image(0, 0, itemKey)
    .setScale(scale)


  const topLabel = this.add
    .text(0, -(itemHeight / 2) - borderPadding / 2 - 20, "You Received:", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: textColor,
      align: "center"
    })
    .setOrigin(0.5);

  const bottomLabel = this.add
    .text(0, itemHeight / 2 + borderPadding / 2 + 12, itemName, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: textColor,
      align: "center"
    })
    .setOrigin(0.5);

  container.add([border, itemImage, topLabel, bottomLabel]);
  console.log(`Received item: ${itemKey}`);

  this[`${itemKey}Received`] = true;

  this.time.delayedCall(3000, () => {
    this.tweens.add({
      targets: container,
      alpha: 0,
      duration: 500,
      onComplete: () => container.destroy()
    });
  });
}


  showDialogue(text, optionsConfig = {}) {
    this.destroyDialogueUI();
    this.dialogueBox = createTextBox(this, text, optionsConfig);
  }

  showOption(text, config = {}) {
    this.destroyDialogueUI();
    this.dialogueBox = createOptionBox(this, text, config);
  }


  updateHUDState() {
    if (this.dialogueActive) {
      this.scene.sleep("HUDScene");
    } else {
      this.scene.wake("HUDScene");
    }
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn) => btn.destroy());
      }
      this.dialogueBox = null;
    }
  }
}

export default WeeCairScene;
