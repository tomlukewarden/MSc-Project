import Phaser from "phaser";
import { inventoryManager } from "./openInventory"; 

export class ChestUI extends Phaser.Scene {
  constructor() {
    super({ key: "ChestUI" });
    this.chestItems = [];
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];
  }

  init(data) {
    // Pass chest items as { items: [...] }
    this.chestItems = data.items || [];
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background panel
    this.add.rectangle(width / 2, height / 2, 420, 320, 0x8d5524)
      .setStrokeStyle(4, 0x3e2f1c)
      .setAlpha(0.97)
      .setDepth(105);

    this.add.text(width / 2, height / 2 - 120, "Chest", {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // Render chest items
    this.renderItems();

    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + 130, "Close", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#fff",
      backgroundColor: "#a0522d",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setDepth(107)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => closeBtn.setStyle({ backgroundColor: "#c68642" }))
      .on("pointerout", () => closeBtn.setStyle({ backgroundColor: "#a0522d" }))
      .on("pointerdown", () => this.scene.stop());

    // Optional: clicking outside closes chest
    this.input.once("pointerdown", (pointer, currentlyOver) => {
      if (!currentlyOver.length) this.scene.stop();
    });
  }

  renderItems() {
    const { width, height } = this.sys.game.config;
    // Remove old
    this.itemRects.forEach(r => r.destroy());
    this.itemTexts.forEach(t => t.destroy());
    this.itemImages.forEach(img => img.destroy());
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];

    // Draw new
    this.chestItems.forEach((item, idx) => {
      const x = width / 2 - 100 + idx * 110;
      const y = height / 2;

      const rect = this.add.rectangle(
        x, y, 90, 90, item.color || 0xd2b48c
      ).setStrokeStyle(3, 0x3e2f1c).setDepth(106).setInteractive();

      let img = null;
      if (item.key && this.textures.exists(item.key)) {
        img = this.add.image(x, y - 10, item.key)
          .setDisplaySize(60, 60)
          .setDepth(107);
        this.itemImages.push(img);
      }

      const text = this.add.text(
        x, y + 35, item.name, {
          fontFamily: "Georgia",
          fontSize: "18px",
          color: "#222"
        }
      ).setOrigin(0.5).setDepth(108);

      rect.on("pointerdown", () => {
        // Add to inventory and remove from chest
        inventoryManager.addItem(item);
        this.chestItems.splice(idx, 1);
        this.renderItems();
      });

      this.itemRects.push(rect);
      this.itemTexts.push(text);
    });
  }
}

export default ChestUI;