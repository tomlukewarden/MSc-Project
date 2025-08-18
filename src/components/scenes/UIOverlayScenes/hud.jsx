import Phaser from "phaser";
import { inventoryManager } from "./openInventory";
import globalTimeManager from "../day/timeManager";

class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: "HUDScene", active: true });
  }

  preload() {
    this.scene.stop("OpenJournal");

    this.load.image("inventoryIcon", "/assets/ui-items/inventory.png");
    this.load.image("settingsIcon", "/assets/ui-items/settings.png");
    this.load.image("journalIcon", "/assets/ui-items/journal.png");
    this.load.image("toolbarSlot", "/assets/ui-items/slot.png");
    this.load.image("energyFull", "/assets/energy/full.png");
    this.load.image("energyHalf", "/assets/energy/50.png");
    this.load.image("energyEmpty", "/assets/energy/10.png");
  }

  create() {
    const { width, height } = this.scale;

    // === Top-right icons ===
    const iconKeys = ["inventoryIcon", "journalIcon", "settingsIcon"];
    const iconSpacing = 140;
    const iconStartX = 900;
    const iconScale = 0.045;
    const iconY = 56;

    const icons = {};

    iconKeys.forEach((key, index) => {
      const icon = this.add
        .image(iconStartX + index * iconSpacing, iconY, key)
        .setInteractive({ useHandCursor: true })
        .setScale(iconScale)
        .setScrollFactor(0)
        .setDepth(999);

      icons[key] = icon;
    });

    icons["journalIcon"].on("pointerdown", () => {
      this.scene.launch("OpenJournal");
      this.scene.bringToTop("OpenJournal");
    });

    icons["settingsIcon"].on("pointerdown", () => {
      this.scene.launch("OpenSettings");
      this.scene.bringToTop("OpenSettings");
    });

    icons["inventoryIcon"].on("pointerdown", () => {
      this.scene.launch("OpenInventory");
      this.scene.bringToTop("OpenInventory");
    });

    // === Time Box (Bottom Left) ===
    const boxWidth = 180;
    const boxHeight = 56;
    const boxX = 16 + boxWidth / 2;
    const boxY = height - 16 - boxHeight / 2;

    this.timeBox = this.add
      .rectangle(boxX, boxY, boxWidth, boxHeight, 0x222a2a, 0.85)
      .setStrokeStyle(2, 0x4caf50)
      .setDepth(99999);

    this.timeText = this.add
      .text(boxX, boxY - 10, "", {
        fontSize: "18px",
        fontFamily: "Georgia",
        color: "#fff",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(99999);

    this.progressBarBg = this.add
      .rectangle(boxX, boxY + 14, boxWidth - 32, 8, 0x444, 0.7)
      .setOrigin(0.5)
      .setDepth(99999);

    this.progressBar = this.add
      .rectangle(boxX - (boxWidth - 32) / 2, boxY + 14, 0, 8, 0xffc107, 0.9)
      .setOrigin(0, 0.5)
      .setDepth(99999);

    this.updateTimeText = () => {
      const timeOfDay = globalTimeManager.getCurrentTimeOfDay();
      this.timeText.setText(`Time: ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`);

      const stage = globalTimeManager.getCurrentStage();
      const stageDuration = globalTimeManager.stageDuration;
      const elapsed = (Date.now() - globalTimeManager.startTimestamp) / 1000;
      const stageElapsed = elapsed - stage * stageDuration;
      const progress = Math.min(stageElapsed / stageDuration, 1);
      const barWidth = (boxWidth - 32) * progress;
      this.progressBar.width = barWidth;
    };

    this.updateTimeText();

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: this.updateTimeText,
    });

  }
}

export default HUDScene;
