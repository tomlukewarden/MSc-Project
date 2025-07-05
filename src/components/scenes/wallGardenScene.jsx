import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, destroyDialogueUI, showOption } from '../../dialogue/dialogueUIHelpers';
import { CoinManager } from '../coinManager';
import { createMainChar } from '../../characters/mainChar';
import ChestLogic from '../chestLogic';
import ChestUI from '../chestUI'; // <-- Import your ChestUI scene
import { saveToLocal } from '../../utils/localStorage';
import Phaser from 'phaser';

const coinManager = CoinManager.load();

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: true } } });
    this.chestLogic = new ChestLogic();
  }

  preload() {
    this.load.tilemapTiledJSON("wallGardenMap", "/assets/maps/wallGardenMap.json");
    this.load.image('wall1', '/assets/backgrounds/wallGarden/wall1.png');
    this.load.image('wall2', '/assets/backgrounds/wallGarden/wall2.png');
    this.load.image('trees', '/assets/backgrounds/wallGarden/trees.png');
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('talkIcon', '/assets/interact/talk.png');
    this.load.image('chestClosed', '/assets/misc/chest-closed.png');
    this.load.image('chestOpen', '/assets/misc/chest-open.png');
    this.load.image("foxglovePlant", "/assets/plants/foxglove.png");
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.audio("click", "/assets/sound-effects/click.mp3");
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
  }

  create() {
    this.scene.launch('HUDScene');
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- Map and background ---
    const map = this.make.tilemap({ key: "wallGardenMap" });

    // Add image layers in correct order
    this.add.image(width / 2, height / 2, "wallGardenBackground").setScale(scaleFactor).setDepth(0);
    this.add.image(width / 2, height / 2, "wall1").setScale(scaleFactor).setDepth(9);
    this.add.image(width / 2, height / 2, "wall2").setScale(scaleFactor).setDepth(103);
    this.add.image(width / 2, height / 2, "trees").setScale(scaleFactor).setDepth(10);

    // --- Collision objects from the object layer ---
    const collisionGroup = this.physics.add.staticGroup();
    const collisionObjects = map.getObjectLayer && map.getObjectLayer("wall-garden-collision");
    const xOffset = -160;
    const yOffset = 0;

    if (collisionObjects && collisionObjects.objects) {
      collisionObjects.objects.forEach((obj) => {
        const hasCollisionProp = obj.properties && obj.properties.some(
          (prop) => prop.name === "collision" && prop.value === true
        );
        if (!hasCollisionProp) return;

        const solid = this.add.rectangle(
          (obj.x + obj.width / 2) * scaleFactor + xOffset,
          (obj.y + obj.height / 2) * scaleFactor + yOffset,
          obj.width * scaleFactor,
          obj.height * scaleFactor,
          0xff0000,
          0.3
        );
        this.physics.add.existing(solid, true);
        collisionGroup.add(solid);
      });
    }


    // Place chest in the scene
    const chestItemsArray = [
      { name: "Foxglove", color: 0xd9ae7e, key: "foxglovePlant" },
      { name: "Spring Shard", color: 0x88cc88, key: "springShard" }
    ];
    const chest = this.add.image(width / 2 + 200, height / 2 - 40 , 'chestClosed')
      .setScale(2)
      .setDepth(15);
    chest.setInteractive();

    this.chestLogic.scene = this; 
    this.chestLogic.setChest(chest);

    // Open chest on click
    chest.on("pointerdown", () => {
      chest.setTexture('chestOpen');
      this.chestLogic.openChest(chestItemsArray);

      this.scene.get("ChestUI").events.once("shutdown", () => {
        chest.setTexture('chestClosed');
      });
    });

    // --- Main Character ---
    const mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    mainChar.setDepth(10).setOrigin(1, -5);
    this.mainChar = mainChar; 

    // --- Butterfly NPC ---
    const butterfly = createButterfly(this, width / 2 + 100, height / 2 - 50);
    butterfly.setDepth(20);

    // --- Dialogue state ---
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    butterfly.setInteractive();
    butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex]);
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex]);
        } else {
          // At the end, offer to move on
          showOption(this, "Would you like to move on?", {
            options: [
              {
                text: "Yes",
                callback: () => {
                  this.destroyDialogueUI();
                  this.butterflyDialogueActive = false;
                  this.scene.start("ShardGardenScene");
                }
              },
              {
                text: "No",
                callback: () => {
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.");
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.butterflyDialogueActive = false;
                  };
                }
              }
            ]
          });
        }
      };
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
      if (!this.butterflyDialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;
      if (this.dialogueOnComplete) {
        this.dialogueOnComplete();
      }
    });
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 90; 

    if (this.mainChar) {

      console.log("mainChar.x:", this.mainChar.x);

      // Right edge
      if (this.mainChar.x >= rightEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("ShardGardenScene");
        }
      }
      // Left edge (adjust for origin if needed)
      if (this.mainChar.x <= leftEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("GreenhouseScene");
        }
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

export default WallGardenScene;