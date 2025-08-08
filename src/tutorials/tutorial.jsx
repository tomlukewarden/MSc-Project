import Phaser from 'phaser';

class Tutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'Tutorial' });
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0xffffff, 0.92)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);

    // Title
    this.add.text(width / 2, 120, 'Welcome!', {
      fontFamily: 'Georgia',
      fontSize: '38px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Tutorial prompt
    this.add.text(width / 2, 200, 'Would you like to play the tutorial?', {
      fontFamily: 'Georgia',
      fontSize: '26px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Yes button
    const yesBtn = this.add.text(width / 2 - 80, 300, "Yes", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 30, right: 30, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => yesBtn.setStyle({ backgroundColor: "#145214" }))
      .on("pointerout", () => yesBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("MovementTutorial");
      });

    // Skip button
    const skipBtn = this.add.text(width / 2 + 80, 300, "Skip", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#a33",
      padding: { left: 30, right: 30, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => skipBtn.setStyle({ backgroundColor: "#800" }))
      .on("pointerout", () => skipBtn.setStyle({ backgroundColor: "#a33" }))
      .on("pointerdown", () => {
        this.scene.start("IntroScene");
      });
  }

  }

export default Tutorial;