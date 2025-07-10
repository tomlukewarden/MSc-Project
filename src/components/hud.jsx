import Phaser from "phaser";
import { getCollectedPlants } from "../components/journalManager";
import { inventoryManager } from "./openInventory";

class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: "HUDScene", active: true });
    }
    preload() {
        this.scene.stop("OpenJournal");
        this.load.image("inventoryIcon","/assets/ui-items/inventory.png");
        this.load.image("settingsIcon","/assets/ui-items/settings.png");
        this.load.image("journalIcon","/assets/ui-items/journal.png");
        this.load.image("toolbarSlot", "/assets/ui-items/slot.png");
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
        const topIconsTotalWidth = iconSpacing * (iconKeys.length - 1);

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

        // Toolbar slots at bottom center
        const toolbarY = height - 50;
        const slotCount = 6; 
        const slotSpacing = 90;
        const slots = [];
        const slotItemImages = [];
        const toolbarTotalWidth = slotSpacing * (slotCount - 1);
        const startX = width / 2 - toolbarTotalWidth / 2;
        for (let i = 0; i < slotCount; i++) {
            const slot = this.add.image(startX + i * slotSpacing, toolbarY, "toolbarSlot")
                .setOrigin(0.5)
                .setScale(0.045)
                .setInteractive({ useHandCursor: true });
            slots.push(slot);
            slotItemImages.push(null); // Placeholder for item image overlays
        }

        // Add hover effects for toolbar slots
        slots.forEach((slot, i) => {
            slot.on("pointerover", () => {
                slot.setTint(0xaaaaaa);
            });
            slot.on("pointerout", () => {
                slot.clearTint();
            });
            slot.on("pointerdown", () => {
                console.log("Toolbar slot clicked", i);
            });
        });

        // Helper to update slot overlays
        const updateToolbarSlots = (toolbarSlots) => {
            for (let i = 0; i < slotCount; i++) {
                // Remove old overlay if exists
                if (slotItemImages[i]) {
                    slotItemImages[i].destroy();
                    slotItemImages[i] = null;
                }
                const item = toolbarSlots[i];
                if (item && item.key && this.textures.exists(item.key)) {
                    // Overlay item image on slot
                    const img = this.add.image(slots[i].x, slots[i].y - 2, item.key)
                        .setDisplaySize(38, 38)
                        .setDepth(slots[i].depth + 1 || 1);
                    slotItemImages[i] = img;
                }
            }
        };

        // Initial render
        updateToolbarSlots(inventoryManager.getToolbarSlots());
        // Listen for toolbar changes
        inventoryManager.onToolbarChange(updateToolbarSlots);

        // Energy icon directly above toolbar
        const energyY = toolbarY - 70;
        const energyIcon = this.add.image(width / 2, energyY, "energyFull")
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });
    }
}

export default HUDScene;