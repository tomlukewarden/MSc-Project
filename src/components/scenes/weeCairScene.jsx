import Phaser from "phaser";
import { createTextBox } from "../../dialogue/dialogueManager";
import {
  createBee,
  beeIntroDialogue,
  beePreDiaglogue,
  beePostDiaglogue
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
    // Map + Background
    this.load.tilemapTiledJSON("weeCairMap", "/assets/maps/weeCairMap.json");
    this.load.image("weeCairBackground", "/assets/backgrounds/weecair/weecair.png");
    this.load.image("weeCairArch", "/assets/backgrounds/weecair/archway.png");

    // Player
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");

    // NPCs
    this.load.image("fairy", "/assets/npc/fairy/fairy.png");
    this.load.image("bee", "/assets/npc/bee/bee-sad.png");

    // UI
    this.load.image("talk", "/assets/interact/talk.png");
  }

  create() {
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // Background
    this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

    // Map collisions
    const map = this.make.tilemap({ key: "weeCairMap" });
    const collisionObjects = map.getObjectLayer("wee-cair-collisions");

    const collisionGroup = this.physics.add.staticGroup();
    const xOffset = -80;
    const yOffset = 0;

    if (collisionObjects) {
      collisionObjects.objects.forEach((obj) => {
        const centerX = (obj.x + obj.width / 2) * scaleFactor + xOffset;
        const centerY = (obj.y + obj.height / 2) * scaleFactor + yOffset;
        const solid = this.physics.add.staticImage(centerX, centerY)
          .setSize(obj.width * scaleFactor, obj.height * scaleFactor)
          .setOrigin(0.5);
        collisionGroup.add(solid);
      });
    }

    // Player setup
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

    // Archway
    this.add.image(width / 2, height / 2, "weeCairArch")
      .setScale(scaleFactor)
      .setOrigin(0.5)
      .setDepth(20);

    // Talk icon (optional for later)
    const talkIcon = this.add.image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(10);

    // NPCs
    const bee = createBee(this, width / 2 + 200, height / 2 + 100);
    const fairy = createFairy(this, width / 2 - 200, height / 2 + 100);

    // Dialogue setup
    this.dialogueActive = false;
    this.currentDialogueSet = 0;
    this.currentDialogueIndex = 0;

    this.fairyDialogues = [
      fairyIntroDialogues,
      fairyHelpDialogues,
      fairyGoodbyeDialogues
    ];

    this.beeDialogues = {
      intro: beeIntroDialogue,
      pre: beePreDiaglogue,
      post: beePostDiaglogue
    };

    this.input.on("pointerdown", (pointer) => {
      if (this.dialogueActive) return;

      if (fairy?.getBounds().contains(pointer.x, pointer.y)) {
        this.startFairyDialogue();
      }

      if (bee?.getBounds().contains(pointer.x, pointer.y)) {
        this.startBeeDialogue();
      }
    });
  }

  startFairyDialogue() {
    this.dialogueActive = true;
    this.scene.sleep("HUDScene");
    this.currentDialogueIndex = 0;
    this.activeDialogue = this.fairyDialogues[this.currentDialogueSet] || [];

    this.showFairyDialogue(this.activeDialogue[this.currentDialogueIndex]);
  }

  startBeeDialogue() {
    this.dialogueActive = true;
    this.scene.sleep("HUDScene");
    this.currentDialogueIndex = 0;
    this.activeDialogue = this.beeDialogues.intro || [];

    this.showDialogue(this.activeDialogue[this.currentDialogueIndex]);
  }

  showDialogue(text) {
    createTextBox(this, text, () => {
      this.dialogueActive = false;
      this.scene.wake("HUDScene");
    });
  }

  showFairyDialogue(text) {
    createTextBox(this, text, () => {
      this.dialogueActive = false;
      this.scene.wake("HUDScene");

      // Advance to next dialogue set
      if (this.currentDialogueSet < this.fairyDialogues.length - 1) {
        this.currentDialogueSet++;
      }
    });
  }
}

export default WeeCairScene;
