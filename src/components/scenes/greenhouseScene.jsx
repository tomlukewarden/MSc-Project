import Phaser from "phaser";
import { createRabbit, rabbitIntroDialogues, rabbitThanksDialogues } from "../../characters/rabbit";
import { createPig, pigIntroDialogues, pigThanksDialogues } from "../../characters/pig";
import { showDialogue, showOption, destroyDialogueUI } from "../../dialogue/dialogueUIHelpers";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { createMainChar } from "../../characters/mainChar";
import globalInventoryManager from "../inventoryManager";
import { receivedItem } from "../recievedItem";
import globalTimeManager from "../../day/timeManager";
import quests from "../../quests/quests";

class GreenhouseScene extends Phaser.Scene {
    constructor() {
        super({ key: "GreenhouseScene", physics: { default: "arcade", arcade: { debug: false } } });
        this.dialogueActive = false;
        this.dialogueBox = null;
        
        // Use the global inventory manager
        this.inventoryManager = globalInventoryManager;
    }

    preload() {
        this.load.image("greenhouseBackground", "/assets/backgrounds/greenhouse/greenhouse.png");
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
        this.load.audio("click", "/assets/sound-effects/click.mp3")
        this.load.audio("sparkle", "/assets/sound-effects/sparkle.mp3");
        this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
        this.load.image("autumnShard", "/assets/items/autumn.png");
        this.load.image("winterShard", "/assets/items/winter.png");
        this.load.image('rabbit', '/assets/npc/rabbit/rabbit.png');
        this.load.image('rabbitHappy', '/assets/npc/rabbit/happy.png');
        this.load.image("pig", "/assets/npc/pig/pig.png");
        this.load.image("pigHappy", "/assets/npc/pig/happy.png");
        this.load.image('talk', '/assets/interact/talk.png');
        this.load.audio("option", "/assets/sound-effects/option.mp3");
        this.load.image('lavenderOil', '/assets/crafting/lavenderOil.png');
        this.load.image('aloeAfterSunCream', '/assets/crafting/creamRemedy.png');
    }

    create() {
        this.transitioning = false;
        globalTimeManager.init(this);
        if (!globalTimeManager.startTimestamp) {
            globalTimeManager.start();
        }

        // --- LOAD STATE FROM LOCAL STORAGE ---
        const sceneState = loadFromLocal('greenhouseSceneState') || {};
        // Restore inventory if present
        if (sceneState.inventory && Array.isArray(sceneState.inventory)) {
            this.inventoryManager.clear();
            sceneState.inventory.forEach(item => this.inventoryManager.addItem(item));
        }
        // Restore NPC states
        this.rabbitIntroDone = !!sceneState.rabbitIntroDone;
        this.rabbitThanksDone = !!sceneState.rabbitThanksDone;
        this.pigIntroDone = !!sceneState.pigIntroDone;
        this.pigThanksDone = !!sceneState.pigThanksDone;
        // Restore time of day
        if (sceneState.timeOfDay) {
            globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
        }

        this.scene.stop("OpenJournal");
        this.scene.stop("WeeCairScene");
        this.scene.stop("StartScene");
        this.scene.launch("HUDScene");
        this.scene.bringToTop("HUDScene");

        const { width, height } = this.sys.game.config;
        const scaleFactor = 0.175;

        this.add.image(width / 2, height / 2, "greenhouseBackground").setScale(scaleFactor);

        // --- Talk icon ---
        const talkIcon = this.add
            .image(0, 0, "talk")
            .setScale(0.05)
            .setVisible(false)
            .setDepth(11)
            .setOrigin(0.5);

        // --- Collision objects (example: invisible wall at left edge) ---
        const collisionGroup = this.physics.add.staticGroup();
        const leftWall = this.add.rectangle(0, height / 2, 10, height, 0x000000, 0);
        this.physics.add.existing(leftWall, true);
        collisionGroup.add(leftWall);

        // Spawn player at center to avoid immediate right edge transition
        this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);

        // --- Rabbit NPC ---
        this.rabbit = createRabbit(this, width / 2 + 200, height / 2 + 100);
        this.rabbit
          .setInteractive({ useHandCursor: true })
          .setDepth(10)
          .setScale(0.1)
          .setOrigin(0.2, 3.2);

        // Set rabbit texture based on saved state
        if (this.rabbitThanksDone && this.textures.exists('rabbitHappy')) {
            this.rabbit.setTexture('rabbitHappy');
        }

        // --- Pig NPC ---
        this.pig = createPig(this, width / 2 - 200, height / 2 + 100);
        this.pig
          .setInteractive({ useHandCursor: true })
          .setDepth(1)
          .setScale(0.12)
          .setOrigin(2, 1.7);

        // Set pig texture based on saved state
        if (this.pigThanksDone && this.textures.exists('pigHappy')) {
            this.pig.setTexture('pigHappy');
        }

        // --- Talk icon events ---
        this.rabbit.on("pointerover", (pointer) => {
          talkIcon.setVisible(true);
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.rabbit.on("pointermove", (pointer) => {
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.rabbit.on("pointerout", () => {
          talkIcon.setVisible(false);
        });

        this.pig.on("pointerover", (pointer) => {
          talkIcon.setVisible(true);
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.pig.on("pointermove", (pointer) => {
          talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
        });
        this.pig.on("pointerout", () => {
          talkIcon.setVisible(false);
        });

        // --- Rabbit dialogue and gifting logic ---
        this.rabbitDialogueActive = false;
        this.rabbitDialogueIndex = 0;
        this.hasLavenderOil = () => this.inventoryManager.hasItemByKey("lavenderOil");

        // Listen for lavenderOil handover event from inventory
        this.events.on("lavenderOilGiven", () => {
          this.awaitingLavenderOilGive = false;
          this.inventoryManager.removeItemByKey("lavenderOil");
          
          if (!this.inventoryManager.hasItemByKey("lavenderOil")) {
            showDialogue(this, "You hand the rabbit the Lavender Oil...", { imageKey: "rabbit" });
            this.rabbit.setTexture && this.rabbit.setTexture("rabbitHappy");
            this.time.delayedCall(800, () => {
              this.rabbitDialogueActive = true;
              this.rabbitDialogueIndex = 0;
              this.activeRabbitDialogues = rabbitThanksDialogues;
              showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
              this.updateHUDState && this.updateHUDState();
            });
            this.rabbitHasLavenderOil = true;
          } else {
            showDialogue(this, "You still have the Lavender Oil.", { imageKey: "rabbit" });
          }
        });

        // Rabbit click handler
        this.rabbit.on("pointerdown", () => {
          if (!this.rabbitIntroDone && !this.rabbitDialogueActive) {
            this.rabbitDialogueActive = true;
            this.rabbitDialogueIndex = 0;
            this.activeRabbitDialogues = rabbitIntroDialogues;
            showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
            this.updateHUDState && this.updateHUDState();

            // --- Activate Carrie Cake's quest when first meeting ---
            const carrieQuest = quests.find(q => q.title === "Help Carrie Cake");
            if (carrieQuest && !carrieQuest.active && !carrieQuest.completed) {
              carrieQuest.active = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Carrie Cake' is now active!");
            }
            return;
          }
          if (this.rabbitIntroDone && !this.rabbitThanksDone && this.hasLavenderOil()) {
            showOption(this, "Give the rabbit the Lavender Oil?", {
              imageKey: "rabbit",
              options: [
                {
                  label: "Yes",
                  onSelect: () => {
                    this.hasMadeLavenderOilChoice = true;
                    this.destroyDialogueUI();
                    this.dialogueActive = true;
                    this.awaitingLavenderOilGive = true;
                    this.scene.launch("OpenInventory");
                  }
                },
                {
                  label: "No",
                  onSelect: () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = true;
                    showDialogue(this, "You decide to hold off for now.", { imageKey: "rabbit" });
                  }
                }
              ]
            });
            return;
          }
          if (this.rabbitIntroDone && !this.rabbitThanksDone && !this.hasLavenderOil()) {
            showDialogue(this, "The rabbit looks at you expectantly. Maybe you need to find something for them?", { imageKey: "rabbit" });
            this.time.delayedCall(1800, () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
            });
            return;
          }
        });

        // --- Pig dialogue and gifting logic ---
        this.pigDialogueActive = false;
        this.pigDialogueIndex = 0;
        this.hasAloeAfterSunCream = () => this.inventoryManager.hasItemByKey("aloeAfterSunCream");

        // Listen for aloeAfterSunCream handover event from inventory
        this.events.on("aloeAfterSunCreamGiven", () => {
          this.awaitingAloeAfterSunCreamGive = false;
          this.inventoryManager.removeItemByKey("aloeAfterSunCream");
          
          if (!this.inventoryManager.hasItemByKey("aloeAfterSunCream")) {
            showDialogue(this, "You hand the pig the Aloe After-Sun Cream...", { imageKey: "pig" });
            this.pig.setTexture && this.pig.setTexture("pigHappy");
            this.time.delayedCall(800, () => {
              this.pigDialogueActive = true;
              this.pigDialogueIndex = 0;
              this.activePigDialogues = pigThanksDialogues;
              showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pigHappy" });
              this.updateHUDState && this.updateHUDState();
            });
            this.pigHasAloeAfterSunCream = true;
          } else {
            showDialogue(this, "You still have the Aloe After-Sun Cream.", { imageKey: "pig" });
          }
        });

        // Pig click handler
        this.pig.on("pointerdown", () => {
          if (!this.pigIntroDone && !this.pigDialogueActive) {
            this.pigDialogueActive = true;
            this.pigDialogueIndex = 0;
            this.activePigDialogues = pigIntroDialogues;
            showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pig" });
            this.updateHUDState && this.updateHUDState();

            // --- Activate Chris P. Bacon's quest when first meeting ---
            const chrisQuest = quests.find(q => q.title === "Help Chris P. Bacon");
            if (chrisQuest && !chrisQuest.active && !chrisQuest.completed) {
              chrisQuest.active = true;
              saveToLocal("quests", quests);
              console.log("Quest 'Help Chris P. Bacon' is now active!");
            }
            return;
          }
          if (this.pigIntroDone && !this.pigThanksDone && this.hasAloeAfterSunCream()) {
            showOption(this, "Give the pig the Aloe After-Sun Cream?", {
              imageKey: "pig",
              options: [
                {
                  label: "Yes",
                  onSelect: () => {
                    this.hasMadeAloeAfterSunCreamChoice = true;
                    this.destroyDialogueUI();
                    this.dialogueActive = true;
                    this.awaitingAloeAfterSunCreamGive = true;
                    this.scene.launch("OpenInventory");
                  }
                },
                {
                  label: "No",
                  onSelect: () => {
                    this.destroyDialogueUI();
                    this.dialogueActive = true;
                    showDialogue(this, "You decide to hold off for now.", { imageKey: "pig" });
                  }
                }
              ]
            });
            return;
          }
          if (this.pigIntroDone && !this.pigThanksDone && !this.hasAloeAfterSunCream()) {
            showDialogue(this, "The pig looks at you expectantly. Maybe you need to find something for them...", { imageKey: "pig" });
            this.time.delayedCall(1800, () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
            });
            return;
          }
        });

        // --- Dialogue advance on click ---
        this.input.on("pointerdown", () => {
          this.sound.play("click");
          // Rabbit dialogue advance
          if (this.rabbitDialogueActive) {
            this.rabbitDialogueIndex++;
            if (this.activeRabbitDialogues && this.rabbitDialogueIndex < this.activeRabbitDialogues.length) {
              showDialogue(this, this.activeRabbitDialogues[this.rabbitDialogueIndex], { imageKey: "rabbit" });
            } else {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();

              if (!this.rabbitIntroDone && this.activeRabbitDialogues === rabbitIntroDialogues) {
                this.rabbitIntroDone = true;
              }
              // After rabbit thanks dialogue
              if (this.rabbitHasLavenderOil && this.activeRabbitDialogues === rabbitThanksDialogues) {
                this.rabbitThanksDone = true;
                // Complete Carrie Cake's quest
                const carrieQuest = quests.find(q => q.title === "Help Carrie Cake");
                if (carrieQuest) {
                  carrieQuest.active = false;
                  carrieQuest.completed = true;
                  saveToLocal("quests", quests);
                  console.log("Quest 'Help Carrie Cake' completed!");
                }
                receivedItem(this, "autumnShard", "Autumn Shard");
              }
              this.rabbitDialogueActive = false;
              this.updateHUDState && this.updateHUDState();
            }
            return;
          }
          // Pig dialogue advance
          if (this.pigDialogueActive) {
            this.pigDialogueIndex++;
            if (this.activePigDialogues && this.pigDialogueIndex < this.activePigDialogues.length) {
              showDialogue(this, this.activePigDialogues[this.pigDialogueIndex], { imageKey: "pig" });
            } else {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState && this.updateHUDState();
              
              if (!this.pigIntroDone && this.activePigDialogues === pigIntroDialogues) {
                this.pigIntroDone = true;
              }
              // After pig thanks dialogue
              if (this.pigHasAloeAfterSunCream && this.activePigDialogues === pigThanksDialogues) {
                this.pigThanksDone = true;
                // Complete Chris P. Bacon's quest
                const chrisQuest = quests.find(q => q.title === "Help Chris P. Bacon");
                if (chrisQuest) {
                  chrisQuest.active = false;
                  chrisQuest.completed = true;
                  saveToLocal("quests", quests);
                  console.log("Quest 'Help Chris P. Bacon' completed!");
                }
                receivedItem(this, "winterShard", "Winter Shard");
              }
              this.pigDialogueActive = false;
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

    // Save relevant state to localStorage
    saveSceneState() {
        const state = {
            inventory: this.inventoryManager.getItems(),
            rabbitIntroDone: !!this.rabbitIntroDone,
            rabbitThanksDone: !!this.rabbitThanksDone,
            pigIntroDone: !!this.pigIntroDone,
            pigThanksDone: !!this.pigThanksDone,
            timeOfDay: globalTimeManager.getCurrentTimeOfDay()
        };
        saveToLocal('greenhouseSceneState', state);
    }

    updateHUDState() {
        if (this.dialogueActive) {
            this.scene.sleep("HUDScene");
        } else {
            this.scene.wake("HUDScene");
        }
    }

    update() {
        if (this.mainChar) {
            const charRight = this.mainChar.x + this.mainChar.displayWidth * (1 - this.mainChar.originX);
            const sceneWidth = this.sys.game.config.width;

            // Only right edge transition (with buffer)
            if (charRight >= sceneWidth - 5 && !this.transitioning) {
                this.transitioning = true;
                this.scene.start("LoaderScene", {
                    nextSceneKey: "WallGardenScene",
                    nextSceneData: {}
                });
            }
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

export default GreenhouseScene;