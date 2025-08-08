import Phaser from 'phaser';
import { showDialogue } from '../dialogue/dialogueUIHelpers';

class ForagingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'ForagingTutorial' });
    this.bushStates = [false, false, false, false];
    this.coinsFound = 0;
    this.plantsFound = [];
    this.minigameActive = false;
    this.dialogueStep = 0;
    this.dialogueActive = false;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.image('arrow', '/assets/ui-items/arrow.png');
    this.load.image("butterflyHappy", "/assets/npc/butterfly/happy-butterfly-dio.png");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Title
    this.add.text(width / 2, 80, 'Foraging Tutorial', {
      fontFamily: 'Georgia',
      fontSize: '38px',
      color: '#228B22',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    // Instructions (will be updated by dialogue)
    this.instructionText = this.add.text(width / 2, 140, '', {
      fontFamily: 'Georgia',
      fontSize: '24px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Bush positions (lower on the screen)
    const bushPositions = [
      { x: width / 2 - 220, y: height - 220 }, // Jasmine
      { x: width / 2 - 70, y: height - 120 },  // Marigold
      { x: width / 2 + 70, y: height - 270 },  // Periwinkle
      { x: width / 2 + 220, y: height - 170 }  // Coins
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
        if (this.minigameActive || this.bushStates[i] || this.dialogueActive) return;
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

    // Dialogue tutorial steps
    this.dialogueStep = 0;
    this.dialogueActive = true;
    this.showForagingDialogue();

    // Advance dialogue on pointerdown
    this.input.on('pointerdown', () => {
      if (this.dialogueActive) {
        this.advanceDialogue();
      }
    });

    // Next button
    const nextBtn = this.add.text(width / 2, height - 60, "Farming Tutorial", {
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
        this.scene.start("FarmingTutorial");
      });
  }

  showForagingDialogue() {
    const steps = [
      {
        text: "Hello again! I can see you now know how to move!\nNow let me show you how to forage in the garden.",
      },
      {
        text: "See those bushes? Click on them to search for plants or coins.",
      },
      {
        text: "You can grow all of the plants, but foraging is a quick way to get started.",
      },
      {
        text: "If a plant appears, you might have to beat out an \n animal that's trying to steal it!",
      },
      {text:"Beat the animal in a minigame to win the plant!"},
      {
        text: "That's all there is to foraging. Have fun exploring! \n Next to learn is farming!",
      }
    ];

    if (this.dialogueStep < steps.length) {
      showDialogue(this, steps[this.dialogueStep].text, {
        imageKey: "butterflyHappy",
        imageSide: "left",
        options: []
      });
    } else {
      this.dialogueActive = false;
      this.destroyDialogueUI();
    }
  }

  advanceDialogue() {
    if (!this.dialogueActive) return;
    this.dialogueStep += 1;
    this.showForagingDialogue();
  }

  showMinigame(plantKey, x, y) {
    this.minigameActive = true;
    const popup = this.add.rectangle(x, y - 80, 220, 120, 0xffffff, 0.98)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(10);
    const popupText = this.add.text(x, y - 110, 'Quick! Click the plant to win it!', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#000000ff'
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
      color: '#000000ff'
    }).setOrigin(0.5).setDepth(12);

    this.time.delayedCall(2000, () => {
      if (this.resultImage) this.resultImage.destroy();
      if (this.resultLabel) this.resultLabel.destroy();
      this.resultImage = null;
      this.resultLabel = null;
    });
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn) => btn.destroy());
      }
      this.dialogueBox = null;
    }
  }
}

export default ForagingTutorial;