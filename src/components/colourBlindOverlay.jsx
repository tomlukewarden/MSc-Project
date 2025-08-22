import Phaser from 'phaser';
import { saveToLocal, loadFromLocal } from '../utils/localStorage';

class ColorBlindOverlay extends Phaser.Scene {
  constructor() {
    super({ key: 'ColorBlindOverlay' });
    
    this.settings = {
      enabled: false,
      filterType: 'none',
      intensity: 0.8,
      greenEnhancement: true
    };
    
    this.overlay = null;
    this.settingsPanel = null;
    this.toggleButton = null;
    this.isSettingsOpen = false;
  }

  create() {
    this.loadSettings();
    this.createToggleButton();
    this.createSettingsPanel();
    this.createOverlayFilter();
    this.setupEventHandlers();
    this.applyAccessibilityFilter();
  }

  createToggleButton() {
    const { width } = this.sys.game.config;
    
    this.toggleButton = this.add.rectangle(width - 50, 50, 40, 40, 0x4CAF50, 0.8)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xFFFFFF);
    
    this.add.text(width - 50, 50, '👁', {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(1001);
    
    this.toggleButton.on('pointerover', () => {
      this.toggleButton.setFillStyle(0x66BB6A, 0.9);
    });
    
    this.toggleButton.on('pointerout', () => {
      this.toggleButton.setFillStyle(0x4CAF50, 0.8);
    });
    
    this.toggleButton.on('pointerdown', () => {
      this.toggleSettingsPanel();
    });
  }

  createSettingsPanel() {
    const { width, height } = this.sys.game.config;
    
    this.settingsPanel = this.add.container(width - 300, 100).setDepth(999);
    
    // Panel background
    const panelBg = this.add.rectangle(0, 0, 280, 300, 0x2E2E2E, 0.95)
      .setStrokeStyle(2, 0x4CAF50);
    
    // Title
    const title = this.add.text(0, -130, 'Color Vision Options', {
      fontFamily: 'Georgia',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Enable toggle
    const enableToggle = this.createToggle(0, -90, 'Enable Filters', 
      this.settings.enabled, (value) => {
        this.settings.enabled = value;
        this.applyAccessibilityFilter();
        this.saveSettings();
      });
    
    // Filter buttons
    const filterOptions = [
      { text: 'None', value: 'none' },
      { text: 'Green-Blind Helper', value: 'deuteranopia' },
      { text: 'Red-Blind Helper', value: 'protanopia' },
      { text: 'High Contrast', value: 'contrast' }
    ];
    
    let yPos = -50;
    filterOptions.forEach(option => {
      const button = this.createFilterButton(0, yPos, option.text, option.value);
      this.settingsPanel.add(button);
      yPos += 30;
    });
    
    // Green enhancement toggle
    const greenToggle = this.createToggle(0, 80, 'Green Enhancement', 
      this.settings.greenEnhancement, (value) => {
        this.settings.greenEnhancement = value;
        this.applyAccessibilityFilter();
        this.saveSettings();
      });
    
    // Close button
    const closeBtn = this.add.text(120, -130, '✕', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleSettingsPanel());
    
    this.settingsPanel.add([panelBg, title, enableToggle, greenToggle, closeBtn]);
    this.settingsPanel.setVisible(false);
  }

  createToggle(x, y, label, initialValue, onChange) {
    const container = this.add.container(x, y);
    
    const labelText = this.add.text(-80, 0, label, {
      fontFamily: 'Georgia',
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);
    
    const toggleBg = this.add.rectangle(60, 0, 40, 20, 
      initialValue ? 0x4CAF50 : 0x666666, 0.8)
      .setInteractive({ useHandCursor: true });
    
    const toggleSlider = this.add.circle(
      60 + (initialValue ? 10 : -10), 0, 8, 0xFFFFFF
    );
    
    let currentValue = initialValue;
    toggleBg.on('pointerdown', () => {
      currentValue = !currentValue;
      toggleBg.setFillStyle(currentValue ? 0x4CAF50 : 0x666666, 0.8);
      toggleSlider.setPosition(60 + (currentValue ? 10 : -10), 0);
      onChange(currentValue);
    });
    
    container.add([labelText, toggleBg, toggleSlider]);
    return container;
  }

  createFilterButton(x, y, text, value) {
    const isSelected = this.settings.filterType === value;
    
    const button = this.add.rectangle(x, y, 220, 25, 
      isSelected ? 0x4CAF50 : 0x555555, 0.8)
      .setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(x, y, text, {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    button.on('pointerdown', () => {
      this.settings.filterType = value;
      this.updateFilterButtons();
      this.applyAccessibilityFilter();
      this.saveSettings();
    });
    
    const container = this.add.container(0, 0);
    container.add([button, buttonText]);
    container.filterValue = value; // Store for updates
    return container;
  }

  updateFilterButtons() {
    // Update all filter button colors
    this.settingsPanel.list.forEach(item => {
      if (item.filterValue) {
        const isSelected = this.settings.filterType === item.filterValue;
        item.list[0].setFillStyle(isSelected ? 0x4CAF50 : 0x555555, 0.8);
      }
    });
  }

  createOverlayFilter() {
    this.overlay = this.add.graphics();
    this.overlay.setDepth(500);
    this.overlay.setVisible(false);
  }

  applyAccessibilityFilter() {
    if (!this.overlay) return;
    
    this.overlay.clear();
    
    if (!this.settings.enabled) {
      this.overlay.setVisible(false);
      return;
    }
    
    this.overlay.setVisible(true);
    const { width, height } = this.sys.game.config;
    
    switch (this.settings.filterType) {
      case 'deuteranopia':
        // Blue tint for green-blind
        this.overlay.fillStyle(0x0066CC, 0.15 * this.settings.intensity);
        this.overlay.fillRect(0, 0, width, height);
        break;
      case 'protanopia':
        // Cyan tint for red-blind
        this.overlay.fillStyle(0x00FFFF, 0.1 * this.settings.intensity);
        this.overlay.fillRect(0, 0, width, height);
        break;
      case 'contrast':
        // High contrast overlay
        this.overlay.fillStyle(0x000000, 0.3);
        this.overlay.fillRect(0, 0, width, height);
        break;
      default:
        if (this.settings.greenEnhancement) {
          // Warm tint for green scenes
          this.overlay.fillStyle(0xFFAA44, 0.05 * this.settings.intensity);
          this.overlay.fillRect(0, 0, width, height);
        }
    }
  }

  toggleSettingsPanel() {
    this.isSettingsOpen = !this.isSettingsOpen;
    this.settingsPanel.setVisible(this.isSettingsOpen);
    
    if (this.isSettingsOpen) {
      this.settingsPanel.setDepth(1500);
    }
  }

  setupEventHandlers() {
    // Ctrl+A shortcut
    this.input.keyboard.on('keydown-A', (event) => {
      if (event.ctrlKey) {
        this.settings.enabled = !this.settings.enabled;
        this.applyAccessibilityFilter();
        this.saveSettings();
      }
    });
    
    // Click outside to close
    this.input.on('pointerdown', (pointer) => {
      if (this.isSettingsOpen) {
        const bounds = this.settingsPanel.getBounds();
        if (!bounds.contains(pointer.x, pointer.y)) {
          this.toggleSettingsPanel();
        }
      }
    });
  }

  saveSettings() {
    saveToLocal('accessibilitySettings', this.settings);
  }

  loadSettings() {
    const saved = loadFromLocal('accessibilitySettings');
    if (saved) {
      this.settings = { ...this.settings, ...saved };
    }
  }

  shutdown() {
    this.saveSettings();
  }
}

export default ColorBlindOverlay;
