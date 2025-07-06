import Phaser from 'phaser';
import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, destroyDialogueUI, showOption } from '../../dialogue/dialogueUIHelpers';
import { CoinManager } from '../coinManager';
import { createMainChar } from '../../characters/mainChar';
import ChestLogic from '../chestLogic';
import ChestUI from '../chestUI';
import { saveToLocal } from '../../utils/localStorage';
import plantData from "../../plantData";
import { inventoryManager } from "../inventoryManager";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";


const coinManager = CoinManager.load();

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: true } } });
    this.chestLogic = new ChestLogic();
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.mainChar = null;
    this.transitioning = false;
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
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    
  }

  create() {
    this.scene.launch('HUDScene');
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- Map and background ---
    const map = this.make.tilemap({ key: "wallGardenMap" });
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

    // --- Place chest in the scene ---
    this.setupChest(width, height);

    // --- Main Character ---
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(1, -5);

    // --- Butterfly NPC ---
    this.setupButterfly(width, height);

    // --- Placeholder bushes: random rectangles ---
    this.setupBushes(width, height);

    this.input.on("pointerdown", () => {
      // Only advance/close if a dialogue is active and a completion callback is set
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
    });
  }

  setupChest(width, height) {
    const chestItemsArray = [
      { name: "Foxglove", color: 0xd9ae7e, key: "foxglovePlant" },
      { name: "Spring Shard", color: 0x88cc88, key: "springShard" }
    ];
    const chest = this.add.image(width / 2 + 200, height / 2 - 40, 'chestClosed')
      .setScale(2)
      .setDepth(15)
      .setInteractive();

    this.chestLogic.scene = this;
    this.chestLogic.setChest(chest);

    chest.on("pointerdown", () => {
      chest.setTexture('chestOpen');
      this.chestLogic.openChest(chestItemsArray);

      this.scene.get("ChestUI").events.once("shutdown", () => {
        chest.setTexture('chestClosed');
      });
    });
  }

  setupButterfly(width, height) {
    this.butterfly = createButterfly(this, width / 2 + 100, height / 2 - 50);
    this.butterfly.setDepth(20).setInteractive();

    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    this.butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
        } else {
          showOption(this, "Would you like to move on?", {
            imageKey: "butterfly",
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
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.", { imageKey: "butterflyHappy" });
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
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 300 },
      { x: 260, y: 400 },
      { x: 340, y: 250 },
      { x: 420, y: 350 }
    ];
    const bushCount = bushPositions.length;

    // Randomly pick which bush will have the periwinkle
    const periwinkleBushIndex = Phaser.Math.Between(0, bushCount - 1);
    let periwinkleFound = false;

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bushWidth = Phaser.Math.Between(40, 70);
      const bushHeight = Phaser.Math.Between(30, 50);
      const color = 0x3e7d3a;

      const bush = this.add.rectangle(x, y, bushWidth, bushHeight, color, 0.85)
        .setStrokeStyle(2, 0x245021)
        .setDepth(12)
        .setInteractive({ useHandCursor: true });

      bush.on("pointerdown", () => {
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState();

        if (i === periwinkleBushIndex && !periwinkleFound) {
          // Give periwinkle plant (after minigame)
          const periwinkle = plantData.find(p => p.key === "periwinklePlant");
          if (periwinkle) {
            showOption(
              this,
              "You found a Periwinkle plant hidden in the bush... But a cheeky little animal is trying to steal it!",
              {
                options: [
                  {
                    label: "Play a game to win it!",
                    callback: () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState();
                      this.dialogueOnComplete = null;
                      this.scene.launch("MiniGameScene", {
                        onWin: () => {
                          this.scene.stop("MiniGameScene");
                          this.dialogueActive = true;
                          this.updateHUDState();
                          receivedItem(this, periwinkle.key, periwinkle.name);
                          inventoryManager.addItem(periwinkle);
                          addPlantToJournal(periwinkle.key);
                          showDialogue(this,
                            "You won the game! The animal reluctantly gives you the Periwinkle plant.",
                            { imageKey: periwinkle.imageKey }
                          );
                          periwinkleFound = true;
                          this.dialogueOnComplete = () => {
                            this.destroyDialogueUI();
                            this.dialogueActive = false;
                            this.updateHUDState();
                            this.dialogueOnComplete = null;
                          };
                        }
                      });
                      this.scene.pause();
                    }
                  },
                  {
                    label: "Try again later",
                    callback: () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState();
                      this.dialogueOnComplete = null;
                    }
                  }
                ],
                imageKey: periwinkle.imageKey
              }
            );
          } else {
            showDialogue(this, "You found a rare plant, but its data is missing!", {});
            this.dialogueOnComplete = () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
            };
          }
          // periwinkleFound is set only after winning the minigame!
        } else {
          // Give coins
          const coins = Phaser.Math.Between(10, 30);
          coinManager.add(coins);
          saveToLocal("coins", coinManager.coins);
          receivedItem(this, "coin", `${coins} Coins`, { scale: 0.15 });
          showDialogue(this, `You found ${coins} coins hidden in the bush!`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState();
            this.dialogueOnComplete = null;
          };
        }
      });
    }
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 90;

    if (this.mainChar) {
      // Right edge
      if (this.mainChar.x >= rightEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("MiddleGardenScene");
      }
      // Left edge
      if (this.mainChar.x <= leftEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("GreenhouseScene");
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