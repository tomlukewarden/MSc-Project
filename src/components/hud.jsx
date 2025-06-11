import Phaser from "phaser";

class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: "HUDScene", active: true });
    }
    preload() {
        this.load.image("inventoryIcon","src/assets/ui-items/inventory.png")
        this.load.image("settingsIcon","src/assets/ui-items/settings.png");
        this.load.image("journalIcon","src/assets/ui-items/journal.png");
        this.load.image("volumeIcon","src/assets/ui-items/volume.png");
        this.load.image("openBook", "src/assets/ui-items/book.png");

    }

    create() {
        this.cameras.main.setBackgroundColor("#ffffff");

        this.add.image(50, 50, "inventoryIcon")
            .setOrigin(0.5)
            .setScale(0.3);

        this.add.image(150, 50, "settingsIcon")
            .setOrigin(-5)
            .setScale(0.3);

        this.add.image(250, 50, "journalIcon")
            .setOrigin(0.5)
            .setScale(0.3);

        this.add.image(350, 50, "volumeIcon")
            .setOrigin(0.5)
            .setScale(0.3);

        this.add.image(450, 50, "openBook")
            .setOrigin(0.5)
            .setScale(0.3);
    }
}

export default HUDScene;