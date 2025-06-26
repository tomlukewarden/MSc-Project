import Phaser from "phaser";
import { saveToLocal } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Brighter, more visible background panel with border
    this.add.rectangle(width / 2, height / 2, 520, 420, 0xf5f5dc, 0.98)
      .setStrokeStyle(6, 0x88ccff)
      .setDepth(1);

    // Title with shadow
    this.add.text(width / 2, height / 2 - 160, "Settings", {
      fontFamily: "Georgia",
      fontSize: "40px",
      color: "#fff",
      fontStyle: "bold",
      stroke: "#88ccff",
      strokeThickness: 3,
      shadow: { offsetX: 2, offsetY: 2, color: "#fff", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Volume slider label
    this.add.text(width / 2 - 150, height / 2 - 60, "Music Volume", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#111", // much darker
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#fff", blur: 0, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    // Volume bar background and fill
    this.add.rectangle(width / 2 + 40, height / 2 - 60, 200, 18, 0xcccccc)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x567d46)
      .setDepth(2);
    this.add.rectangle(width / 2 + 40, height / 2 - 60, 120, 18, 0x88ccff)
      .setOrigin(0, 0.5)
      .setDepth(2);

    // Fullscreen toggle label
    this.add.text(width / 2 - 150, height / 2, "Fullscreen", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#111", // much darker
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

    // Save button - bright green
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

        this.add.text(width / 2, height / 2 + 100, "Settings & Game Saved!", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#234",
          backgroundColor: "#ffe066",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(20);
      });

    // Back button - bright blue
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
  }
}

export default OpenSettings;