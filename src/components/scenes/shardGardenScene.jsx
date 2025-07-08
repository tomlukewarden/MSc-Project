import { createButterfly, butterflyPillarDialogues, butterflyShardDialogues, butterflyGoodbyeDialogues } from "../../characters/butterfly";
import { createMainChar } from "../../characters/mainChar";
import { CoinManager } from "../coinManager";
import { saveToLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import {shardLogic} from "../shardLogic";
import { inventoryManager } from "../openInventory";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";

class ShardGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShardGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.dialogueActive = false;
    this.dialogueBox = null;
    this.dialogueStage = 0;
    this.activeDialogue = [];
    this.activeDialogueIndex = 0;
    this.shardCounts = {
      spring: 3,
      summer: 1,
      autumn: 1,
      winter: 1
    };
    this.winDialogueActive = false;
  }

  preload() {
    this.load.image('shardBackground', '/assets/backgrounds/shardGarden/shardBackground.png');
    this.load.image('folliage', '/assets/backgrounds/shardGarden/folliage.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
    this.load.image("elephant", "/assets/npc/elephant/elephant.png");
    this.load.image('spring', '/assets/backgrounds/shardGarden/spring/sad.png');
    this.load.image('summer', '/assets/backgrounds/shardGarden/summer/sad.png');
    this.load.image('autumn', '/assets/backgrounds/shardGarden/autumn/sad.png');
    this.load.image('winter', '/assets/backgrounds/shardGarden/winter/sad.png');
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
  }

  create() {
    this.scene.launch("HUDScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    this.add.image(width / 2, height / 2, "shardBackground").setScale(scaleFactor);
    const foliageImg = this.add.image(width / 2, height / 2, "folliage").setScale(scaleFactor);

    const collisionGroup = this.physics.add.staticGroup();

    const foliageRect = this.add.rectangle(
      width / 2,
      height / 2,
      foliageImg.width * scaleFactor,
      foliageImg.height * scaleFactor,
      0x00ff00,
      0.2
    ).setDepth(1);
    this.physics.add.existing(foliageRect, true);
    collisionGroup.add(foliageRect);

    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonScale = 0.09;
    const spacing = 800 * scaleFactor;
    const startX = width / 2 - ((seasons.length - 1) * spacing) / 2;
    const y = height * scaleFactor + 100;

    seasons.forEach((season, i) => {
      const seasonImg = this.add.image(startX + i * spacing, y, season)
        .setScale(seasonScale)
        .setDepth(10)
        .setInteractive({ useHandCursor: true });

      seasonImg.on("pointerover", () => seasonImg.setTint(0x88ccff));
      seasonImg.on("pointerout", () => seasonImg.clearTint());
      seasonImg.on("pointerup", () => {
        const shardKey = season + "Shard";
        const hasShard = inventoryManager.hasItem && inventoryManager.hasItem(shardKey);
        if (hasShard) {
          if (this.shardCounts[season] > 0) {
            this.shardCounts[season]--;
            inventoryManager.removeItem && inventoryManager.removeItem(shardKey);
            showDialogue(this, `You returned a ${season} shard! (${this.shardCounts[season]} left)`);
            shardLogic(this);
          } else {
            showDialogue(this, `No ${season} shards left to return!`);
          }
        } else {
          showDialogue(this, `You don't have a ${season} shard in your inventory.`,  { imageKey: {shardKey} }); ;
        }
        this.updateHUDState();
      });
    });

    // 🧍 Main Character
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(0.5, 0.5);

    // 🦋 Butterfly setup
    const butterfly = createButterfly(this, width / 2, height / 2);
    butterfly.setScale(0.09).setOrigin(0.5, 0.5).setDepth(20).setInteractive();

    this.dialogueStage = 0;
    this.setActiveDialogue();

    butterfly.on("pointerdown", () => {
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.activeDialogueIndex = 0;
      showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey: "butterflyHappy" });
      this.updateHUDState();
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
      if (!this.dialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;
      this.activeDialogueIndex++;
      if (this.activeDialogueIndex < this.activeDialogue.length) {
        showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey: "butterflyHappy" });
      } else {
        this.dialogueActive = false;
        this.updateHUDState();
        this.destroyDialogueUI();
        if (this.dialogueStage < 2) {
          this.dialogueStage++;
          this.setActiveDialogue();
        }
      }
    });

    // Add bushes with periwinkle and coins
    this.setupBushes(width, height);
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 50;

    if (this.mainChar && this.mainChar.x <= leftEdge && !this.transitioning) {
      this.transitioning = true;
      this.scene.start("MiddleGardenScene");
    }
  }

  setActiveDialogue() {
    if (this.dialogueStage === 0) {
      this.activeDialogue = butterflyPillarDialogues;
    } else if (this.dialogueStage === 1) {
      this.activeDialogue = butterflyShardDialogues;
    } else {
      this.activeDialogue = butterflyGoodbyeDialogues;
    }
    this.activeDialogueIndex = 0;
  }

  updateHUDState() {
    this.scene[this.dialogueActive ? 'sleep' : 'wake']("HUDScene");
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      this.dialogueBox.optionButtons?.forEach((btn) => btn.destroy());
      this.dialogueBox = null;
    }
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 300 },
      { x: 260, y: 400 },
      { x: 340, y: 250 },
      { x: 420, y: 350 }
    ];
    const bushCount = bushPositions.length;
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
        this.updateHUDState && this.updateHUDState();
        if (i === periwinkleBushIndex && !periwinkleFound) {
          let periwinkle = null;
          if (typeof plantData !== 'undefined' && Array.isArray(plantData)) {
            periwinkle = plantData.find(p => p.key === "periwinklePlant");
          }
          if (!periwinkle) {
            periwinkle = { name: "Periwinkle", key: "periwinklePlant", imageKey: "periwinklePlant" };
          }
          showOption(
            this,
            "You found a Periwinkle plant hidden in the bush... But a cheeky little animal is trying to steal it!",
            {
              options: [
                {
                  label: "Play a game to win it!",
                  callback: () => {
                    this.destroyDialogueUI && this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState && this.updateHUDState();
                    this.dialogueOnComplete = null;
                    this.scene.launch("MiniGameScene", {
                      onWin: () => {
                        this.scene.stop("MiniGameScene");
                        receivedItem(this, periwinkle.key, periwinkle.name);
                        inventoryManager.addItem(periwinkle);
                        addPlantToJournal(periwinkle.key);
                        showDialogue(this,
                          "You won the game! The animal reluctantly gives you the Periwinkle plant.",
                          {
                            imageKey: periwinkle.imageKey,
                            onComplete: () => {
                              this.dialogueOnComplete = () => {
                                this.destroyDialogueUI();
                                this.dialogueActive = false;
                                this.updateHUDState();
                                this.dialogueOnComplete = null;
                              };
                            }
                          }
                        );
                        periwinkleFound = true;
                      }
                    });
                    this.scene.pause();
                  }
                },
                {
                  label: "Try again later",
                  callback: () => {
                    this.destroyDialogueUI && this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState && this.updateHUDState();
                    this.dialogueOnComplete = null;
                  }
                }
              ],
              imageKey: periwinkle.imageKey
            }
          );
        } else {
          const coins = Phaser.Math.Between(10, 30);
          CoinManager.load().add(coins);
          saveToLocal("coins", CoinManager.load().coins);
          this.destroyDialogueUI && this.destroyDialogueUI();
          receivedItem(this, "coin", `${coins} Coins`, { scale: 0.15 });
          showDialogue(this, `You found ${coins} coins hidden in the bush!`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
        }
      });
    }
  }
}

export default ShardGardenScene;
