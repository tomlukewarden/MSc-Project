import Phaser from "phaser";
import { saveToLocal, loadFromLocal, removeFromLocal } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
  }
  preload() {
  this.load.image("settingsBackground", "/assets/ui-items/overlayBg.png");
}

  create() {
    const { width, height } = this.sys.game.config;

    // Use settingsBackground image instead of rectangle
    this.add.image(width / 2, height / 2, "settingsBackground")
      .setDisplaySize(520, 420)
      .setDepth(1)
      .setAlpha(0.98);

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
      this.time.delayedCall(2000, () => {
        if (textObj && !textObj.destroyed) textObj.destroy();
      });
    // Clean up on shutdown/destroy
    this.events.on('shutdown', () => {
      // Add any additional cleanup if needed
    });
    this.events.on('destroy', () => {
      // Add any additional cleanup if needed
    });
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
        // Show confirmation dialog
        const confirmBg = this.add.rectangle(width / 2, height / 2 + 200, 340, 120, 0xf5f5dc, 0.98)
          .setStrokeStyle(4, 0xd7263d)
          .setDepth(30);
        const confirmText = this.add.text(width / 2, height / 2 + 170, "Are you sure you want \n to clear this save?", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#d7263d",
          fontStyle: "bold"
        }).setOrigin(0.5).setDepth(31);
        const yesBtn = this.add.text(width / 2 - 60, height / 2 + 230, "Yes", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#fff",
          backgroundColor: "#d7263d",
          fontStyle: "bold",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
        const noBtn = this.add.text(width / 2 + 60, height / 2 + 230, "No", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#fff",
          backgroundColor: "#3388cc",
          fontStyle: "bold",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });

        yesBtn.on("pointerdown", () => {
          // Remove all relevant state keys
          removeFromLocal("botanistSave");
          removeFromLocal("coins");
          removeFromLocal("personalGardenSceneState");
          removeFromLocal("middleGardenSceneState");
          removeFromLocal("wallGardenSceneState");
          removeFromLocal("shardGardenSceneState");
          removeFromLocal("greenhouseSceneState");
          removeFromLocal("timeOfDay");
          confirmBg.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
          showTempMessage("All save data cleared! Restarting...", height / 2 + 140);
          this.time.delayedCall(1200, () => {
            this.scene.stop();
            this.scene.get("HUDScene")?.scene?.stop();
            this.scene.get("PersonalGarden")?.scene?.stop();
            this.scene.get("MiddleGardenScene")?.scene?.stop();
            this.scene.get("WallGardenScene")?.scene?.stop();
            this.scene.get("ShardGardenScene")?.scene?.stop();
            this.scene.get("GreenhouseScene")?.scene?.stop();
            this.scene.start("StartScene");
          });
        });
        noBtn.on("pointerdown", () => {
          confirmBg.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
        });
      });
  }
}

export default OpenSettings;