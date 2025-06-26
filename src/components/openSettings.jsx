import Phaser from "phaser";
import { saveToLocal } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.rectangle(width / 2, height / 2, 500, 400, 0x222233, 0.95)
      .setStrokeStyle(4, 0x88ccff)
      .setDepth(1);

    // Title
    this.add.text(width / 2, height / 2 - 160, "Settings", {
      fontFamily: "Georgia",
      fontSize: "36px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(2);

    // Example: Volume slider (visual only)
    this.add.text(width / 2 - 150, height / 2 - 60, "Music Volume", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff"
    }).setOrigin(0, 0.5);

    const volumeBarBg = this.add.rectangle(width / 2 + 40, height / 2 - 60, 200, 16, 0x444455).setOrigin(0, 0.5);
    const volumeBar = this.add.rectangle(width / 2 + 40, height / 2 - 60, 120, 16, 0x88ccff).setOrigin(0, 0.5);

    // Example: Toggle (visual only)
    this.add.text(width / 2 - 150, height / 2, "Fullscreen", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff"
    }).setOrigin(0, 0.5);

    const toggleBg = this.add.rectangle(width / 2 + 40, height / 2, 60, 32, 0x444455).setOrigin(0, 0.5);
    const toggleBtn = this.add.circle(width / 2 + 60, height / 2, 14, 0x88ccff).setOrigin(0.5);

    toggleBg.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      if (toggleBtn.x === width / 2 + 60) {
        toggleBtn.x = width / 2 + 90;
        // Set fullscreen ON here
        this.scale.startFullscreen();
      } else {
        toggleBtn.x = width / 2 + 60;
        // Set fullscreen OFF here
        this.scale.stopFullscreen();
      }
    });

    // Save button
    const saveBtn = this.add.text(width / 2 - 100, height / 2 + 140, "Save", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#225522",
      padding: { left: 24, right: 24, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => saveBtn.setStyle({ backgroundColor: "#338833" }))
      .on("pointerout", () => saveBtn.setStyle({ backgroundColor: "#225522" }))
      .on("pointerdown", () => {
        const coins = this.registry.get("coins") || 0;
        const inventory = this.registry.get("inventory") || [];
        const isFullscreen = this.scale.isFullscreen;

        saveToLocal("botanistSave", {
          coins,
          inventory,
          isFullscreen
        });

        this.add.text(width / 2, height / 2 + 100, "Settings & Game Saved!", {
          fontFamily: "Georgia",
          fontSize: "20px",
          color: "#ffe066",
          backgroundColor: "#222",
          padding: { left: 16, right: 16, top: 6, bottom: 6 }
        }).setOrigin(0.5).setDepth(10);
      });

    // Back button
    const backBtn = this.add.text(width / 2 + 100, height / 2 + 140, "Back", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#222",
      padding: { left: 24, right: 24, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#444" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#222" }))
      .on("pointerdown", () => {
        this.scene.stop("SettingsScene");
        this.scene.resume("HUDScene");
      });
  }
}

export default OpenSettings;