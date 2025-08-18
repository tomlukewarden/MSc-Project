import Phaser from "phaser";
import { loadFromLocal } from "../../../utils/localStorage";

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: "StartScene" });
    }

    preload() {
        this.load.image("logo", "/assets/backgrounds/start/botanist-logo.png");
        this.load.image("startButton", "/assets/backgrounds/start/start-button.png");
        this.load.image("background", "/assets/backgrounds/start/background.png");
          this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
              this.load.audio('finalTheme', '/assets/music/credits.mp3');
    }

    create() {
        if (this.sound.get("finalTheme")) {
            this.sound.stopByKey("finalTheme");
        }
        this.sound.play("theme1", {
            loop: true,
            volume: 0.1
        });
        const { width, height } = this.sys.game.config;

        // Stop HUD and Journal scenes if running
        this.scene.stop("HUDScene");
        this.scene.stop("OpenJournal");

        // --- Background ---
        this.add.image(width / 2, height / 2, "background").setScale(1.5);

        // --- Logo ---
        this.add.image(width / 2, height / 3, "logo").setScale(0.3);

        // --- Start Button ---
        const startButton = this.add.image(width / 2, height / 1.3, "startButton")
            .setScale(0.2)
            .setInteractive();

        startButton.on("pointerdown", () => {
            // Show popup
            this.showSavePopup(width, height);
        });

        this.add.text(width / 2, height / 1.05, "Made by Thomas Warden | Art by Emma Formosa", {
            fontSize: "16px",
            fill: "#000"
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 1.02, "Demo: 1.0.0", {
            fontSize: "16px",
            fill: "#000"
        }).setOrigin(0.5);
    }

    showSavePopup(width, height) {
        // Popup background
        const popupBg = this.add.rectangle(width / 2, height / 2, 400, 250, 0xffffff, 0.95)
            .setStrokeStyle(2, 0x3a5a40)
            .setDepth(10);

        // Popup text
        const popupText = this.add.text(width / 2, height / 2 - 80, "Do you have a current save?", {
            fontSize: "24px",
            color: "#3a5a40",
            fontFamily: "Georgia"
        }).setOrigin(0.5).setDepth(11);

        // Yes button
        const yesBtn = this.add.text(width / 2 - 60, height / 2 + 40, "Yes", {
            fontSize: "28px",
            backgroundColor: "#3bb273",
            color: "#fff",
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            fontFamily: "Georgia"
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

        // No button
        const noBtn = this.add.text(width / 2 + 60, height / 2 + 40, "No", {
            fontSize: "28px",
            backgroundColor: "#e05a47",
            color: "#fff",
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            fontFamily: "Georgia"
        }).setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });

        // Yes button handler
        yesBtn.on("pointerdown", () => {
            // Remove popup
            popupBg.destroy();
            popupText.destroy();
            yesBtn.destroy();
            noBtn.destroy();

            // Show input fields for nickname and farm name
            this.showUserInputPopup(width, height);
        });

        // No button handler
        noBtn.on("pointerdown", () => {
            popupBg.destroy();
            popupText.destroy();
            yesBtn.destroy();
            noBtn.destroy();
            // Start new game
            this.scene.stop("StartScene");
            this.scene.start("NewGameScene");
        });
    }

    showUserInputPopup(width, height) {
        // Input background
        const inputBg = this.add.rectangle(width / 2, height / 2, 400, 300, 0xffffff, 0.98)
            .setStrokeStyle(2, 0x3a5a40)
            .setDepth(12);

        // Input text
        const inputText = this.add.text(width / 2, height / 2 - 100, "Enter your nickname and farm name:", {
            fontSize: "20px",
            color: "#3a5a40",
            fontFamily: "Georgia"
        }).setOrigin(0.5).setDepth(13);

        // Nickname input
        const nicknameInput = this.add.dom(width / 2, height / 2 - 30, 'input', {
            type: 'text',
            fontSize: '18px',
            width: '220px',
            padding: '8px',
            borderRadius: '6px'
        }).setDepth(13);
        nicknameInput.node.placeholder = "Nickname";

        // Farm name input
        const farmInput = this.add.dom(width / 2, height / 2 + 20, 'input', {
            type: 'text',
            fontSize: '18px',
            width: '220px',
            padding: '8px',
            borderRadius: '6px'
        }).setDepth(13);
        farmInput.node.placeholder = "Farm Name";

        // Submit button
        const submitBtn = this.add.text(width / 2, height / 2 + 80, "Continue", {
            fontSize: "24px",
            backgroundColor: "#3bb273",
            color: "#fff",
            padding: { left: 30, right: 30, top: 10, bottom: 10 },
            fontFamily: "Georgia"
        }).setOrigin(0.5).setDepth(13).setInteractive({ useHandCursor: true });

        // Submit handler
        submitBtn.on("pointerdown", () => {
            const nickname = nicknameInput.node.value.trim();
            const farmname = farmInput.node.value.trim();

            if (!nickname || !farmname) {
                inputText.setText("Please enter both nickname and farm name.");
                return;
            }

            fetch(`http://localhost:3000/user?nickname=${nickname}&farmname=${farmname}`)
              .then(res => res.json())
              .then(userData => {
                console.log("Loaded userData:", userData);

                // Save userId and nickname to localStorage
                localStorage.setItem("userId", userData.id);
                localStorage.setItem("characterName", userData.nickname);

                // Optionally update lastLogin or active status
                fetch('http://localhost:3000/user/active', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: userData.id, lastLogin: new Date().toISOString() })
                });

                // Start game with loaded user/gameState
                this.scene.stop("StartScene");
                this.scene.start("PersonalGarden", { loadedState: userData.gameState });
                this.scene.launch("HUDScene");

                // Cleanup popup
                inputBg.destroy();
                inputText.destroy();
                nicknameInput.destroy();
                farmInput.destroy();
                submitBtn.destroy();
              });
        });
    }
}

export default StartScene;
