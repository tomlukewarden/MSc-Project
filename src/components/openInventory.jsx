
import { CoinManager } from "../components/coinManager";
import { loadFromLocal } from "../utils/localStorage";

const startingCoins = loadFromLocal("coins") || 0;
const coinManager = new CoinManager(startingCoins);
class OpenInventory extends Phaser.Scene {
  constructor() {
    super({ key: "OpenInventory" });
    this.coinText = null;
  }

  create() {
    const { width, height } = this.sys.game.config;
    this.add.rectangle(width / 2, height / 2, 420, 320, 0x567d46)
      .setStrokeStyle(4, 0x3e2f1c)
      .setAlpha(0.95)
      .setDepth(105);

    this.add.text(width / 2, height / 2 - 120, "Inventory", {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(106);

    // --- COINS ---
    this.coinText = this.add.text(width / 2 + 170, height / 2 - 140, `${coinManager.coins}c`, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#ffe066",
      backgroundColor: "#222",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(1, 0).setDepth(106);

    // Listen for coin changes and update display
    coinManager.onChange((coins) => {
      if (this.coinText) this.coinText.setText(`${coins}c`);
    });

    // Example items
    const items = [
      { name: "Seeds", color: 0xa3b18a },
      { name: "Foxglove", color: 0xd9ae7e },
      { name: "Spring Shard", color: 0x88cc88 }
    ];
    items.forEach((item, idx) => {
      this.add.rectangle(
        width / 2 - 100 + idx * 110, height / 2, 90, 90, item.color
      ).setStrokeStyle(3, 0x3e2f1c).setDepth(106);
      this.add.text(
        width / 2 - 100 + idx * 110, height / 2, item.name, {
          fontFamily: "Georgia",
          fontSize: "18px",
          color: "#222"
        }
      ).setOrigin(0.5).setDepth(106);
    });

    // Click anywhere to exit inventory
    this.input.once("pointerdown", () => {
      this.scene.stop("OpenInventory");
    });
  }
}

export default OpenInventory;