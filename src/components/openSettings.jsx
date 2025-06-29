import Phaser from "phaser";
import { saveToLocal, loadFromLocal, removeFromLocal } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background panel
    this.add.rectangle(width / 2, height / 2, 520, 420, 0xf5f5dc, 0.98)
      .setStrokeStyle(6, 0x88ccff)
      .setDepth(1);

    // Title
    this.add.text(width / 2, height / 2 - 160, "Settings", {
      fontFamily: "Georgia",
      fontSize: "40px",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#88ccff",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#fff", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Music Volume
    this.add.text(width / 2 - 150, height / 2 - 60, "Music Volume", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#111",
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#fff", blur: 0, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    this.add.rectangle(width / 2 + 40, height / 2 - 60, 200, 18, 0xcccccc)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x567d46)
      .setDepth(2);
    this.add.rectangle(width / 2 + 40, height / 2 - 60, 120, 18, 0x88ccff)
      .setOrigin(0, 0.5)
      .setDepth(2);

    // Fullscreen toggle
    this.add.text(width / 2 - 150, height / 2, "Fullscreen", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#111",
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#fff", blur: 0, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    const toggleBg = this.add.rectangle(width / 2 + 40, height / 2, 70, 36, 0xcccccc)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x567d46)
      .setDepth(2);
    const toggleBtn = this.add.circle(width / 2 + 65, height / 2, 16, 0x88ccff)
      .setOrigin(0.5)
      .setDepth(3);

    toggleBg.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      if (toggleBtn.x === width / 2 + 65) {
        toggleBtn.x = width / 2 + 100;
        this.scale.startFullscreen();
      } else {
        toggleBtn.x = width / 2 + 65;
        this.scale.stopFullscreen();
      }
    });

    // Helper to show a temporary message
    const showTempMessage = (msg, y) => {
      const textObj = this.add.text(width / 2, y, msg, {
        fontFamily: "Georgia",
        fontSize: "22px",
        color: "#234",
        backgroundColor: "#ffe066",
        padding: { left: 18, right: 18, top: 8, bottom: 8 }
      }).setOrigin(0.5).setDepth(20);
      this.time.delayedCall(2000, () => textObj.destroy());
    };

    // Save button
    const saveBtn = this.add.text(width / 2 - 100, height / 2 + 140, "Save", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff",
      backgroundColor: "#3bb273",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => saveBtn.setStyle({ backgroundColor: "#2e8c5a" }))
      .on("pointerout", () => saveBtn.setStyle({ backgroundColor: "#3bb273" }))
      .on("pointerdown", () => {
        const coins = this.registry.get("coins") || 0;
        const inventory = this.registry.get("inventory") || [];
        const isFullscreen = this.scale.isFullscreen;

        saveToLocal("botanistSave", {
          coins,
          inventory,
          isFullscreen
        });

        showTempMessage("Settings & Game Saved!", height / 2 + 100);
      });

    // Back button
    const backBtn = this.add.text(width / 2 + 100, height / 2 + 140, "Back", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff",
      backgroundColor: "#3388cc",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#225588" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#3388cc" }))
      .on("pointerdown", () => {
        this.scene.stop("OpenSettings");
        this.scene.resume("HUDScene");
      });

    // Clear Save button
    const clearBtn = this.add.text(width / 2, height / 2 + 200, "Clear Save", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff",
      backgroundColor: "#d7263d",
      fontStyle: "bold",
      padding: { left: 24, right: 24, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => clearBtn.setStyle({ backgroundColor: "#a61b2b" }))
      .on("pointerout", () => clearBtn.setStyle({ backgroundColor: "#d7263d" }))
      .on("pointerdown", () => {
        removeFromLocal("botanistSave");
        removeFromLocal("coins");
        showTempMessage("All save data cleared!", height / 2 + 140);
      });
  }
}

export default OpenSettings;