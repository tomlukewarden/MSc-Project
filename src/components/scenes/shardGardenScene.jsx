import { createButterfly, butterflyPillarDialogues, butterflyShardDialogues, butterflyGoodbyeDialogues } from "../../characters/butterfly";
import { saveToLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";

class ShardGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShardGardenScene' });
    this.dialogueActive = false;
    this.dialogueBox = null;
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
    this.add.image(width / 2, height / 2, "folliage").setScale(scaleFactor);

    // Arrange the season images in a horizontal line further back (higher y value)
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonScale = 0.09;
    const spacing = 800 * scaleFactor;
    const startX = width / 2 - ((seasons.length - 1) * spacing) / 2;
    const y = height * scaleFactor + 100;

    const seasonImages = seasons.map((season, i) => {
      return this.add.image(startX + i * spacing, y, season).setScale(seasonScale);
    });

    // Butterfly NPC and dialogue logic
    const butterfly = createButterfly(this, width / 2, height / 2);
    butterfly.setScale(0.09).setOrigin(0.5, 0.5);

    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    butterfly.setInteractive();
    butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyPillarDialogues[this.butterflyDialogueIndex]);
      this.dialogueActive = true;
      this.updateHUDState();
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
      if (!this.butterflyDialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.butterflyDialogueIndex++;
      if (this.butterflyDialogueIndex < butterflyPillarDialogues.length) {
        showDialogue(this, butterflyPillarDialogues[this.butterflyDialogueIndex]);
      } else {
        this.destroyDialogueUI();
        this.butterflyDialogueActive = false;
        this.dialogueActive = false;
        this.updateHUDState();
      }
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

export default ShardGardenScene