import Phaser from 'phaser';
import { createButterfly, butterflyIntroDialogues } from '../../characters/butterfly';
import { showDialogue, destroyDialogueUI, showOption } from '../../dialogue/dialogueUIHelpers';
import { createMainChar } from '../../characters/mainChar';
import { saveToLocal, loadFromLocal } from '../../utils/localStorage';
import plantData from "../../plantData";
import quests from "../../quests/quests";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { createElephant, elephantIntroDialogues, elephantThanksDialogues } from '../../characters/elephant';
import { createPolarBear, polarBearIntroDialogues, polarBearThanksDialogues } from '../../characters/polar';
import {createDeer, deerIntroDialogues, deerThanksDialogues} from '../../characters/deer';
import globalTimeManager from "../../day/timeManager";


class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.mainChar = null;
    this.transitioning = false;
  }

  preload() {
    this.load.tilemapTiledJSON("wallGardenMap", "/assets/maps/wallGardenMap.json");
    this.load.image('wall1', '/assets/backgrounds/wallGarden/wall1.png');
    this.load.image('wall2', '/assets/backgrounds/wallGarden/wall2.png');
    this.load.image('trees', '/assets/backgrounds/wallGarden/trees.png');
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
    this.load.image("defaultFront", "/assets/char/default/front-default.png");
        this.load.image("defaultBack", "/assets/char/default/back-default.png");
        this.load.image("defaultLeft", "/assets/char/default/left-default.png");
        this.load.image("defaultRight", "/assets/char/default/right-default.png");
        this.load.image("defaultFrontWalk1", "/assets/char/default/front-step-1.PNG");
        this.load.image("defaultFrontWalk2", "/assets/char/default/front-step-2.PNG");
        this.load.image("defaultBackWalk1", "/assets/char/default/back-step-1.PNG");
        this.load.image("defaultBackWalk2", "/assets/char/default/back-step-2.PNG");
        this.load.image("defaultLeftWalk1", "/assets/char/default/left-step-1.PNG");
        this.load.image("defaultLeftWalk2", "/assets/char/default/left-step-2.PNG");
        this.load.image("defaultRightWalk1", "/assets/char/default/right-step-1.PNG");
        this.load.image("defaultRightWalk2", "/assets/char/default/right-step-2.PNG");
           this.load.image('deer', '/assets/npc/deer/deer.png')
    this.load.image('deerHappy', '/assets/npc/deer/happy.png')
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('talk', '/assets/interact/talk.png');
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
    this.load.image('butterflyHappy', '/assets/npc/dialogue/butterflyHappy.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('elephant', '/assets/npc/elephant/elephant.png');
    this.load.image('elephantHappy', '/assets/npc/elephant/happy.png');
    this.load.image('polarBear', '/assets/npc/polarBear/polar.PNG');
    this.load.image('polarBearHappy', '/assets/npc/polarBear/happy.PNG');
    this.load.image('autumnShard', '/assets/items/autumn.png');
    this.load.image("baseCream", "/assets/shopItems/cream.png");
    this.load.image("aloePlant", "/assets/plants/aloe.PNG");
    this.load.image('aloeAfterSunCream', '/assets/crafting/creamRemedy.png');
    this.load.audio("option", "/assets/sound-effects/option.mp3");
       this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');
    this.load.image("polarDialogueHappy", "/assets/npc/dialogue/polarHappy.png")
    this.load.image("polarDialogueSad", "/assets/npc/dialogue/polarSad.png");
    this.load.image("deerDialogueHappy", "/assets/npc/dialogue/deerHappy.png");
    this.load.image("deerDialogueSad", "/assets/npc/dialogue/deerSad.png");
    this.load.image("elephantDialogueHappy", "/assets/npc/dialogue/elephantHappy.png");
    this.load.image("elephantDialogueSad", "/assets/npc/dialogue/elephantSad.png");
    this.load.image("winterShard", "/assets/items/winter.png");
    this.load.tilemapTiledJSON("wallGardenMap", "/assets/maps/wallGardenMap.json");
  }

  create() {
    const debugY = 30;
    const loadedKeys = this.textures.getTextureKeys();
    const expectedKeys = [
      'wallGardenBackground', 'wall1', 'wall2', 'trees', 'butterfly', 'defaultFront', 'defaultBack', 'defaultLeft', 'defaultRight',
      'defaultFrontWalk1', 'defaultFrontWalk2', 'defaultBackWalk1', 'defaultBackWalk2', 'defaultLeftWalk1', 'defaultLeftWalk2',
      'defaultRightWalk1', 'defaultRightWalk2', 'talk', 'foxglovePlant', 'springShard', 'butterflyHappy',
      'periwinklePlant', 'dialogueBoxBg', 'bush', 'elephant', 'elephantHappy', 'jasminePlant', 'autumnShard'
    ];
    let missingKeys = expectedKeys.filter(k => !loadedKeys.includes(k));
    let debugText = `Loaded textures: ${loadedKeys.join(', ')}\nMissing: ${missingKeys.join(', ')}`;
    this.add.text(20, debugY, debugText, { fontSize: '14px', color: missingKeys.length ? '#f00' : '#080', backgroundColor: '#fff', wordWrap: { width: 800 } }).setDepth(-1);
    this.transitioning = false;
    // --- Personal Garden Button (above bushes) ---
    const btnX = 220;
    const btnY = 300;
    const btnWidth = 180;
    const btnHeight = 48;
    const personalBtnBg = this.add.rectangle(btnX, btnY, btnWidth, btnHeight, 0x3e7d3a, 0.95)
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive({ useHandCursor: true });
    const personalBtnText = this.add.text(btnX, btnY, 'Go to Personal Garden', {
      fontFamily: 'Georgia',
      fontSize: '22px',
      color: '#fff',
      align: 'center',
      shadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#4caf50',
        blur: 8,
        fill: true
      }
    }).setOrigin(0.5).setDepth(101);

    personalBtnText.setInteractive({ useHandCursor: true });
    personalBtnText.on('pointerdown', () => {
      personalBtnBg.emit('pointerdown');
    });
    personalBtnBg.on('pointerover', () => {
      personalBtnBg.setFillStyle(0x4caf50, 0.98);
      personalBtnText.setColor('#ffffcc');
    });
    personalBtnBg.on('pointerout', () => {
      personalBtnBg.setFillStyle(0x3e7d3a, 0.95);
      personalBtnText.setColor('#fff');
    });
    personalBtnBg.on('pointerdown', () => {
      if (!this.transitioning) {
        this.transitioning = true;
        this.scene.start("LoaderScene", {
          nextSceneKey: "PersonalGarden",
          nextSceneData: {}
        });
      }
    });
  globalTimeManager.init(this);
  if (!globalTimeManager.startTimestamp) {
    globalTimeManager.start();
  }
  
    if (typeof window !== "undefined") {
      window.inventoryManager = inventoryManager;
    }
    this.scene.launch('HUDScene');
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('wallGardenSceneState') || {};
    // Restore inventory if present (assumes inventoryManager is imported)
    if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
      inventoryManager.clear();
      sceneState.inventory.forEach(item => inventoryManager.addItem(item));
    }
    // Restore periwinkleFound (for bush logic)
    let periwinkleFound = !!sceneState.periwinkleFound;
    // Restore butterfly dialogue state
    this.butterflyDialogueIndex = sceneState.butterflyDialogueIndex || 0;
    this.butterflyDialogueActive = !!sceneState.butterflyDialogueActive;
    this.dialogueActive = !!sceneState.dialogueActive;
    // Restore time of day
    if (sceneState.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }

    // --- Restore dialogue UI if needed ---
    // Only restore if dialogue was active when leaving
    if (this.butterflyDialogueActive) {
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
        } else {
          showOption(this, "Would you like to move on?", {
            imageKey: "butterflyHappy",
            options: [
              {
                text: "Yes",
                callback: () => {
                  this.destroyDialogueUI();
                  this.butterflyDialogueActive = false;
                  this.saveSceneState(periwinkleFound);
                  this.scene.start("ShardGardenScene");
                }
              },
              {
                text: "No",
                callback: () => {
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.", { imageKey: "butterflyHappy" });
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.butterflyDialogueActive = false;
                    this.saveSceneState(periwinkleFound);
                  };
                }
              }
            ]
          });
        }
      };
    }

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(110)
      .setOrigin(0.5);

      // --- Elephant NPC ---

    // --- Elephant NPC ---
    this.elephant = createElephant(this, width / 2 + 200, height / 2 + 100);
    this.elephant
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.1)
      .setOrigin(0.5, 0.9);

    // Elephant talk icon events
    this.elephant.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.elephant.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.elephant.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // --- Elephant dialogue and gifting logic ---
    this.elephantDialogueActive = false;
    this.elephantDialogueIndex = 0;
    // Change required item to Jasmine Tea
    this.hasJasmineTea = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("jasmineTea");

    // Listen for jasmineTea handover event from inventory
    this.events.on("jasmineTeaGiven", () => {
      this.awaitingJasmineTeaGive = false;
      // Remove ALL jasmineTea items from inventory as a failsafe
      if (typeof inventoryManager.getItems === "function" && typeof inventoryManager.removeItemByKey === "function") {
        let items = inventoryManager.getItems();
        let teaCount = items.filter(item => item.key === "jasmineTea").length;
        for (let i = 0; i < teaCount; i++) {
          inventoryManager.removeItemByKey("jasmineTea");
        }
      }
      const items = typeof inventoryManager.getItems === "function" ? inventoryManager.getItems() : [];
      const hasJasmineTea = items.some(item => item.key === "jasmineTea");
      if (!hasJasmineTea) {
        showDialogue(this, "You hand the elephant the Jasmine Tea...", { imageKey: "elephantDialogueHappy" });
        this.elephant.setTexture && this.elephant.setTexture("elephantHappy");
        this.time.delayedCall(800, () => {
          this.elephantDialogueActive = true;
          this.elephantDialogueIndex = 0;
          this.activeElephantDialogues = elephantThanksDialogues;
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephantDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.elephantHasJasmineTea = true;
      } else {
        showDialogue(this, "You still have the Jasmine Tea.", { imageKey: "elephantDialogueSad" });
      }
    });

    // Elephant click handler
    this.elephant.on("pointerdown", () => {
      if (!this.elephantIntroDone && !this.elephantDialogueActive) {
        this.elephantDialogueActive = true;
        this.elephantDialogueIndex = 0;
        this.activeElephantDialogues = elephantIntroDialogues;
        showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephantDialogueSad" });
        this.updateHUDState && this.updateHUDState();

        // --- Activate Tia's quest when first meeting ---
        const tiaQuest = quests.find(q => q.title === "Help Tia");
        if (tiaQuest && !tiaQuest.active && !tiaQuest.completed) {
          tiaQuest.active = true;
          saveToLocal("quests", quests);
          console.log("Quest 'Help Tia' is now active!");
        }
        return;
      }
      if (this.elephantIntroDone && !this.elephantThanksDone && this.hasJasmineTea()) {
        showOption(this, "Give the Tia the Jasmine Tea?", {
          imageKey: "elephantDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeJasmineTeaChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                // Set flag to await jasmineTea handover
                this.awaitingJasmineTeaGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "elephantDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.elephantIntroDone && !this.elephantThanksDone && !this.hasJasmineTea()) {
        showDialogue(this, "The elephant looks at you expectantly. Maybe you need to find something for them...", { imageKey: "elephantDialogueSad" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // Elephant dialogue advance on click
    this.input.on("pointerdown", () => {
      if (this.elephantDialogueActive) {
        this.elephantDialogueIndex++;
        if (this.activeElephantDialogues && this.elephantDialogueIndex < this.activeElephantDialogues.length) {
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { 
            imageKey: this.activeElephantDialogues === elephantThanksDialogues ? "elephantDialogueHappy" : "elephantDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.elephantIntroDone && this.activeElephantDialogues === elephantIntroDialogues) {
            this.elephantIntroDone = true;
          }
          if (this.elephantHasJasmineTea && this.activeElephantDialogues === elephantThanksDialogues) {
            this.elephantThanksDone = true;
            // --- Complete Tia's quest after thanks dialogue ---
            const tiaQuest = quests.find(q => q.title === "Help Tia");
            if (tiaQuest) {
              tiaQuest.active = false;
              tiaQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Tia' completed!");
            }
            receivedItem(this, "autumnShard", "Autumn Shard");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("jasmineTea");
          }
          this.elephantDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      // --- Polar Bear dialogue advance on click ---
      if (this.polarBearDialogueActive) {
        this.polarBearDialogueIndex++;
        if (this.activePolarBearDialogues && this.polarBearDialogueIndex < this.activePolarBearDialogues.length) {
          showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { 
            imageKey: this.activePolarBearDialogues === polarBearThanksDialogues ? "polarDialogueHappy" : "polarDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.polarBearIntroDone && this.activePolarBearDialogues === polarBearIntroDialogues) {
            this.polarBearIntroDone = true;
            // --- Activate Snowbert's quest when first meeting ---
            const snowbertQuest = quests.find(q => q.title === "Help Snowbert");
            if (snowbertQuest && !snowbertQuest.active && !snowbertQuest.completed) {
              snowbertQuest.active = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Snowbert' is now active!");
            }
          }
          if (this.polarBearHasWillowBarkTea && this.activePolarBearDialogues === polarBearThanksDialogues) {
            this.polarBearThanksDone = true;
            // --- Complete Snowbert's quest after thanks dialogue ---
            const snowbertQuest = quests.find(q => q.title === "Help Snowbert");
            if (snowbertQuest) {
              snowbertQuest.active = false;
              snowbertQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Snowbert' completed!");
            }
            receivedItem(this, "winterShard", "Winter Shard");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("willowBarkTea");
          }
          this.polarBearDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      // --- Deer dialogue advance on click ---
      if (this.deerDialogueActive) {
        this.deerDialogueIndex++;
        if (this.activeDeerDialogues && this.deerDialogueIndex < this.activeDeerDialogues.length) {
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { 
            imageKey: this.activeDeerDialogues === deerThanksDialogues ? "deerDialogueHappy" : "deerDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.deerIntroDone && this.activeDeerDialogues === deerIntroDialogues) {
            this.deerIntroDone = true;
          }
          if (this.deerHasMarigoldSalve && this.activeDeerDialogues === deerThanksDialogues) {
            this.deerThanksDone = true;
            // --- Complete Elkton John's quest after thanks dialogue ---
            const deerQuest = quests.find(q => q.title === "Help Elkton John");
            if (deerQuest) {
              deerQuest.active = false;
              deerQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Elkton John' completed!");
            }
            receivedItem(this, "springShard", "Spring Shard");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldSalve");
          }
          this.deerDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
      this.updateHUDState && this.updateHUDState();
    });

    // --- Polar Bear NPC ---
    this.polarBear = createPolarBear(this, width / 2 - 200, height / 2 + 100);
    this.polarBear
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.06)
      .setOrigin(0.5, 0.9);

    // Polar Bear talk icon events
    this.polarBear.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.polarBear.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.polarBear.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // --- Polar Bear dialogue and gifting logic ---
    this.polarBearDialogueActive = false;
    this.polarBearDialogueIndex = 0;
    // Change required item to Willow Bark Tea
    this.hasWillowBarkTea = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("willowBarkTea");

    // Listen for willowBarkTea handover event from inventory
    this.events.on("willowBarkTeaGiven", () => {
      this.awaitingWillowBarkTeaGive = false;
      // Remove ALL willowBarkTea items from inventory as a failsafe
      if (typeof inventoryManager.getItems === "function" && typeof inventoryManager.removeItemByKey === "function") {
        let items = inventoryManager.getItems();
        let teaCount = items.filter(item => item.key === "willowBarkTea").length;
        for (let i = 0; i < teaCount; i++) {
          inventoryManager.removeItemByKey("willowBarkTea");
        }
      }
      const items = typeof inventoryManager.getItems === "function" ? inventoryManager.getItems() : [];
      const hasWillowBarkTea = items.some(item => item.key === "willowBarkTea");
      if (!hasWillowBarkTea) {
        showDialogue(this, "You hand the polar bear the Willow Bark Tea...", { imageKey: "polarDialogueHappy" });
        this.polarBear.setTexture && this.polarBear.setTexture("polarBearHappy");
        this.time.delayedCall(800, () => {
          this.polarBearDialogueActive = true;
          this.polarBearDialogueIndex = 0;
          this.activePolarBearDialogues = polarBearThanksDialogues;
          showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.polarBearHasWillowBarkTea = true;
      } else {
        showDialogue(this, "You still have the Willow Bark Tea.", { imageKey: "polarDialogueSad" });
      }
    });

    // Polar Bear click handler
    this.polarBear.on("pointerdown", () => {
      if (!this.polarBearIntroDone && !this.polarBearDialogueActive) {
        this.polarBearDialogueActive = true;
        this.polarBearDialogueIndex = 0;
        this.activePolarBearDialogues = polarBearIntroDialogues;
        showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarDialogueSad" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.polarBearIntroDone && !this.polarBearThanksDone && this.hasWillowBarkTea()) {
        showOption(this, "Give the polar bear the Willow Bark Tea?", {
          imageKey: "polarDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeWillowBarkTeaChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                // Set flag to await willowBarkTea handover
                this.awaitingWillowBarkTeaGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "polarDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.polarBearIntroDone && !this.polarBearThanksDone && !this.hasWillowBarkTea()) {
        showDialogue(this, "The polar bear looks at you expectantly. Maybe you need to find something for them...", { imageKey: "polarDialogueSad" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Deer NPC ---
    this.deer = createDeer(this, width / 2, height / 2 - 120);
    this.deer
      .setInteractive({ useHandCursor: true })
      .setDepth(30)
      .setScale(0.13)
      .setOrigin(4, 0.3);

    // Deer talk icon events
    this.deer.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.deer.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.deer.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    // --- Deer dialogue and gifting logic ---
    this.deerDialogueActive = false;
    this.deerDialogueIndex = 0;
    this.hasMarigoldSalve = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("marigoldSalve");

    // Listen for marigoldSalve handover event from inventory
    this.events.on("marigoldSalveGiven", () => {
      this.awaitingMarigoldSalveGive = false;
      // Remove ALL marigoldSalve items from inventory as a failsafe
      if (typeof inventoryManager.getItems === "function" && typeof inventoryManager.removeItemByKey === "function") {
        let items = inventoryManager.getItems();
        let salveCount = items.filter(item => item.key === "marigoldSalve").length;
        for (let i = 0; i < salveCount; i++) {
          inventoryManager.removeItemByKey("marigoldSalve");
        }
      }
      const items = typeof inventoryManager.getItems === "function" ? inventoryManager.getItems() : [];
      const hasMarigoldSalve = items.some(item => item.key === "marigoldSalve");
      if (!hasMarigoldSalve) {
        showDialogue(this, "You hand the deer the Marigold Salve...", { imageKey: "deerDialogueHappy" });
        this.deer.setTexture && this.deer.setTexture("deerHappy");
        this.time.delayedCall(800, () => {
          this.deerDialogueActive = true;
          this.deerDialogueIndex = 0;
          this.activeDeerDialogues = deerThanksDialogues;
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deerDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.deerHasMarigoldSalve = true;
      } else {
        showDialogue(this, "You still have the Marigold Salve.", { imageKey: "deerDialogueSad" });
      }
    });

    // Deer click handler
    this.deer.on("pointerdown", () => {
      if (!this.deerIntroDone && !this.deerDialogueActive) {
        this.deerDialogueActive = true;
        this.deerDialogueIndex = 0;
        this.activeDeerDialogues = deerIntroDialogues;
        showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deerDialogueSad" });
        this.updateHUDState && this.updateHUDState();

        // --- Activate Elkton John's quest when first meeting ---
        const deerQuest = quests.find(q => q.title === "Help Elkton John");
        if (deerQuest && !deerQuest.active && !deerQuest.completed) {
          deerQuest.active = true;
          saveToLocal("quests", quests);
          console.log("Quest 'Help Elkton John' is now active!");
        }
        return;
      }
      if (this.deerIntroDone && !this.deerThanksDone && this.hasMarigoldSalve()) {
        showOption(this, "Give the deer the Marigold Salve?", {
          imageKey: "deerDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeMarigoldSalveChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                // Set flag to await marigoldSalve handover
                this.awaitingMarigoldSalveGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "deerDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.deerIntroDone && !this.deerThanksDone && !this.hasMarigoldSalve()) {
        showDialogue(this, "The deer looks at you expectantly. Maybe you need to find something for them...", { imageKey: "deerDialogueSad" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // Deer dialogue advance on click
    this.input.on("pointerdown", () => {
      if (this.deerDialogueActive) {
        this.deerDialogueIndex++;
        if (this.activeDeerDialogues && this.deerDialogueIndex < this.activeDeerDialogues.length) {
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.deerIntroDone && this.activeDeerDialogues === deerIntroDialogues) {
            this.deerIntroDone = true;
          }
          if (this.deerHasMarigoldSalve && this.activeDeerDialogues === deerThanksDialogues) {
            this.deerThanksDone = true;
            // --- Complete Elkton John's quest after thanks dialogue ---
            const deerQuest = quests.find(q => q.title === "Help Elkton John");
            if (deerQuest) {
              deerQuest.active = false;
              deerQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Elkton John' completed!");
            }
            receivedItem(this, "springShard", "Spring Shard");
            inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldSalve");
          }
          this.deerDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
    });

    // --- Map and background ---
    const map = this.make.tilemap({ key: "wallGardenMap" });
    console.log('WallGarden tilemap created:', map);
    
    // Asset existence check helper
    const safeAddImage = (scene, x, y, key, ...args) => {
      if (!scene.textures.exists(key)) {
        console.warn(`Image asset missing: ${key}`);
        scene.add.text(x, y, `Missing: ${key}`, { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);
        return null;
      }
      return scene.add.image(x, y, key, ...args);
    };
    
    safeAddImage(this, width / 2, height / 2, "wallGardenBackground").setScale(scaleFactor).setDepth(0);
    safeAddImage(this, width / 2, height / 2, "wall1").setScale(scaleFactor).setDepth(9);
    safeAddImage(this, width / 2, height / 2, "wall2").setScale(scaleFactor).setDepth(103);
    safeAddImage(this, width / 2, height / 2, "trees").setScale(scaleFactor).setDepth(10);

    // --- Create tilemap collision system ---
    console.log('Creating WallGarden tilemap collision system...');
    
    // Create collision group
    const collisionGroup = this.physics.add.staticGroup();

    // Handle collision objects from the tilemap
    const objectLayer = map.getObjectLayer('Object Layer 1');
    console.log('Object Layer 1 found:', objectLayer);

    // Collision scale and offset for positioning
    const collisionScale = 0.175; // Match your scaleFactor
    const tilemapOffsetX = -190; // Your existing offset
    const tilemapOffsetY = 30;

    if (objectLayer) {
      console.log(`Found ${objectLayer.objects.length} objects in Object Layer 1`);
      
      objectLayer.objects.forEach((obj, index) => {
        console.log(`Object ${index}:`, {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          name: obj.name,
          properties: obj.properties
        });
        
        // Check for collision property
        const hasCollision = obj.properties && obj.properties.find(prop => 
          (prop.name === 'collision' && prop.value === true) ||
          (prop.name === 'collisions' && prop.value === true) ||
          obj.name === 'wall-garden-collision'
        );
        
        console.log(`Object ${index} has collision:`, !!hasCollision);
        
        if (hasCollision || obj.name === 'wall-garden-collision') {
          console.log(`Creating collision rectangle for object ${index}`);
          
          // Calculate position and size with scale factor and offset
          const rectX = (obj.x * collisionScale) + (obj.width * collisionScale) / 2 + tilemapOffsetX;
          const rectY = (obj.y * collisionScale) + (obj.height * collisionScale) / 2 + tilemapOffsetY;
          const rectWidth = obj.width * collisionScale;
          const rectHeight = obj.height * collisionScale;
          
          console.log(`Collision rect ${index} - Position: (${rectX}, ${rectY}), Size: ${rectWidth}x${rectHeight}`);
          
          // Create invisible collision rectangle (no visual elements)
          const collisionRect = this.add.rectangle(
            rectX,
            rectY,
            rectWidth,
            rectHeight,
            0x000000, // Color doesn't matter since it's invisible
            0 // Completely transparent
          );
          
          // Enable physics on the collision rectangle
          this.physics.add.existing(collisionRect, true);
          collisionGroup.add(collisionRect);
          
          console.log(`Successfully created invisible collision rectangle ${index}`);
        }
      });
    } else {
      console.log('No Object Layer 1 found. Available object layers:');
      if (map.objects) {
        map.objects.forEach((layer, index) => {
          console.log(`Object layer ${index}:`, layer.name || 'unnamed');
        });
      } else {
        console.log('No object layers found in tilemap');
      }
      
      // Fallback: create basic invisible collision rectangles
      console.log('Using fallback collision system');
      const fallbackCollisions = [
        { x: width * 0.1, y: height * 0.1, width: width * 0.8, height: 50 }, // Top wall
        { x: width * 0.1, y: height * 0.9, width: width * 0.8, height: 50 }, // Bottom wall
        { x: 50, y: height * 0.1, width: 50, height: height * 0.8 }, // Left wall
        { x: width - 50, y: height * 0.1, width: 50, height: height * 0.8 } // Right wall
      ];
      
      fallbackCollisions.forEach((collision, index) => {
        const collisionRect = this.add.rectangle(
          collision.x,
          collision.y,
          collision.width,
          collision.height,
          0x000000,
          0 // Completely transparent
        );
        
        this.physics.add.existing(collisionRect, true);
        collisionGroup.add(collisionRect);
      });
    }

    // --- Main Character with collision ---
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(1, -5);

    // Enable collision between character and collision group
    this.physics.add.collider(this.mainChar, collisionGroup);

    // Enable Phaser's physics debug rendering (optional - uncomment to see physics bodies)
    // this.physics.world.createDebugGraphic();
    // this.physics.world.debugGraphic.setDepth(9999);

    // --- Butterfly NPC ---
    this.butterfly = createButterfly(this, width / 2 + 100, height / 2 - 50);
    this.butterfly.setDepth(20).setScale(0.09).setInteractive();

    // --- Talk icon hover logic ---
    this.butterfly.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.butterfly.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.butterfly.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;

    this.butterfly.on("pointerdown", () => {
      if (this.butterflyDialogueActive) return;
      this.butterflyDialogueActive = true;
      // Do not reset index if restoring
      if (!this.dialogueBox) this.butterflyDialogueIndex = 0;
      showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
      this.dialogueOnComplete = () => {
        this.butterflyDialogueIndex++;
        if (this.butterflyDialogueIndex < butterflyIntroDialogues.length) {
          showDialogue(this, butterflyIntroDialogues[this.butterflyDialogueIndex], { imageKey: "butterflyHappy" });
        } else {
          showOption(this, "Would you like to move on?", {
            imageKey: "butterflyHappy",
            options: [
              {
                text: "Yes",
                callback: () => {
                  this.destroyDialogueUI();
                  this.butterflyDialogueActive = false;
                  this.scene.start("LoaderScene", {
                    nextSceneKey: "ShardGardenScene",
                    nextSceneData: {}
                  });
                }
              },
              {
                text: "No",
                callback: () => {
                  showDialogue(this, "Take your time and explore! Talk to me again when you're ready to move on.", { imageKey: "butterflyHappy" });
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.butterflyDialogueActive = false;
                    this.dialogueActive = false;
                    this.updateHUDState();
                    this.dialogueOnComplete = null;
                  };
                }
              }
            ]
          });
        }
      };
    });

    // --- Placeholder bushes: random rectangles ---
    this.setupBushes(width, height, periwinkleFound);

    this.input.on("pointerdown", () => {
      this.sound.play("click");
      // Only advance/close if a dialogue is active and a completion callback is set
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
    });

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState(periwinkleFound);
    }, 8000);

    // Save on shutdown/stop
    this.events.on('shutdown', () => {
      this.saveSceneState(periwinkleFound);
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
    this.events.on('destroy', () => {
      this.saveSceneState(periwinkleFound);
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
  }

  // Save relevant state to localStorage
  saveSceneState(periwinkleFound) {
    const state = {
      inventory: inventoryManager.getItems ? inventoryManager.getItems() : [],
      periwinkleFound: !!periwinkleFound,
      butterflyDialogueIndex: this.butterflyDialogueIndex,
      butterflyDialogueActive: !!this.butterflyDialogueActive,
      dialogueActive: !!this.dialogueActive,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay(),
      bushDispensed: this.bushDispensed || [false, false, false, false],
      garlicFound: !!this.garlicFound,
      thymeFound: !!this.thymeFound
    };
    saveToLocal('wallGardenSceneState', state);
    console.log('Saved state:', state);
  }

  setupBushes(width, height) {
    // Initialize bush dispensed state from saved data or default
    const sceneState = loadFromLocal('wallGardenSceneState') || {};
    this.bushDispensed = sceneState.bushDispensed || [false, false, false, false];
    this.garlicFound = !!sceneState.garlicFound;
    this.thymeFound = !!sceneState.thymeFound;

    // Set up each bush separately
    this.setupGarlicBush(180, 600, 0);
    this.setupThymeBush(300, 400, 1);
    this.setupRandomBush(400, 500, 2);
    this.setupRandomBush(500, 550, 3);
  }

  setupGarlicBush(x, y, bushIndex) {
    const bush = this.textures.exists('bush')
      ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
      : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

    bush.on("pointerdown", () => {
      this.sound.play("click");
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.updateHUDState && this.updateHUDState();

      console.log(`Garlic bush clicked. Dispensed: ${this.bushDispensed[bushIndex]}, Found: ${this.garlicFound}`);

      // If already dispensed, show empty dialogue
      if (this.bushDispensed[bushIndex]) {
        showDialogue(this, "This bush is empty!");
        this.dialogueOnComplete = () => {
          this.destroyDialogueUI && this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          this.dialogueOnComplete = null;
        };
        return;
      }

      // Check if garlic already found
      if (this.garlicFound) {
        showDialogue(this, "You already found the garlic from this area.");
        this.dialogueOnComplete = () => {
          this.destroyDialogueUI && this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          this.dialogueOnComplete = null;
        };
        return;
      }

      const garlic = plantData.find(p => p.key === "garlicPlant");
      if (garlic) {
        this.showPlantMinigame(garlic, "garlicFound", bushIndex);
      } else {
        this.showPlantMissing();
        this.bushDispensed[bushIndex] = true;
      }
    });
  }

  setupThymeBush(x, y, bushIndex) {
    const bush = this.textures.exists('bush')
      ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
      : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

    bush.on("pointerdown", () => {
      this.sound.play("click");
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.updateHUDState && this.updateHUDState();

      console.log(`Thyme bush clicked. Dispensed: ${this.bushDispensed[bushIndex]}, Found: ${this.thymeFound}`);

      // If already dispensed, show empty dialogue
      if (this.bushDispensed[bushIndex]) {
        showDialogue(this, "This bush is empty!");
        this.dialogueOnComplete = () => {
          this.destroyDialogueUI && this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          this.dialogueOnComplete = null;
        };
        return;
      }

      // Check if thyme already found
      if (this.thymeFound) {
        showDialogue(this, "You already found the thyme from this area.");
        this.dialogueOnComplete = () => {
          this.destroyDialogueUI && this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          this.dialogueOnComplete = null;
        };
        return;
      }

      const thyme = plantData.find(p => p.key === "thymePlant");
      if (thyme) {
        this.showPlantMinigame(thyme, "thymeFound", bushIndex);
      } else {
        this.showPlantMissing();
        this.bushDispensed[bushIndex] = true;
      }
    });
  }

  setupRandomBush(x, y, bushIndex) {
    const bush = this.textures.exists('bush')
      ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
      : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

    bush.on("pointerdown", () => {
      this.sound.play("click");
      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.updateHUDState && this.updateHUDState();

      console.log(`Random bush ${bushIndex} clicked. Dispensed: ${this.bushDispensed[bushIndex]}`);

      // If already dispensed, show empty dialogue
      if (this.bushDispensed[bushIndex]) {
        showDialogue(this, "This bush is empty!");
        this.dialogueOnComplete = () => {
          this.destroyDialogueUI && this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
          this.dialogueOnComplete = null;
        };
        return;
      }

      // Random bushes are empty
      showDialogue(this, "You found nothing in this bush.");
      this.dialogueOnComplete = () => {
        this.destroyDialogueUI && this.destroyDialogueUI();
        this.dialogueActive = false;
        this.updateHUDState && this.updateHUDState();
        this.dialogueOnComplete = null;
      };
      this.bushDispensed[bushIndex] = true; // Mark as dispensed after checking
    });
  }

  showPlantMinigame(plant, foundFlag, bushIndex) {
    showOption(
      this,
      `You found a ${plant.name} plant! \n But a cheeky animal is trying to steal it!`,
      {
        imageKey: plant.imageKey,
        options: [
          {
            label: "Play a game to win it!",
            callback: () => {
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
              
              console.log(`Launching minigame for ${plant.name}, bush ${bushIndex}`);
              
              // Stop any existing minigame scenes before launching new one
              const sceneManager = this.scene.manager;
              const minigameScenes = ["MiniGameScene", "XOTutorialScene", "XOGameScene"];
              
              minigameScenes.forEach(sceneKey => {
                if (sceneManager.isActive(sceneKey) || sceneManager.isPaused(sceneKey)) {
                  console.log(`[WallGardenScene] Stopping existing scene: ${sceneKey}`);
                  this.scene.stop(sceneKey);
                }
              });
              
              // Small delay to ensure cleanup, then launch fresh minigame
              this.time.delayedCall(200, () => {
                this.scene.launch("MiniGameScene", {
                  onWin: () => {
                    console.log(`Won minigame for ${plant.name}`);
                    this.scene.resume();

                    const alreadyHas = inventoryManager.hasItemByKey && inventoryManager.hasItemByKey(plant.key);
                    if (!alreadyHas) {
                      addPlantToJournal(plant.key);
                      receivedItem(this, plant.key, plant.name);
                    }

                    showDialogue(this,
                      alreadyHas
                        ? `You already have the ${plant.name} plant.`
                        : `You won the game! The animal reluctantly \n gives you the ${plant.name} plant.`, {
                          imageKey: plant.imageKey
                        }
                    );

                    this[foundFlag] = true;
                    this.dialogueActive = true;

                    // ONLY mark bush as dispensed after successful win
                    if (bushIndex !== undefined) {
                      this.bushDispensed[bushIndex] = true;
                      console.log(`Bush ${bushIndex} marked as dispensed after win`);
                    }

                    this.dialogueOnComplete = () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState && this.updateHUDState();
                      this.dialogueOnComplete = null;
                    };
                  },
                  onLose: () => {
                    console.log(`Lost minigame for ${plant.name}`);
                    this.scene.resume();
                    
                    showDialogue(this, `You lost the game! The animal ran away with the ${plant.name} plant. \nTry clicking the bush again to find another one!`);
                    
                    this.dialogueActive = true;
                    this.dialogueOnComplete = () => {
                      this.destroyDialogueUI();
                      this.dialogueActive = false;
                      this.updateHUDState && this.updateHUDState();
                      this.dialogueOnComplete = null;
                    };
                    // DON'T mark bush as dispensed - bush remains clickable
                    console.log(`Bush ${bushIndex} remains clickable after loss`);
                  }
                });
                this.scene.pause();
              });
            }
          },
          {
            label: "Try again later",
            callback: () => {
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
              // DON'T mark bush as dispensed - player can try again
            }
          }
        ],
      }
    );
  }

  showPlantMissing() {
    showDialogue(this, "You found a rare plant, but its data is missing!", {});
    this.dialogueOnComplete = () => {
      this.destroyDialogueUI && this.destroyDialogueUI();
      this.dialogueActive = false;
      this.updateHUDState && this.updateHUDState();
      this.dialogueOnComplete = null;
    };
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 90;

    if (this.mainChar) {
      // Right edge
      if (this.mainChar.x >= rightEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("LoaderScene", {
          nextSceneKey: "MiddleGardenScene",
          nextSceneData: {}
        });
      }
      // Left edge
      if (this.mainChar.x <= leftEdge && !this.transitioning) {
        this.transitioning = true;
        this.scene.start("LoaderScene", {
          nextSceneKey: "GreenhouseScene",
          nextSceneData: {}
        });
      }
    }
  }

  updateHUDState() {
    if (this.dialogueActive) {
      this.scene.sleep("HUDScene");
    } else {
      this.scene.wake("HUDScene");
    }
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn) => btn.destroy());
      }
      this.dialogueBox = null;
    }
  }

}
export default WallGardenScene;