import Phaser from 'phaser';
import { createMainChar } from '../characters/mainChar';

class MovementTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'MovementTutorial' });
    this.player = null;
    this.cursors = null;
    this.obstacles = [];
    this.collisionGroup = null;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('rock', '/assets/misc/rock.png');
    this.load.image('tree', '/assets/misc/tree.png');
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
    this.load.image("defaultFrontWalk1", "/assets/char/default/front-step-1.PNG");
    this.load.image("defaultFrontWalk2", "/assets/char/default/front-step-2.PNG");
    this.load.image("defaultBackWalk1", "/assets/char/default/back-step-1.PNG");
    this.load.image("defaultBackWalk2", "/assets/char/default/back-step-2.PNG");
    this.load.image("defaultLeftWalk1", "/assets/char/default/left-step-1.PNG");
    this.load.image("defaultLeftWalk2", "/assets/char/default/left-step-2.PNG");
    this.load.image("defaultRightWalk1", "/assets/char/default/right-step-1.PNG");
    this.load.image("defaultRightWalk2", "/assets/char/default/right-step-2.PNG");
    this.load
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Instructions
    this.add.rectangle(width / 2, 80, 600, 60, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);
    this.add.text(width / 2, 80, 'Use WASD to move. Avoid obstacles!', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#228B22'
    }).setOrigin(0.5).setDepth(2);

    // Obstacles group
    this.collisionGroup = this.physics.add.staticGroup();
    const rock1 = this.physics.add.staticImage(width / 2 - 150, height / 2, 'rock').setScale(2).setAlpha(1).setDepth(100);
    const tree = this.physics.add.staticImage(width / 2 + 120, height / 2 - 60, 'tree').setScale(4).setAlpha(1).setDepth(100);
    const rock2 = this.physics.add.staticImage(width / 2 + 40, height / 2 + 80, 'rock').setScale(2).setAlpha(1).setDepth(100);
    this.collisionGroup.add(rock1);
    this.collisionGroup.add(tree);
    this.collisionGroup.add(rock2);

    // Create main character with animations and collisions
    this.player = createMainChar(this, width, height, 0.04, this.collisionGroup);

    // Collision feedback (red flash)
    this.physics.add.collider(this.player, this.collisionGroup, () => {
      this.player.setTint(0xff4444);
      this.time.delayedCall(200, () => this.player.clearTint());
    });

    // Back button
    const backBtn = this.add.text(width / 2, height - 60, "Back", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#145214" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("PersonalGarden");
      });
  }
}

export default MovementTutorial;