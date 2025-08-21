import Phaser from 'phaser';
import { createMainChar } from '../characters/mainChar';
import { showDialogue } from '../dialogue/dialogueUIHelpers';

class MovementTutorial extends Phaser.Scene {
  constructor() {
    super({ key: 'MovementTutorial' });
    this.player = null;
    this.cursors = null;
    this.obstacles = [];
    this.collisionGroup = null;
    this.dialogueStep = 0;
    this.dialogueActive = false;
  }

  preload() {
    this.load.image('personalGardenBg', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('rock', '/assets/misc/rock.png');
    this.load.image('tree', '/assets/misc/tree.png');
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
    this.load.image("defaultBack", "/assets/char/default/back-default.png");
    this.load.image("defaultLeft", "/assets/char/default/left-default.png");
    this.load.image("defaultRight", "/assets/char/default/right-default.png");
    this.load.image("defaultFrontWalk1", "/assets/char/default/front-step-1.PNG");
    this.load.image("defaultFrontWalk2", "/assets/char/default/front-step-2.PNG");
    this.load.image("defaultBackWalk1", "/assets/char/default/back-step-1.PNG");
    this.load.image("defaultBackWalk2", "/assets/char/default/back-step-2.PNG");
    this.load.image("defaultLeftWalk1", "/assets/char/default/left-step-1.PNG");
    this.load.image("defaultLeftWalk2", "/assets/char/default/left-step-2.PNG");
    this.load.image("defaultRightWalk1", "/assets/char/default/right-step-1.PNG");
    this.load.image("defaultRightWalk2", "/assets/char/default/right-step-2.PNG");
    this.load.image("butterflyHappy", "/assets/npc/dialogue/butterflySad.PNG");
    this.load.image("dialogueBoxBg", "/assets/ui-items/dialogue.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'personalGardenBg')
      .setDisplaySize(width, height)
      .setDepth(0);

    // Obstacles group
    this.collisionGroup = this.physics.add.staticGroup();
    const rock1 = this.physics.add.staticImage(width / 2 - 150, height / 2, 'rock').setScale(2).setAlpha(1).setDepth(100);
    const tree = this.physics.add.staticImage(width / 2 + 120, height / 2 - 60, 'tree').setScale(4).setAlpha(1).setDepth(100);
    const rock2 = this.physics.add.staticImage(width / 2 + 40, height / 2 + 80, 'rock').setScale(2).setAlpha(1).setDepth(100);
    this.collisionGroup.add(rock1);
    this.collisionGroup.add(tree);
    this.collisionGroup.add(rock2);

    // Create main character with animations and collisions
    this.player = createMainChar(this, width, height, 0.04, this.collisionGroup);

    // Collision feedback (red flash)
    this.physics.add.collider(this.player, this.collisionGroup, () => {
      this.player.setTint(0xff4444);
      this.time.delayedCall(200, () => this.player.clearTint());
    });

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Show movement tutorial dialogue step-by-step
    this.dialogueStep = 0;
    this.dialogueActive = true;
    this.showMovementDialogue();

    // Advance dialogue on pointerdown
    this.input.on('pointerdown', () => {
      if (this.dialogueActive) {
        this.advanceDialogue();
      }
    });

    // Next button - moved to top right
    const nextBtn = this.add.text(width - 20, 20, "Foraging Tutorial", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#228B22",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(1, 0) // Set origin to top-right corner
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => nextBtn.setStyle({ backgroundColor: "#145214" })) // Fixed variable name
      .on("pointerout", () => nextBtn.setStyle({ backgroundColor: "#228B22" }))
      .on("pointerdown", () => {
        this.scene.start("ForagingTutorial", this.scene.settings.data?.nextData || {});
      });
  }

  showMovementDialogue() {
    const steps = [
      {
        text: "Welcome to movement tutorial!\nLet's learn how to move your character.",
      },
      {
        text: "Press W to move up, A to move left, S to move down, and D to move right.",
      },
      {
        text: "Try moving around now! Notice how you can't walk through rocks or trees.",
      },
      {
        text: "That's it! You're ready to explore.\nTry running around and when you are ready, move on!",
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
        options: [
          {
            label: "Continue to Foraging",
            onSelect: () => {
              this.dialogueActive = false;
              this.destroyDialogueUI();
              this.scene.start("ForagingTutorial", this.scene.settings.data?.nextData || {});
            }
          }
        ]
      });
    } else {
      // End of tutorial dialogue
      this.dialogueActive = false;
      this.destroyDialogueUI();
    }
  }

  advanceDialogue() {
    if (!this.dialogueActive) return;
    this.dialogueStep += 1;
    this.showMovementDialogue();
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

export default MovementTutorial;