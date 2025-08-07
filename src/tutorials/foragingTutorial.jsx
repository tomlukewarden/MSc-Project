import Phaser from 'phaser';

class ForagingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'ForagingTutorial' });
    this.bushStates = [false, false, false, false]; // Track if each bush has been clicked
    this.coinsFound = 0;
    this.plantsFound = [];
    this.minigameActive = false;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.image('arrow', '/assets/ui-items/arrow.png');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);

    // Title
    this.add.text(width / 2, 80, 'Foraging Tutorial', {
      fontFamily: 'Georgia',
      fontSize: '38px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Instructions
    this.instructionText = this.add.text(width / 2, 140, 'Click on bushes to forage for plants or coins!', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Bush positions
    const bushPositions = [
      { x: width / 2 - 220, y: 300 }, // Jasmine
      { x: width / 2 - 70, y: 400 },  // Marigold
      { x: width / 2 + 70, y: 250 },  // Periwinkle
      { x: width / 2 + 220, y: 350 }  // Coins
    ];

    // Plant keys for first three bushes
    const plantKeys = ['jasminePlant', 'marigoldPlant', 'periwinklePlant'];

    // Bushes
    this.bushSprites = [];
    for (let i = 0; i < bushPositions.length; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.add.image(x, y, 'bush')
        .setScale(1.3)
        .setDepth(2)
        .setInteractive({ useHandCursor: true });

      bush.on('pointerdown', () => {
        if (this.minigameActive || this.bushStates[i]) return;
        this.bushStates[i] = true;
        bush.setTint(0x88cc88);

        if (i < 3) {
          // Plant bush: show minigame popup
          this.showMinigame(plantKeys[i], x, y);
        } else {
          // Coin bush
          const coins = Phaser.Math.Between(10, 30);
          this.coinsFound += coins;
          this.showFoundItem('coin', `${coins} Coins`, x, y);
          this.instructionText.setText(`You found ${coins} coins! Try the other bushes.`);
        }
      });

      this.bushSprites.push(bush);
    }

    // Result display
    this.resultImage = null;
    this.resultLabel = null;

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

  showMinigame(plantKey, x, y) {
    this.minigameActive = true;
    // Simple minigame: click the plant before it disappears
    const popup = this.add.rectangle(x, y - 80, 220, 120, 0xffffff, 0.98)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(10);
    const popupText = this.add.text(x, y - 110, 'Quick! Click the plant to win it!', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#228B22'
    }).setOrigin(0.5).setDepth(11);

    const plantSprite = this.add.image(x, y - 60, plantKey)
      .setScale(0.13)
      .setDepth(11)
      .setInteractive({ useHandCursor: true });

    let won = false;
    plantSprite.on('pointerdown', () => {
      won = true;
      this.showFoundItem(plantKey, `${plantKey.replace('Plant', '')} Plant`, x, y);
      this.instructionText.setText(`You won the plant! Try the other bushes.`);
      popup.destroy();
      popupText.destroy();
      plantSprite.destroy();
      this.minigameActive = false;
    });

    // If not clicked in 2 seconds, fail
    this.time.delayedCall(2000, () => {
      if (!won) {
        this.instructionText.setText('Too slow! Try again by clicking another bush.');
        popup.destroy();
        popupText.destroy();
        plantSprite.destroy();
        this.minigameActive = false;
      }
    });
  }

  showFoundItem(itemKey, itemName, x, y) {
    if (this.resultImage) this.resultImage.destroy();
    if (this.resultLabel) this.resultLabel.destroy();
    this.resultImage = this.add.image(x, y - 40, itemKey)
      .setScale(itemKey === 'coin' ? 0.13 : 0.15)
      .setDepth(12);
    this.resultLabel = this.add.text(x, y + 30, itemName, {
      fontFamily: 'Georgia',
      fontSize: '18px',
      color: '#228B22'
    }).setOrigin(0.5).setDepth(12);

    // Hide result after 2 seconds
    this.time.delayedCall(2000, () => {
      if (this.resultImage) this.resultImage.destroy();
      if (this.resultLabel) this.resultLabel.destroy();
      this.resultImage = null;
      this.resultLabel = null;
    });
  }
}

export default ForagingTutorial;