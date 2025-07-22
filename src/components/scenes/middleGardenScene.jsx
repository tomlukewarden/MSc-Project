import { createMainChar } from "../../characters/mainChar";
import plantData from "../../plantData";
import { inventoryManager } from "../inventoryManager";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import { CoinManager } from "../coinManager";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import { createWolf, wolfIntroDialogues, wolfThanksDialogues } from "../../characters/wolf";
import {createDeer, deerIntroDialogues, deerThanksDialogues} from "../../characters/deer";
import globalTimeManager from "../../day/timeManager";



const coinManager = CoinManager.load();

class MiddleGardenScene extends Phaser.Scene {
  constructor() {
    
    super({ key: 'MiddleGardenScene', physics: { default: 'arcade', arcade: { debug: false } } });
    this.garlicFound = false;
    this.thymeFound = false;
    this.dialogueActive = false;
    this.dialogueOnComplete = null;
    this.transitioning = false;
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
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('wolf', '/assets/npc/wolf/wolf.png')
    this.load.image('wolfHappy', '/assets/npc/wolf/happy.png')
    this.load.image('talk', '/assets/ui-items/talk.png');
    this.load.image('summerShard', '/assets/items/summer.png');
    this.load.image('winterShard', '/assets/items/winter.png');
    this.load.image('deer', '/assets/npc/deer/deer.png')
    this.load.image('deerHappy', '/assets/npc/deer/happy.png')
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
  }

  create() {
      globalTimeManager.init(this);
  if (!globalTimeManager.startTimestamp) {
    globalTimeManager.start();
  }
    if (typeof window !== "undefined") {
    window.inventoryManager = inventoryManager;
}
    this.scene.launch("HUDScene");
    this.scene.stop("StartScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // Background
    this.add.image(width / 2, height / 2, 'finalGardenBackground').setScale(scaleFactor).setDepth(0);
    // Folliage
    this.add.image(width / 2, height / 2, 'folliage1').setScale(scaleFactor).setDepth(1);
    const folliage2Img = this.add.image(width / 2, height / 2, 'folliage2').setScale(scaleFactor).setDepth(2);

    // --- Collision for folliage2 ---
    const collisionGroup = this.physics.add.staticGroup();
    const folliage2Rect = this.add.rectangle(
      width / 2,
      height / 2,
      folliage2Img.width * scaleFactor,
      folliage2Img.height * scaleFactor,
      0x00ff00, 
      0 
    ).setDepth(2); 
    this.physics.add.existing(folliage2Rect, true);
    collisionGroup.add(folliage2Rect);

    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(1).setOrigin(0.5, 0.5);


    // --- Wolf NPC ---
    this.wolf = createWolf(this, width / 2 + 200, height / 2 + 100);
    this.wolf
      .setInteractive({ useHandCursor: true })
      .setDepth(10)
      .setScale(0.15)
      .setOrigin(0.5, 0.9);

    // --- Deer NPC ---
    this.deer = createDeer(this, width / 2 - 200, height / 2 + 100);
    this.deer
      .setInteractive({ useHandCursor: true })
      .setDepth(1)
      .setScale(0.15)
      .setOrigin(0.5, 0.2);

    // --- Talk icon ---
    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(11)
      .setOrigin(0.5);

    // Wolf talk icon events
    this.wolf.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.wolf.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    this.wolf.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

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

    // --- Wolf dialogue and gifting logic ---
    this.wolfDialogueActive = false;
    this.wolfDialogueIndex = 0;
    this.hasPeriwinkle = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("periwinklePlant");

    // --- Deer dialogue and gifting logic ---
    this.deerDialogueActive = false;
    this.deerDialogueIndex = 0;
    this.hasMarigold = () => inventoryManager.hasItemByKey && inventoryManager.hasItemByKey("marigoldPlant");

    // Wolf click handler
    this.wolf.on("pointerdown", () => {
      if (!this.wolfIntroDone && !this.wolfDialogueActive) {
        this.wolfDialogueActive = true;
        this.wolfDialogueIndex = 0;
        this.activeWolfDialogues = wolfIntroDialogues;
        showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && this.hasPeriwinkle()) {
        showOption(this, "Give the wolf the Periwinkle?", {
          imageKey: "wolf",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.destroyDialogueUI();
                this.updateHUDState && this.updateHUDState();
                inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("periwinklePlant");
                this.wolfHasPeriwinkle = true;
                this.wolf.setTexture("wolfHappy");
                showDialogue(this, "You hand the wolf the Periwinkle...", { imageKey: "wolf" });
                this.time.delayedCall(800, () => {
                  this.destroyDialogueUI();
                  this.updateHUDState && this.updateHUDState();
                  this.wolfDialogueActive = true;
                  this.wolfDialogueIndex = 0;
                  this.activeWolfDialogues = wolfThanksDialogues;
                  showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
                  this.updateHUDState && this.updateHUDState();
                });
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.updateHUDState && this.updateHUDState();
                showDialogue(this, "You decide to hold off for now.", { imageKey: "wolf" });
              }
            }
          ]
        });
        return;
      }
      if (this.wolfIntroDone && !this.wolfThanksDone && !this.hasPeriwinkle()) {
        showDialogue(this, "Fang Dreschure looks at you expectantly. Maybe you need to find something for that toothache?", { imageKey: "wolf" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });
    this.deer.on("pointerdown", () => {
      if (!this.deerIntroDone && !this.deerDialogueActive) {
        this.deerDialogueActive = true;
        this.deerDialogueIndex = 0;
        this.activeDeerDialogues = deerIntroDialogues;
        showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
        this.updateHUDState && this.updateHUDState();
        return;
      }
      if (this.deerIntroDone && !this.deerThanksDone && this.hasMarigold()) {
        showOption(this, "Give the deer the Marigold?", {
          imageKey: "deer",
          options: [
            {
              label: "Yes",
              onSelect: () => {
                this.destroyDialogueUI();
                this.updateHUDState && this.updateHUDState();
                inventoryManager.removeItemByKey && inventoryManager.removeItemByKey("marigoldPlant");
                this.deerHasMarigold = true;
                showDialogue(this, "You hand the deer the Marigold...", { imageKey: "deer" });
                this.deer.setTexture("deerHappy");
                this.time.delayedCall(800, () => {
                  this.destroyDialogueUI();
                  this.updateHUDState && this.updateHUDState();
                  this.deerDialogueActive = true;
                  this.deerDialogueIndex = 0;
                  this.activeDeerDialogues = deerThanksDialogues;
                  showDialogue(this, this.activeDeerDialogues[this.deerDialogueIndex], { imageKey: "deer" });
                  this.updateHUDState && this.updateHUDState();
                });
              }
            },
            {
              label: "No",
              onSelect: () => {
                this.destroyDialogueUI();
                this.updateHUDState && this.updateHUDState();
                showDialogue(this, "You decide to hold off for now.", { imageKey: "deer" });
              }
            }
          ]
        });
        return;
      }
      if (this.deerIntroDone && !this.deerThanksDone && !this.hasMarigold()) {
        showDialogue(this, "The deer looks at you expectantly. Maybe you need to find something for them...", { imageKey: "deer" });
        this.time.delayedCall(1800, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        });
        return;
      }
    });

    // --- Bushes/Flowerbeds logic ---
    this.setupBushes(width, height);

    // --- Dialogue advance on click ---
    this.input.on("pointerdown", () => {
      this.sound.play("click");
      // Wolf dialogue advance
      if (this.wolfDialogueActive) {
        this.wolfDialogueIndex++;
        if (this.activeWolfDialogues && this.wolfDialogueIndex < this.activeWolfDialogues.length) {
          showDialogue(this, this.activeWolfDialogues[this.wolfDialogueIndex], { imageKey: "wolf" });
        } else {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState && this.updateHUDState();

          if (!this.wolfIntroDone && this.activeWolfDialogues === wolfIntroDialogues) {
            this.wolfIntroDone = true;
          }
          if (this.wolfHasPeriwinkle && this.activeWolfDialogues === wolfThanksDialogues) {
            this.wolfThanksDone = true;
            // Automatically give summer shard after thanks dialogue
            receivedItem(this, "summerShard", "Summer Shard");
          }
          this.wolfDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Deer dialogue advance
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
          if (this.deerHasMarigold && this.activeDeerDialogues === deerThanksDialogues) {
            this.deerThanksDone = true;
            // Automatically give winter shard after thanks dialogue
            receivedItem(this, "winterShard", "Winter Shard");
          }
          this.deerDialogueActive = false;
          this.updateHUDState && this.updateHUDState();
        }
        return;
      }
      // Plant/coin dialogue advance
      if (this.dialogueActive && typeof this.dialogueOnComplete === "function") {
        this.dialogueOnComplete();
      }
      // Always update HUD after any dialogue completes
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
    });
    this.events.on('destroy', () => {
      this.saveSceneState();
      clearInterval(this._saveInterval);
    });

    // --- LOAD SCENE STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('middleGardenSceneState');
if (sceneState) {
  // Restore flags, inventory, coins, etc.
  this.wolfThanksDone = !!sceneState.wolfThanksDone;
  this.deerHasMarigold = !!sceneState.deerHasMarigold;
  // Restore NPC textures
  if (sceneState.wolfTexture && this.wolf) this.wolf.setTexture(sceneState.wolfTexture);
  if (sceneState.deerTexture && this.deer) this.deer.setTexture(sceneState.deerTexture);
  // Restore time of day
  if (sceneState.timeOfDay) globalTimeManager.dayCycle.setTimeOfDay(sceneState.timeOfDay);
}
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 300 }, 
      { x: 260, y: 400 }, 
      { x: 340, y: 250 }, 
      { x: 420, y: 350 }  
    ];
    const bushCount = bushPositions.length;
    const jasmineIndex = 0;
    const marigoldIndex = 1;

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      const bush = this.add.image(x, y, 'bush')
        .setScale(1.8)
        .setDepth(1)
        .setInteractive({ useHandCursor: true });

      bush.on("pointerdown", () => {
        this.sound.play("click");
        if (this.dialogueActive) return;
        this.dialogueActive = true;
        this.updateHUDState && this.updateHUDState();

        // Marigold bush
        if (i === marigoldIndex && !this.marigoldFound) {
          const marigold = plantData.find(p => p.key === "marigoldPlant");
          if (marigold) {
            this.showPlantMinigame(marigold, "marigoldFound");
          } else {
            this.showPlantMissing();
          }
        }
        // Thyme bush
        else if (i === jasmineIndex && !this.jasmineFound) {
          const jasmine = plantData.find(p => p.key === "jasminePlant");
          if (jasmine) {
            this.showPlantMinigame(jasmine, "jasmineFound");
          } else {
            this.showPlantMissing();
          }
        }
        // All other bushes give coins
        else {
          const coins = Phaser.Math.Between(10, 30);
          coinManager.add(coins);
          saveToLocal("coins", coinManager.coins);
          receivedItem(this, "coin", `${coins} Coins`, { scale: 0.15 });
          showDialogue(this, `You found ${coins} coins hidden in the bush!`);
          this.dialogueOnComplete = () => {
            this.destroyDialogueUI && this.destroyDialogueUI();
            this.dialogueActive = false;
            this.updateHUDState && this.updateHUDState();
            this.dialogueOnComplete = null;
          };
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

  receivedItem(this, plant.key, plant.name);
  inventoryManager.addItem(plant);
  addPlantToJournal(plant.key);

  showDialogue(this,
    `You won the game! The animal reluctantly gives you the ${plant.name} plant.`,
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

      console.log("mainChar.x:", this.mainChar.x);

      // Right edge
      if (this.mainChar.x >= rightEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("ShardGardenScene");
        }
      }
      // Left edge
      if (this.mainChar.x <= leftEdge) {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("WallGardenScene");
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
    coins: coinManager.get ? coinManager.get() : 0,
    inventory: inventoryManager.getItems ? inventoryManager.getItems() : [],
    garlicFound: !!this.garlicFound,
    thymeFound: !!this.thymeFound,
    wolfIntroDone: !!this.wolfIntroDone,
    wolfThanksDone: !!this.wolfThanksDone,
    wolfHasPeriwinkle: !!this.wolfHasPeriwinkle,
    deerIntroDone: !!this.deerIntroDone,
    deerThanksDone: !!this.deerThanksDone,
    deerHasMarigold: !!this.deerHasMarigold,
    wolfTexture: this.wolf ? this.wolf.texture.key : null,
    deerTexture: this.deer ? this.deer.texture.key : null,
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