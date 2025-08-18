import Phaser from 'phaser';

class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.audio('letterOpen', '/assets/sound-effects/sparkle.mp3');

    // Preload your images (replace with your actual paths)
    this.load.image('scene1', '/assets/backgrounds/intro/scene1.png');
    this.load.image('scene2', '/assets/backgrounds/intro/scene2.png');
    this.load.image('scene3', '/assets/backgrounds/intro/scene3.png');
  }

  create() {
    const { width, height } = this.sys.game.config;

    const scenes = [
      {
        text: "Dearest Friend,\n\nTrouble is afoot in the botanic gardens, something’s gone terribly wrong, and we simply must call upon your help!\n",
        image: 'scene1'
      },
      {
        text: "Please come to the WeeCAIR Garden as soon as you can. The flowers are wilting, the seasons are fading, and honestly... we're in a bit of a pickle.\n\n",
        image: 'scene2'
      },
      {
        text: "The gardens are counting on you.\n\nYour ever-faithful friends,\nThe Fairies",
        image: 'scene3'
      }
    ];

    let currentSceneIndex = 0;
    let displayText = '';
    let letterText = '';
    const typeSpeed = 60;

    // Background image
    const bg = this.add.image(width / 2, height / 2, 'scene1')
      .setAlpha(0)
      .setDepth(0)
      .setScale(0.7);

    this.tweens.add({ targets: bg, alpha: 1, duration: 1000 });

    // Text box
    const textBox = this.add.text(width / 2, height / 2 - 40, '', {
      fontFamily: 'Georgia',
      fontSize: '28px',
      color: '#222',
      backgroundColor: '#fff8',
      align: 'center',
      wordWrap: { width: 600 },
      padding: { left: 24, right: 24, top: 24, bottom: 24 }
    }).setOrigin(0.5).setDepth(10);

    // Sound effect
    this.sound.play('letterOpen', { volume: 0.3 });

    const typeScene = () => {
      displayText = '';
      letterText = scenes[currentSceneIndex].text;
      const targetImage = scenes[currentSceneIndex].image;

      // Update background image
      this.tweens.add({
        targets: bg,
        alpha: 0,
        duration: 750,
        onComplete: () => {
          bg.setTexture(targetImage);
          this.tweens.add({ targets: bg, alpha: 1, duration: 500 });
        }
      });

      let i = 0;
      this.time.addEvent({
        delay: typeSpeed,
        repeat: letterText.length - 1,
        callback: () => {
          displayText += letterText[i];
          textBox.setText(displayText);
          i++;

          // Once the full scene is typed
          if (i === letterText.length) {
            currentSceneIndex++;
            if (currentSceneIndex < scenes.length) {
              // Delay then type next part
              this.time.delayedCall(2000, typeScene);
            } else {
              // Done typing everything
              showPrompt();
            }
          }
        },
        callbackScope: this
      });
    };

    typeScene();

    // Prompt
    const prompt = this.add.text(width / 2, height - 80, 'Press SPACE to begin your adventure...', {
      fontFamily: 'Georgia',
      fontSize: '22px',
      color: '#3e7d3a',
      backgroundColor: '#fff',
      align: 'center',
      padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5).setAlpha(0).setDepth(20);

    const showPrompt = () => {
      this.tweens.add({ targets: prompt, alpha: 1, duration: 1200 });
    };

    this.input.keyboard.once('keydown-SPACE', () => {
      this.tweens.add({
        targets: [bg, textBox, prompt],
        alpha: 0,
        duration: 800,
        onComplete: () => {
          this.scene.start('WeeCairScene');
        }
      });
    });
  }
}

export default IntroScene;
