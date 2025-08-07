import Phaser from 'phaser';

class MovementTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'MovementTutorial' });
    this.player = null;
    this.cursors = null;
    this.obstacles = [];
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('player', '/assets/characters/player.png');
    this.load.image('rock', '/assets/misc/rock.png');
    this.load.image('tree', '/assets/misc/tree.png');
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
    this.add.text(width / 2, 80, 'Use arrow keys or WASD to move. Avoid obstacles!', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#228B22'
    }).setOrigin(0.5).setDepth(2);

    // Player
    this.player = this.physics.add.sprite(width / 2, height / 2 + 100, 'player')
      .setScale(0.13)
      .setCollideWorldBounds(true);

    // Obstacles
    this.obstacles = [
      this.physics.add.staticImage(width / 2 - 150, height / 2, 'rock').setScale(0.18),
      this.physics.add.staticImage(width / 2 + 120, height / 2 - 60, 'tree').setScale(0.22),
      this.physics.add.staticImage(width / 2 + 40, height / 2 + 80, 'rock').setScale(0.15)
    ];

    // Enable collision
    this.obstacles.forEach(ob => {
      this.physics.add.collider(this.player, ob, () => {
        this.player.setTint(0xff4444);
        this.time.delayedCall(200, () => this.player.clearTint());
      });
    });

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
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

  update() {
    if (!this.player) return;
    const speed = 180;
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = speed;

    this.player.setVelocity(vx, vy);
  }
}

export default MovementTutorial;