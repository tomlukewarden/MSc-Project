import Phaser from "phaser";
import { getCollectedPlants } from "./journalManager";
import plantData from "../../../gameData/plantData";
import recipieData from "../../../gameData/recipieData";
import buddiesData from "../../../gameData/buddies";
import quests from "../../../gameData/quests"
import achievements from "../../../gameData/achievments"
import { saveToLocal, loadFromLocal } from "../../../utils/localStorage";

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


    this.load.image("star", "public/assets/misc/Star.png"); 

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
    // Remove ALL previous content for ALL tabs
    this.destroyAllTabContent();

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

  // Updated method to destroy all tab content
  destroyAllTabContent() {
    // Plants tab content (updated with new elements)
    if (this.plantImage && !this.plantImage.destroyed) this.plantImage.destroy();
    if (this.plantName && !this.plantName.destroyed) this.plantName.destroy();
    if (this.plantMedicinal && !this.plantMedicinal.destroyed) this.plantMedicinal.destroy();
    if (this.plantUsedInTitle && !this.plantUsedInTitle.destroyed) this.plantUsedInTitle.destroy();
    if (this.plantUsedInList && !this.plantUsedInList.destroyed) this.plantUsedInList.destroy();

    // Recipes tab content (updated with new elements)
    if (this.recipeImage && !this.recipeImage.destroyed) this.recipeImage.destroy();
    if (this.recipeName && !this.recipeName.destroyed) this.recipeName.destroy();
    if (this.recipeDescription && !this.recipeDescription.destroyed) this.recipeDescription.destroy();
    if (this.recipeIngredientsTitle && !this.recipeIngredientsTitle.destroyed) this.recipeIngredientsTitle.destroy();
    if (this.recipeIngredients && !this.recipeIngredients.destroyed) this.recipeIngredients.destroy();

    // Buddies tab content (updated with new elements)
    if (this.buddyImage && !this.buddyImage.destroyed) this.buddyImage.destroy();
    if (this.buddyName && !this.buddyName.destroyed) this.buddyName.destroy();
    if (this.buddyDesc && !this.buddyDesc.destroyed) this.buddyDesc.destroy();
    if (this.buddyStatus && !this.buddyStatus.destroyed) this.buddyStatus.destroy();

    // Quests tab content
    if (this.questImage && !this.questImage.destroyed) this.questImage.destroy();
    if (this.questTitle && !this.questTitle.destroyed) this.questTitle.destroy();
    if (this.questDesc && !this.questDesc.destroyed) this.questDesc.destroy();
    if (this.questStatus && !this.questStatus.destroyed) this.questStatus.destroy();
    if (this.completedTitle && !this.completedTitle.destroyed) this.completedTitle.destroy();
    if (this.completedList && !this.completedList.destroyed) this.completedList.destroy();
    if (this.shardImages && Array.isArray(this.shardImages)) {
      this.shardImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
      this.shardImages = [];
    }

    // Achievements tab content
    if (this.achievementImage && !this.achievementImage.destroyed) this.achievementImage.destroy();
    if (this.achievementTitle && !this.achievementTitle.destroyed) this.achievementTitle.destroy();
    if (this.achievementDesc && !this.achievementDesc.destroyed) this.achievementDesc.destroy();
    if (this.achievementStatus && !this.achievementStatus.destroyed) this.achievementStatus.destroy();
    if (this.completedAchievementsTitle && !this.completedAchievementsTitle.destroyed) this.completedAchievementsTitle.destroy();
    if (this.completedAchievementsList && !this.completedAchievementsList.destroyed) this.completedAchievementsList.destroy();

    // Page number (shared across tabs)
    if (this.pageNumText && !this.pageNumText.destroyed) this.pageNumText.destroy();

    // Recipe images array (if exists)
    if (this.recipeImages && Array.isArray(this.recipeImages)) {
      this.recipeImages.forEach(img => { if (img && !img.destroyed) img.destroy(); });
      this.recipeImages = [];
    }
  }

  // --- Updated Quest Page Renderer with proper cleanup ---
  renderQuestPage() {
    const { width, height } = this.sys.game.config;

    // Filter quests
    const activeQuests = quests.filter(q => q.active && !q.completed);
    const completedQuests = quests.filter(q => q.completed);
    const allQuests = [...activeQuests, ...completedQuests];

    // --- LEFT SIDE: Completed Quests Checklist ---
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

    // Quest image
    const imageX = width / 2 + 100;
    const imageY = height / 2 - 20;
    
    if (questImageKey && this.textures.exists(questImageKey)) {
      this.questImage = this.add.image(imageX, imageY, questImageKey)
        .setDisplaySize(160, 160)
        .setDepth(2);
    } else {
      if (this.textures.exists("questGeneral")) {
        this.questImage = this.add.image(imageX, imageY, "questGeneral")
          .setDisplaySize(160, 160)
          .setDepth(2);
      }
    }

    // Quest title
    this.questTitle = this.add.text(imageX + 110, imageY - 80, quest.title, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: quest.completed ? "#567d46" : (quest.active ? "#2d4739" : "#888"),
      fontStyle: "bold",
      wordWrap: { width: 180 }
    });

    // Quest description
    this.questDesc = this.add.text(imageX + 110, imageY - 40, quest.description, {
      fontFamily: "Georgia",
      fontSize: "15px",
      color: "#444",
      wordWrap: { width: 180 },
      lineSpacing: 3
    });

    // Quest status
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

    // Special handling for shard quests
    if (quest.title.toLowerCase().includes("shard")) {
      this.shardImages = [];
      const shardKeys = ["springShard", "summerShard", "autumnShard", "winterShard"];
      const shardStartX = imageX - 60;
      const shardStartY = imageY + 100;
      
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

    // Navigation buttons
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

  // --- Updated Achievements Page Renderer with proper cleanup ---
  renderAchievementsPage() {
    const { width, height } = this.sys.game.config;

    // Filter achievements
    const completedAchievements = achievements.filter(a => a.completed);
    const incompleteAchievements = achievements.filter(a => !a.completed);
    const allAchievements = [...incompleteAchievements, ...completedAchievements];

    // --- LEFT SIDE: Completed Achievements Checklist ---
    if (completedAchievements.length > 0) {
      this.completedAchievementsTitle = this.add.text(width / 2 - 220, 200, "🏆 Earned Achievements:", {
        fontFamily: "Georgia",
        fontSize: "18px",
        color: "#d4851f",
        fontStyle: "bold"
      });

      const checklistText = completedAchievements.map(a => `🏆 ${a.title}`).join('\n');
      this.completedAchievementsList = this.add.text(width / 2 - 220, 230, checklistText, {
        fontFamily: "Georgia",
        fontSize: "14px",
        color: "#d4851f",
        wordWrap: { width: 240 },
        lineSpacing: 5
      });
    } else {
      this.completedAchievementsTitle = this.add.text(width / 2 - 220, 250, "No achievements earned yet.", {
        fontFamily: "Georgia",
        fontSize: "16px",
        color: "#888",
        fontStyle: "italic"
      });
    }

    // --- RIGHT SIDE: Current Achievement Display ---
    const achievement = allAchievements[this.currentPage];
    
    if (!achievement) {
      this.achievementTitle = this.add.text(width / 2 + 150, height / 2, "No achievements available.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    // Determine achievement image
    let achievementImageKey = this.getAchievementImageKey(achievement);

    // Achievement image
    const imageX = width / 2 + 100;
    const imageY = height / 2 - 20;
    
    if (achievementImageKey && this.textures.exists(achievementImageKey)) {
      this.achievementImage = this.add.image(imageX, imageY, achievementImageKey)
        .setDisplaySize(160, 160)
        .setDepth(2);
      
      if (achievement.completed) {
        this.achievementImage.setTint(0xffd700); // Golden tint for completed
      } else {
        this.achievementImage.setTint(0x888888); // Gray tint for incomplete
      }
    } else {
      if (this.textures.exists("questGeneral")) {
        this.achievementImage = this.add.image(imageX, imageY, "questGeneral")
          .setDisplaySize(160, 160)
          .setDepth(2)
          .setTint(achievement.completed ? 0xffd700 : 0x888888);
      }
    }

    // Achievement title
    this.achievementTitle = this.add.text(imageX + 80, imageY - 80, achievement.title, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: achievement.completed ? "#d4851f" : "#888",
      fontStyle: "bold",
      wordWrap: { width: 180 }
    });

    // Achievement description
    this.achievementDesc = this.add.text(imageX + 80, imageY - 20, achievement.description, {
      fontFamily: "Georgia",
      fontSize: "15px",
      color: "#444",
      wordWrap: { width: 180 },
      lineSpacing: 3
    });

    // Achievement status
    let statusText = "";
    let statusColor = "#444";
    if (achievement.completed) {
      statusText = "🏆 EARNED";
      statusColor = "#d4851f";
    } else {
      statusText = "⚫ LOCKED";
      statusColor = "#888";
    }

    this.achievementStatus = this.add.text(imageX + 80, imageY + 60, statusText, {
      fontFamily: "Georgia",
      fontSize: "13px",
      color: statusColor,
      fontStyle: "bold",
      backgroundColor: statusColor === "#d4851f" ? "#fff8e1" : "#f5f5f5",
      padding: { left: 8, right: 8, top: 4, bottom: 4 }
    });

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Achievement ${this.currentPage + 1} of ${allAchievements.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Navigation buttons
    const showNav = allAchievements.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < allAchievements.length - 1 ? 1 : 0.4);
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

  // Helper method to determine achievement image
  getAchievementImageKey(achievement) {
    // FIRST: Check if achievement has a predefined imageKey and use it
    if (achievement.imageKey) {
      // If texture exists, use the defined imageKey as-is
      if (this.textures.exists(achievement.imageKey)) {
        return achievement.imageKey;
      }
    }

    // FALLBACK: Use keyword detection based on achievement title/description
    const title = achievement.title.toLowerCase();
    const description = achievement.description.toLowerCase();
    
    // Achievement type-based image selection
    if (title.includes("first steps") || title.includes("quest")) {
      return achievement.completed ? "questGeneral" : "questGeneral";
    }
    if (title.includes("green thumb") || title.includes("grow") || title.includes("plant")) {
      return achievement.completed ? "hoeIcon" : "hoeIcon";
    }
    if (title.includes("shard collector") || title.includes("shard")) {
      return achievement.completed ? "springShard" : "springShard";
    }
    if (title.includes("seasoned adventurer") || title.includes("all quests")) {
      return achievement.completed ? "butterflyBuddy" : "butterflySad";
    }
    if (title.includes("buddy helper") || title.includes("help") || title.includes("buddies")) {
      return achievement.completed ? "fairyBuddy" : "fairySad";
    }
    if (title.includes("master gardener") || title.includes("every type")) {
      return achievement.completed ? "garlicPlant" : "garlicPlant";
    }
    if (title.includes("community builder") || title.includes("interact") || title.includes("npc")) {
      return achievement.completed ? "beeBuddy" : "beeSad";
    }
    if (title.includes("master of your craft") || title.includes("craft")) {
      return achievement.completed ? "elephantBuddy" : "elephantSad";
    }
    
    // Default fallback
    return achievement.completed ? "star" : "questGeneral";
  }

  // --- Plant Page Renderer (Updated Two-Column Layout) ---
  renderPlantPage() {
    const { width, height } = this.sys.game.config;
    
    if (this.collectedPlants.length === 0) {
      this.plantName = this.add.text(width / 2, height / 2, "No plants collected yet.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    const plant = this.collectedPlants[this.currentPage];
    if (!plant) return;

    // --- LEFT SIDE: Plant Image ---
    const imageX = width / 2 - 150;
    const imageY = height / 2;
    
    if (plant.imageKey && this.textures.exists(plant.imageKey)) {
      this.plantImage = this.add.image(imageX, imageY, plant.imageKey)
        .setDisplaySize(200, 200)
        .setDepth(2);
    }

    // --- RIGHT SIDE: Plant Information ---
  const textX = imageX + 200;
    const textStartY = imageY - 60;

    // Plant name
    this.plantName = this.add.text(textX, textStartY, plant.name, {
      fontFamily: "Georgia",
      fontSize: "28px",
      color: "#2d4739",
      fontStyle: "bold",
      wordWrap: { width: 280 }
    });

    // Plant medicinal properties
    this.plantMedicinal = this.add.text(textX, textStartY + 50, plant.medicinal || "No medicinal properties recorded.", {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#444",
      wordWrap: { width: 280 },
      lineSpacing: 3
    });

    // Find recipes that use this plant
    const recipesUsingPlant = recipieData.filter(recipe => 
      recipe.ingredients.some(ingredient => 
        ingredient.key === plant.key || ingredient.key === plant.name
      )
    );

    // "Used in" section
    if (recipesUsingPlant.length > 0) {
      this.plantUsedInTitle = this.add.text(textX, textStartY + 170, "Used in Recipes:", {
        fontFamily: "Georgia",
        fontSize: "18px",
        color: "#567d46",
        fontStyle: "bold"
      });

      const recipeNames = recipesUsingPlant.map(recipe => `• ${recipe.result.name}`).join('\n');
      this.plantUsedInList = this.add.text(textX, textStartY + 190, recipeNames, {
        fontFamily: "Georgia",
        fontSize: "14px",
        color: "#567d46",
        wordWrap: { width: 280 },
        lineSpacing: 2
      });
    } else {
      this.plantUsedInTitle = this.add.text(textX, textStartY + 190, "Not used in any known recipes.", {
        fontFamily: "Georgia",
        fontSize: "16px",
        color: "#888",
        fontStyle: "italic"
      });
    }

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Plant ${this.currentPage + 1} of ${this.collectedPlants.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Navigation buttons
    const showNav = this.collectedPlants.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < this.collectedPlants.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }

  // --- Recipe Page Renderer (Updated Two-Column Layout) ---
  renderRecipePage() {
    const { width, height } = this.sys.game.config;
    
    if (recipieData.length === 0) {
      this.recipeName = this.add.text(width / 2, height / 2, "No recipes available.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    const recipe = recipieData[this.currentPage];
    if (!recipe) return;

    // --- LEFT SIDE: Recipe Image and Title ---
    const imageX = width / 2 - 150;
    const imageY = height / 2 - 20;
    
    if (recipe.result && recipe.result.imageKey && this.textures.exists(recipe.result.imageKey)) {
      this.recipeImage = this.add.image(imageX, imageY, recipe.result.imageKey)
        .setDisplaySize(160, 160)
        .setDepth(2);
    }

    // Recipe name (below image, on left side)
    this.recipeName = this.add.text(imageX, imageY + 100, recipe.result.name, {
      fontFamily: "Georgia",
      fontSize: "22px",
      color: "#2d4739",
      fontStyle: "bold",
      wordWrap: { width: 200 },
      align: "center"
    }).setOrigin(0.5);

    // --- RIGHT SIDE: Recipe Information ---
     const textX = imageX + 200;
    const textStartY = imageY - 60;

    // Recipe description
    this.recipeDescription = this.add.text(textX, textStartY, recipe.description || "A crafted remedy.", {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#444",
      wordWrap: { width: 280 },
      lineSpacing: 3
    });

    // Ingredients section
    this.recipeIngredientsTitle = this.add.text(textX, textStartY + 80, "Ingredients:", {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#567d46",
      fontStyle: "bold"
    });

    const ingredientsText = recipe.ingredients.map(i => `• ${i.amount}x ${i.key}`).join('\n');
    this.recipeIngredients = this.add.text(textX, textStartY + 110, ingredientsText, {
      fontFamily: "Georgia",
      fontSize: "14px",
      color: "#567d46",
      wordWrap: { width: 280 },
      lineSpacing: 2
    });

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Recipe ${this.currentPage + 1} of ${recipieData.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Navigation buttons
    const showNav = recipieData.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < recipieData.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }

  // --- Buddy Page Renderer (Updated Two-Column Layout) ---
  renderBuddyPage() {
    const { width, height } = this.sys.game.config;
    
    if (buddiesData.length === 0) {
      this.buddyName = this.add.text(width / 2, height / 2, "No buddies available.", {
        fontFamily: "Georgia",
        fontSize: "24px",
        color: "#2d4739"
      }).setOrigin(0.5);
      return;
    }

    const buddy = buddiesData[this.currentPage];
    if (!buddy) return;

    // --- LEFT SIDE: Buddy Image and Name ---
    const imageX = width / 2 - 150;
    const imageY = height / 2 - 20;
    
    if (buddy.imageKey && this.textures.exists(buddy.imageKey)) {
      this.buddyImage = this.add.image(imageX, imageY, buddy.imageKey)
        .setDisplaySize(160, 160)
        .setDepth(2);
    }

    // Buddy name (below image, on left side)
    this.buddyName = this.add.text(imageX, imageY + 100, buddy.name, {
      fontFamily: "Georgia",
      fontSize: "24px",
      color: "#2d4739",
      fontStyle: "bold",
      wordWrap: { width: 200 },
      align: "center"
    }).setOrigin(0.5);

    // --- RIGHT SIDE: Buddy Information ---
    const textX = imageX + 200;
    const textStartY = imageY - 60;

    // Buddy description
    this.buddyDesc = this.add.text(textX, textStartY, buddy.description || "A friendly companion from the garden.", {
      fontFamily: "Georgia",
      fontSize: "16px",
      color: "#444",
      wordWrap: { width: 280 },
      lineSpacing: 3
    });

    // Optional: Add buddy status or additional info
    if (buddy.status || buddy.location) {
      this.buddyStatus = this.add.text(textX, textStartY + 150, `Location: ${buddy.location || "Garden"}`, {
        fontFamily: "Georgia",
        fontSize: "14px",
        color: "#567d46",
        fontStyle: "italic"
      });
    }

    // Page number
    this.pageNumText = this.add.text(width / 2, 580, `Buddy ${this.currentPage + 1} of ${buddiesData.length}`, {
      fontFamily: "Georgia",
      fontSize: "18px",
      color: "#3e2f1c"
    }).setOrigin(0.5);

    // Navigation buttons
    const showNav = buddiesData.length > 1;
    this.nextBtn.setVisible(showNav);
    this.nextBtnBg.setVisible(showNav);
    this.prevBtn.setVisible(showNav);
    this.prevBtnBg.setVisible(showNav);
    if (showNav) {
      this.nextBtn.setAlpha(this.currentPage < buddiesData.length - 1 ? 1 : 0.4);
      this.prevBtn.setAlpha(this.currentPage > 0 ? 1 : 0.4);
    }
  }
}
export default OpenJournal;