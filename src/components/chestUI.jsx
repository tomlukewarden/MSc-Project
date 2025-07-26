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

  init() {
    // Always use window.chestItems as the source of truth
    // Group stackable items by key+name
    const rawItems = window.chestItems || [];
    const stackMap = {};
    rawItems.forEach(item => {
      const stackKey = `${item.key || ''}|${item.name || ''}`;
      if (!stackMap[stackKey]) {
        stackMap[stackKey] = { ...item, quantity: 1 };
      } else {
        stackMap[stackKey].quantity += 1;
      }
    });
    this.chestItems = Object.values(stackMap);
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Responsive chest panel size
    const minPanelWidth = 320;
    const minPanelHeight = 220;
    const maxPanelWidth = Math.min(width * 0.8, 600);
    const maxPanelHeight = Math.min(height * 0.6, 400);
    const panelWidth = Math.max(minPanelWidth, Math.min(maxPanelWidth, 140 + this.chestItems.length * 110));
    const panelHeight = Math.max(minPanelHeight, maxPanelHeight);

    // Background panel
    this.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x8d5524)
      .setStrokeStyle(4, 0x3e2f1c)
      .setAlpha(0.97)
      .setDepth(105);

    this.add.text(width / 2, height / 2 - panelHeight / 2 + 40, "Chest", {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // Render chest items
    this.renderItems(panelWidth, panelHeight);

    // Close button
    const closeBtn = this.add.text(width / 2, height / 2 + panelHeight / 2 - 30, "Close", {
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

  renderItems(panelWidth = 420, panelHeight = 320) {
    const { width, height } = this.sys.game.config;
    // Remove old
    this.itemRects.forEach(r => r.destroy());
    this.itemTexts.forEach(t => t.destroy());
    this.itemImages.forEach(img => img.destroy());
    this.itemRects = [];
    this.itemTexts = [];
    this.itemImages = [];

    // Always use window.chestItems for rendering
    // Group stackable items by key+name
    const rawItems = window.chestItems || [];
    const stackMap = {};
    rawItems.forEach(item => {
      const stackKey = `${item.key || ''}|${item.name || ''}`;
      if (!stackMap[stackKey]) {
        stackMap[stackKey] = { ...item, quantity: 1 };
      } else {
        stackMap[stackKey].quantity += 1;
      }
    });
    this.chestItems = Object.values(stackMap);
    const itemCount = this.chestItems.length;
    const itemSize = Math.min(90, Math.max(60, panelWidth / Math.max(itemCount, 1) - 20));
    const totalWidth = itemCount * (itemSize + 20) - 20;
    const startX = width / 2 - totalWidth / 2 + itemSize / 2;
    const y = height / 2;

    // Draw new
    this.chestItems.forEach((item, idx) => {
      const x = startX + idx * (itemSize + 20);

      const rect = this.add.rectangle(
        x, y, itemSize, itemSize, item.color || 0xd2b48c
      ).setStrokeStyle(3, 0x3e2f1c).setDepth(106).setInteractive();

      let img = null;
      if (item.key && this.textures.exists(item.key)) {
        img = this.add.image(x, y - 10, item.key)
          .setDisplaySize(itemSize * 0.7, itemSize * 0.7)
          .setDepth(107);
        this.itemImages.push(img);
      }

      // Show name and quantity
      const text = this.add.text(
        x, y + itemSize / 2 - 10,
        item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name,
        {
          fontFamily: "Georgia",
          fontSize: Math.max(14, Math.min(18, itemSize / 5)),
          color: "#222"
        }
      ).setOrigin(0.5).setDepth(108);

      rect.on("pointerdown", () => {
        // Add one to inventory and remove one from chest stack
        inventoryManager.addItem(item);
        // Remove one matching item from window.chestItems
        const stackKey = `${item.key || ''}|${item.name || ''}`;
        const idxToRemove = window.chestItems.findIndex(i => `${i.key || ''}|${i.name || ''}` === stackKey);
        if (idxToRemove !== -1) window.chestItems.splice(idxToRemove, 1);
        // Recalculate panel size and redraw
        this.scene.restart();
      });

      this.itemRects.push(rect);
      this.itemTexts.push(text);
    });
  }
}

export default ChestUI;