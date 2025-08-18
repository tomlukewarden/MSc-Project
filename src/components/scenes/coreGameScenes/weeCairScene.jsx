// Ensure global inventoryManager instance
import globalInventoryManager from "../inventoryManager";

import Phaser from "phaser";
import { showDialogue, showOption, destroyDialogueUI } from "../../../dialogue/dialogueUIHelpers";
import {
  createBee,
  beeIntroDialogues,
  beeThanksDialogues
} from "../../../characters/bee";
import {
  createFairy,
  fairyIntroDialogues,
  fairyHelpDialogues,
  fairyGoodbyeDialogues
} from "../../../characters/fairy";
import { saveToLocal, loadFromLocal } from "../../../utils/localStorage";
import { createMainChar } from "../../../characters/mainChar";
import { receivedItem } from "../../recievedItem";
import {addPlantToJournal} from "../journalManager";
import quests from "../../../quests/quests";
import achievements from "../../../quests/achievments";

class WeeCairScene extends Phaser.Scene {
  constructor() {
    super({
      key: "WeeCairScene",
      physics: { default: "arcade", arcade: { debug: false } }
    });
    
    // Use the global managers
    this.inventoryManager = globalInventoryManager;
    
    // Track progress for conditions
    this.hasInteractedWithFairy = false;
    this.hasInteractedWithBee = false;
    this.hasHelpedPaula = false;
    this.hasReceivedFirstShard = false;
  }

  preload() {
    this.load.tilemapTiledJSON("weeCairMap", "/assets/maps/weeCairMap.json");
    this.load.image("weeCairBackground", "/assets/backgrounds/weecair/weecair.png");
    this.load.image("weeCairArch", "/assets/backgrounds/weecair/archway.png");
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
    this.load.image("fairy", "/assets/npc/fairy/fairy.png");
    this.load.image("fairySad", "/assets/npc/dialogue/fairySad.PNG");
    this.load.image("fairyHappy", "/assets/npc/dialogue/fairyHappy.PNG");
    this.load.image("bee", "/assets/npc/bee/bee-sad.png");
    this.load.image("beeHappy", "/assets/npc/bee/bee-happy.png");
    this.load.image("beeDialogueSad", "/assets/npc/dialogue/beeSad.png");
    this.load.image("beeDialogueHappy", "/assets/npc/dialogue/beeHappy.png");
    this.load.image("talk", "/assets/interact/talk.png");
    this.load.image("foxglovePlant", "/assets/plants/foxglove.png");
    this.load.image("springShard", "/assets/items/spring.png");
    this.load.audio("click", "/assets/sound-effects/click.mp3");
    this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
    this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image("craftingBench", "/assets/crafting/bench.png");
    this.load.audio("option", "/assets/sound-effects/option.mp3");
    this.load.image("star", "/assets/misc/Star.png")
  }

  create() {
    // Load progress state
    this.loadProgressState();

    this.scene.launch("ControlScene");
    // --- Launch HUD ---
    this.scene.launch("HUDScene");
    this.scene.bringToTop("HUDScene");

    // --- Map and background ---
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;
    this.add.image(width / 2, height / 2, "weeCairBackground").setScale(scaleFactor);

    // --- Create tilemap collision system ---
    const map = this.make.tilemap({ key: "weeCairMap" });

    // Create collision group
    const collisionGroup = this.physics.add.staticGroup();

    // Handle collision objects from the tilemap
    const collisionObjects = map.getObjectLayer("wee-cair-collisions");

    // Collision scale and offset for positioning
    const collisionScale = 0.175; // Match the background scale
    const tilemapOffsetX = -160; // Match your existing offset
    const tilemapOffsetY = 0;

    if (collisionObjects) {
      collisionObjects.objects.forEach((obj, index) => {
        // Check for collision property
        const hasCollision = obj.properties && obj.properties.find(prop => 
          (prop.name === 'collision' && prop.value === true) ||
          (prop.name === 'collisions' && prop.value === true)
        );
        
        if (hasCollision) {
          // Calculate position and size with scale factor and offset
          const rectX = (obj.x * collisionScale) + (obj.width * collisionScale) / 2 + tilemapOffsetX;
          const rectY = (obj.y * collisionScale) + (obj.height * collisionScale) / 2 + tilemapOffsetY;
          const rectWidth = obj.width * collisionScale;
          const rectHeight = obj.height * collisionScale;
          
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
        }
      });
    }

    // Pass collisionGroup to createMainChar
    const char = createMainChar(this, width, height, scaleFactor, collisionGroup);

    this.add
      .image(width / 2, height / 2, "weeCairArch")
      .setScale(scaleFactor)
      .setOrigin(0.5)
      .setDepth(20);

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(10)
      .setOrigin(0.5);

    // --- NPCs ---
    const bee = createBee(this, width / 2 + 200, height / 2 + 100);
    const fairy = createFairy(this, width / 2 - 200, height / 2 + 100);

    [bee, fairy].forEach((npc) => {
      npc.setInteractive();
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

    // Enable collision between character and collision group
    this.physics.add.collider(char, collisionGroup);

    // --- Dialogue sequence with proper bee images ---
    this.dialogueSequence = [
      { lines: fairyIntroDialogues, imageKey: "fairySad" },
      { lines: beeIntroDialogues, imageKey: "beeDialogueSad" }, 
      { lines: fairyHelpDialogues, imageKey: "fairySad" },
      { lines: beeThanksDialogues, imageKey: "beeDialogueHappy" }, 
      { lines: fairyGoodbyeDialogues, imageKey: "fairyHappy" }
    ];
    this.currentSet = 0;
    this.currentDialogueIndex = 0;
    this.dialogueActive = false;
    this.currentNPC = null;
    this.foxglovePlantReceived = false;
    this.springShardReceived = false;
    this.hasMadeFoxgloveChoice = false;

    // --- Start dialogue sequence ---
    this.startDialogueSequence = () => {
      if (this.currentSet >= this.dialogueSequence.length) return;
      this.activeDialogue = this.dialogueSequence[this.currentSet].lines;
      this.activeImageKey = this.dialogueSequence[this.currentSet].imageKey;
      this.currentDialogueIndex = 0;
      this.dialogueActive = true;
      this.updateHUDState();
      showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
        imageKey: this.activeImageKey
      });
    };

    // --- Enhanced Fairy click handler ---
    fairy.on("pointerdown", () => {
      // Mark interaction
      this.hasInteractedWithFairy = true;
      
      const currentImage = this.dialogueSequence[this.currentSet]?.imageKey;
      if (
        !this.dialogueActive &&
        (currentImage === "fairySad" || currentImage === "fairyHappy")
      ) {
        this.currentNPC = fairy;
        this.startDialogueSequence();
      }
    });

    // --- Enhanced Bee click handler ---
    bee.on("pointerdown", () => {
      // Mark interaction
      this.hasInteractedWithBee = true;
      
      const currentImage = this.dialogueSequence[this.currentSet]?.imageKey;

      // If player has foxglove, offer to give it to Paula (the bee)
      if (this.foxglovePlantReceived && !this.hasMadeFoxgloveChoice) {
        this.dialogueActive = true;
        this.updateHUDState();
        showOption(this, "Give Paula the Foxglove?", {
          imageKey: "beeDialogueSad",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.hasMadeFoxgloveChoice = true;
                destroyDialogueUI(this);
                this.dialogueActive = true;
                this.foxglovePlantReceived = false;
                // Set flag to await foxglove handover
                this.awaitingFoxgloveGive = true;

                this.scene.launch("OpenInventory");
              }
            },
            {
              label: "No",
              onSelect: () => {
                destroyDialogueUI(this);
                this.dialogueActive = true;
                showDialogue(this, "You decide to hold off for now.", {
                  imageKey: "beeDialogueSad"
                });
              }
            }
          ]
        });
        return;
      }

      if (!this.dialogueActive && (currentImage === "beeDialogueSad" || currentImage === "beeDialogueHappy")) {
        this.currentNPC = bee;
        this.startDialogueSequence();
      }
    });

    // --- Enhanced pointerdown handler for advancing dialogue ---
    this.input.on("pointerdown", () => {
      this.sound.play("click", { volume: 0.5 });
      if (!this.dialogueActive || !this.activeDialogue) return;
      if (this.dialogueBox?.optionButtons?.length > 0) return;

      this.currentDialogueIndex++;

      if (this.currentDialogueIndex < this.activeDialogue.length) {
        showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
          imageKey: this.activeImageKey
        });
      } else {
        // First dialogue set completed - manual quest handling
        if (this.currentSet === 0) { 
          // Complete "Welcome to the Gardens" quest manually
          const welcomeQuest = quests.find(q => q.title === "Welcome to the Gardens");
          if (welcomeQuest && !welcomeQuest.completed) {
            welcomeQuest.completed = true;
            console.log("Completed quest: Welcome to the Gardens");
          }
          
          // Activate "Help Paula Nator" quest manually
          const paulaQuest = quests.find(q => q.title === "Help Paula Nator");
          if (paulaQuest && !paulaQuest.active) {
            paulaQuest.active = true;
            console.log("Activated quest: Help Paula Nator");
          }
          
          // Check "First Steps" achievement manually
          const firstStepsAchievement = achievements.find(a => a.title === "First Steps");
          if (firstStepsAchievement && !firstStepsAchievement.completed) {
            firstStepsAchievement.completed = true;
            console.log("Completed achievement: First Steps");
          }
        }

        // --- After beeThanksDialogues, receive spring shard ---
        if (this.activeDialogue === beeThanksDialogues) {
          // Complete "Help Paula Nator" quest manually
          const paulaQuest = quests.find(q => q.title === "Help Paula Nator");
          if (paulaQuest && !paulaQuest.completed) {
            paulaQuest.completed = true;
            console.log("Completed quest: Help Paula Nator");
          }
          
          // Activate "Return the first Shard" quest manually
          const shardQuest = quests.find(q => q.title === "Return the first Shard");
          if (shardQuest && !shardQuest.active) {
            shardQuest.active = true;
            console.log("Activated quest: Return the first Shard");
          }

          // Mark that Paula has been helped
          this.hasHelpedPaula = true;

          // Existing spring shard logic
          if (!this.springShardReceived) {
            receivedItem(this, "springShard", "Spring Shard");
            addPlantToJournal("springShard");
            this.springShardReceived = true;
            this.hasReceivedFirstShard = true;
            
            // Check "Shard Collector" achievement manually
            const shardCollectorAchievement = achievements.find(a => a.title === "Shard Collector");
            if (shardCollectorAchievement && !shardCollectorAchievement.completed) {
              shardCollectorAchievement.completed = true;
              console.log("Completed achievement: Shard Collector");
            }

            this.time.delayedCall(1000, () => {
              this.activeDialogue = fairyGoodbyeDialogues;
              this.activeImageKey = "fairyHappy";
              this.currentDialogueIndex = 0;
              this.dialogueActive = true;
              showDialogue(this, this.activeDialogue[this.currentDialogueIndex], { imageKey: this.activeImageKey });
            });
            return;
          }
        }

        // --- After fairyGoodbyeDialogues, show options ---
        if (this.activeDialogue === fairyGoodbyeDialogues) {
          destroyDialogueUI(this);
          this.dialogueActive = false;
          this.updateHUDState();

          this.showStayOrGoOptions = () => {
            showOption(this, "What would you like do?", {
              imageKey: "fairyHappy",
              options: [
                {
                  label: "Go to the botanic gardens",
                  onSelect: () => {
                    this.scene.start("WallGardenScene");
                  }
                },
                {
                  label: "Stay here",
                  onSelect: () => {
                    this.activeDialogue = ["Come back when you're ready!"];
                    this.activeImageKey = "fairyHappy";
                    this.currentDialogueIndex = 0;
                    this.dialogueActive = true;
                    this.updateHUDState();
                    showDialogue(this, this.activeDialogue[0], {
                      imageKey: this.activeImageKey,
                      onComplete: () => {
                        this.dialogueActive = false;
                        this.updateHUDState();
                        this.showStayOrGoOptions();
                      }
                    });
                  }
                }
              ]
            });
          };

          this.showStayOrGoOptions();
          return;
        }

        // --- Normal sequence advancement ---
        destroyDialogueUI(this);
        this.dialogueActive = false;
        this.updateHUDState();
        this.currentSet++;
        this.currentNPC = null;

        // --- After fairyHelpDialogues, receive foxglove ---
        const justCompletedSet = this.currentSet - 1;
        if (
          this.dialogueSequence[justCompletedSet] &&
          this.dialogueSequence[justCompletedSet].lines === fairyHelpDialogues &&
          !this.foxglovePlantReceived
        ) {
          receivedItem(this, "foxglovePlant", "Foxglove");
          addPlantToJournal("foxglovePlant");
          this.foxglovePlantReceived = true;
          
          // Check "Green Thumb" achievement manually when getting first plant
          const greenThumbAchievement = achievements.find(a => a.title === "Green Thumb");
          if (greenThumbAchievement && !greenThumbAchievement.completed) {
            greenThumbAchievement.completed = true;
            console.log("Completed achievement: Green Thumb");
          }
        }
      }
    });

    // --- Enhanced foxglove handover event ---
    this.events.on("foxgloveGiven", () => {
      this.awaitingFoxgloveGive = false;
      this.hasMadeFoxgloveChoice = true;
      
      // Use global inventory manager to check and remove foxglove
      if (!this.inventoryManager.hasItemByKey("foxglovePlant")) {
        this.foxglovePlantReceived = false;
        // Show handover dialogue with proper bee image
        showDialogue(this, "You hand her the plant...", { imageKey: "beeDialogueHappy" });
        
        this.time.delayedCall(800, () => {
          this.currentSet = this.dialogueSequence.findIndex(
            (set) => set.lines === beeThanksDialogues
          );
          this.activeDialogue = beeThanksDialogues;
          this.activeImageKey = "beeDialogueHappy";
          this.currentDialogueIndex = 0;
          this.dialogueActive = true;
          this.updateHUDState();
          showDialogue(this, this.activeDialogue[this.currentDialogueIndex], {
            imageKey: this.activeImageKey
          });
        });
      } else {
        // If foxglove still present, do not continue - use sad bee image
        showDialogue(this, "You still have the foxglove.", { imageKey: "beeDialogueSad" });
      }
    });

    // Add the crafting bench image to the garden
    const benchX = 1050;
    const benchY = 200;
    const craftingBenchImg = this.add.image(benchX, benchY, "craftingBench")
      .setScale(0.05)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);

    craftingBenchImg.on("pointerdown", () => {
      // Launch the CraftUI as a scene overlay
      this.scene.launch('CraftUI');
      this.scene.bringToTop('CraftUI');
    });

    // Check for "Community Builder" achievement at the end - manually
    this.time.delayedCall(1000, () => {
      if (this.hasInteractedWithFairy && this.hasInteractedWithBee) {
        const communityBuilderAchievement = achievements.find(a => a.title === "Community Builder");
        if (communityBuilderAchievement && !communityBuilderAchievement.completed) {
          communityBuilderAchievement.completed = true;
          console.log("Completed achievement: Community Builder");
        }
      }
    });

    // Save quests and achievements periodically
    setInterval(() => {
      saveToLocal('quests', quests);
      saveToLocal('achievements', achievements);
    }, 5000);
  }

  // Enhanced saveSceneState to include progress tracking
  saveSceneState() {
    const state = {
      inventory: this.inventoryManager.getItems ? this.inventoryManager.getItems() : [],
      currentSet: this.currentSet,
      currentDialogueIndex: this.currentDialogueIndex,
      dialogueActive: !!this.dialogueActive,
      foxglovePlantReceived: !!this.foxglovePlantReceived,
      springShardReceived: !!this.springShardReceived,
      hasMadeFoxgloveChoice: !!this.hasMadeFoxgloveChoice,
      // Save interaction progress
      hasInteractedWithFairy: this.hasInteractedWithFairy,
      hasInteractedWithBee: this.hasInteractedWithBee,
      hasHelpedPaula: this.hasHelpedPaula,
      hasReceivedFirstShard: this.hasReceivedFirstShard
    };
    saveToLocal('weeCairSceneState', state);
    
    // Also save quests and achievements
    saveToLocal('quests', quests);
    saveToLocal('achievements', achievements);
  }

  // Load progress state from saved data
  loadProgressState() {
    const sceneState = loadFromLocal('weeCairSceneState') || {};
    
    // Restore interaction states
    this.hasInteractedWithFairy = sceneState.hasInteractedWithFairy || false;
    this.hasInteractedWithBee = sceneState.hasInteractedWithBee || false;
    this.hasHelpedPaula = sceneState.hasHelpedPaula || false;
    this.hasReceivedFirstShard = sceneState.hasReceivedFirstShard || false;
    
    // Restore dialogue state
    this.currentSet = sceneState.currentSet || 0;
    this.currentDialogueIndex = sceneState.currentDialogueIndex || 0;
    this.foxglovePlantReceived = sceneState.foxglovePlantReceived || false;
    this.springShardReceived = sceneState.springShardReceived || false;
    this.hasMadeFoxgloveChoice = sceneState.hasMadeFoxgloveChoice || false;
    
    // Restore inventory
    if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
      this.inventoryManager.clear();
      sceneState.inventory.forEach(item => this.inventoryManager.addItem(item));
    }
    
    // Load quests and achievements
    const savedQuests = loadFromLocal('quests');
    const savedAchievements = loadFromLocal('achievements');
    
    if (savedQuests && Array.isArray(savedQuests)) {
      // Update quest states
      savedQuests.forEach((savedQuest, index) => {
        if (quests[index]) {
          quests[index] = { ...quests[index], ...savedQuest };
        }
      });
    }
    
    if (savedAchievements && Array.isArray(savedAchievements)) {
      // Update achievement states
      savedAchievements.forEach((savedAchievement, index) => {
        if (achievements[index]) {
          achievements[index] = { ...achievements[index], ...savedAchievement };
        }
      });
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

  handleResize(gameSize) {
    if (this.dialogueBox && this.dialogueBox.box) {
      const { width, height } = gameSize;
      const boxWidth = Math.min(600, width * 0.8);
      const boxHeight = Math.min(220, height * 0.3);
      this.dialogueBox.box.setPosition(width / 2, height - boxHeight / 2 - 30);
      this.dialogueBox.box.setSize(boxWidth, boxHeight);
      if (this.dialogueBox.textObj) {
        this.dialogueBox.textObj.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      if (this.dialogueBox.image) {
        this.dialogueBox.image.setPosition(width / 2, height - boxHeight / 2 - 30);
      }
      if (this.dialogueBox.optionButtons) {
        this.dialogueBox.optionButtons.forEach((btn, idx) => {
          btn.setPosition(width / 2, height - boxHeight / 2 + 40 + idx * 40);
        });
      }
    }
  }
}

export default WeeCairScene;