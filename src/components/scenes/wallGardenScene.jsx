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
import { createDeer, deerIntroDialogues, deerThanksDialogues } from '../../characters/deer';
import globalTimeManager from "../../day/timeManager";
import globalInventoryManager from "../globalInventoryManager";

class WallGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WallGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.butterflyDialogueIndex = 0;
    this.butterflyDialogueActive = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.mainChar = null;
    this.transitioning = false;
    
    // Initialize found flags
    this.garlicFound = false;
    this.thymeFound = false;
    
    // Use the global inventory manager
    this.inventoryManager = globalInventoryManager;
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
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
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
    this.load.image('winterShard', '/assets/items/winter.png');
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

    // --- Personal Garden Button ---
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

    this.scene.launch('HUDScene');
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('wallGardenSceneState') || {};
    // Restore inventory if present
    if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
      this.inventoryManager.clear();
      sceneState.inventory.forEach(item => this.inventoryManager.addItem(item));
    }
    
    // Restore found flags
    this.garlicFound = !!sceneState.garlicFound;
    this.thymeFound = !!sceneState.thymeFound;
    
    // Restore NPC states
    this.elephantIntroDone = !!sceneState.elephantIntroDone;
    this.elephantThanksDone = !!sceneState.elephantThanksDone;
    this.polarBearIntroDone = !!sceneState.polarBearIntroDone;
    this.polarBearThanksDone = !!sceneState.polarBearThanksDone;
    this.deerIntroDone = !!sceneState.deerIntroDone;
    this.deerThanksDone = !!sceneState.deerThanksDone;
    
    // Restore dialogue state
    this.butterflyDialogueIndex = sceneState.butterflyDialogueIndex || 0;
    this.butterflyDialogueActive = !!sceneState.butterflyDialogueActive;
    this.dialogueActive = !!sceneState.dialogueActive;
    
    // Restore bush dispensed state
    this.bushDispensed = sceneState.bushDispensed || [false, false, false, false];
    
    // Restore time of day
    if (sceneState.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }

    console.log('Loaded state:', {
      garlicFound: this.garlicFound,
      thymeFound: this.thymeFound,
      bushDispensed: this.bushDispensed
    });

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(110)
      .setOrigin(0.5);

    // --- Create all NPCs and set up their interactions ---
    this.createNPCs(width, height, talkIcon);

    // --- SINGLE dialogue advance handler ---
    this.setupDialogueHandler();

    // --- Map and background ---
    this.setupMapAndBackground(width, height, scaleFactor);

    // --- Main Character ---
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, this.collisionGroup);
    this.mainChar.setDepth(10).setOrigin(1, -5);

    // --- Butterfly NPC ---
    this.setupButterfly(width, height, talkIcon);

    // --- Bushes ---
    this.setupBushes(width, height);

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    this.events.on('shutdown', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
    this.events.on('destroy', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
      this.transitioning = false;
    });
  }

  createNPCs(width, height, talkIcon) {
    // --- Elephant NPC ---
    this.elephant = createElephant(this, width / 2 + 200, height / 2 + 100);
    this.elephant
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.1)
      .setOrigin(0.5, 0.9);

    // Set elephant texture based on saved state
    if (this.elephantThanksDone && this.textures.exists('elephantHappy')) {
      this.elephant.setTexture('elephantHappy');
    }

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
    this.hasJasmineTea = () => this.inventoryManager.hasItemByKey("jasmineTea");

    // Listen for jasmineTea handover event from inventory
    this.events.on("jasmineTeaGiven", () => {
      this.awaitingJasmineTeaGive = false;
      this.inventoryManager.removeItemByKey("jasmineTea");
      
      if (!this.inventoryManager.hasItemByKey("jasmineTea")) {
        showDialogue(this, "You hand the elephant the Jasmine Tea...", { imageKey: "elephant" });
        this.elephant.setTexture && this.elephant.setTexture("elephantHappy");
        this.time.delayedCall(800, () => {
          this.elephantDialogueActive = true;
          this.elephantDialogueIndex = 0;
          this.activeElephantDialogues = elephantThanksDialogues;
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
          this.updateHUDState && this.updateHUDState();
        });
        this.elephantHasJasmineTea = true;
      } else {
        showDialogue(this, "You still have the Jasmine Tea.", { imageKey: "elephant" });
      }
    });

    // Elephant click handler
    this.elephant.on("pointerdown", () => {
      if (!this.elephantIntroDone && !this.elephantDialogueActive) {
        this.elephantDialogueActive = true;
        this.elephantDialogueIndex = 0;
        this.activeElephantDialogues = elephantIntroDialogues;
        showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
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
        showOption(this, "Give the elephant the Jasmine Tea?", {
          imageKey: "elephant",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeJasmineTeaChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingJasmineTeaGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "elephant" });
              }
            }
          ]
        });
        return;
      }
      if (this.elephantIntroDone && !this.elephantThanksDone && !this.hasJasmineTea()) {
        showDialogue(this, "The elephant looks at you expectantly. Maybe you need to find something for them...", { imageKey: "elephant" });
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
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
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
          showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarBear" });
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
          }
          this.polarBearDialogueActive = false;
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
    this.hasWillowBarkTea = () => this.inventoryManager.hasItemByKey("willowBarkTea");

    // Listen for willowBarkTea handover event from inventory
    this.events.on("willowBarkTeaGiven", () => {
      this.awaitingWillowBarkTeaGive = false;
      this.inventoryManager.removeItemByKey("willowBarkTea");
      
      if (!this.inventoryManager.hasItemByKey("willowBarkTea")) {
        showDialogue(this, "You hand the polar bear the Willow Bark Tea...", { imageKey: "polarBear" });
        this.polarBear.setTexture && this.polarBear.setTexture("polarBearHappy");
        this.time.delayedCall(800, () => {
          this.polarBearDialogueActive = true;
          this.polarBearDialogueIndex = 0;
          this.activePolarBearDialogues = polarBearThanksDialogues;
          showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarBear" });
          this.updateHUDState && this.updateHUDState();
        });
        this.polarBearHasWillowBarkTea = true;
      } else {
        showDialogue(this, "You still have the Willow Bark Tea.", { imageKey: "polarBear" });
      }
    });

    // Polar Bear click handler
    this.polarBear.on("pointerdown", () => {
      if (!this.polarBearIntroDone && !this.polarBearDialogueActive) {
        this.polarBearDialogueActive = true;
        this.polarBearDialogueIndex = 0;
        this.activePolarBearDialogues = polarBearIntroDialogues;
        showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarBear" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.polarBearIntroDone && !this.polarBearThanksDone && this.hasWillowBarkTea()) {
        showOption(this, "Give the polar bear the Willow Bark Tea?", {
          imageKey: "polarBear",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeWillowBarkTeaChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingWillowBarkTeaGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "polarBear" });
              }
            }
          ]
        });
        return;
      }
      if (this.polarBearIntroDone && !this.polarBearThanksDone && !this.hasWillowBarkTea()) {
        showDialogue(this, "The polar bear looks at you expectantly. Maybe you need to find something for them...", { imageKey: "polarBear" });
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
    this.hasMarigoldSalve = () => this.inventoryManager.hasItemByKey("marigoldSalve");

    // Listen for marigoldSalve handover event from inventory
    this.events.on("marigoldSalveGiven", () => {
      this.awaitingMarigoldSalveGive = false;
      this.inventoryManager.removeItemByKey("marigoldSalve");
      
      if (!this.inventoryManager.hasItemByKey("marigoldSalve")) {
        showDialogue(this, "You hand the deer the Marigold Salve...", { imageKey: "deer" });
        this.deer.setTexture && this.deer.setTexture("deerHappy");
        this.time.delayedCall(800, () => {
          this.deerDialogueActive = true;
          this.deerDialogueIndex = 0;
          this.activeDeerDialogues = deerThanksDialogues;
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
          this.updateHUDState && this.updateHUDState();
        });
        this.deerHasMarigoldSalve = true;
      } else {
        showDialogue(this, "You still have the Marigold Salve.", { imageKey: "deer" });
      }
    });

    // Deer click handler
    this.deer.on("pointerdown", () => {
      if (!this.deerIntroDone && !this.deerDialogueActive) {
        this.deerDialogueActive = true;
        this.deerDialogueIndex = 0;
        this.activeDeerDialogues = deerIntroDialogues;
        showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
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
          imageKey: "deer",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeMarigoldSalveChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingMarigoldSalveGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "deer" });
              }
            }
          ]
        });
        return;
      }
      if (this.deerIntroDone && !this.deerThanksDone && !this.hasMarigoldSalve()) {
        showDialogue(this, "The deer looks at you expectantly. Maybe you need to find something for them...", { imageKey: "deer" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Global dialogue advance handler ---
    this.input.on("pointerdown", () => {
      this.sound.play("click");

      // Handle elephant dialogue
      if (this.elephantDialogueActive) {
        this.elephantDialogueIndex++;
        if (this.activeElephantDialogues && this.elephantDialogueIndex < this.activeElephantDialogues.length) {
          showDialogue(this, this.activeElephantDialogues[this.elephantDialogueIndex], { imageKey: "elephant" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();

          if (!this.elephantIntroDone && this.activeElephantDialogues === elephantIntroDialogues) {
            this.elephantIntroDone = true;
          }
          if (this.elephantHasJasmineTea && this.activeElephantDialogues === elephantThanksDialogues) {
            this.elephantThanksDone = true;
            const tiaQuest = quests.find(q => q.title === "Help Tia");
            if (tiaQuest) {
              tiaQuest.active = false;
              tiaQuest.completed = true;
              saveToLocal("quests", quests);
            }
            receivedItem(this, "autumnShard", "Autumn Shard");
          }
          this.elephantDialogueActive = false;
          this.updateHUDState();
        }
        return;
      }

      // Handle polar bear dialogue
      if (this.polarBearDialogueActive) {
        this.polarBearDialogueIndex++;
        if (this.activePolarBearDialogues && this.polarBearDialogueIndex < this.activePolarBearDialogues.length) {
          showDialogue(this, this.activePolarBearDialogues[this.polarBearDialogueIndex], { imageKey: "polarBear" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();

          if (!this.polarBearIntroDone && this.activePolarBearDialogues === polarBearIntroDialogues) {
            this.polarBearIntroDone = true;
            const snowbertQuest = quests.find(q => q.title === "Help Snowbert");
            if (snowbertQuest && !snowbertQuest.active && !snowbertQuest.completed) {
              snowbertQuest.active = true;
              saveToLocal("quests", quests);
            }
          }
          if (this.polarBearHasWillowBarkTea && this.activePolarBearDialogues === polarBearThanksDialogues) {
            this.polarBearThanksDone = true;
            const snowbertQuest = quests.find(q => q.title === "Help Snowbert");
            if (snowbertQuest) {
              snowbertQuest.active = false;
              snowbertQuest.completed = true;
              saveToLocal("quests", quests);
            }
            receivedItem(this, "winterShard", "Winter Shard");
          }
          this.polarBearDialogueActive = false;
          this.updateHUDState();
        }
        return;
      }

      // Handle deer dialogue
      if (this.deerDialogueActive) {
        this.deerDialogueIndex++;
        if (this.activeDeerDialogues && this.deerDialogueIndex < this.activeDeerDialogues.length) {
          showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();

          if (!this.deerIntroDone && this.activeDeerDialogues === deerIntroDialogues) {
            this.deerIntroDone = true;
          }
          if (this.deerHasMarigoldSalve && this.activeDeerDialogues === deerThanksDialogues) {
            this.deerThanksDone = true;
            const deerQuest = quests.find(q => q.title === "Help Elkton John");
            if (deerQuest) {
              deerQuest.active = false;
              deerQuest.completed = true;
              saveToLocal("quests", quests);
            }
            receivedItem(this, "springShard", "Spring Shard");
          }
          this.deerDialogueActive = false;
          this.updateHUDState();
        }
        return;
      }

      // Handle butterfly dialogue
      if (this.butterflyDialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
        return;
      }

      // Handle plant dialogue advance
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
        return;
      }

      this.updateHUDState();
    });
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 600 }, // Garlic
      { x: 300, y: 400 }, // Thyme
      { x: 400, y: 500 }, // Random bush 1
      { x: 500, y: 550 }, // Random bush 2
    ];
    const bushCount = bushPositions.length;
    const garlicIndex = 0;
    const thymeIndex = 1;
    
    // Initialize bushDispensed if not already done
    if (!this.bushDispensed || this.bushDispensed.length !== bushCount) {
      this.bushDispensed = Array(bushCount).fill(false);
    }

    console.log('Setting up bushes with state:', this.bushDispensed);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.textures.exists('bush')
        ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

      bush.on("pointerdown", () => {
        console.log(`Bush ${i} clicked. Dispensed: ${this.bushDispensed[i]}, GarlicFound: ${this.garlicFound}, ThymeFound: ${this.thymeFound}`);
        
        if (this.dialogueActive) {
          console.log('Dialogue already active, ignoring bush click');
          return;
        }
        
        this.sound.play("click");
        this.dialogueActive = true;
        this.updateHUDState();

        // Check if bush is already dispensed
        if (this.bushDispensed[i]) {
          console.log(`Bush ${i} is already dispensed`);
          showDialogue(this, "This bush is empty!");
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          return;
        }

        if (i === garlicIndex && !this.garlicFound) {
          console.log('Showing garlic minigame');
          const garlic = plantData.find(p => p.key === "garlicPlant");
          if (garlic) {
            this.showPlantMinigame(garlic, "garlicFound", i);
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        else if (i === thymeIndex && !this.thymeFound) {
          console.log('Showing thyme minigame');
          const thyme = plantData.find(p => p.key === "thymePlant");
          if (thyme) {
            this.showPlantMinigame(thyme, "thymeFound", i);
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        else {
          console.log(`Bush ${i} is empty or plant already found`);
          showDialogue(this, `You found nothing in the bush this time.`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          this.bushDispensed[i] = true;
        }
      });
    }
  }

  showPlantMinigame(plant, foundFlag, bushIndex) {
    console.log(`Showing plant minigame for ${plant.name}, bush ${bushIndex}`);
    
    showOption(
      this,
      `You found a ${plant.name} plant! \n But a cheeky animal is trying to steal it!`,
      {
        imageKey: plant.imageKey,
        options: [
          {
            label: "Play a game to win it!",
            callback: () => {
              console.log(`Launching minigame for ${plant.name}`);
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
              
              this.scene.launch("MiniGameScene", {
                onWin: () => {
                  console.log(`Won minigame for ${plant.name}`);
                  this.scene.stop("MiniGameScene");
                  this.scene.resume();

                  const alreadyHas = this.inventoryManager.hasItemByKey(plant.key);
                  if (!alreadyHas) {
                    this.inventoryManager.addItem({
                      key: plant.key,
                      name: plant.name,
                      imageKey: plant.imageKey,
                      type: 'plant',
                      color: 0x4caf50
                    });
                    addPlantToJournal(plant.key);
                    receivedItem(this, plant.key, plant.name);
                  }

                  showDialogue(this,
                    alreadyHas
                      ? `You already have the ${plant.name} plant.`
                      : `You won the game! The animal reluctantly gives you the ${plant.name} plant.`, {
                        imageKey: plant.imageKey
                      }
                  );

                  this[foundFlag] = true;
                  this.dialogueActive = true;

                  // ONLY mark bush as dispensed after successful win
                  if (bushIndex !== undefined) {
                    this.bushDispensed[bushIndex] = true;
                    console.log(`Bush ${bushIndex} marked as dispensed`);
                  }

                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState();
                    this.dialogueOnComplete = null;
                  };
                },
                onLose: () => {
                  console.log(`Lost minigame for ${plant.name}`);
                  this.scene.stop("MiniGameScene");
                  this.scene.resume();
                  
                  showDialogue(this, `You lost the game! The animal ran away with the ${plant.name} plant. \nMaybe you can find another one in a different bush...`);
                  
                  this.dialogueActive = true;
                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState();
                    this.dialogueOnComplete = null;
                  };
                }
              });
              this.scene.pause();
            }
          },
          {
            label: "Try again later",
            callback: () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
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