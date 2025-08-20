import Phaser from "phaser";
import { saveToLocal, loadFromLocal, wipeAllGameData } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
    this.musicVolume = 0.5; // Default volume
    this.volumeSlider = null;
    this.volumeFill = null;
  }

  preload() {
    this.load.image("settingsBackground", "/assets/ui-items/overlayBg.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    // Load saved settings
    const savedSettings = loadFromLocal("gameSettings");
    if (savedSettings) {
      this.musicVolume = savedSettings.musicVolume || 0.5;
    }

    // Use settingsBackground image instead of rectangle
    this.add.image(width / 2, height / 2, "settingsBackground")
      .setDisplaySize(520, 420)
      .setDepth(1)
      .setAlpha(0.98);

    // Title
    this.add.text(width / 2, height / 2 - 160, "Settings", {
      fontFamily: "Georgia",
      fontSize: "40px",
      color: "#ffe066", // Changed to bright yellow for dark background
      fontStyle: "bold",
      stroke: "#2c1810", // Dark brown stroke
      strokeThickness: 2,
      shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Music Volume Label - moved left
    this.add.text(width / 2 - 200, height / 2 - 60, "Music Volume", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff", // Changed to white for better visibility
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#000", blur: 1, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    // Volume bar background - moved left
    const volumeBarBg = this.add.rectangle(width / 2 - 10, height / 2 - 60, 200, 20, 0x3e2f1c)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x8b7355)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    // Volume bar fill - moved left
    this.volumeFill = this.add.rectangle(width / 2 - 10, height / 2 - 60, 200 * this.musicVolume, 20, 0x4caf50)
      .setOrigin(0, 0.5)
      .setDepth(3);

    // Volume percentage text - moved left
    this.volumeText = this.add.text(width / 2 + 140, height / 2 - 60, `${Math.round(this.musicVolume * 100)}%`, {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#fff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5).setDepth(10);

    // Make the volume bar interactive - updated position
    this.setupVolumeControl(volumeBarBg, width / 2 - 80, height / 2 - 60);

    // Helper to show a temporary message
    const showTempMessage = (msg, y) => {
      const textObj = this.add.text(width / 2, y, msg, {
        fontFamily: "Georgia",
        fontSize: "22px",
        color: "#2c1810", // Dark brown text
        backgroundColor: "#ffe066", // Yellow background
        padding: { left: 18, right: 18, top: 8, bottom: 8 }
      }).setOrigin(0.5).setDepth(20);
      this.time.delayedCall(2000, () => {
        if (textObj && !textObj.destroyed) textObj.destroy();
      });
    };

    // Helper to save wiped state to database
    const saveWipedStateToDB = async (nickname) => {
      const wipedGameState = {
        inventory: [],
        personalGardenSceneState: null,
        middleGardenSceneState: null,
        wallGardenSceneState: null,
        shardGardenSceneState: null,
        greenhouseSceneState: null,
        timeOfDay: "morning",
        journalState: null,
        settings: null,
        HUDState: null,
        quests: [],
        characterName: nickname,
        wipedAt: new Date().toISOString(),
        action: "GAME_RESET"
      };

      try {
        console.log("💾 Saving wiped game state to database...");
        const response = await fetch('http://localhost:3000/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname: nickname,
            gameState: wipedGameState
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Wiped game state saved to database:", data);
          return true;
        } else {
          console.error("❌ Failed to save wiped state to database:", response.status);
          return false;
        }
      } catch (error) {
        console.error("❌ Database save error:", error);
        return false;
      }
    };

    // Save button - moved up
    const saveBtn = this.add.text(width / 2 - 100, height / 2 + 60, "Save", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff",
      backgroundColor: "#3bb273",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => saveBtn.setStyle({ backgroundColor: "#2e8c5a" }))
      .on("pointerout", () => saveBtn.setStyle({ backgroundColor: "#3bb273" }))
      .on("pointerdown", () => {
        const coins = this.registry.get("coins") || 0;
        const inventory = this.registry.get("inventory") || [];
        const isFullscreen = this.scale.isFullscreen;

        // Save game settings including volume
        saveToLocal("gameSettings", {
          musicVolume: this.musicVolume,
          isFullscreen: isFullscreen
        });

        saveToLocal("botanistSave", {
          coins,
          inventory,
          isFullscreen
        });

        showTempMessage("Settings & Game Saved!", height / 2 + 20);
      });

    // Back button - moved up
    const backBtn = this.add.text(width / 2 + 100, height / 2 + 60, "Back", {
      fontFamily: "Georgia",
      fontSize: "26px",
      color: "#fff",
      backgroundColor: "#3388cc",
      fontStyle: "bold",
      padding: { left: 28, right: 28, top: 12, bottom: 12 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#225588" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#3388cc" }))
      .on("pointerdown", () => {
        this.scene.stop("OpenSettings");
        this.scene.resume("HUDScene");
      });

    // Clear Save button - moved up
    const clearBtn = this.add.text(width / 2, height / 2 + 120, "Clear Save", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff",
      backgroundColor: "#d7263d",
      fontStyle: "bold",
      padding: { left: 24, right: 24, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => clearBtn.setStyle({ backgroundColor: "#a61b2b" }))
      .on("pointerout", () => clearBtn.setStyle({ backgroundColor: "#d7263d" }))
      .on("pointerdown", () => {
        // Show confirmation dialog - moved up
        const confirmBg = this.add.rectangle(width / 2, height / 2 + 120, 340, 120, 0xf5f5dc, 0.98)
          .setStrokeStyle(4, 0xd7263d)
          .setDepth(30);
        const confirmText = this.add.text(width / 2, height / 2 + 90, "Are you sure you want \n to clear this save?", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#d7263d",
          fontStyle: "bold"
        }).setOrigin(0.5).setDepth(31);
        const yesBtn = this.add.text(width / 2 - 60, height / 2 + 150, "Yes", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#fff",
          backgroundColor: "#d7263d",
          fontStyle: "bold",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
        const noBtn = this.add.text(width / 2 + 60, height / 2 + 150, "No", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#fff",
          backgroundColor: "#3388cc",
          fontStyle: "bold",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });

        yesBtn.on("pointerdown", async () => {
          console.log("🗑️ Clear Save button clicked - starting data wipe...");
          
          const characterName = localStorage.getItem("characterName") || "Unknown";
          console.log(`📝 Character name before wipe: ${characterName}`);
          
          const wipeSuccess = wipeAllGameData(true);
          
          if (wipeSuccess) {
            console.log("✅ All game data successfully wiped!");
            
            const dbSaveSuccess = await saveWipedStateToDB(characterName);
            
            if (dbSaveSuccess) {
              console.log("✅ Wiped state saved to database!");
              showTempMessage("✅ All save data cleared & saved to DB! Restarting...", height / 2 + 60);
            } else {
              console.warn("⚠️ Local data cleared but database save failed");
              showTempMessage("✅ Local data cleared! (DB save failed)", height / 2 + 60);
            }
            
            if (window.inventoryManager) {
              if (window.inventoryManager.clear) {
                window.inventoryManager.clear();
              } else if (window.inventoryManager.items) {
                window.inventoryManager.items = [];
              }
              if (window.inventoryManager.emitChange) {
                window.inventoryManager.emitChange();
              }
            }
            
            this.registry.set("coins", 0);
            this.registry.set("inventory", []);
            this.registry.set("timeOfDay", "morning");
            
          } else {
            console.error("❌ Some data failed to clear!");
            showTempMessage("⚠️ Some data may not have cleared properly", height / 2 + 60);
          }

          confirmBg.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
          
          this.time.delayedCall(2000, () => {
            console.log("🔄 Restarting game...");
            
            const sceneManager = this.scene.manager;
            const scenesToStop = [
              "OpenSettings", "HUDScene", "PersonalGarden", "MiddleGardenScene", 
              "WallGardenScene", "ShardGardenScene", "GreenhouseScene", "OpenJournal",
              "OpenInventory", "MiniGameScene", "XOTutorialScene", "XOGameScene",
              "FishTutorialScene", "FishGameScene", "FlowerCatchTutorial", "FlowerCatchGame"
            ];
            
            scenesToStop.forEach(sceneKey => {
              if (sceneManager.isActive(sceneKey) || sceneManager.isPaused(sceneKey)) {
                console.log(`Stopping scene: ${sceneKey}`);
                this.scene.stop(sceneKey);
              }
            });
            
            this.scene.start("StartScene");
          });
        });

        noBtn.on("pointerdown", () => {
          console.log("Clear save cancelled by user");
          confirmBg.destroy();
          confirmText.destroy();
          yesBtn.destroy();
          noBtn.destroy();
        });
      });

    // Clean up on shutdown/destroy
    this.events.on('shutdown', () => {
      // Add any additional cleanup if needed
    });
    this.events.on('destroy', () => {
      // Add any additional cleanup if needed
    });
  }

  setupVolumeControl(volumeBarBg, barX, barY) {
    let isDragging = false;

    // Click/drag on volume bar
    volumeBarBg.on('pointerdown', (pointer) => {
      isDragging = true;
      this.updateVolume(pointer, barX);
    });

    // Click/drag on volume slider
    this.volumeSlider.on('pointerdown', () => {
      isDragging = true;
    });

    // Global pointer move
    this.input.on('pointermove', (pointer) => {
      if (isDragging) {
        this.updateVolume(pointer, barX);
      }
    });

    // Global pointer up
    this.input.on('pointerup', () => {
      isDragging = false;
    });
  }

  updateVolume(pointer, barX) {
    const relativeX = pointer.x - barX;
    const percentage = Phaser.Math.Clamp(relativeX / 200, 0, 1);
    
    this.musicVolume = percentage;
    
    // Update visual elements
    this.volumeFill.setDisplaySize(200 * percentage, 20);
    this.volumeSlider.setPosition(barX + (200 * percentage), this.volumeSlider.y);
    this.volumeText.setText(`${Math.round(percentage * 100)}%`);
    
    // Apply volume to all music
    this.updateAllMusicVolume();
  }

  updateAllMusicVolume() {
    // Update volume for all currently playing music
    const musicKeys = ['theme1', 'shopTheme', 'menuTheme'];
    
    musicKeys.forEach(key => {
      const sound = this.sound.get(key);
      if (sound && sound.isPlaying) {
        sound.setVolume(this.musicVolume);
      }
    });

    // Set global music volume for future sounds
    this.sound.volume = this.musicVolume;
  }
}

export default OpenSettings;