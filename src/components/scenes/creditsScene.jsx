import Phaser from 'phaser';

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CreditsScene' });
  }

  preload() {
    this.load.image('creditsBg', '/assets/credits/credits-bg.jpg');
    this.load.audio('creditsTheme', '/assets/music/credits.mp3');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'creditsBg')
      .setDisplaySize(width, height)
      .setAlpha(0.8);

    // Play background music
    const music = this.sound.add('creditsTheme', { loop: true, volume: 0.4 });
    music.play();

    // Credits content
    const creditsText = `
    Music, Concept & Code Created By:
    Tom Warden

    Art & Design:
    Emma Formosa 

    Special Thanks:
    Our babies Obi, Arlo & Lego.
    My friends for their support in testing the game.
    My parents for their encouragement and support.
    My Supervisor Dr Michael Crabb for his encouragement and guidance through this project.
    And most importantly, my wonderful partner Emma Formosa for her support, patience & incredible art.

    I hope you have enjoyed playing my game!

    If you have any feedback, please reach out to me at: tomlukewarden@gmail.com
    `;

    // Scrollable text
    const text = this.add.text(width / 2, height + 200, creditsText, {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#fff',
      align: 'center',
      lineSpacing: 14
    }).setOrigin(0.5).setDepth(1);

    // Tween to scroll the credits
    this.tweens.add({
      targets: text,
      y: -text.height,
      duration: 30000,
      ease: 'Linear'
    });

    // Fade-in return button
    const button = this.add.rectangle(width / 2, height - 60, 320, 50, 0x3e7d3a, 0.95)
      .setStrokeStyle(2, 0x4caf50)
      .setInteractive({ useHandCursor: true })
      .setDepth(2);
    const buttonText = this.add.text(width / 2, height - 60, '↩️ Return to Main Menu', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#fff'
    }).setOrigin(0.5).setDepth(3);

    button.on('pointerover', () => {
      button.setFillStyle(0x4caf50, 0.95);
      buttonText.setColor('#ffffcc');
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x3e7d3a, 0.95);
      buttonText.setColor('#ffffff');
    });

    button.on('pointerdown', () => {
      music.stop();
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('StartScene');
      });
    });

    // Fade in scene
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
}

export default CreditsScene;
