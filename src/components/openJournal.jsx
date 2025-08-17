import Phaser from "phaser";
import { getCollectedPlants } from "./journalManager";
import plantData from "../plantData";
import recipieData from "../recipieData";
import buddiesData from "../buddies";
import quests from "../quests/quests"
import achievements from "../quests/achievments"
import { saveToLocal, loadFromLocal } from "../utils/localStorage";

class OpenJournal extends Phaser.Scene {
  constructor() {
    super({ key: "OpenJournal" });
    this.currentPage = 0;
  }

  init(data) {
    let collectedKeys = [];
    let journalState = loadFromLocal && loadFromLocal("journalState");
    if (data && Array.isArray(data.plants) && data.plants.length > 0) {
      collectedKeys = data.plants;
    } else {
      collectedKeys = getCollectedPlants();
    }
    this.collectedPlants = collectedKeys
      .map(key => plantData.find(p => p.key === key))
      .filter(Boolean); // Remove any not found

    // Restore tab and page if available
    if (journalState) {
      this.activeTab = journalState.activeTab || "plants";
      this.currentPage = typeof journalState.currentPage === "number" ? journalState.currentPage : 0;
    } else {
      this.activeTab = "plants";
      this.currentPage = 0;
    }
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
    
    // Happy buddies
    this.load.image("beeBuddy", "/assets/npc/dialogue/beeHappy.png");
    this.load.image("butterflyBuddy", "/assets/npc/dialogue/butterflyHappy.png");
    this.load.image("fairyBuddy", "/assets/npc/dialogue/fairyHappy.PNG")
    this.load.image("elephantBuddy", "/assets/npc/dialogue/elephantHappy.png");
    this.load.image("wolfBuddy", "/assets/npc/dialogue/wolfHappy.PNG");
    this.load.image("deerBuddy", "/assets/npc/dialogue/deerHappy.png");
    this.load.image("pigBuddy", "/assets/npc/dialogue/pigHappy.PNG");
    this.load.image("turtleBuddy", "/assets/npc/dialogue/turtleHappy.PNG");
    this.load.image("rabbitBuddy", "/assets/npc/dialogue/rabbitHappy.PNG");
    this.load.image("polarBearBuddy", "/assets/npc/dialogue/polarHappy.png");
    this.load.image("moleBuddy", "/assets/npc/dialogue/moleHappy.png");

    // Sad versions for quests
    this.load.image("beeSad", "/assets/npc/dialogue/beeSad.png");
    this.load.image("butterflySad", "/assets/npc/dialogue/butterflySad.png");
    this.load.image("fairySad", "/assets/npc/dialogue/fairySad.PNG");
    this.load.image("elephantSad", "/assets/npc/dialogue/elephantSad.png");
    this.load.image("wolfSad", "/assets/npc/dialogue/wolfSad.PNG");
    this.load.image("deerSad", "/assets/npc/dialogue/deerSad.png");
    this.load.image("pigSad", "/assets/npc/dialogue/pigSad.PNG");
    this.load.image("turtleSad", "/assets/npc/dialogue/turtleSad.PNG");
    this.load.image("rabbitSad", "/assets/npc/dialogue/rabbitSad.PNG");
    this.load.image("polarBearSad", "/assets/npc/dialogue/polarSad.png");
    this.load.image("moleSad", "/assets/npc/dialogue/moleSad.png");

    // Shard images for shard quests
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.image("summerShard", "/assets/items/summer.png");
    this.load.image("autumnShard", "/assets/items/autumn.png");
    this.load.image("winterShard", "/assets/items/winter.png");

    // Quest-specific images
    this.load.image("hoeIcon","/assets/tools/hoe.png" )
    this.load.image("questGeneral", "/assets/misc/questGeneral.png"); // Generic quest icon

    // Optionally, load all plant images here if not already loaded elsewhere
    plantData.forEach(plant => {
      if (plant.imageKey) {
        this.load.image(plant.imageKey, `/assets/items/${plant.imageKey}.png`);
      }
    });
    recipieData.forEach(recipe => {
      if (recipe.result && recipe.result.imageKey) {
        this.load.image(recipe.result.imageKey, `/assets/crafting/${recipe.result.imageKey}.png`);
      }
    });  }

  create() {
    const { width, height } = this.sys.game.config;

    // Background
    this.add.image(width / 2, height / 2, 'journal').setScale(0.4).setDepth(0);
    this.title = this.add.text(width / 2, 80, "Journal", {
      fontFamily: "Georgia",
      fontSize: "36px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // --- Tabs ---
    const tabY = 130;
    const tabStyle = (active) => ({
      fontFamily: "Georgia",
      fontSize: "24px",
      color: active ? "#fff" : "#3e2f1c",
      backgroundColor: active ? "#567d46" : "#e0cda9",
      padding: { left: 24, right: 24, top: 8, bottom: 8 },
      fontStyle: active ? "bold" : "normal"
    });

    this.plantsTab = this.add.text(width / 2 - 240, tabY, "Plants", tabStyle(this.activeTab === "plants"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.activeTab !== "plants") {
          this.activeTab = "plants";
          this.currentPage = 0;
          this.renderJournalTab();
        }
      });

    this.recipiesTab = this.add.text(width / 2 - 120, tabY, "Recipies", tabStyle(this.activeTab === "recipies"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.activeTab !== "recipies") {
          this.activeTab = "recipies";
          this.currentPage = 0;
          this.renderJournalTab();
        }
      });

    this.buddiesTab = this.add.text(width / 2, tabY, "Buddies", tabStyle(this.activeTab === "buddies"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.activeTab !== "buddies") {
          this.activeTab = "buddies";
          this.currentPage = 0;
          this.renderJournalTab();
        }
      });

    // --- New Quest Tab ---
    this.questsTab = this.add.text(width / 2 + 120, tabY, "Quests", tabStyle(this.activeTab === "quests"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.activeTab !== "quests") {
          this.activeTab = "quests";
          this.currentPage = 0;
          this.renderJournalTab();
        }
      });

    // --- New Achievements Tab ---
    this.achievementsTab = this.add.text(width / 2 + 240, tabY, "Achievements", tabStyle(this.activeTab === "achievements"))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        if (this.activeTab !== "achievements") {
          this.activeTab = "achievements";
          this.currentPage = 0;
          this.renderJournalTab();
        }
      });

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
      // Save current tab and page to local storage
      saveToLocal("journalState", {
        activeTab: this.activeTab,
        currentPage: this.currentPage,
        collectedPlants: this.collectedPlants.map(p => p.key)
      });
      saveToLocal("quests", quests);

      this.scene.stop();
      this.scene.resume("HUDScene");
    });

    // Next/Prev buttons for all tabs
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
      if (this.activeTab === "plants" && this.currentPage < this.collectedPlants.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "recipies" && this.currentPage < recipieData.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "buddies" && this.currentPage < buddiesData.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "quests" && this.currentPage < quests.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "achievements" && this.currentPage < achievements.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      }
    });
    this.nextBtn.on("pointerdown", () => {
      if (this.activeTab === "plants" && this.currentPage < this.collectedPlants.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "recipies" && this.currentPage < recipieData.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "buddies" && this.currentPage < buddiesData.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "quests" && this.currentPage < quests.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      } else if (this.activeTab === "achievements" && this.currentPage < achievements.length - 1) {
        this.currentPage++;
        this.renderJournalTab();
      }
    });
    this.prevBtnBg.on("pointerdown", () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderJournalTab();
      }
    });
    this.prevBtn.on("pointerdown", () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderJournalTab();
      }
    });

    this.activeTab = "plants";
    this.renderJournalTab();
  }

  renderJournalTab() {
    // Remove previous content
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
    if (this.recipeImage && !this.recipeImage.destroyed) this.recipeImage.destroy();
    if (this.recipeName && !this.recipeName.destroyed) this.recipeName.destroy();
    if (this.recipeIngredients && !this.recipeIngredients.destroyed) this.recipeIngredients.destroy();
    if (this.recipeDescription && !this.recipeDescription.destroyed) this.recipeDescription.destroy();
    if (this.buddyImage && !this.buddyImage.destroyed) this.buddyImage.destroy();
    if (this.buddyName && !this.buddyName.destroyed) this.buddyName.destroy();
    if (this.buddyDesc && !this.buddyDesc.destroyed) this.buddyDesc.destroy();
    if (this.questTitle && !this.questTitle.destroyed) this.questTitle.destroy();
    if (this.questDesc && !this.questDesc.destroyed) this.questDesc.destroy();
    if (this.achievementTitle && !this.achievementTitle.destroyed) this.achievementTitle.destroy();
    if (this.achievementDesc && !this.achievementDesc.destroyed) this.achievementDesc.destroy();

    // Update tab styles
    const tabStyle = (active) => ({
      fontFamily: "Georgia",
      fontSize: "24px",
      color: active ? "#fff" : "#3e2f1c",
      backgroundColor: active ? "#567d46" : "#e0cda9",
      padding: { left: 24, right: 24, top: 8, bottom: 8 },
      fontStyle: active ? "bold" : "normal"
    });
    this.plantsTab.setStyle(tabStyle(this.activeTab === "plants"));
    this.recipiesTab.setStyle(tabStyle(this.activeTab === "recipies"));
    this.buddiesTab.setStyle(tabStyle(this.activeTab === "buddies"));
    this.questsTab.setStyle(tabStyle(this.activeTab === "quests"));
    this.achievementsTab.setStyle(tabStyle(this.activeTab === "achievements"));

    if (this.activeTab === "plants") {
      this.renderPlantPage();
    } else if (this.activeTab === "recipies") {
      this.renderRecipePage();
    } else if (this.activeTab === "buddies") {
      this.renderBuddyPage();
    } else if (this.activeTab === "quests") {
      this.renderQuestPage();
    } else if (this.activeTab === "achievements") {
      this.renderAchievementsPage();
    }
  }

  renderPlantPage() {
    // Remove previous plant display if any
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
    if (this.recipeImages && Array.isArray(this.recipeImages)) {
      this.recipeImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
    }

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
      this.plantImage = this.add.image(width / 2 - 180, height / 2, plant.imageKey)
        .setDisplaySize(200, 200)
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

  renderRecipePage() {
    // Remove previous recipe display if any
    if (this.recipeImage && !this.recipeImage.destroyed) this.recipeImage.destroy();
    if (this.recipeName && !this.recipeName.destroyed) this.recipeName.destroy();
    if (this.recipeIngredients && !this.recipeIngredients.destroyed) this.recipeIngredients.destroy();
    if (this.recipeDescription && !this.recipeDescription.destroyed) this.recipeDescription.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();

    const { width, height } = this.sys.game.config;
    const recipe = recipieData[this.currentPage];

    if (!recipe) {
      this.recipeName = this.add.text(width / 2, height / 2, "No recipes available.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    // Recipe image
    if (recipe.imageKey && this.textures.exists(recipe.imageKey)) {
      this.recipeImage = this.add.image(width / 2 - 180, height / 2, recipe.imageKey)
        .setDisplaySize(200, 200)
        .setDepth(2);
    }

    // Recipe name
    this.recipeName = this.add.text(width / 2 + 40, height / 2 - 40, recipe.name, {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#2d4739"
    });



    // Helper to get readable name from key
    const getDisplayName = (key) => {
      const plant = plantData.find(p => p.key === key);
      if (plant && plant.name) return plant.name;
      // Fallback: prettify key (only strip 'Plant' at the end)
      let name = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^(.)/, (m) => m.toUpperCase())
        .replace(/ Plant$/i, '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      // If name is empty, fallback to key
      if (!name) name = key;
      return name;
    };

    // Render all ingredients, one per line
    let ingredientsText = "";
    if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      ingredientsText = recipe.ingredients.map(i => `${getDisplayName(i.key)} x${i.amount}`).join('\n');
    } else {
      ingredientsText = "No ingredients.";
    }
    this.recipeIngredients = this.add.text(width / 2 + 40, height / 2 + 10, ingredientsText, {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#444",
      wordWrap: { width: 260 }
    });

    // Description
    this.recipeDescription = this.add.text(width / 2 + 40, height / 2 + 80, recipe.description || "", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#567d46",
      wordWrap: { width: 260 }
    });

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Page ${this.currentPage + 1} of ${recipieData.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Show/hide buttons based on number of recipes
    const showNav = recipieData.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav); 
    this.prevBtnBg.setVisible(showNav);
    // Enable/disable buttons
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < recipieData.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }

  renderBuddyPage() {
    // Remove previous buddy display if any
    if (this.buddyImage && !this.buddyImage.destroyed) this.buddyImage.destroy();
    if (this.buddyName && !this.buddyName.destroyed) this.buddyName.destroy();
    if (this.buddyDesc && !this.buddyDesc.destroyed) this.buddyDesc.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();

    const { width, height } = this.sys.game.config;
    const buddy = buddiesData[this.currentPage];

    if (!buddy) {
      this.buddyName = this.add.text(width / 2, height / 2, "No buddies found.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    // Buddy image
    if (buddy.imageKey && this.textures.exists(buddy.imageKey)) {
      this.buddyImage = this.add.image(width / 2 - 180, height / 2, buddy.imageKey)
        .setDisplaySize(200, 200) 
        .setDepth(2);
    }

    // Buddy name
    this.buddyName = this.add.text(width / 2 + 40, height / 2 - 40, buddy.name, {
      fontFamily: "Georgia",
      fontSize: "32px",
      color: "#2d4739"
    });

    // Buddy description
    this.buddyDesc = this.add.text(width / 2 + 40, height / 2 + 10, buddy.description || "No info.", {
      fontFamily: "Georgia",
      fontSize: "20px",
      color: "#444",
      wordWrap: { width: 260 }
    });

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Page ${this.currentPage + 1} of ${buddiesData.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Show/hide buttons based on number of buddies
    const showNav = buddiesData.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    // Enable/disable buttons
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < buddiesData.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }

  // --- New Quest Page Renderer ---
  renderQuestPage() {
    const { width, height } = this.sys.game.config;

    // Remove previous quest display if any
    if (this.questImage && !this.questImage.destroyed) this.questImage.destroy();
    if (this.questTitle && !this.questTitle.destroyed) this.questTitle.destroy();
    if (this.questDesc && !this.questDesc.destroyed) this.questDesc.destroy();
    if (this.questStatus && !this.questStatus.destroyed) this.questStatus.destroy();
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();
    if (this.completedTitle && !this.completedTitle.destroyed) this.completedTitle.destroy();
    if (this.completedList && !this.completedList.destroyed) this.completedList.destroy();
    if (this.shardImages && Array.isArray(this.shardImages)) {
      this.shardImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
      this.shardImages = [];
    }

    // Filter quests
    const activeQuests = quests.filter(q => q.active && !q.completed);
    const completedQuests = quests.filter(q => q.completed);
    const allQuests = [...activeQuests, ...completedQuests];

    // --- LEFT SIDE: Completed Quests Checklist (moved more to center) ---
    if (completedQuests.length > 0) {
      this.completedTitle = this.add.text(width / 2 - 220, 200, "✓ Completed Quests:", {
        fontFamily: "Georgia",
        fontSize: "18px",
        color: "#567d46",
        fontStyle: "bold"
      });

      const checklistText = completedQuests.map(q => `✓ ${q.title}`).join('\n');
      this.completedList = this.add.text(width / 2 - 220, 230, checklistText, {
        fontFamily: "Georgia",
        fontSize: "14px",
        color: "#567d46",
        wordWrap: { width: 240 },
        lineSpacing: 5
      });
    } else {
      this.completedTitle = this.add.text(width / 2 - 220, 250, "No completed quests yet.", {
        fontFamily: "Georgia",
        fontSize: "16px",
        color: "#888",
        fontStyle: "italic"
      });
    }

    // --- RIGHT SIDE: Current Quest Display ---
    const quest = allQuests[this.currentPage];
    
    if (!quest) {
      this.questTitle = this.add.text(width / 2 + 150, height / 2, "No quests available.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    // Determine quest image based on quest type and status
    let questImageKey = this.getQuestImageKey(quest);

    // Quest image (moved more to the right)
    const imageX = width / 2 + 100;
    const imageY = height / 2 - 20;
    
    if (questImageKey && this.textures.exists(questImageKey)) {
      this.questImage = this.add.image(imageX, imageY, questImageKey)
        .setDisplaySize(160, 160)
        .setDepth(2);
    } else {
      // Fallback to generic quest icon
      if (this.textures.exists("questGeneral")) {
        this.questImage = this.add.image(imageX, imageY, "questGeneral")
          .setDisplaySize(160, 160)
          .setDepth(2);
      }
    }

    // Quest title (further right, above image)
    this.questTitle = this.add.text(imageX + 110, imageY - 80, quest.title, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: quest.completed ? "#567d46" : (quest.active ? "#2d4739" : "#888"),
      fontStyle: "bold",
      wordWrap: { width: 180 }
    });

    // Quest description (further right, next to image)
    this.questDesc = this.add.text(imageX + 110, imageY - 40, quest.description, {
      fontFamily: "Georgia",
      fontSize: "15px",
      color: "#444",
      wordWrap: { width: 180 },
      lineSpacing: 3
    });

    // Quest status (further right, below description)
    let statusText = "";
    let statusColor = "#444";
    if (quest.completed) {
      statusText = "✓ COMPLETED";
      statusColor = "#567d46";
    } else if (quest.active) {
      statusText = "⏳ IN PROGRESS";
      statusColor = "#d4851f";
    } else {
      statusText = "⚫ NOT STARTED";
      statusColor = "#888";
    }

    this.questStatus = this.add.text(imageX + 110, imageY + 40, statusText, {
      fontFamily: "Georgia",
      fontSize: "13px",
      color: statusColor,
      fontStyle: "bold",
      backgroundColor: statusColor === "#567d46" ? "#e8f5e8" : (statusColor === "#d4851f" ? "#fff3e0" : "#f5f5f5"),
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    });

    // Special handling for shard quests - show all 4 shards below image
    if (quest.title.toLowerCase().includes("shard")) {
      this.shardImages = [];
      const shardKeys = ["springShard", "summerShard", "autumnShard", "winterShard"];
      const shardStartX = imageX - 60;
      const shardStartY = imageY + 100;
      
      // Add shard title
      this.add.text(shardStartX, shardStartY - 20, "Seasonal Shards:", {
        fontFamily: "Georgia",
        fontSize: "12px",
        color: "#567d46",
        fontStyle: "italic"
      });
      
      shardKeys.forEach((shardKey, index) => {
        if (this.textures.exists(shardKey)) {
          const shardImage = this.add.image(
            shardStartX + (index * 40), 
            shardStartY, 
            shardKey
          )
          .setDisplaySize(30, 30)
          .setDepth(3);
          this.shardImages.push(shardImage);
        }
      });
    }

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Quest ${this.currentPage + 1} of ${allQuests.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Show/hide buttons based on number of quests
    const showNav = allQuests.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < allQuests.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }

  // Helper method to determine quest image
  getQuestImageKey(quest) {
    // FIRST: Check if quest has a predefined imageKey and use it
    if (quest.imageKey) {
      // Handle completion status conversion for buddy images
      if (quest.imageKey.endsWith("Sad") && quest.completed) {
        // Convert sad to buddy version when completed
        const buddyVersion = quest.imageKey.replace("Sad", "Buddy");
        if (this.textures.exists(buddyVersion)) {
          return buddyVersion;
        }
      } else if (quest.imageKey.endsWith("Buddy") && !quest.completed) {
        // Convert buddy to sad version when not completed
        const sadVersion = quest.imageKey.replace("Buddy", "Sad");
        if (this.textures.exists(sadVersion)) {
          return sadVersion;
        }
      }
      
      // If texture exists, use the defined imageKey as-is
      if (this.textures.exists(quest.imageKey)) {
        return quest.imageKey;
      }
    }

    // FALLBACK: If no imageKey defined or texture doesn't exist, use keyword detection
    const title = quest.title.toLowerCase();
    const description = quest.description.toLowerCase();
    
    // Check if quest involves specific buddies by name in title or description
    if (title.includes("paula nator") || description.includes("paula nator")) {
      return quest.completed ? "beeBuddy" : "beeSad";
    }
    if (title.includes("mona") || description.includes("mona")) {
      return quest.completed ? "butterflyBuddy" : "butterflySad";
    }
    if (title.includes("flora") || description.includes("flora")) {
      return quest.completed ? "fairyBuddy" : "fairySad";
    }
    if (title.includes("tia") || description.includes("tia")) {
      return quest.completed ? "elephantBuddy" : "elephantSad";
    }
    if (title.includes("fang drescher") || description.includes("fang drescher")) {
      return quest.completed ? "wolfBuddy" : "wolfSad";
    }
    if (title.includes("elkton john") || description.includes("elkton john")) {
      return quest.completed ? "deerBuddy" : "deerSad";
    }
    if (title.includes("chris p. bacon") || description.includes("chris p. bacon")) {
      return quest.completed ? "pigBuddy" : "pigSad";
    }
    if (title.includes("murtle") || description.includes("murtle")) {
      return quest.completed ? "turtleBuddy" : "turtleSad";
    }
    if (title.includes("carrie cake") || description.includes("carrie cake")) {
      return quest.completed ? "rabbitBuddy" : "rabbitSad";
    }
    if (title.includes("digmund freud") || description.includes("digmund freud")) {
      return quest.completed ? "moleBuddy" : "moleSad";
    }
    if (title.includes("snowbert") || description.includes("snowbert")) {
      return quest.completed ? "polarBearBuddy" : "polarBearSad";
    }
    
    // Type-based fallbacks
    if (title.includes("shard")) {
      return quest.completed ? "butterflyBuddy" : "butterflySad";
    }
    if (title.includes("plant") || title.includes("herb") || title.includes("collect")) {
      return quest.completed ? "fairyBuddy" : "fairySad";
    }
    if (title.includes("bee") || title.includes("pollination") || title.includes("honey")) {
      return quest.completed ? "beeBuddy" : "beeSad";
    }
    if (title.includes("craft") || title.includes("recipe") || title.includes("remedy")) {
      return quest.completed ? "elephantBuddy" : "elephantSad";
    }
    if (title.includes("garden") || title.includes("farm") || title.includes("grow")) {
      return quest.completed ? "fairyBuddy" : "fairySad";
    }
    
    // Default fallback
    return quest.completed ? "questGeneral" : "butterflySad";
  }
}
export default OpenJournal;