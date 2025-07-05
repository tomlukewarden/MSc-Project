import Phaser from "phaser";
import { getCollectedPlants } from "../components/journalManager"; // <-- Import your new journal manager

class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: "HUDScene", active: true });
    }
    preload() {
        this.scene.stop("OpenJournal");
        this.load.image("inventoryIcon","/assets/ui-items/inventory.png");
        this.load.image("settingsIcon","/assets/ui-items/settings.png");
        this.load.image("journalIcon","/assets/ui-items/journal.png");
        this.load.image("toolbarIcon","/assets/ui-items/toolbar.png");
        this.load.image("energyFull", "/assets/energy/full.png");
        this.load.image("energyHalf", "/assets/energy/50.png");
        this.load.image("energyEmpty", "/assets/energy/10.png");
    }

    create() {
        // HUD icon settings for top row
        const { width, height } = this.scale;

        const iconKeys = [
            "inventoryIcon",
            "journalIcon",
            "settingsIcon",
        ];
        const iconSpacing = 140;
        const iconStartX = 900;
        const iconScale = 0.045;
        const iconY = 56;

        // Center the top icons
        const totalWidth = iconSpacing * (iconKeys.length - 1);

        // Store references to the created icons
        const icons = {};

        iconKeys.forEach((key, idx) => {
            icons[key] = this.add.image(iconStartX + idx * iconSpacing, iconY, key)
                .setOrigin(0.5)
                .setScale(iconScale)
                .setInteractive({ useHandCursor: true });
        });

        icons["journalIcon"].on("pointerdown", () => {
            console.log("Journal icon clicked");
            const plants = getCollectedPlants(); // <-- Use your new system
            this.scene.launch("OpenJournal", { plants });
            this.scene.bringToTop("OpenJournal");
        });

        icons["settingsIcon"].on("pointerdown", () => {
            console.log("Settings icon clicked");
            this.scene.launch("OpenSettings");
            this.scene.bringToTop("OpenSettings");
        });

        icons["inventoryIcon"].on("pointerdown", () => {
            console.log("Inventory icon clicked");
            this.scene.launch("OpenInventory");
            this.scene.bringToTop("OpenInventory");
        });

        // Toolbar icon at bottom center
        const toolbarY = height - 50;
        const toolbar = this.add.image(width / 2, toolbarY, "toolbarIcon")
            .setOrigin(0.5)
            .setScale(0.15)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                console.log("Toolbar icon clicked");
            });

        // Energy icon directly above toolbar
        const energyY = toolbarY - 70;
        const energyIcon = this.add.image(width / 2, energyY, "energyFull")
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });
    }
}

export default HUDScene;