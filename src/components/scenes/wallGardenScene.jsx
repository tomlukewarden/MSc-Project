import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, showOption, destroyDialogueUI } from '../../dialogue/dialogueUIHelpers';
import Phaser from 'phaser';

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene' });
  }

  preload() {
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
  }

  create() {
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "wallGardenBackground").setScale(scaleFactor);

    const butterfly = createButterfly(this, width / 2 + 200, height / 2 + 100);

    // --- Dialogue state ---
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    butterfly.setInteractive();
    butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex]);
    });

    // Advance butterfly dialogue on pointerdown
    this.input.on("pointerdown", () => {
      if (!this.butterflyDialogueActive) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.butterflyDialogueIndex++;
      if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
        showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex]);
      } else {
        destroyDialogueUI(this);
        this.butterflyDialogueActive = false;
      }
    });
  }
}

export default WallGardenScene;