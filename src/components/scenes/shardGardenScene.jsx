import { createButterfly, butterflyPillarDialogues, butterflyShardDialogues, butterflyGoodbyeDialogues } from "../../characters/butterfly";
import { createMainChar } from "../../characters/mainChar";
import { CoinManager } from "../coinManager";
import { saveToLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";

class ShardGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShardGardenScene', physics: { default: 'arcade', arcade: { debug: true } } });
    this.dialogueActive = false;
    this.dialogueBox = null;
    this.dialogueStage = 0;
    this.activeDialogue = [];
    this.activeDialogueIndex = 0;
    this.shardCounts = {
      spring: 3,
      summer: 2,
      autumn: 2,
      winter: 2
    };
  }

  preload() {
    this.load.image('background', '/assets/backgrounds/shardGarden/backgound.png');
    this.load.image('folliage' , '/assets/backgrounds/shardGarden/folliage.png');
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
  }

  create() {
    this.scene.launch("HUDScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "background").setScale(scaleFactor);
    const folliageImg = this.add.image(width / 2, height / 2, "folliage").setScale(scaleFactor);

    // --- Collision group for folliage and seasons ---
    const collisionGroup = this.physics.add.staticGroup();

    // Folliage collision (rectangle matching the image, adjust as needed)
    const folliageRect = this.add.rectangle(
      width / 2,
      height / 2,
      folliageImg.width * scaleFactor,
      folliageImg.height * scaleFactor,
      0x00ff00,
      0.2
    ).setDepth(1);
    this.physics.add.existing(folliageRect, true);
    collisionGroup.add(folliageRect);

    // Arrange the season images in a horizontal line further back (higher y value)
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonScale = 0.09;
    const spacing = 800 * scaleFactor;
    const startX = width / 2 - ((seasons.length - 1) * spacing) / 2;
    const y = height * scaleFactor + 100;

    seasons.forEach((season, i) => {
      const seasonImg = this.add.image(startX + i * spacing, y, season)
        .setScale(seasonScale)
        .setDepth(10);
      seasonImg.setInteractive();

      seasonImg.on("pointerover", () => {
        seasonImg.setTint(0x88ccff);
      });

      seasonImg.on("pointerout", () => {
        seasonImg.clearTint();
      });
      seasonImg.on("pointerdown", () => {
        showOption(
          this,
          `Return ${season.charAt(0).toUpperCase() + season.slice(1)} Shard? (${this.shardCounts[season]} left)`,
          [
            {
              text: "Yes",
              callback: () => {
                if (this.shardCounts[season] > 0) {
                  this.shardCounts[season]--;
                  showDialogue(this, `You returned a ${season} shard! (${this.shardCounts[season]} left)`);
                } else {
                  showDialogue(this, `No ${season} shards left to return!`);
                }
                this.updateHUDState();
              }
            },
            {
              text: "No",
              callback: () => {
                showDialogue(this, `You kept your ${season} shard.`);
                this.updateHUDState();
              }
            }
          ]
        );
      });

      const seasonRect = this.add.rectangle(
        startX + i * spacing,
        y,
        seasonImg.width * seasonScale,
        seasonImg.height * seasonScale,
        0xff0000,
        0.2
      ).setDepth(1); // Rectangles below images
      this.physics.add.existing(seasonRect, true);
      collisionGroup.add(seasonRect);
    });

    const char = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
char.setDepth(10).setOrigin(4, -4);
    // Butterfly
    const butterfly = createButterfly(this, width / 2, height / 2);
    butterfly.setScale(0.09).setOrigin(0.5, 0.5).setDepth(20); // Ensure above everything

    this.dialogueStage = 0; // 0: pillar, 1: shard, 2: goodbye
    this.setActiveDialogue();

    butterfly.setInteractive();
    butterfly.on("pointerdown", () => {
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.activeDialogueIndex = 0;
      showDialogue(this, this.activeDialogue[this.activeDialogueIndex]);
      this.updateHUDState();
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
      if (!this.dialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.activeDialogueIndex++;
      if (this.activeDialogueIndex < this.activeDialogue.length) {
        showDialogue(this, this.activeDialogue[this.activeDialogueIndex]);
      } else {
        this.dialogueActive = false;
        this.updateHUDState();
        this.destroyDialogueUI();

        // Advance to next dialogue stage if available
        if (this.dialogueStage < 2) {
          this.dialogueStage++;
          this.setActiveDialogue();
        }
      }
    });
  }

  setActiveDialogue() {
    if (this.dialogueStage === 0) {
      this.activeDialogue = butterflyPillarDialogues;
    } else if (this.dialogueStage === 1) {
      this.activeDialogue = butterflyShardDialogues;
    } else if (this.dialogueStage === 2) {
      this.activeDialogue = butterflyGoodbyeDialogues;
    }
    this.activeDialogueIndex = 0;
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

export default ShardGardenScene