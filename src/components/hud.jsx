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

        const topIconsTotalWidth = iconSpacing * (iconKeys.length - 1);

        // Store references to the created icons
        const icons = {};

        iconKeys.forEach((key, idx) => {
            icons[key] = this.add.image(iconStartX + idx * iconSpacing, iconY, key)
                .setOrigin(0.5)
                .setScale(iconScale)
                .setInteractive({ useHandCursor: true });
        });
        // Add map text in top left corner (no button)
        const mapTextX = 56;
        const mapTextY = 32;
        const mapText = this.add.text(mapTextX, mapTextY, "MAP", {
            font: "bold 16px Arial",
            color: "#fff",
            align: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        mapText.on("pointerdown", () => {
            this.scene.launch("MapScene");
            this.scene.bringToTop("MapScene");
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

        let selectedSlotIndex = null;
        slots.forEach((slot, i) => {
            slot.on("pointerover", () => {
                slot.setTint(0xaaaaaa);
            });
            slot.on("pointerout", () => {
                slot.clearTint();
            });
            slot.on("pointerdown", () => {
                // Deselect all slots visually
                slots.forEach((s, idx) => {
                    if (idx !== i) s.setAlpha(1);
                });
                // Toggle selection
                if (selectedSlotIndex === i) {
                    slot.setAlpha(1);
                    selectedSlotIndex = null;
                } else {
                    slot.setAlpha(0.6);
                    selectedSlotIndex = i;
                }
                this.game.scene.getScenes(true).forEach(scene => {
                    if (scene.events) {
                        scene.events.emit("selectToolbarSlot", selectedSlotIndex);
                    }
                });
            });
        });

        const updateToolbarSlots = (toolbarSlots) => {
            for (let i = 0; i < slotCount; i++) {
                if (slotItemImages[i]) {
                    slotItemImages[i].destroy();
                    slotItemImages[i] = null;
                }
                const item = toolbarSlots[i];
                if (item && item.key && this.textures.exists(item.key)) {
                    const img = this.add.image(slots[i].x, slots[i].y - 2, item.key)
                        .setDisplaySize(38, 38)
                        .setDepth(slots[i].depth + 1 || 1);
                    slotItemImages[i] = img;
                }
            }
        };

        updateToolbarSlots(inventoryManager.getToolbarSlots());
        inventoryManager.onToolbarChange(updateToolbarSlots);
        inventoryManager.onChange(() => {
            updateToolbarSlots(inventoryManager.getToolbarSlots());
        });

        const energyY = toolbarY - 70;
        const energyIcon = this.add.image(width / 2, energyY, "energyFull")
            .setOrigin(0.5)
            .setScale(0.1)
            .setInteractive({ useHandCursor: true });

        // Add time-of-day indicator (top right)
        try {
            const globalTimeManager = require("../../day/timeManager").default;
            this.timeText = this.add.text(width - 180, 24, "", {
                fontSize: "22px",
                fontFamily: "Georgia",
                color: "#fff",
                backgroundColor: "#222a",
                padding: { left: 12, right: 12, top: 6, bottom: 6 },
                align: "center"
            }).setDepth(99999);
            // Initial update
            this.updateTimeText = () => {
                if (this.timeText) {
                    const timeOfDay = globalTimeManager.getCurrentTimeOfDay();
                    this.timeText.setText(`Time: ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`);
                }
            };
            this.updateTimeText();
            // Update every 2 seconds
            this.time.addEvent({
                delay: 2000,
                loop: true,
                callback: () => this.updateTimeText()
            });
        } catch (e) {
            // If globalTimeManager is not available, do nothing
        }
    }
}

export default HUDScene;