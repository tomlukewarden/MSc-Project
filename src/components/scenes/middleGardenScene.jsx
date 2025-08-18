import { createMainChar } from "../../characters/mainChar";
import plantData from "../../plantData";
import globalInventoryManager from "../inventoryManager";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import { createWolf, wolfIntroDialogues, wolfThanksDialogues } from "../../characters/wolf";
import { createMole, moleIntroDialogues, moleThanksDialogues } from "../../characters/mole";
import { createTurtle, turtleIntroDialogues, turtleThanksDialogues } from "../../characters/turtle";
import globalTimeManager from "../../day/timeManager";
import quests from "../../quests/quests";

class MiddleGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiddleGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.garlicFound = false;
    this.thymeFound = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.transitioning = false;
    
    // Use the global inventory manager
    this.inventoryManager = globalInventoryManager;
  }

  preload() {
   this.load.image('finalGardenBackground', '/assets/backgrounds/finalGarden/middleBackground.png');
   this.load.image('folliage1', '/assets/backgrounds/finalGarden/folliage1.png');
   this.load.image('folliage2', '/assets/backgrounds/finalGarden/folliage2.png');
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
    this.load.audio("click", "/assets/sound-effects/click.mp3");
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('wolf', '/assets/npc/wolf/wolf.png')
    this.load.image('wolfHappy', '/assets/npc/wolf/happy.png')
    this.load.image('talk', '/assets/ui-items/talk.png');
    this.load.image('summerShard', '/assets/items/summer.png');
    this.load.image('winterShard', '/assets/items/winter.png');
    this.load.image('springShard', '/assets/items/spring.png');
    this.load.image('autumnShard', '/assets/items/autumn.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('mole', '/assets/npc/mole/mole.png');
    this.load.image('moleHappy', '/assets/npc/mole/happy.png');
    this.load.image('turtle', '/assets/npc/turtle/turtle.png');
    this.load.image('turtleHappy', '/assets/npc/turtle/happy.png');
    this.load.audio("option", "/assets/sound-effects/option.mp3");
    this.load.image("turtleDialogueHappy", "/assets/npc/dialogue/turtleHappy.PNG");
    this.load.image("turtleDialogueSad", "/assets/npc/dialogue/turtleSad.PNG");
    this.load.image("moleDialogueHappy", "/assets/npc/dialogue/moleHappy.png");
    this.load.image("moleDialogueSad", "/assets/npc/dialogue/moleSad.png");
    this.load.image("wolfDialogueHappy", "/assets/npc/dialogue/wolfHappy.PNG");
    this.load.image("wolfDialogueSad", "/assets/npc/dialogue/wolfSad.PNG");
    this.load.tilemapTiledJSON('middleGardenMap', '/assets/maps/middleGarden.json');
  }

  create() {
    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }
    this.transitioning = false;
    
    this.scene.launch("HUDScene");
    this.scene.stop("StartScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('middleGardenSceneState') || {};
    // Restore inventory if present
    if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
      this.inventoryManager.clear();
      sceneState.inventory.forEach(item => this.inventoryManager.addItem(item));
    }
    // Restore found flags
    this.garlicFound = !!sceneState.garlicFound;
    this.thymeFound = !!sceneState.thymeFound;
    this.marigoldFound = !!sceneState.marigoldFound;
    this.jasmineFound = !!sceneState.jasmineFound;
    this.periwinkleFound = !!sceneState.periwinkleFound;
    // Restore NPC states
    this.wolfIntroDone = !!sceneState.wolfIntroDone;
    this.wolfThanksDone = !!sceneState.wolfThanksDone;
    this.moleIntroDone = !!sceneState.moleIntroDone;
    this.moleThanksDone = !!sceneState.moleThanksDone;
    this.turtleIntroDone = !!sceneState.turtleIntroDone;
    this.turtleThanksDone = !!sceneState.turtleThanksDone;
    // Restore time of day
    if (sceneState.timeOfDay) {
      globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
    }

    // Asset existence check helper
    const safeAddImage = (scene, x, y, key, ...args) => {
      if (!scene.textures.exists(key)) {
        console.warn(`Image asset missing: ${key}`);
        return scene.add.text(x, y, `Missing: ${key}`, { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);
      }
      return scene.add.image(x, y, key, ...args);
    };

    // Background
    safeAddImage(this, width / 2, height / 2, 'finalGardenBackground').setScale(scaleFactor).setDepth(0);
    // Folliage
    safeAddImage(this, width / 2, height / 2, 'folliage1').setScale(scaleFactor).setDepth(1);
    const folliage2Img = safeAddImage(this, width / 2, height / 2, 'folliage2').setScale(scaleFactor).setDepth(2);

    // --- Create tilemap collision system ---
    console.log('Creating tilemap collision system...');
    this.map = this.make.tilemap({ key: 'middleGardenMap' });
    console.log('Tilemap created:', this.map);

    // Create collision group
    const collisionGroup = this.physics.add.staticGroup();

    // Handle collision objects from the tilemap
    const objectLayer = this.map.getObjectLayer('Object Layer 1');
    console.log('Object Layer 1 found:', objectLayer);

    // Collision scale and offset for positioning
    const collisionScale = 0.175;
    const tilemapOffsetX = -175;
    const tilemapOffsetY = 20;

    if (objectLayer) {
      console.log(`Found ${objectLayer.objects.length} objects in layer`);
      
      objectLayer.objects.forEach((obj, index) => {
        console.log(`Object ${index}:`, {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
          properties: obj.properties,
          type: obj.type,
          name: obj.name
        });
        
        // Check for collision property
        const hasCollision = obj.properties && obj.properties.find(prop => 
          (prop.name === 'collisions' && prop.value === true) ||
          (prop.name === 'collision' && prop.value === true) ||
          prop.name === 'collides'
        );
        
        console.log(`Object ${index} has collision:`, !!hasCollision);
        
        if (hasCollision || obj.type === 'collision' || obj.name === 'collision') {
          console.log(`Creating collision rectangle for object ${index}`);
          
          // Calculate position and size with scale factor
          const rectX = (obj.x * collisionScale) + (obj.width * collisionScale) / 2 + tilemapOffsetX;
          const rectY = (obj.y * collisionScale) + (obj.height * collisionScale) / 2 + tilemapOffsetY;
          const rectWidth = obj.width * collisionScale;
          const rectHeight = obj.height * collisionScale;
          
          console.log(`Collision rect ${index} - Position: (${rectX}, ${rectY}), Size: ${rectWidth}x${rectHeight}`);
          
          // Create invisible collision rectangle
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
      if (this.map.objects) {
        this.map.objects.forEach((layer, index) => {
          console.log(`Object layer ${index}:`, layer.name || 'unnamed');
        });
      } else {
        console.log('No object layers found in tilemap');
      }
    }

    // --- Add invisible folliage2 collision ---
    const folliage2Rect = this.add.rectangle(
      width / 2,
      height / 2,
      folliage2Img.width * scaleFactor,
      folliage2Img.height * scaleFactor,
      0x000000,
      0 // Completely transparent
    );
    this.physics.add.existing(folliage2Rect, true);
    collisionGroup.add(folliage2Rect);

    // Create main character with collision
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(1).setOrigin(0.5, 0.5);

    // Enable collision between character and collision group
    this.physics.add.collider(this.mainChar, collisionGroup);


    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(11)
      .setOrigin(0.5);

    // --- Mole NPC ---
    this.mole = createMole(this, width / 2 + 200, height / 2 + 100);
    this.mole
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.09)
      .setOrigin(-3.5, 2);

    // Set mole texture based on saved state
    if (this.moleThanksDone && this.textures.exists('moleHappy')) {
      this.mole.setTexture('moleHappy');
    }

    // --- Turtle NPC ---
    this.turtle = createTurtle(this, width / 2 - 200, height / 2 + 100);
    this.turtle
      .setInteractive({ useHandCursor: true })
      .setDepth(1)
      .setScale(0.12)
      .setOrigin(-0.2, 1.7);

    // Set turtle texture based on saved state
    if (this.turtleThanksDone && this.textures.exists('turtleHappy')) {
      this.turtle.setTexture('turtleHappy');
    }

    // --- Wolf NPC ---
    this.wolf = createWolf(this, width / 2, height / 2 - 120);
    this.wolf
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.15)
      .setOrigin(0.5, 0.9);

    // Set wolf texture based on saved state
    if (this.wolfThanksDone && this.textures.exists('wolfHappy')) {
      this.wolf.setTexture('wolfHappy');
    }

    // Talk icon events for all NPCs
    [this.mole, this.turtle, this.wolf].forEach(npc => {
      npc.on("pointerover", (pointer) => {
        talkIcon.setVisible(true);
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
      });
      npc.on("pointermove", (pointer) => {
        talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
      });
      npc.on("pointerout", () => {
        talkIcon.setVisible(false);
      });
    });

    // --- Mole dialogue and gifting logic ---
    this.moleDialogueActive = false;
    this.moleDialogueIndex = 0;
    this.hasGarlicPaste = () => this.inventoryManager.hasItemByKey("garlicPaste");

    // Listen for garlicPaste handover event from inventory
    this.events.on("garlicPasteGiven", () => {
      this.awaitingGarlicPasteGive = false;
      this.inventoryManager.removeItemByKey("garlicPaste");
      
      if (!this.inventoryManager.hasItemByKey("garlicPaste")) {
        showDialogue(this, "You hand the mole the Garlic Paste...", { imageKey: "moleDialogueHappy" });
        this.mole.setTexture && this.mole.setTexture("moleHappy");
        this.time.delayedCall(800, () => {
          this.moleDialogueActive = true;
          this.moleDialogueIndex = 0;
          this.activeMoleDialogues = moleThanksDialogues;
          showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "moleDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.moleHasGarlicPaste = true;
      } else {
        showDialogue(this, "You still have the Garlic Paste.", { imageKey: "moleDialogueSad" });
      }
    });

    // Mole click handler
    this.mole.on("pointerdown", () => {
      if (!this.moleIntroDone && !this.moleDialogueActive) {
        this.moleDialogueActive = true;
        this.moleDialogueIndex = 0;
        this.activeMoleDialogues = moleIntroDialogues;
        showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { imageKey: "moleDialogueSad" });
        this.updateHUDState && this.updateHUDState();

        // --- Activate Mole's quest when first meeting ---
        const moleQuest = quests.find(q => q.title === "Help the Mole");
        if (moleQuest && !moleQuest.active && !moleQuest.completed) {
          moleQuest.active = true;
          saveToLocal("quests", quests);
          console.log("Quest 'Help the Mole' is now active!");
        }
        return;
      }
      if (this.moleIntroDone && !this.moleThanksDone && this.hasGarlicPaste()) {
        showOption(this, "Give the mole the Garlic Paste?", {
          imageKey: "moleDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeGarlicPasteChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingGarlicPasteGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "moleDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.moleIntroDone && !this.moleThanksDone && !this.hasGarlicPaste()) {
        showDialogue(this, "The mole looks at you expectantly. Maybe you need to find something for them?", { imageKey: "moleDialogueSad" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Turtle dialogue and gifting logic ---
    this.turtleDialogueActive = false;
    this.turtleDialogueIndex = 0;
    this.hasThymeInfusedOil = () => this.inventoryManager.hasItemByKey("thymeInfusedOil");

    // Listen for thymeInfusedOil handover event from inventory
    this.events.on("thymeInfusedOilGiven", () => {
      this.awaitingThymeInfusedOilGive = false;
      this.inventoryManager.removeItemByKey("thymeInfusedOil");
      
      if (!this.inventoryManager.hasItemByKey("thymeInfusedOil")) {
        showDialogue(this, "You hand the turtle the Thyme Infused Oil...", { imageKey: "turtleDialogueHappy" });
        this.turtle.setTexture && this.turtle.setTexture("turtleHappy");
        this.time.delayedCall(800, () => {
          this.turtleDialogueActive = true;
          this.turtleDialogueIndex = 0;
          this.activeTurtleDialogues = turtleThanksDialogues;
          showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { imageKey: "turtleDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.turtleHasThymeInfusedOil = true;
      } else {
        showDialogue(this, "You still have the Thyme Infused Oil.", { imageKey: "turtleDialogueSad" });
      }
    });

    // Turtle click handler
    this.turtle.on("pointerdown", () => {
      if (!this.turtleIntroDone && !this.turtleDialogueActive) {
        this.turtleDialogueActive = true;
        this.turtleDialogueIndex = 0;
        this.activeTurtleDialogues = turtleIntroDialogues;
        showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { imageKey: "turtleDialogueSad" });
        this.updateHUDState && this.updateHUDState();

        // --- Activate Turtle's quest when first meeting ---
        const turtleQuest = quests.find(q => q.title === "Help the Turtle");
        if (turtleQuest && !turtleQuest.active && !turtleQuest.completed) {
          turtleQuest.active = true;
          saveToLocal("quests", quests);
          console.log("Quest 'Help the Turtle' is now active!");
        }
        return;
      }
      if (this.turtleIntroDone && !this.turtleThanksDone && this.hasThymeInfusedOil()) {
        showOption(this, "Give the turtle the Thyme Infused Oil?", {
          imageKey: "turtleDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeThymeInfusedOilChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingThymeInfusedOilGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "turtleDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.turtleIntroDone && !this.turtleThanksDone && !this.hasThymeInfusedOil()) {
        showDialogue(this, "The turtle looks at you expectantly. Maybe you need to find something for them...", { imageKey: "turtleDialogueSad" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Wolf dialogue and gifting logic ---
    this.wolfDialogueActive = false;
    this.wolfDialogueIndex = 0;
    this.hasPeriwinkleExtract = () => this.inventoryManager.hasItemByKey("periwinkleExtract");

    // Listen for periwinkleExtract handover event from inventory
    this.events.on("periwinkleExtractGiven", () => {
      this.awaitingPeriwinkleExtractGive = false;
      this.inventoryManager.removeItemByKey("periwinkleExtract");
      
      if (!this.inventoryManager.hasItemByKey("periwinkleExtract")) {
        showDialogue(this, "You hand the wolf the Periwinkle Extract...", { imageKey: "wolfDialogueHappy" });
        this.wolf.setTexture && this.wolf.setTexture("wolfHappy");
        this.time.delayedCall(800, () => {
          this.wolfDialogueActive = true;
          this.wolfDialogueIndex = 0;
          this.activeWolfDialogues = wolfThanksDialogues;
          showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolfDialogueHappy" });
          this.updateHUDState && this.updateHUDState();
        });
        this.wolfHasPeriwinkleExtract = true;
      } else {
        showDialogue(this, "You still have the Periwinkle Extract.", { imageKey: "wolfDialogueSad" });
      }
    });

    // Wolf click handler
    this.wolf.on("pointerdown", () => {
      if (!this.wolfIntroDone && !this.wolfDialogueActive) {
        this.wolfDialogueActive = true;
        this.wolfDialogueIndex = 0;
        this.activeWolfDialogues = wolfIntroDialogues;
        showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolfDialogueSad" });
        this.updateHUDState && this.updateHUDState();

        // --- Activate Wolf's quest when first meeting ---
        const wolfQuest = quests.find(q => q.title === "Help the Wolf");
        if (wolfQuest && !wolfQuest.active && !wolfQuest.completed) {
          wolfQuest.active = true;
          saveToLocal("quests", quests);
          console.log("Quest 'Help the Wolf' is now active!");
        }
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && this.hasPeriwinkleExtract()) {
        showOption(this, "Give the wolf the Periwinkle Extract?", {
          imageKey: "wolfDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadePeriwinkleExtractChoice = true;
                this.destroyDialogueUI();
                this.dialogueActive = true;
                this.awaitingPeriwinkleExtractGive = true;
                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", { imageKey: "wolfDialogueSad" });
              }
            }
          ]
        });
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && !this.hasPeriwinkleExtract()) {
        showDialogue(this, "The wolf looks at you expectantly. Maybe you need to find something for them?", { imageKey: "wolfDialogueSad" });
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
      if (this.wolfDialogueActive) {
        this.wolfDialogueIndex++;
        if (this.activeWolfDialogues && this.wolfDialogueIndex < this.activeWolfDialogues.length) {
          showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { 
            imageKey: this.activeWolfDialogues === wolfThanksDialogues ? "wolfDialogueHappy" : "wolfDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.wolfIntroDone && this.activeWolfDialogues === wolfIntroDialogues) {
            this.wolfIntroDone = true;
          }
          if (this.wolfHasPeriwinkleExtract && this.activeWolfDialogues === wolfThanksDialogues) {
            this.wolfThanksDone = true;
            // --- Complete Wolf's quest after thanks dialogue ---
            const wolfQuest = quests.find(q => q.title === "Help the Wolf");
            if (wolfQuest) {
              wolfQuest.active = false;
              wolfQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help the Wolf' completed!");
            }
            receivedItem(this, "summerShard", "Summer Shard");
          }
          this.wolfDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      if (this.moleDialogueActive) {
        this.moleDialogueIndex++;
        if (this.activeMoleDialogues && this.moleDialogueIndex < this.activeMoleDialogues.length) {
          showDialogue(this, this.activeMoleDialogues[this.moleDialogueIndex], { 
            imageKey: this.activeMoleDialogues === moleThanksDialogues ? "moleDialogueHappy" : "moleDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.moleIntroDone && this.activeMoleDialogues === moleIntroDialogues) {
            this.moleIntroDone = true;
          }
          if (this.moleHasGarlicPaste && this.activeMoleDialogues === moleThanksDialogues) {
            this.moleThanksDone = true;
            // --- Complete Mole's quest after thanks dialogue ---
            const moleQuest = quests.find(q => q.title === "Help the Mole");
            if (moleQuest) {
              moleQuest.active = false;
              moleQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help the Mole' completed!");
            }
            receivedItem(this, "springShard", "Spring Shard");
          }
          this.moleDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      if (this.turtleDialogueActive) {
        this.turtleDialogueIndex++;
        if (this.activeTurtleDialogues && this.turtleDialogueIndex < this.activeTurtleDialogues.length) {
          showDialogue(this, this.activeTurtleDialogues[this.turtleDialogueIndex], { 
            imageKey: this.activeTurtleDialogues === turtleThanksDialogues ? "turtleDialogueHappy" : "turtleDialogueSad" 
          });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.turtleIntroDone && this.activeTurtleDialogues === turtleIntroDialogues) {
            this.turtleIntroDone = true;
          }
          if (this.turtleHasThymeInfusedOil && this.activeTurtleDialogues === turtleThanksDialogues) {
            this.turtleThanksDone = true;
            // --- Complete Turtle's quest after thanks dialogue ---
            const turtleQuest = quests.find(q => q.title === "Help the Turtle");
            if (turtleQuest) {
              turtleQuest.active = false;
              turtleQuest.completed = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help the Turtle' completed!");
            }
            receivedItem(this, "autumnShard", "Autumn Shard");
          }
          this.turtleDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }

      // Plant dialogue advance
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
      this.updateHUDState && this.updateHUDState();
    });

    // --- Setup bushes ---
    this.setupBushes(width, height);

    // --- PERIODIC SAVE TO LOCAL STORAGE ---
    this._saveInterval = setInterval(() => {
      this.saveSceneState();
    }, 8000);

    // Save on shutdown/stop
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

  setupBushes(width, height) {
    const bushPositions = [
      { x: 100, y: 300 }, // Jasmine
      { x: 120, y: 500 }, // Marigold
      { x: 1150, y: 250 }, // Periwinkle
      { x: 1200, y: 550 }  // Random bush
    ];
    const bushCount = bushPositions.length;
    const jasmineIndex = 0;
    const marigoldIndex = 1;
    const periwinkleIndex = 2;
    this.bushDispensed = this.bushDispensed || Array(bushCount).fill(false);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.textures.exists('bush')
        ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

      bush.on("pointerdown", () => {
        this.sound.play("click");
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState && this.updateHUDState();

        // If already dispensed, show empty dialogue
        if (this.bushDispensed[i]) {
          showDialogue(this, "This bush is empty!");
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          return;
        }

        // Marigold bush
        if (i === marigoldIndex && !this.marigoldFound) {
          const marigold = plantData.find(p => p.key === "marigoldPlant");
          if (marigold) {
            this.showPlantMinigame(marigold, "marigoldFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // Jasmine bush
        else if (i === jasmineIndex && !this.jasmineFound) {
          const jasmine = plantData.find(p => p.key === "jasminePlant");
          if (jasmine) {
            this.showPlantMinigame(jasmine, "jasmineFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // Periwinkle bush
        else if (i === periwinkleIndex && !this.periwinkleFound) {
          const periwinkle = plantData.find(p => p.key === "periwinklePlant");
          if (periwinkle) {
            this.showPlantMinigame(periwinkle, "periwinkleFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        // All other bushes
        else {
          showDialogue(this, `You found nothing in the bush this time.`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
          this.bushDispensed[i] = true;
        }
      });
    }
  }

  showPlantMinigame(plant, foundFlag) {
    showOption(
      this,
      `You found a ${plant.name} plant! But a cheeky animal is trying to steal it!`,
      {
        options: [
          {
            label: "Play a game to win it!",
            callback: () => {
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
              this.scene.launch("MiniGameScene", {
                onWin: () => {
                  this.scene.stop("MiniGameScene");
                  this.scene.resume();

                  const alreadyHas = this.inventoryManager.hasItemByKey(plant.key);
                  if (!alreadyHas) {
                    addPlantToJournal(plant.key);
                    receivedItem(this, plant.key, plant.name);
                  }

                  showDialogue(this,
                    alreadyHas
                      ? `You already have the ${plant.name} plant.`
                      : `You won the game! The animal reluctantly gives you the ${plant.name} plant.`,
                    { imageKey: plant.imageKey }
                  );

                  this[foundFlag] = true;
                  this.dialogueActive = true;

                  this.dialogueOnComplete = () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = false;
                    this.updateHUDState && this.updateHUDState();
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
              this.destroyDialogueUI && this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              this.dialogueOnComplete = null;
            }
          }
        ],
        imageKey: plant.imageKey
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
    const rightEdge = this.sys.game.config.width - 60;
    const leftEdge = 50; 

    if (this.mainChar) {
      // Right edge
      if (this.mainChar.x >= rightEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("LoaderScene", {
            nextSceneKey: "ShardGardenScene",
            nextSceneData: {}
          });
        }
      }
      // Left edge
      if (this.mainChar.x <= leftEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("LoaderScene", {
            nextSceneKey: "WallGardenScene",
            nextSceneData: {}
          });
        }
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

  saveSceneState() {
    const state = {
      inventory: this.inventoryManager.getItems(),
      garlicFound: !!this.garlicFound,
      thymeFound: !!this.thymeFound,
      marigoldFound: !!this.marigoldFound,
      jasmineFound: !!this.jasmineFound,
      periwinkleFound: !!this.periwinkleFound,
      wolfIntroDone: !!this.wolfIntroDone,
      wolfThanksDone: !!this.wolfThanksDone,
      moleIntroDone: !!this.moleIntroDone,
      moleThanksDone: !!this.moleThanksDone,
      turtleIntroDone: !!this.turtleIntroDone,
      turtleThanksDone: !!this.turtleThanksDone,
      timeOfDay: globalTimeManager.getCurrentTimeOfDay()
    };
    saveToLocal('middleGardenSceneState', state);
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

export default MiddleGardenScene;