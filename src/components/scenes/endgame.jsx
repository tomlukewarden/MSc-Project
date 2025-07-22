import Phaser from 'phaser';

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndGameScene' });
  }

  preload() {
    this.load.audio('finalTheme', '/assets/music/final.mp3');
    this.load.audio('theme1', '/assets/music/main-theme-1.mp3');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Smooth fade in
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#1e2a2f');

    // Soft glow behind the title
    this.add.text(width / 2, height / 2 - 160, '✨ The Garden is Whole ✨', {
      fontFamily: 'Georgia',
      fontSize: '54px',
      color: '#fff',
      stroke: '#ffcc66',
      strokeThickness: 4,
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#ffc',
        blur: 18,
        fill: true
      }
    }).setOrigin(0.5).setDepth(1);

    // Play end theme
    const finalTheme = this.sound.add('finalTheme', { loop: true, volume: 0.35 });
    finalTheme.play();

    // Ending dialogue box (moved further left)
    this.add.text(width / 2 - 420, height / 2 + 20, 
      "Congratulations!\n\nYou have restored all the shards \n\nand completed the garden.\n\nThank you for playing 💐",
      {
        fontSize: 34,
        boxImageKey: 'dialogueBoxBg',
        imageKey: null,
        boxPadding: 32,
        textAlign: 'center',
        textColor: '#2e3d2f',
        y: height / 2  
      }
    );

    // Main menu button (move to right)
    const buttonX = width - 220;
    const buttonY = height - 120;
    const button = this.add.rectangle(buttonX, buttonY, 340, 56, 0x3e7d3a, 0.98)
      .setOrigin(0.5)
      .setDepth(2)
      .setStrokeStyle(3, 0x4caf50)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add.text(buttonX, buttonY, '↩️ Return to Main Menu', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#ffffff',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#4caf50',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(3);

    button.on('pointerover', () => {
      button.setFillStyle(0x4caf50, 0.98);
      button.setStrokeStyle(3, 0x3e7d3a);
      buttonText.setColor('#ffffcc');
    });
    button.on('pointerout', () => {
      button.setFillStyle(0x3e7d3a, 0.98);
      button.setStrokeStyle(3, 0x4caf50);
      buttonText.setColor('#ffffff');
    });
    button.on('pointerdown', () => {
      finalTheme.stop();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('StartScene');
      });
    });
  }
}

export default EndGameScene;
