import Phaser from "phaser";
import { createTextBox } from "../../dialogue/createTextbox";
import { createOptionBox } from "../../dialogue/createOptionBox";
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
      this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
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
        this.showOption("Give Paula the Foxglove?", {
          imageKey: "bee",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeFoxgloveChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.foxglovePlantReceived = false;

                this.showDialogue("You hand her the plant...", {
                  imageKey: "bee"
                });                onSelect: () => {
                    coinManager.add(200);
                    saveToLocal("coins", coinManager.coins); // <-- always save after changing coins
          
                }

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

      // Only start bee dialogue if not already active and it's a bee set
      if (!this.dialogueActive && (currentImage === "bee" || currentImage === "beeHappy")) {
        this.currentNPC = bee;
        this.startDialogueSequence();
      }
    });

    // --- Pointerdown handler for advancing dialogue ---
    this.input.on("pointerdown", () => {
      if (!this.dialogueActive || !this.activeDialogue) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.currentDialogueIndex++;

      if (this.currentDialogueIndex < this.activeDialogue.length) {
        this.showDialogue(this.activeDialogue[this.currentDialogueIndex], {
          imageKey: this.activeImageKey
        });
      } else {
        // Special case: just finished beeThanksDialogues
        if (this.activeDialogue === beeThanksDialogues) {
          this.receivedItem("springShard", "Spring Shard");

          // Delay before starting fairyGoodbyeDialogues
          this.time.delayedCall(1000, () => {
            this.activeDialogue = fairyGoodbyeDialogues;
            this.activeImageKey = "fairyHappy";
            this.currentDialogueIndex = 0;
            this.dialogueActive = true;
            this.showDialogue(this.activeDialogue[this.currentDialogueIndex], { imageKey: this.activeImageKey });
          });

          return;
        }

        // Special case: just finished fairyGoodbyeDialogues
        if (this.activeDialogue === fairyGoodbyeDialogues) {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();

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
                  this.destroyDialogueUI();
                  this.dialogueActive = true;
                  this.updateHUDState();
                  this.showDialogue("You decide to wait a bit longer...");
                }
              }
            ]
          });
          return;
        }

        // Normal sequence advancement
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
      }
    });

    // --- Responsive: Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  // --- Responsive dialogue UI helpers ---
  showDialogue(text, optionsConfig = {}) {
    this.destroyDialogueUI();
    // Use responsive width/height for the dialogue box
    const { width, height } = this.scale;
    const boxWidth = Math.min(600, width * 0.8);
    const boxHeight = Math.min(180, height * 0.25);

    // Pass boxWidth/boxHeight to your createTextBox if it supports sizing
    this.dialogueBox = createTextBox(this, text, {
      ...optionsConfig,
      boxWidth,
      boxHeight,
      x: width / 2,
      y: height - boxHeight / 2 - 30
    });
    this.dialogueActive = true;
    this.updateHUDState();
  }

  showOption(text, config = {}) {
    this.destroyDialogueUI();
    // Use responsive width/height for the option box
    const { width, height } = this.scale;
    const boxWidth = Math.min(600, width * 0.8);
    const boxHeight = Math.min(220, height * 0.3);

    // Pass boxWidth/boxHeight to your createOptionBox if it supports sizing
    this.dialogueBox = createOptionBox(this, text, {
      ...config,
      boxWidth,
      boxHeight,
      x: width / 2,
      y: height - boxHeight / 2 - 30
    });
    this.dialogueActive = true;
    this.updateHUDState();
  }

  // --- Responsive resize handler ---
  handleResize(gameSize) {
    // Reposition or resize UI elements as needed
    // For example, if you have a dialogue box open:
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

  // --- Item received popup ---
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
      .setScale(scale);

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

    // --- COIN MANAGER LOGIC ---
    if (itemKey === "springShard") {
      coinManager.add(200); 
      saveToLocal("coins", coinManager.coins);
    }

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
