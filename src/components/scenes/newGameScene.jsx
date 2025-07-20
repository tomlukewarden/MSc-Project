import Phaser from "phaser";

class NewGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "NewGameScene" });
  }

  create() {
    const { width, height } = this.sys.game.config;
    this.add.rectangle(width / 2, height / 2, 600, 500, 0xf5f5dc, 0.98)
      .setStrokeStyle(6, 0x88ccff)
      .setDepth(1);

    this.add.text(width / 2, height / 2 - 210, "New Game Setup", {
      fontFamily: "Georgia",
      fontSize: "40px",
      color: "#567d46",
      fontStyle: "bold",
      stroke: "#88ccff",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#fff", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Character Name
    this.add.text(width / 2 - 180, height / 2 - 120, "Character Name:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#234"
    }).setOrigin(0, 0.5);
    const nameInput = this.add.dom(width / 2 + 60, height / 2 - 120, 'input', {
      type: 'text',
      fontSize: '22px',
      width: '220px',
      padding: '8px',
      borderRadius: '8px',
      border: '2px solid #88ccff',
      background: '#fff',
      color: '#234'
    });

    // Farm Name
    this.add.text(width / 2 - 180, height / 2 - 60, "Farm Name:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#234"
    }).setOrigin(0, 0.5);
    const farmInput = this.add.dom(width / 2 + 60, height / 2 - 60, 'input', {
      type: 'text',
      fontSize: '22px',
      width: '220px',
      padding: '8px',
      borderRadius: '8px',
      border: '2px solid #88ccff',
      background: '#fff',
      color: '#234'
    });

    // Gender selection
    this.add.text(width / 2 - 180, height / 2, "Gender:", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#234"
    }).setOrigin(0, 0.5);
    const genderOptions = ["Male", "Female", "Non-binary"];
    let selectedGender = genderOptions[0];
    genderOptions.forEach((gender, i) => {
      const btn = this.add.text(width / 2 - 60 + i * 110, height / 2, gender, {
        fontFamily: "Georgia",
        fontSize: "22px",
        color: "#fff",
        backgroundColor: i === 0 ? "#567d46" : "#88ccff",
        padding: { left: 18, right: 18, top: 8, bottom: 8 },
        borderRadius: '8px'
      }).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        selectedGender = gender;
        genderOptions.forEach((g, j) => {
          this.children.getByName && this.children.getByName(g)?.setStyle({ backgroundColor: j === i ? "#567d46" : "#88ccff" });
        });
        btn.setStyle({ backgroundColor: "#567d46" });
      });
      btn.name = gender;
    });


    // Start Game button
    const startBtn = this.add.text(width / 2, height / 2 + 160, "Start Game", {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#fff",
      backgroundColor: "#3bb273",
      fontStyle: "bold",
      padding: { left: 38, right: 38, top: 14, bottom: 14 },
      borderRadius: '10px'
    })
      .setOrigin(0.5)
      .setDepth(20)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => startBtn.setStyle({ backgroundColor: "#2e8c5a" }))
      .on("pointerout", () => startBtn.setStyle({ backgroundColor: "#3bb273" }))
      .on("pointerdown", () => {
        // Collect form data
        const characterName = nameInput.node.value.trim();
        const farmName = farmInput.node.value.trim();
        if (!characterName || !farmName) {
          this.add.text(width / 2, height / 2 + 210, "Please enter all required fields.", {
            fontFamily: "Georgia",
            fontSize: "20px",
            color: "#d7263d",
            backgroundColor: "#fff0f0",
            padding: { left: 18, right: 18, top: 8, bottom: 8 }
          }).setOrigin(0.5).setDepth(30);
          return;
        }
        // Save to registry or localStorage as needed
        this.registry.set("characterName", characterName);
        this.registry.set("farmName", farmName);
        this.registry.set("gender", selectedGender);
        // Start the game (replace with your first scene)
        this.scene.start("WeeCairScene");
      });
  }
}

export default NewGameScene;
