import Phaser from "phaser";

class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: "HUDScene", active: true });
    }
    preload() {
        this.load.image("inventoryIcon","src/assets/ui-items/inventory.png");
        this.load.image("settingsIcon","src/assets/ui-items/settings.png");
        this.load.image("journalIcon","src/assets/ui-items/journal.png");
        this.load.image("volumeIcon","src/assets/ui-items/volume.png");
    

    }

    create() {

        // HUD icon settings
        const iconKeys = [
            "inventoryIcon",
            "journalIcon",
            "settingsIcon",
        ];
        const iconSpacing = 140; // increased space between icons
        const iconStartX = 1040;  // starting x position
        const iconY = 86;       // y position for all icons
        const iconScale = 0.05; // smaller scale for HUD icons

        iconKeys.forEach((key, idx) => {
            this.add.image(iconStartX + idx * iconSpacing, iconY, key)
                .setOrigin(0.5)
                .setScale(iconScale);
        });

        
    }
}

export default HUDScene;