import Phaser from 'phaser';
import { showDialogue } from '../dialogue/dialogueUIHelpers';

class FarmingTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'FarmingTutorial' });
    this.plotState = 'empty';
    this.seedCount = 1;
    this.waterCount = 0;
    this.hasPlant = false;
    this.dialogueStep = 0;
    this.dialogueActive = false;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('plot', '/assets/farming/prepared.PNG');
    this.load.image('marigoldSeeds', '/assets/shopItems/seeds/marigoldSeeds.png');
    this.load.image('wateringCan', '/assets/tools/wateringCan.png');
    this.load.image('hoe', '/assets/tools/hoe.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
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

    // Overlay
    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, 0xffffff, 0.85)
      .setStrokeStyle(2, 0x228B22)
      .setDepth(1);

    // Title
    this.add.text(width / 2, 80, 'Farming Tutorial', {
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

    // Tool icons
    const hoeX = width / 2 - 220;
    const toolY = 200;
    const hoeIcon = this.add.image(hoeX, toolY, 'hoe').setScale(0.09).setDepth(2).setInteractive({ useHandCursor: true });
    const canX = width / 2 + 220;
    const canIcon = this.add.image(canX, toolY, 'wateringCan').setScale(0.09).setDepth(2).setInteractive({ useHandCursor: true });

    // Plot
    const plotX = width / 2;
    const plotY = 260;
    this.plotRect = this.add.rectangle(plotX, plotY, 80, 80, 0x8bc34a, 0.8)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    this.plotImg = this.add.image(plotX, plotY, 'plot')
      .setScale(0.13)
      .setVisible(false)
      .setDepth(3);

    // Seed icon
    const seedX = width / 2 - 80;
    this.seedIcon = this.add.image(seedX, plotY + 80, 'marigoldSeeds')
      .setScale(0.09)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    this.seedLabel = this.add.text(seedX, plotY + 120, `Marigold Seeds x${this.seedCount}`, {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Water count display
    this.waterLabel = this.add.text(width / 2 + 80, plotY + 120, `Watered: ${this.waterCount}/3`, {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#333'
    }).setOrigin(0.5).setDepth(2);

    // Plant image (hidden until grown)
    this.plantImg = this.add.image(plotX, plotY, 'marigoldPlant')
      .setScale(0.11)
      .setVisible(false)
      .setDepth(4);

    // Harvest button (hidden until grown)
    this.harvestBtn = this.add.text(width / 2, plotY + 170, "Harvest!", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    // Step 1: Prepare soil
    hoeIcon.on('pointerdown', () => {
      if (this.plotState === 'empty' && !this.dialogueActive) {
        this.plotState = 'prepared';
        this.plotImg.setVisible(true);
        this.instructionText.setText('Step 2: Plant seeds in the prepared soil.');
      }
    });

    // Step 2: Plant seed
    this.seedIcon.on('pointerdown', () => {
      if (this.plotState === 'prepared' && this.seedCount > 0 && !this.dialogueActive) {
        this.plotState = 'planted';
        this.seedCount -= 1;
        this.seedLabel.setText(`Marigold Seeds x${this.seedCount}`);
        this.instructionText.setText('Step 3: Water the plant for 3 days.');
      }
    });

    // Step 3: Water plant
    canIcon.on('pointerdown', () => {
      if (this.plotState === 'planted' && this.waterCount < 3 && !this.dialogueActive) {
        this.waterCount += 1;
        this.waterLabel.setText(`Watered: ${this.waterCount}/3`);
        if (this.waterCount === 3) {
          this.plotState = 'grown';
          this.plantImg.setVisible(true);
          this.instructionText.setText('Step 4: Harvest your plant!');
          this.harvestBtn.setVisible(true);
        }
      }
    });

    // Step 4: Harvest
    this.harvestBtn.on('pointerdown', () => {
      if (this.plotState === 'grown' && !this.dialogueActive) {
        this.plotState = 'harvested';
        this.plantImg.setVisible(false);
        this.harvestBtn.setVisible(false);
        this.instructionText.setText('Success! You harvested Marigold.');
      }
    });

    // Dialogue tutorial steps
    this.dialogueStep = 0;
    this.dialogueActive = true;
    this.showFarmingDialogue();

    // Advance dialogue on pointerdown
    this.input.on('pointerdown', () => {
      if (this.dialogueActive) {
        this.advanceDialogue();
      }
    });

    // Next button (separate, always visible at bottom)
    const nextBtn = this.add.text(width / 2, height - 60, "Crafting Tutorial", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => nextBtn.setStyle({ backgroundColor: "#145214" }))
      .on("pointerout", () => nextBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("CraftingTutorial");
      });
  }

  showFarmingDialogue() {
    const steps = [
      {
        text: "Welcome to farming! I'm here to help you grow your first plant.",
      },
      {
        text: "Step 1: Click the hoe to prepare the soil.",
      },
      {
        text: "Step 2: Click the seed packet to plant your marigold seed.",
      },
      {
        text: "Step 3: Water the plant three times using the watering can.",
      },
      {
        text: "Step 4: When the plant is grown, click to collect it.",
      },
      {
        text: "Great job! Next up is crafting. Click below to continue.",
      }
    ];

    if (this.dialogueStep < steps.length - 1) {
      showDialogue(this, steps[this.dialogueStep].text, {
        imageKey: "butterflyHappy",
        imageSide: "left",
        options: []
      });
    } else if (this.dialogueStep === steps.length - 1) {
      // Last step: show "Continue" button
      showDialogue(this, steps[this.dialogueStep].text, {
        imageKey: "butterflyHappy",
        imageSide: "left",
    
      });
  ;
    } else {
      this.dialogueActive = false;
      this.destroyDialogueUI();
    }
  }

  advanceDialogue() {
    if (!this.dialogueActive) return;
    this.dialogueStep += 1;
    this.showFarmingDialogue();
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

export default FarmingTutorial;