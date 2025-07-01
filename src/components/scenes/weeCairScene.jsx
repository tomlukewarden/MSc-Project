import Phaser from "phaser";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import {
  createBee,
  beeIntroDialogues,
  beeThanksDialogues
} from "../../characters/bee";
import {
  createFairy,
  fairyIntroDialogues,
  fairyHelpDialogues,
  fairyGoodbyeDialogues
} from "../../characters/fairy";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";
import { receivedItem } from "../../components/recievedItem";

const coinManager = CoinManager.load();

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
    this.load.image("beeHappy", "/assets/npc/bee/bee-happy.png");
    this.load.image("talk", "/assets/interact/talk.png");
    this.load.image("foxglovePlant", "/assets/plants/foxglove.png");
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.audio("click", "/assets/sound-effects/click.mp3")
  }

  create() {
    // --- Launch HUD ---
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    // --- Map and background ---
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

    const map = this.make.tilemap({ key: "weeCairMap" });
    const collisionObjects = map.getObjectLayer("wee-cair-collisions");
    const collisionGroup = this.physics.add.staticGroup();

    const xOffset = -160;
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

    const char = createMainChar(this, width, height, collisionObjects, scaleFactor);

    this.add
      .image(width / 2, height / 2, "weeCairArch")
      .setScale(scaleFactor)
      .setOrigin(0.5)
      .setDepth(20);

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(10)
      .setOrigin(0.5);

    // --- NPCs ---
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

    // --- Dialogue sequence ---
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
    this.springShardReceived = false;
    this.hasMadeFoxgloveChoice = false;

    // --- Start dialogue sequence ---
    this.startDialogueSequence = () => {
      if (this.currentSet >= this.dialogueSequence.length) return;
      this.activeDialogue = this.dialogueSequence[this.currentSet].lines;
      this.activeImageKey = this.dialogueSequence[this.currentSet].imageKey;
      this.currentDialogueIndex = 0;
      this.dialogueActive = true;
      this.updateHUDState();
      showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
        imageKey: this.activeImageKey
      });
    };

    // --- Fairy click handler ---
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

    // --- Bee click handler ---
    bee.on("pointerdown", () => {
      const currentImage = this.dialogueSequence[this.currentSet]?.imageKey;

      // If player has foxglove, offer to give it to Paula (the bee)
      if (this.foxglovePlantReceived && !this.hasMadeFoxgloveChoice) {
        this.dialogueActive = true;
        this.updateHUDState();
        showOption(this, "Give Paula the Foxglove?", {
          imageKey: "bee",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeFoxgloveChoice = true;
                destroyDialogueUI(this);
                this.dialogueActive = true;
                this.foxglovePlantReceived = false;

                showDialogue(this, "You hand her the plant...", {
                  imageKey: "bee"
                });

                coinManager.add(200);
                saveToLocal("coins", coinManager.coins);

                this.time.delayedCall(800, () => {
                  // Set currentSet to beeThanksDialogues index so pointerdown handler works
                  this.currentSet = this.dialogueSequence.findIndex(
                    (set) => set.lines === beeThanksDialogues
                  );
                  this.activeDialogue = beeThanksDialogues;
                  this.activeImageKey = "bee";
                  this.currentDialogueIndex = 0;
                  this.dialogueActive = true;
                  this.updateHUDState();
                  showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
                    imageKey: this.activeImageKey
                  });
                });
              }
            },
            {
              label: "No",
              onSelect: () => {
                destroyDialogueUI(this);
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", {
                  imageKey: "bee"
                });
              }
            }
          ]
        });
        return;
      }

      // Only start bee dialogue if not already active and it's a bee set
      if (!this.dialogueActive && (currentImage === "bee" || currentImage === "beeHappy")) {
        this.currentNPC = bee;
        this.startDialogueSequence();
      }
    });

    // --- Pointerdown handler for advancing dialogue ---
    this.input.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.5 });
      if (!this.dialogueActive || !this.activeDialogue) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.currentDialogueIndex++;

      if (this.currentDialogueIndex < this.activeDialogue.length) {
        showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
          imageKey: this.activeImageKey
        });
      } else {
        // --- After beeThanksDialogues, receive spring shard ---
        if (this.activeDialogue === beeThanksDialogues) {
          receivedItem(this, "springShard", "Spring Shard");

          this.time.delayedCall(1000, () => {
            this.activeDialogue = fairyGoodbyeDialogues;
            this.activeImageKey = "fairyHappy";
            this.currentDialogueIndex = 0;
            this.dialogueActive = true;
            showDialogue(this, this.activeDialogue[this.currentDialogueIndex], { imageKey: this.activeImageKey });
          });
          return;
        }

        // --- After fairyGoodbyeDialogues, show options ---
        if (this.activeDialogue === fairyGoodbyeDialogues) {
          destroyDialogueUI(this);
          this.dialogueActive = false;
          this.updateHUDState();

          showOption(this, "What would you like to do?", {
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
                  destroyDialogueUI(this);
                  this.dialogueActive = true;
                  this.updateHUDState();
                  showDialogue(this, "You decide to wait a bit longer...");
                }
              }
            ]
          });
          return;
        }

        // --- Normal sequence advancement ---
        destroyDialogueUI(this);
        this.dialogueActive = false;
        this.updateHUDState();
        this.currentSet++;
        this.currentNPC = null;

        // --- After fairyHelpDialogues, receive foxglove ---
        const justCompletedSet = this.currentSet - 1;
        if (
          this.dialogueSequence[justCompletedSet] &&
          this.dialogueSequence[justCompletedSet].lines === fairyHelpDialogues
        ) {
          receivedItem(this, "foxglovePlant", "Foxglove");
          this.foxglovePlantReceived = true;
        }
      }
    });

    // --- Responsive: Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }
  // --- Responsive resize handler ---
  handleResize(gameSize) {
    if (this.dialogueBox && this.dialogueBox.box) {
      const { width, height } = gameSize;
      const boxWidth = Math.min(600, width * 0.8);
      const boxHeight = Math.min(220, height * 0.3);
      this.dialogueBox.box.setPosition(width / 2, height - boxHeight / 2 - 30);
      this.dialogueBox.box.setSize(boxWidth, boxHeight);
      // Also reposition text/image if needed
      if (this.dialogueBox.textObj) {
        this.dialogueBox.textObj.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      if (this.dialogueBox.image) {
        this.dialogueBox.image.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      // Option buttons: reposition as needed
      if (this.dialogueBox.optionButtons) {
        // Example: stack vertically under the box
        this.dialogueBox.optionButtons.forEach((btn, idx) => {
          btn.setPosition(width / 2, height - boxHeight / 2 + 40 + idx * 40);
        });
      }
    }
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
