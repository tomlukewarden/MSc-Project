import Phaser from "phaser";

class CreditsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CreditsScene" });
  }

  preload() {
    this.load.image("creditsBg", "/assets/backgrounds/credits.png"); // Optional: add a background image
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Optional background
    if (this.textures.exists("creditsBg")) {
      this.add.image(width / 2, height / 2, "creditsBg").setOrigin(0.5).setDepth(0);
    } else {
      this.cameras.main.setBackgroundColor("#222");
    }

    // Credits text content
    const creditsText = `
Music, Concept & Programming By:
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

    // Create the credits text object
    const credits = this.add.text(width / 2, height + 50, creditsText, {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#ffe066",
      align: "center",
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5);

    // Rolling animation
    this.tweens.add({
      targets: credits,
      y: -credits.height / 2,
      duration: 18000,
      ease: "Linear",
      onComplete: () => {
        this.scene.start("StartScene"); // Go back to start or main menu
      }
    });

    // Allow skipping credits with click or key
    this.input.once("pointerdown", () => {
      this.scene.start("StartScene");
    });
    this.input.keyboard.once("keydown", () => {
      this.scene.start("StartScene");
    });
  }
}

export default CreditsScene;