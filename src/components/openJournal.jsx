import Phaser from "phaser";
import { getCollectedPlants } from "./journalManager";
import plantData from "../plantData";

class OpenJournal extends Phaser.Scene {
  constructor() {
    super({ key: "OpenJournal" });
    this.currentPage = 0;
  }

  init(data) {
    let collectedKeys = [];
    if (data && Array.isArray(data.plants) && data.plants.length > 0) {
      collectedKeys = data.plants;
    } else {
      collectedKeys = getCollectedPlants();
    }
    this.collectedPlants = collectedKeys
      .map(key => plantData.find(p => p.key === key))
      .filter(Boolean); // Remove any not found
    this.currentPage = 0;
  }

  preload() {
    this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');
    this.load.image('journal', '/assets/ui-items/book.png');
    // Optionally, load all plant images here if not already loaded elsewhere
    plantData.forEach(plant => {
      if (plant.imageKey) {
        this.load.image(plant.imageKey, `/assets/items/${plant.imageKey}.png`);
      }
    });
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'journal').setScale(0.4).setDepth(0);
    this.title = this.add.text(width / 2, 80, "Journal", {
      fontFamily: "Georgia",
      fontSize: "36px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // --- Close "X" Button ---
    this.closeBtn = this.add.text(width - 60, 40, "✕", {
      fontFamily: "Georgia",
      fontSize: "36px",
      color: "#a33",
      backgroundColor: "#fff5",
      padding: { left: 10, right: 10, top: 2, bottom: 2 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(10);

    this.closeBtn.on("pointerdown", () => {
      this.scene.stop();
      this.scene.resume("HUDScene");
    });

    // Next/Prev buttons (created before renderPlantPage so they can be shown/hidden)
    this.nextBtnBg = this.add.rectangle(width / 2 + 120, height - 60, 110, 40, 0xe0cda9, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.nextBtn = this.add.text(width / 2 + 120, height - 60, "Next ▶", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#3e2f1c",
      backgroundColor: "#e0cda9",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5);

    this.prevBtnBg = this.add.rectangle(width / 2 - 120, height - 60, 110, 40, 0xe0cda9, 0.8)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.prevBtn = this.add.text(width / 2 - 120, height - 60, "◀ Prev", {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#3e2f1c",
      backgroundColor: "#e0cda9",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    }).setOrigin(0.5);

    this.nextBtnBg.on("pointerdown", () => {
      if (this.currentPage < this.collectedPlants.length - 1) {
        this.currentPage++;
        this.renderPlantPage();
      }
    });
    this.nextBtn.on("pointerdown", () => {
      if (this.currentPage < this.collectedPlants.length - 1) {
        this.currentPage++;
        this.renderPlantPage();
      }
    });

    this.prevBtnBg.on("pointerdown", () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderPlantPage();
      }
    });
    this.prevBtn.on("pointerdown", () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderPlantPage();
      }
    });

    // Render the first plant (after buttons are created)
    this.renderPlantPage();
  }

  renderPlantPage() {
    // Remove previous plant display if any
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
  // Clean up on shutdown/destroy
  this.events.on('shutdown', () => {
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
  });
  this.events.on('destroy', () => {
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
  });

    const { width, height } = this.sys.game.config;
    const plant = this.collectedPlants[this.currentPage];

    if (!plant) {
      this.plantName = this.add.text(width / 2, height / 2, "No plants collected yet.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    // Plant image
    if (plant.imageKey && this.textures.exists(plant.imageKey)) {
      this.plantImage = this.add.image(width / 2 - 100, height / 2, plant.imageKey)
        .setDisplaySize(120, 120)
        .setDepth(2);
    }

    // Plant name
    this.plantName = this.add.text(width / 2 + 40, height / 2 - 40, plant.name, {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#2d4739"
    });

    // Medicinal properties
    this.plantMedicinal = this.add.text(width / 2 + 40, height / 2 + 10, plant.medicinal || "No info.", {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#444",
      wordWrap: { width: 260 }
    });

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Page ${this.currentPage + 1} of ${this.collectedPlants.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Show/hide buttons based on number of plants
    const showNav = this.collectedPlants.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    // Enable/disable buttons
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < this.collectedPlants.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }
}

export default OpenJournal;