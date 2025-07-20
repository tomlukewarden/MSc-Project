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
import {addPlantToJournal} from "../journalManager";
import {inventoryManager} from "../inventoryManager";


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
    this.load.audio("click", "/assets/sound-effects/click.mp3");
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
    this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
  }

  create() {

    const craftBtnX = 120;
    const craftBtnY = 80;
    const craftBtnWidth = 140;
    const craftBtnHeight = 48;
    const craftBtnBg = this.add.rectangle(craftBtnX, craftBtnY, craftBtnWidth, craftBtnHeight, 0x3e7d3a, 0.95)
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });
    const craftBtnText = this.add.text(craftBtnX, craftBtnY, '🛠️ Craft', {
      fontFamily: 'Georgia',
      fontSize: '26px',
      color: '#fff',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#4caf50',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(101);

    craftBtnText.setInteractive({ useHandCursor: true });
    craftBtnText.on('pointerdown', () => {
      craftBtnBg.emit('pointerdown');
    });
    craftBtnBg.on('pointerover', () => {
      craftBtnBg.setFillStyle(0x4caf50, 0.98);
      craftBtnText.setColor('#ffffcc');
    });
    craftBtnBg.on('pointerout', () => {
      craftBtnBg.setFillStyle(0x3e7d3a, 0.95);
      craftBtnText.setColor('#fff');
    });
    craftBtnBg.on('pointerdown', () => {
      // Remove any existing CraftUI overlay
      if (this.craftUIOverlay) {
        this.craftUIOverlay.destroy(true);
        this.craftUIOverlay = null;
      }
      // Get inventory items (as objects)
      const items = inventoryManager.getItems ? inventoryManager.getItems() : [];
      // Center overlay
      const { width, height } = this.sys.game.config;
      // Dynamically import the CraftUI class
      import('../../components/craftUI').then(({ default: CraftUI }) => {
        this.craftUIOverlay = new CraftUI(this, width / 2, height / 2);
        this.craftUIOverlay.setDepth && this.craftUIOverlay.setDepth(200);
        // Set inventory items as ingredients (first 3 for demo)
        this.craftUIOverlay.setIngredients(items.slice(0, 3));
        // Optionally, you could allow drag/drop or selection logic here
        // Add a close button to the overlay
        const closeBtn = this.add.text(width / 2 + 140, height / 2 - 90, '✕', {
          fontFamily: 'Georgia',
          fontSize: '28px',
          color: '#a33',
          backgroundColor: '#fff5',
          padding: { left: 10, right: 10, top: 2, bottom: 2 }
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(201);
        closeBtn.on('pointerdown', () => {
          this.craftUIOverlay.destroy(true);
          closeBtn.destroy();
          this.craftUIOverlay = null;
        });
      });
    });
    this.scene.launch("ControlScene");
    // --- Launch HUD ---
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    // --- Map and background ---
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

    const map = this.make.tilemap({ key: "weeCairMap" });
    const collisionObjects = map.getObjectLayer("wee-cair-collisions");

    const xOffset = -160;
    const yOffset = 0;

    const collisionGroup = this.physics.add.staticGroup();

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

    // Pass collisionGroup to createMainChar
    const char = createMainChar(this, width, height, scaleFactor, collisionGroup);

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
                inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("foxglovePlant");

                showDialogue(this, "You hand her the plant...", {
                  imageKey: "bee"
                });

                coinManager.add(200);
                saveToLocal("coins", coinManager.coins);

                this.time.delayedCall(800, () => {
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
        if (this.activeDialogue === beeThanksDialogues && !this.springShardReceived) {
          receivedItem(this, "springShard", "Spring Shard");
          addPlantToJournal("springShard");
          this.springShardReceived = true;

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

      this.showStayOrGoOptions = () => {
        showOption(this, "What would you like to do?", {
          imageKey: "fairyHappy",
          options: [
            {
              label: "Go to the botanic gardens",
              onSelect: () => {
                this.scene.start("WallGardenScene");
              }
            },
            {
              label: "Stay here",
              onSelect: () => {
                this.activeDialogue = ["Come back when you're ready!"];
                this.activeImageKey = "fairyHappy";
                this.currentDialogueIndex = 0;
                this.dialogueActive = true;
                this.updateHUDState();
                showDialogue(this, this.activeDialogue[0], {
                  imageKey: this.activeImageKey,
                  onComplete: () => {
                    this.dialogueActive = false;
                    this.updateHUDState();
                    this.showStayOrGoOptions();
                  }
                });
              }
            }
          ]
        });
      };

      this.showStayOrGoOptions();
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
          this.dialogueSequence[justCompletedSet].lines === fairyHelpDialogues &&
          !this.foxglovePlantReceived
        ) {
          receivedItem(this, "foxglovePlant", "Foxglove");
          addPlantToJournal("foxglovePlant");
          this.foxglovePlantReceived = true;
        }
      }
    });

    // --- Responsive: Listen for resize events
    this.scale.on('resize', (gameSize) => {
      const char = createMainChar(this, width, height, collisionObjects, scaleFactor);      this.handleResize(gameSize);
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

  handleResize(gameSize) {
    if (this.dialogueBox && this.dialogueBox.box) {
      const { width, height } = gameSize;
      const boxWidth = Math.min(600, width * 0.8);
      const boxHeight = Math.min(220, height * 0.3);
      this.dialogueBox.box.setPosition(width / 2, height - boxHeight / 2 - 30);
      this.dialogueBox.box.setSize(boxWidth, boxHeight);
      if (this.dialogueBox.textObj) {
        this.dialogueBox.textObj.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      if (this.dialogueBox.image) {
        this.dialogueBox.image.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn, idx) => {
          btn.setPosition(width / 2, height - boxHeight / 2 + 40 + idx * 40);
        });
      }
    }
  }
}


export default WeeCairScene;