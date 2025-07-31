import Phaser from "phaser";

class NewGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "NewGameScene" });
  }

  create() {
    const { width, height } = this.sys.game.config;


    // Darker, less transparent background
    this.add.rectangle(0, 0, width, height, 0x7bb7a8, 1).setOrigin(0);

    // Darker, less transparent panel
    const panel = this.add.rectangle(width / 2, height / 2, 640, 520, 0xe0e0c0, 1)
      .setStrokeStyle(4, 0x3a5a40)
      .setDepth(1);

    this.add.text(width / 2, height / 2 - 210, " New Game Setup", {
      fontFamily: "Georgia",
      fontSize: "42px",
      color: "#3a5a40",
      fontStyle: "bold",
      stroke: "#88ccff",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#fff", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    this.add.text(width / 2 - 180, height / 2 - 120, "Name:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff"
    }).setOrigin(0, 0.5).setDepth(2);

    const nameInput = this.add.dom(width / 2 + 60, height / 2 - 120, 'input');
    nameInput.node.type = 'text';
    nameInput.node.style.fontSize = '20px';
    nameInput.node.style.width = '240px';
    nameInput.node.style.padding = '10px';
    nameInput.node.style.borderRadius = '10px';
    nameInput.node.style.border = '2px solid #88ccff';
    nameInput.node.style.background = '#fff';
    nameInput.node.style.color = '#234';

    this.add.text(width / 2 - 180, height / 2 - 60, "Farm Name:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff"
    }).setOrigin(0, 0.5).setDepth(2);

    const farmInput = this.add.dom(width / 2 + 60, height / 2 - 60, 'input');
    farmInput.node.type = 'text';
    farmInput.node.style.fontSize = '20px';
    farmInput.node.style.width = '240px';
    farmInput.node.style.padding = '10px';
    farmInput.node.style.borderRadius = '10px';
    farmInput.node.style.border = '2px solid #88ccff';
    farmInput.node.style.background = '#fff';
    farmInput.node.style.color = '#234';

    this.add.text(width / 2 - 180, height / 2 + 0, "Gender:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff"
    }).setOrigin(0, 0.5).setDepth(2);

    const genderOptions = ["Male", "Female", "Non-binary"];
    let selectedGender = genderOptions[0];
    const genderButtons = [];

    genderOptions.forEach((gender, i) => {
      const btn = this.add.text(width / 2 - 60 + i * 110, height / 2 + 0, gender, {
        fontFamily: "Georgia",
        fontSize: "22px",
        color: "#fff",
        backgroundColor: i === 0 ? "#3a5a40" : "#88ccff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      }).setOrigin(0.5).setDepth(2).setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        selectedGender = gender;
        genderButtons.forEach(b => b.setStyle({ backgroundColor: "#88ccff" }));
        btn.setStyle({ backgroundColor: "#3a5a40" });
      });

      genderButtons.push(btn);
    });

    const validationText = this.add.text(width / 2, height / 2 + 210, "", {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#d7263d",
      backgroundColor: "#fff0f0",
      padding: { left: 18, right: 18, top: 8, bottom: 8 },
      align: "center"
    }).setOrigin(0.5).setDepth(30).setVisible(false);

    const startBtn = this.add.text(width / 2, height / 2 + 140, "Start Game", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#3bb273",
      fontStyle: "bold",
      padding: { left: 40, right: 40, top: 14, bottom: 14 },
      borderRadius: '12px'
    })
      .setOrigin(0.5)
      .setDepth(20)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => startBtn.setStyle({ backgroundColor: "#2e8c5a" }))
      .on("pointerout", () => startBtn.setStyle({ backgroundColor: "#3bb273" }))
      .on("pointerdown", () => {
        const characterName = nameInput.node.value.trim();
        const farmName = farmInput.node.value.trim();

        if (!characterName || !farmName) {
          validationText.setText("Please fill out both the character and farm name.")
            .setVisible(true);
          return;
        }

        // Save data
        this.registry.set("characterName", characterName);
        this.registry.set("farmName", farmName);
        this.registry.set("gender", selectedGender);

        // Go to game
        nameInput.destroy();
        farmInput.destroy();
        this.scene.start("IntroScene");
      });
  }
}

export default NewGameScene;
