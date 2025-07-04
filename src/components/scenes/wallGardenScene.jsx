import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, destroyDialogueUI } from '../../dialogue/dialogueUIHelpers';
import { CoinManager } from '../coinManager';
import { createMainChar } from '../../characters/mainChar';
import { saveToLocal } from '../../utils/localStorage';
import Phaser from 'phaser';

const coinManager = CoinManager.load();

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: true } } });
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
        // Check for a 'collision' property and only create a hitbox if it's true
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

    // --- Main Character ---
    const mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    mainChar.setDepth(10);

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
    });

    // Advance butterfly dialogue on pointerdown (but not if clicking on butterfly itself)
    this.input.on("pointerdown", (pointer, currentlyOver) => {
      if (currentlyOver && currentlyOver.includes(butterfly)) return;
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