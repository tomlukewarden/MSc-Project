import Phaser from "phaser";
import { saveToLocal, loadFromLocal, wipeAllGameData } from "../utils/localStorage";

class OpenSettings extends Phaser.Scene {
  constructor() {
    super({ key: "OpenSettings" });
    this.musicVolume = 0.5;
    this.volumeSlider = null;
    this.volumeFill = null;
    
    // Colorblind overlay properties
    this.colorBlindSettings = {
      enabled: false,
      filterType: 'none',
      intensity: 0.8,
      greenEnhancement: true
    };
    this.colorOverlay = null;
    this.colorSettingsPanel = null;
    this.isColorSettingsOpen = false;
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

    // Load colorblind settings
    const savedColorSettings = loadFromLocal('accessibilitySettings');
    if (savedColorSettings) {
      this.colorBlindSettings = { ...this.colorBlindSettings, ...savedColorSettings };
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
      color: "#ffe066",
      fontStyle: "bold",
      stroke: "#2c1810",
      strokeThickness: 2,
      shadow: { offsetX: 2, offsetY: 2, color: "#000", blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(2);

    // Music Volume Label
    this.add.text(width / 2 - 200, height / 2 - 60, "Music Volume", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff",
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#000", blur: 1, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    // Volume controls
    const volumeBarBg = this.add.rectangle(width / 2 - 10, height / 2 - 60, 200, 20, 0x3e2f1c)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x8b7355)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    this.volumeFill = this.add.rectangle(width / 2 - 10, height / 2 - 60, 200 * this.musicVolume, 20, 0x4caf50)
      .setOrigin(0, 0.5)
      .setDepth(3);

    this.volumeSlider = this.add.circle(
      width / 2 - 10 + (200 * this.musicVolume), 
      height / 2 - 60, 
      12, 
      0xffe066
    )
      .setDepth(4)
      .setInteractive({ useHandCursor: true });

    this.volumeText = this.add.text(width / 2 + 140, height / 2 - 60, `${Math.round(this.musicVolume * 100)}%`, {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#fff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5).setDepth(10);

    this.setupVolumeControl(volumeBarBg, width / 2 - 80, height / 2 - 60);

    // === COLORBLIND ACCESSIBILITY SECTION ===
    this.add.text(width / 2 - 200, height / 2 - 10, "Accessibility", {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#fff",
      fontStyle: "bold",
      shadow: { offsetX: 1, offsetY: 1, color: "#000", blur: 1, fill: true }
    }).setOrigin(0, 0.5).setDepth(10);

    // Main toggle for colorblind features
    const enableText = this.add.text(width / 2 - 150, height / 2 + 20, "Enable Color Vision Help", {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#fff"
    }).setOrigin(0, 0.5).setDepth(10);

    const toggleBg = this.add.rectangle(width / 2 + 50, height / 2 + 20, 60, 30, 
      this.colorBlindSettings.enabled ? 0x4CAF50 : 0x666666, 0.8)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xFFFFFF)
      .setDepth(10);

    const toggleSlider = this.add.circle(
      width / 2 + 50 + (this.colorBlindSettings.enabled ? 15 : -15), 
      height / 2 + 20, 
      12, 
      0xFFFFFF
    ).setDepth(11);

    // Toggle interaction
    toggleBg.on('pointerdown', () => {
      this.colorBlindSettings.enabled = !this.colorBlindSettings.enabled;
      
      // Update visual
      toggleBg.setFillStyle(this.colorBlindSettings.enabled ? 0x4CAF50 : 0x666666, 0.8);
      toggleSlider.setPosition(
        width / 2 + 50 + (this.colorBlindSettings.enabled ? 15 : -15), 
        height / 2 + 20
      );
      
      // Apply filter
      this.applyColorFilter();
      this.saveColorSettings();
    });

    // Options button
    const optionsBtn = this.add.text(width / 2 + 120, height / 2 + 20, "Options", {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#fff",
      backgroundColor: "#4CAF50",
      padding: { left: 12, right: 12, top: 6, bottom: 6 }
    })
      .setOrigin(0.5)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleColorSettings());

    // Create color overlay
    this.createColorOverlay();
    this.createColorSettingsPanel();
    
    // Apply initial filter
    this.applyColorFilter();

    // === HELPER FUNCTIONS ===
    
    // Helper to show a temporary message
    const showTempMessage = (msg, y) => {
      const textObj = this.add.text(width / 2, y, msg, {
        fontFamily: "Georgia",
        fontSize: "22px",
        color: "#2c1810",
        backgroundColor: "#ffe066",
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

    // Back button
    const backBtn = this.add.text(width / 2 + 100, height / 2 + 80, "Back", {
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

    // Clear Save button
    const clearBtn = this.add.text(width / 2, height / 2 + 140, "Clear Save", {
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
        // Show confirmation dialog
        const confirmBg = this.add.rectangle(width / 2, height / 2 + 140, 340, 120, 0xf5f5dc, 0.98)
          .setStrokeStyle(4, 0xd7263d)
          .setDepth(30);
        const confirmText = this.add.text(width / 2, height / 2 + 110, "Are you sure you want \n to clear this save?", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#d7263d",
          fontStyle: "bold"
        }).setOrigin(0.5).setDepth(31);
        const yesBtn = this.add.text(width / 2 - 60, height / 2 + 170, "Yes", {
          fontFamily: "Georgia",
          fontSize: "22px",
          color: "#fff",
          backgroundColor: "#d7263d",
          fontStyle: "bold",
          padding: { left: 18, right: 18, top: 8, bottom: 8 }
        }).setOrigin(0.5).setDepth(32).setInteractive({ useHandCursor: true });
        const noBtn = this.add.text(width / 2 + 60, height / 2 + 170, "No", {
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
              showTempMessage("✅ All save data cleared & saved to DB! Restarting...", height / 2 + 80);
            } else {
              console.warn("⚠️ Local data cleared but database save failed");
              showTempMessage("✅ Local data cleared! (DB save failed)", height / 2 + 80);
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
            showTempMessage("⚠️ Some data may not have cleared properly", height / 2 + 80);
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
      this.hideAccessibilityTooltip();
    });
    this.events.on('destroy', () => {
      this.hideAccessibilityTooltip();
    });
  }

  /**
   * === NEW ACCESSIBILITY METHODS ===
   */

  /**
   * Launches the ColorBlind Overlay scene
   * Checks if scene already exists to prevent duplicates
   */
  launchAccessibilityOverlay() {
    console.log("🎨 Launching Accessibility Options...");
    
    // Check if ColorBlind Overlay is already running
    const overlayScene = this.scene.get('ColorBlindOverlay');
    
    if (overlayScene && (this.scene.manager.isActive('ColorBlindOverlay') || this.scene.manager.isPaused('ColorBlindOverlay'))) {
      // If already running, just bring it to focus
      console.log("Accessibility overlay already running, bringing to focus");
      this.scene.bringToTop('ColorBlindOverlay');
      
      // Toggle the settings panel if it exists
      if (overlayScene.toggleSettingsPanel) {
        overlayScene.isSettingsOpen = true;
        overlayScene.toggleSettingsPanel();
      }
    } else {
      // Launch new instance
      this.scene.launch('ColorBlindOverlay');
      console.log("Accessibility overlay launched");
      
      // Show a brief instruction message
      this.showTempAccessibilityMessage("Look for the 👁 button in the top-right corner!", this.sys.game.config.height / 2 + 40);
    }
  }

  /**
   * Shows tooltip for accessibility button
   */
  showAccessibilityTooltip(x, y) {
    // Remove existing tooltip
    this.hideAccessibilityTooltip();
    
    this.accessibilityTooltip = this.add.text(x, y, 
      "Open color-blind friendly options\nHelps with green-heavy scenes", {
      fontFamily: "Georgia",
      fontSize: "14px",
      color: "#fff",
      backgroundColor: "#2E2E2E",
      padding: { left: 8, right: 8, top: 4, bottom: 4 },
      align: "center"
    }).setOrigin(0.5, 0).setDepth(15);
  }

  /**
   * Hides accessibility tooltip
   */
  hideAccessibilityTooltip() {
    if (this.accessibilityTooltip && !this.accessibilityTooltip.destroyed) {
      this.accessibilityTooltip.destroy();
      this.accessibilityTooltip = null;
    }
  }

  /**
   * Shows temporary message for accessibility features
   */
  showTempAccessibilityMessage(msg, y) {
    const textObj = this.add.text(this.sys.game.config.width / 2, y, msg, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#fff",
      backgroundColor: "#4CAF50",
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
      align: "center"
    }).setOrigin(0.5).setDepth(25);
    
    this.time.delayedCall(3000, () => {
      if (textObj && !textObj.destroyed) textObj.destroy();
    });
  }

  /**
   * === EXISTING METHODS (unchanged) ===
   */

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

  // === COLORBLIND OVERLAY METHODS ===

  createColorOverlay() {
    this.colorOverlay = this.add.graphics();
    this.colorOverlay.setDepth(500);
    this.colorOverlay.setVisible(false);
  }

  createColorSettingsPanel() {
    const { width, height } = this.sys.game.config;
    
    this.colorSettingsPanel = this.add.container(width / 2, height / 2 + 50).setDepth(999);
    
    // Panel background
    const panelBg = this.add.rectangle(0, 0, 300, 200, 0x2E2E2E, 0.95)
      .setStrokeStyle(2, 0x4CAF50);
    
    // Title
    const title = this.add.text(0, -80, 'Color Vision Options', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Filter options
    const filterOptions = [
      { text: 'None', value: 'none' },
      { text: 'Green-Blind Helper', value: 'deuteranopia' },
      { text: 'Red-Blind Helper', value: 'protanopia' },
      { text: 'High Contrast', value: 'contrast' }
    ];
    
    let yPos = -40;
    filterOptions.forEach(option => {
      const button = this.createFilterButton(0, yPos, option.text, option.value);
      this.colorSettingsPanel.add(button);
      yPos += 25;
    });
    
    // Green enhancement toggle
    const greenToggle = this.createColorToggle(0, 50, 'Green Enhancement', 
      this.colorBlindSettings.greenEnhancement, (value) => {
        this.colorBlindSettings.greenEnhancement = value;
        this.applyColorFilter();
        this.saveColorSettings();
      });
    
    // Close button
    const closeBtn = this.add.text(130, -80, '✕', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleColorSettings());
    
    this.colorSettingsPanel.add([panelBg, title, greenToggle, closeBtn]);
    this.colorSettingsPanel.setVisible(false);
  }

  createFilterButton(x, y, text, value) {
    const isSelected = this.colorBlindSettings.filterType === value;
    
    const button = this.add.rectangle(x, y, 220, 20, 
      isSelected ? 0x4CAF50 : 0x555555, 0.8)
      .setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    button.on('pointerdown', () => {
      this.colorBlindSettings.filterType = value;
      this.updateFilterButtons();
      this.applyColorFilter();
      this.saveColorSettings();
    });
    
    const container = this.add.container(0, 0);
    container.add([button, buttonText]);
    container.filterValue = value;
    return container;
  }

  createColorToggle(x, y, label, initialValue, onChange) {
    const container = this.add.container(x, y);
    
    const labelText = this.add.text(-60, 0, label, {
      fontFamily: 'Georgia',
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    
    const toggleBg = this.add.rectangle(40, 0, 40, 20, 
      initialValue ? 0x4CAF50 : 0x666666, 0.8)
      .setInteractive({ useHandCursor: true });
    
    const toggleSlider = this.add.circle(
      40 + (initialValue ? 10 : -10), 0, 8, 0xFFFFFF
    );
    
    let currentValue = initialValue;
    toggleBg.on('pointerdown', () => {
      currentValue = !currentValue;
      toggleBg.setFillStyle(currentValue ? 0x4CAF50 : 0x666666, 0.8);
      toggleSlider.setPosition(40 + (currentValue ? 10 : -10), 0);
      onChange(currentValue);
    });
    
    container.add([labelText, toggleBg, toggleSlider]);
    return container;
  }

  updateFilterButtons() {
    this.colorSettingsPanel.list.forEach(item => {
      if (item.filterValue) {
        const isSelected = this.colorBlindSettings.filterType === item.filterValue;
        item.list[0].setFillStyle(isSelected ? 0x4CAF50 : 0x555555, 0.8);
      }
    });
  }

  toggleColorSettings() {
    this.isColorSettingsOpen = !this.isColorSettingsOpen;
    this.colorSettingsPanel.setVisible(this.isColorSettingsOpen);
  }

  applyColorFilter() {
    if (!this.colorOverlay) return;
    
    this.colorOverlay.clear();
    
    if (!this.colorBlindSettings.enabled) {
      this.colorOverlay.setVisible(false);
      return;
    }
    
    this.colorOverlay.setVisible(true);
    const { width, height } = this.sys.game.config;
    
    switch (this.colorBlindSettings.filterType) {
      case 'deuteranopia':
        this.colorOverlay.fillStyle(0x0066CC, 0.15 * this.colorBlindSettings.intensity);
        this.colorOverlay.fillRect(0, 0, width, height);
        break;
      case 'protanopia':
        this.colorOverlay.fillStyle(0x00FFFF, 0.1 * this.colorBlindSettings.intensity);
        this.colorOverlay.fillRect(0, 0, width, height);
        break;
      case 'contrast':
        this.colorOverlay.fillStyle(0x000000, 0.3);
        this.colorOverlay.fillRect(0, 0, width, height);
        break;
      default:
        if (this.colorBlindSettings.greenEnhancement) {
          this.colorOverlay.fillStyle(0xFFAA44, 0.05 * this.colorBlindSettings.intensity);
          this.colorOverlay.fillRect(0, 0, width, height);
        }
    }
  }

  saveColorSettings() {
    saveToLocal('accessibilitySettings', this.colorBlindSettings);
  }
}

export default OpenSettings;