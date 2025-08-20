import Phaser from 'phaser';

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndGameScene' });
  }

  preload() {
    this.load.audio('finalTheme', '/assets/music/final.mp3');
    this.load.audio('theme1', '/assets/music/main-theme-1.mp3');

    // Load your end scene images
    this.load.image('ending1', '/assets/backgrounds/end/ending1.png');
    this.load.image('ending2', '/assets/backgrounds/end/ending2.png');
    this.load.image('ending3', '/assets/backgrounds/end/ending3.png');
  }

  create() {
    const { width, height } = this.sys.game.config;
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#1e2a2f');

    // Final theme music
    const finalTheme = this.sound.add('finalTheme', { loop: true, volume: 0.35 });
    finalTheme.play();

    // Image cycling + dialogue
    const scenes = [
      {
        text: "The last shard falls into place...\nThe seasons hum again in harmony.",
        image: 'ending1'
      },
      {
        text: "The fairies dance, the flowers bloom,\nYour remedies brought light and life back to the garden.",
        image: 'ending2'
      },
      {
        text: "Thank you, dear botanist.\nYou've healed a world in need.\n\n🌿 The Garden is Whole 🌿",
        image: 'ending3'
      }
    ];

    let currentSceneIndex = 0;
    let displayText = '';
    let fullText = '';

    const bg = this.add.image(width / 2, height / 2, 'ending1')
      .setAlpha(0)
      .setScale(0.225)
      .setDepth(0);

    this.tweens.add({ targets: bg, alpha: 1, duration: 1000 });

    const textBox = this.add.text(width / 2, height / 2 + 60, '', {
      fontFamily: 'Georgia',
      fontSize: '30px',
      color: '#fefefe',
      backgroundColor: '#1e2a2fbb',
      align: 'center',
      wordWrap: { width: 720 },
      padding: { top: 20, bottom: 20, left: 40, right: 40 }
    }).setOrigin(0.5).setDepth(5);

    const typeSpeed = 40;

    const typeScene = () => {
      displayText = '';
      fullText = scenes[currentSceneIndex].text;
      const nextImageKey = scenes[currentSceneIndex].image;

      // Fade out old image
      this.tweens.add({
        targets: bg,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          bg.setTexture(nextImageKey);
          this.tweens.add({ targets: bg, alpha: 1, duration: 500 });
        }
      });

      let i = 0;
      this.time.addEvent({
        delay: typeSpeed,
        repeat: fullText.length - 1,
        callback: () => {
          displayText += fullText[i];
          textBox.setText(displayText);
          i++;

          if (i === fullText.length && currentSceneIndex < scenes.length - 1) {
            currentSceneIndex++;
            this.time.delayedCall(2000, typeScene);
          } else if (i === fullText.length) {
            showButton();
          }
        },
        callbackScope: this
      });
    };

    typeScene();

    // Button to return to main menu (initially hidden)
    const buttonX = width - 220;
    const buttonY = height - 100;
    const button = this.add.rectangle(buttonX, buttonY, 340, 56, 0x3e7d3a, 0.98)
      .setOrigin(0.5)
      .setDepth(2)
      .setStrokeStyle(3, 0x4caf50)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0);
    const buttonText = this.add.text(buttonX, buttonY, 'View Credits', {
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
    }).setOrigin(0.5).setDepth(3).setAlpha(0);

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
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('CreditsScene');
      });
    });

    const showButton = () => {
      this.tweens.add({ targets: [button, buttonText], alpha: 1, duration: 800 });
    };
  }
}

export default EndGameScene;
