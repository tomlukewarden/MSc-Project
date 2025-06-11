import Phaser from "phaser";

class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: "HUDScene", active: true });
    }
    preload() {
        const inventory = this.load.image("inventoryIcon","src/assets/ui-items/inventory.png");
      const settings = this.load.image("settingsIcon","src/assets/ui-items/settings.png");
      const journal =  this.load.image("journalIcon","src/assets/ui-items/journal.png");
        // const volume = this.load.image("volumeIcon","src/assets/ui-items/volume.png");
        const openBook = this.load.image("openBookIcon","src/assets/ui-items/book.png");
    

    }

    create() {

        // HUD icon settings
        const iconKeys = [
            "inventoryIcon",
            "journalIcon",
            "settingsIcon",
        ];
        const iconSpacing = 140; 
        const iconStartX = 1040; 
        const iconY = 86;       
        const iconScale = 0.05;

        // Store references to the created icons
        const icons = {};

        iconKeys.forEach((key, idx) => {
            icons[key] = this.add.image(iconStartX + idx * iconSpacing, iconY, key)
                .setOrigin(0.5)
                .setScale(iconScale)
                .setInteractive({ useHandCursor: true });
        });

        // Now you can use icons["journalIcon"], etc.
        icons["journalIcon"].on("pointerdown", () => {
            console.log("Journal icon clicked");
            // Add functionality for journal icon click
        });

        icons["settingsIcon"].on("pointerdown", () => {
            console.log("Settings icon clicked");
            // Add functionality for settings icon click
        });

        icons["inventoryIcon"].on("pointerdown", () => {
            console.log("Inventory icon clicked");
            // Add functionality for inventory icon click
        });

    }
}

export default HUDScene;