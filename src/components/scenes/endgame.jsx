import Phaser from 'phaser';
import { showDialogue } from '../../dialogue/dialogueUIHelpers';

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndGameScene' });
  }

  preload() {
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
  }

  create() {
    const { width, height } = this.sys.game.config;

    this.cameras.main.setBackgroundColor('#222b2f');
    this.sound.play('sparkle', { volume: 0.7 });

    showDialogue(this,
      "Congratulations!\n\nYou have restored all the shards and completed the garden.\n\nThank you for playing!",
      {
        fontSize: 32,
        boxImageKey: 'dialogueBoxBg',
        imageKey: null
      }
    );

    // Add a button to return to main menu
    const button = this.add.text(width / 2, height - 100, 'Return to Main Menu', {
      font: '28px Arial',
      fill: '#fff',
      backgroundColor: '#222',
      padding: { left: 20, right: 20, top: 10, bottom: 10 },
      borderRadius: 8
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(200);

    button.on('pointerover', () => button.setStyle({ fill: '#ff0' }));
    button.on('pointerout', () => button.setStyle({ fill: '#fff' }));
    button.on('pointerdown', () => {
      this.scene.start('StartScene');
    });
  }
}

export default EndGameScene;
