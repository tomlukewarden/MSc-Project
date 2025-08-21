import { createButterfly, butterflyPillarDialogues, butterflyShardDialogues, butterflyGoodbyeDialogues } from "../../characters/butterfly";
import { createMainChar } from "../../characters/mainChar";
import { saveToLocal, loadFromLocal } from "../../utils/localStorage";
import plantData from "../../plantData";
import { showDialogue, showOption } from "../../dialogue/dialogueUIHelpers";
import { shardLogic } from "../shardLogic";
import globalInventoryManager from "../inventoryManager";
import { addPlantToJournal } from "../journalManager";
import { receivedItem } from "../recievedItem";
import globalTimeManager from "../../day/timeManager";
import quests from "../../quests/quests";
import achievements from "../../quests/achievments";
import { addCompanionToScene } from "../../characters/companion";

class ShardGardenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShardGardenScene', physics: { default: 'arcade', arcade: { debug: false} } });
    this.dialogueActive = false;
    this.dialogueBox = null;
    this.dialogueStage = 0;
    this.activeDialogue = [];
    this.activeDialogueIndex = 0;
    this.shardCounts = {
      spring: 3,
      summer: 2,
      autumn: 2,
      winter: 2
    };
    this.happySprites = {
      spring: false,
      summer: false,
      autumn: false,
      winter: false
    };
    this.winDialogueActive = false;
    this.garlicFound = false;
    this.thymeFound = false;
    this.transitioning = false;
    
    // Use the global inventory manager
    this.inventoryManager = globalInventoryManager;
  }

  preload() {
    this.load.image('shardBackground', '/assets/backgrounds/shardGarden/shardBackground.png');
    this.load.image('folliage', '/assets/backgrounds/shardGarden/folliage.png');
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
    this.load.image("elephant", "/assets/npc/elephant/elephant.png");
    this.load.image('spring', '/assets/backgrounds/shardGarden/spring/sad.png');
    this.load.image('springHappy', '/assets/backgrounds/shardGarden/spring/happy.png');
    this.load.image('summer', '/assets/backgrounds/shardGarden/summer/sad.png');
    this.load.image('summerHappy', '/assets/backgrounds/shardGarden/summer/happy.png');
    this.load.image('autumnHappy', '/assets/backgrounds/shardGarden/autumn/happy.png');
    this.load.image('winterHappy', '/assets/backgrounds/shardGarden/winter/happy.png');
    this.load.image('autumn', '/assets/backgrounds/shardGarden/autumn/sad.png');
    this.load.image('winter', '/assets/backgrounds/shardGarden/winter/sad.png');
    this.load.image('butterflyHappy', '/assets/npc/dialogue/butterflyHappy.png');
    this.load.image('butterflySad', '/assets/npc/dialogue/butterflySad.PNG');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('talk', '/assets/interact/talk.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.audio("theme1", "/assets/music/main-theme-1.mp3");
    this.load.audio("option", "/assets/sound-effects/option.mp3");
    this.load.audio("shardAdd", "/assets/sound-effects/shard.mp3");
    this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');
    this.load.tilemapTiledJSON("shardGardenMap", "/assets/maps/shardGarden.json");
    this.load.image("middleGardenSign", "/assets/signs/middleGardenL.PNG");
     this.load.image("sit", "/assets/npc/pet/dog_3_sit.png");
    this.load.image("walk1", "/assets/npc/pet/dog_3_walk_sheet1.png");
    this.load.image("walk2", "/assets/npc/pet/dog_3_walk_sheet2.png");
    this.load.audio("dogBark", "/assets/sound-effects/dogbark.mp3");
  }

  create() {
    this.transitioning = false;
    
    // DEBUG: Show all loaded texture keys and highlight missing ones
    const debugY = 30;
    const loadedKeys = this.textures.getTextureKeys();
    const expectedKeys = [
      'shardBackground', 'folliage', 'butterfly', 'defaultFront', 'defaultBack', 'defaultLeft', 'defaultRight',
      'defaultFrontWalk1', 'defaultFrontWalk2', 'defaultBackWalk1', 'defaultBackWalk2', 'defaultLeftWalk1', 'defaultLeftWalk2',
      'defaultRightWalk1', 'defaultRightWalk2', 'elephant', 'spring', 'springHappy', 'summer', 'summerHappy',
      'autumnHappy', 'winterHappy', 'autumn', 'winter', 'butterflyHappy', 'butterflySad', 'periwinklePlant',
      'marigoldPlant', 'dialogueBoxBg', 'talk', 'jasminePlant', 'bush'
    ];
    let missingKeys = expectedKeys.filter(k => !loadedKeys.includes(k));
    let debugText = `Loaded textures: ${loadedKeys.join(', ')}\nMissing: ${missingKeys.join(', ')}`;
    this.add.text(20, debugY, debugText, { fontSize: '14px', color: missingKeys.length ? '#f00' : '#080', backgroundColor: '#fff', wordWrap: { width: 800 } }).setDepth(-1);
    
    globalTimeManager.init(this);
    if (!globalTimeManager.startTimestamp) {
      globalTimeManager.start();
    }

    this.scene.launch("HUDScene");
    const { width, height } = this.sys.game.config;
    const scaleFactor = 0.175;

    // --- LOAD STATE FROM LOCAL STORAGE ---
    const sceneState = loadFromLocal('shardGardenSceneState') || {};
    // Restore shard counts, happySprites, and dialogue stage
    if (sceneState.shardCounts) {
      this.shardCounts = { ...this.shardCounts, ...sceneState.shardCounts };
    }
    if (sceneState.happySprites) {
      this.happySprites = { ...this.happySprites, ...sceneState.happySprites };
    }
    if (sceneState.dialogueStage !== undefined) {
      this.dialogueStage = sceneState.dialogueStage;
    }
    if (sceneState.garlicFound !== undefined) {
      this.garlicFound = sceneState.garlicFound;
    }
    if (sceneState.thymeFound !== undefined) {
      this.thymeFound = sceneState.thymeFound;
    }
    this.dialogueActive = !!sceneState.dialogueActive;
    this.activeDialogueIndex = sceneState.activeDialogueIndex || 0;
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
    
    safeAddImage(this, width / 2, height / 2, "shardBackground").setScale(scaleFactor);
    const foliageImg = safeAddImage(this, width / 2, height / 2, "folliage").setScale(scaleFactor);

    // --- Create tilemap collision system ---
    console.log('Creating ShardGarden tilemap collision system...');
    
    // Create collision group
    const collisionGroup = this.physics.add.staticGroup();
    
    // Try to load the tilemap
    try {
      const map = this.make.tilemap({ key: "shardGardenMap" });
      console.log('ShardGarden tilemap created:', map);

      // Handle collision objects from the tilemap
      const objectLayer = map.getObjectLayer('Object Layer 1');
      console.log('Object Layer 1 found:', objectLayer);

      // Collision scale and offset for positioning
      const collisionScale = 0.175; // Match your scaleFactor
      const tilemapOffsetX = -150; // Adjust as needed
      const tilemapOffsetY = 0; // Adjust as needed

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
                  obj.name === 'shard-garden-collision'
              );
              
              console.log(`Object ${index} has collision:`, !!hasCollision);
              
              if (hasCollision || obj.name === 'shard-garden-collision') {
                  console.log(`Creating collision rectangle for object ${index}`);
                  
                  // Calculate position and size with scale factor and offset
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
          console.log('No Object Layer 1 found in tilemap, using fallback');
          this.createFallbackCollisions(collisionGroup, width, height);
      }
    } catch (error) {
      console.log('Failed to load tilemap, using fallback:', error);
      this.createFallbackCollisions(collisionGroup, width, height);
    }

    // --- Add invisible folliage collision ---
    if (foliageImg && foliageImg.width && foliageImg.height) {
      const foliageRect = this.add.rectangle(
        width / 2,
        height / 2,
        foliageImg.width * scaleFactor,
        foliageImg.height * scaleFactor,
        0x000000, // Color doesn't matter since it's invisible
        0 // Completely transparent
      );
      
      this.physics.add.existing(foliageRect, true);
      collisionGroup.add(foliageRect);
    }

    // --- Season pillars setup ---
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonScale = 0.09;
    const spacing = 800 * scaleFactor;
    const startX = width / 2 - ((seasons.length - 1) * spacing) / 2;

    // Pick 4 distinct y coordinates for the pillars
    const yCoords = [
      height * scaleFactor + 100,
      height * scaleFactor + 180,
      height * scaleFactor + 140,
      height * scaleFactor + 220
    ];

    seasons.forEach((season, i) => {
      const y = yCoords[i]; // Assign each pillar a different y coordinate

      let seasonImg;
      const isHappy = this.shardCounts[season] === 0; // Only happy when all shards given

      const spriteKey = isHappy ? season + "Happy" : season;
      if (this.textures.exists(spriteKey)) {
        seasonImg = this.add.image(startX + i * spacing, y, spriteKey)
          .setScale(seasonScale)
          .setDepth(10)
          .setInteractive({ useHandCursor: true });
      } else {
        console.warn(`Image asset missing: ${spriteKey}`);
        seasonImg = this.add.text(startX + i * spacing, y, `Missing: ${spriteKey}`, { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);
      }
      this[season + 'ShardSprite'] = seasonImg;

      if (seasonImg.setInteractive) {
        seasonImg.on("pointerover", () => seasonImg.setTint && seasonImg.setTint(0x88ccff));
        seasonImg.on("pointerout", () => seasonImg.clearTint && seasonImg.clearTint());
        seasonImg.on("pointerup", () => {
          this.handleShardReturn(season, seasonImg);
        });
      }
    });

    // --- Create main character ---
    this.mainChar = createMainChar(this, width / 2, height / 2, scaleFactor, collisionGroup);
    this.mainChar.setDepth(10).setOrigin(0.5, 0.5);
 this.companion = addCompanionToScene(this, this.mainChar);
    // Enable collision between character and collision group
    this.physics.add.collider(this.mainChar, collisionGroup);

    // --- Create butterfly ---
    const butterfly = createButterfly(this, width / 2, height / 2);
    butterfly.setScale(0.09).setOrigin(-2, 0.3).setDepth(20).setInteractive();

    const talkIcon = this.add
      .image(0, 0, "talk")
      .setScale(0.05)
      .setVisible(false)
      .setDepth(110)
      .setOrigin(0.5);

    // --- Butterfly interaction ---
    this.setupButterflyInteraction(butterfly, talkIcon);

    // --- Middle Garden Sign (Left side) ---
    const middleGardenSignX = 120;
    const middleGardenSignY = height / 2 +  100;
    const middleGardenSign = this.textures.exists('middleGardenSign')
      ? this.add.image(middleGardenSignX, middleGardenSignY, 'middleGardenSign')
        .setScale(0.15)
        .setDepth(50)
        .setInteractive({ useHandCursor: true })
      : this.add.text(middleGardenSignX, middleGardenSignY, 'Missing: middleGardenSign', { 
          fontSize: '16px', 
          color: '#f00', 
          backgroundColor: '#fff' 
        }).setOrigin(0.5).setDepth(999);

    if (this.textures.exists('middleGardenSign')) {
      middleGardenSign.on('pointerover', () => {
        middleGardenSign.setTint(0xcccccc);
      });
      
      middleGardenSign.on('pointerout', () => {
        middleGardenSign.clearTint();
      });
      
      middleGardenSign.on('pointerdown', () => {
        if (!this.transitioning) {
          this.transitioning = true;
          this.scene.start("LoaderScene", {
            nextSceneKey: "MiddleGardenScene",
            nextSceneData: {}
          });
        }
      });
    }

    // --- Setup bushes ---
    this.setupBushes(width, height);

    // --- Input handling ---
    this.setupInputHandling();

    // --- Save system ---
    this.setupSaveSystem();
  }

  createFallbackCollisions(collisionGroup, width, height) {
    console.log('Using fallback collision system');
    const fallbackCollisions = [
      { x: 0, y: height / 2, width: 20, height: height }, // Left wall
      { x: width, y: height / 2, width: 20, height: height }, // Right wall
      { x: width / 2, y: 0, width: width, height: 20 }, // Top wall
      { x: width / 2, y: height, width: width, height: 20 } // Bottom wall
    ];
    
    fallbackCollisions.forEach((collision, index) => {
        // Create visible fallback collision rectangle with green outline
        const collisionRect = this.add.rectangle(
            collision.x,
            collision.y,
            collision.width,
            collision.height,
            0x000000,
            0.3 // Semi-transparent fill
        );
        
        // Add green outline for fallback collisions
        collisionRect.setStrokeStyle(3, 0x00ff00); // Green outline, 3px thick
        collisionRect.setDepth(10000);
        
        this.physics.add.existing(collisionRect, true);
        collisionGroup.add(collisionRect);
        
        // Add debug text for fallback collisions
        this.add.text(
          collision.x - collision.width/2,
          collision.y - collision.height/2 - 25,
          `Fallback Collision ${index}\n${collision.width}x${collision.height}`,
          { 
            fontSize: '10px', 
            color: '#ffffff', 
            backgroundColor: '#00ff00',
            padding: { left: 3, right: 3, top: 2, bottom: 2 }
          }
        ).setDepth(10001);
        
        console.log(`Created visible fallback collision ${index}`);
    });
  }

  handleShardReturn(season, seasonImg) {
    const shardKey = season + "Shard";
    const hasShard = this.inventoryManager.hasItemByKey(shardKey);
    
    if (hasShard) {
      if (this.shardCounts[season] > 0) {
        this.shardCounts[season]--;
        this.inventoryManager.removeItemByKey(shardKey);

        // Play shard add sound when a shard is returned
        if (this.sound && typeof this.sound.play === "function") {
          this.sound.play("shardAdd", { volume: 0.7 });
        }

        showDialogue(this, `You returned a ${season} shard! (${this.shardCounts[season]} left)`);
        
        if (typeof shardLogic === 'function') {
          shardLogic(this);
        }

        // --- QUEST LOGIC ---
        this.handleQuestLogic();

        // Update pillar sprite to happy if all shards given
        if (this.shardCounts[season] === 0 && this.textures.exists(season + "Happy")) {
          seasonImg.setTexture(season + "Happy");
        }
      } else {
        showDialogue(this, `No ${season} shards left to return!`);
      }
    } else {
      showDialogue(this, `You don't have a ${season} shard in your inventory.`, { imageKey: shardKey });
    }
    this.updateHUDState();
  }


  // Add this new method to check for Master Gardener achievement
  checkMasterGardenerAchievement() {
    // Get all unique plant keys from plantData
    const allPlantKeys = plantData.map(plant => plant.key);
    
    // Check if player has collected all plants
    const hasAllPlants = allPlantKeys.every(plantKey => 
      this.inventoryManager.hasItemByKey(plantKey)
    );

    if (hasAllPlants) {
      const masterGardenerAchievement = achievements.find(a => a.title === "Master Gardener");
      if (masterGardenerAchievement && !masterGardenerAchievement.completed) {
        masterGardenerAchievement.completed = true;
        saveToLocal("achievements", achievements);
        console.log("Achievement 'Master Gardener' completed!");
      }
    }
  }

  setupButterflyInteraction(butterfly, talkIcon) {
    butterfly.on("pointerover", (pointer) => {
      talkIcon.setVisible(true);
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    butterfly.on("pointermove", (pointer) => {
      talkIcon.setPosition(pointer.worldX + 32, pointer.worldY);
    });
    butterfly.on("pointerout", () => {
      talkIcon.setVisible(false);
    });

    this.setActiveDialogue();

    butterfly.on("pointerdown", () => {
      // Check if player is close enough
      if (!this.isPlayerNearNPC(butterfly, 120)) {
        this.dialogueActive = true;
        this.updateHUDState();
        showDialogue(this, "You need to get closer to talk to Mona.", {imageKey: "butterflySad"});
        this.time.delayedCall(1500, () => {
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();
        });
        return;
      }

      // Check if dialogue has progressed past stage 2 (finished all main dialogue)
      if (this.dialogueStage >= 3) {
        console.log('Showing busy message because dialogue stage >= 3');
        this.dialogueActive = true;
        this.updateHUDState();
        
        // DON'T set activeDialogue - this lets the input handler know it's a simple message
        this.activeDialogue = null; 
        this.activeDialogueIndex = 0;
        
        showDialogue(this, "Mona is too busy looking at the butterflies.", { imageKey: "butterflyHappy" });
        return;
      }

      if (this.dialogueActive) return;
      this.dialogueActive = true;
      this.activeDialogueIndex = 0;
      showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey: "butterflySad" });
      this.updateHUDState();

      // Complete "Community Builder" achievement when interacting with butterfly
      const communityBuilderAchievement = achievements.find(a => a.title === "Community Builder");
      if (communityBuilderAchievement && !communityBuilderAchievement.completed) {
        this.checkCommunityBuilderAchievement();
      }
    });
  }

  // Add this new method to check for Community Builder achievement
  checkCommunityBuilderAchievement() {
    // This would ideally check if all NPCs have been interacted with
    // For now, we'll complete it when butterfly is interacted with and other conditions are met
    // You might want to implement a global NPC interaction tracker
    
    const communityBuilderAchievement = achievements.find(a => a.title === "Community Builder");
    if (communityBuilderAchievement && !communityBuilderAchievement.completed) {
      // Simple check - if they've made it this far, they've likely interacted with most NPCs
      communityBuilderAchievement.completed = true;
      saveToLocal("achievements", achievements);
      console.log("Achievement 'Community Builder' completed!");
    }
  }

  // Add this method to check for crafting achievement if you have crafting in this scene
  checkMasterCrafterAchievement() {
    // This would check if all items have been crafted
    // You'd need to implement this based on your crafting system
    
    const masterCrafterAchievement = achievements.find(a => a.title === "Master of Your Craft");
    if (masterCrafterAchievement && !masterCrafterAchievement.completed) {
      // Check if all recipes have been crafted (implementation depends on your crafting system)
      // masterCrafterAchievement.completed = true;
      // saveToLocal("achievements", achievements);
      // console.log("Achievement 'Master of Your Craft' completed!");
    }
  }

  // Add this method to check for Buddy Helper achievement
  checkBuddyHelperAchievement() {
    // Check if all buddy-related quests are completed
    const buddyQuests = quests.filter(q => 
      q.title.includes("Help") || 
      q.title.includes("Paula") || 
      q.title.includes("buddy")
    );
    
    const allBuddyQuestsCompleted = buddyQuests.every(q => q.completed);
    
    if (allBuddyQuestsCompleted) {
      const buddyHelperAchievement = achievements.find(a => a.title === "Buddy Helper");
      if (buddyHelperAchievement && !buddyHelperAchievement.completed) {
        buddyHelperAchievement.completed = true;
        saveToLocal("achievements", achievements);
        console.log("Achievement 'Buddy Helper' completed!");
      }
    }
  }

  // Update the handleQuestLogic method to also check buddy helper achievement
  handleQuestLogic() {
    // Activate and complete "Return the first Shard" quest if this is the first shard returned
    const shardQuest = quests.find(q => q.title === "Return the first Shard");
    if (shardQuest && shardQuest.active) {
      shardQuest.active = false;
      shardQuest.completed = true;
      saveToLocal("quests", quests);
      console.log("Quest 'Return the first Shard' completed!");
      
      // Check buddy helper achievement after completing quests
      this.checkBuddyHelperAchievement();
    }

    // If all shards for all seasons are returned, activate and complete "Return all Shards" quest
    const allReturned = Object.values(this.shardCounts).every(count => count === 0);
    const allShardsQuest = quests.find(q => q.title === "Return all Shards");
    if (allReturned && allShardsQuest && !allShardsQuest.completed) {
      allShardsQuest.active = false;
      allShardsQuest.completed = true;
      saveToLocal("quests", quests);
      console.log("Quest 'Return all Shards' completed!");

      // Complete "Seasoned Adventurer" achievement when all shards are returned
      const seasonedAdventurerAchievement = achievements.find(a => a.title === "Seasoned Adventurer");
      if (seasonedAdventurerAchievement && !seasonedAdventurerAchievement.completed) {
        seasonedAdventurerAchievement.completed = true;
        saveToLocal("achievements", achievements);
        console.log("Achievement 'Seasoned Adventurer' completed!");
      }
      
      // Check buddy helper achievement
      this.checkBuddyHelperAchievement();
    }
  }

  update() {
    const rightEdge = this.sys.game.config.width - 50;
    const leftEdge = 50;

    if (this.mainChar && this.mainChar.x <= leftEdge && !this.transitioning) {
      this.transitioning = true;
      this.scene.start("MiddleGardenScene");
    }
  }

  setActiveDialogue() {
    if (this.dialogueStage === 0) {
      this.activeDialogue = butterflyPillarDialogues;
    } else if (this.dialogueStage === 1) {
      this.activeDialogue = butterflyShardDialogues;
    } else {
      this.activeDialogue = butterflyGoodbyeDialogues;
    }
    this.activeDialogueIndex = 0;
  }

  updateHUDState() {
    this.scene[this.dialogueActive ? 'sleep' : 'wake']("HUDScene");
  }

  destroyDialogueUI() {
    if (this.dialogueBox) {
      this.dialogueBox.box?.destroy();
      this.dialogueBox.textObj?.destroy();
      this.dialogueBox.image?.destroy();
      this.dialogueBox.optionButtons?.forEach((btn) => btn.destroy());
      this.dialogueBox = null;
    }
  }

  setupBushes(width, height) {
    const bushPositions = [
      { x: 180, y: 600 }, // Garlic
      { x: 1200, y: 600 }, // Thyme
    ];
    const bushCount = bushPositions.length;
    const garlicIndex = 0;
    const thymeIndex = 1;
    
    // Track dispensed state for each bush
    this.bushDispensed = this.bushDispensed || Array(bushCount).fill(false);

    for (let i = 0; i < bushCount; i++) {
      const { x, y } = bushPositions[i];
      // Asset existence check for bush
      const bush = this.textures.exists('bush')
        ? this.add.image(x, y, 'bush').setScale(0.05).setDepth(1).setInteractive({ useHandCursor: true })
        : this.add.text(x, y, 'Missing: bush', { fontSize: '16px', color: '#f00', backgroundColor: '#fff' }).setOrigin(0.5).setDepth(999);

      bush.on("pointerdown", () => {
        if (this.sound && this.sound.play) {
          this.sound.play("click");
        }
        if (this.dialogueActive) return; // Fixed: added opening parenthesis
        this.dialogueActive = true;
        this.updateHUDState();

        // If already dispensed, show empty dialogue
        if (this.bushDispensed[i]) {
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
          const garlic = plantData.find(p => p.key === "garlicPlant");
          if (garlic) {
            this.showPlantMinigame(garlic, "garlicFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
        else if (i === thymeIndex && !this.thymeFound) {
          const thyme = plantData.find(p => p.key === "thymePlant");
          if (thyme) {
            this.showPlantMinigame(thyme, "thymeFound");
            this.bushDispensed[i] = true;
          } else {
            this.showPlantMissing();
            this.bushDispensed[i] = true;
          }
        }
      });
    }
  }

  showPlantMinigame(plant, foundFlag) {
    showOption(
      this,
      `You found a ${plant.name} plant! \n But a cheeky animal is trying to steal it!`,
      {
        imageKey: plant.imageKey,
        options: [
          {
            text: "Play a game to win it!",
            callback: () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
              this.scene.launch("MiniGameScene", {
                onWin: () => {
                  this.scene.stop("MiniGameScene");
                  this.scene.resume();

                  const alreadyHas = this.inventoryManager.hasItemByKey(plant.key);
                  if (!alreadyHas) {
                    addPlantToJournal(plant.key);
                    receivedItem(this, plant.key, plant.name);

                    // Complete "Green Thumb" achievement when first plant is collected
                    const greenThumbAchievement = achievements.find(a => a.title === "Green Thumb");
                    if (greenThumbAchievement && !greenThumbAchievement.completed) {
                      greenThumbAchievement.completed = true;
                      saveToLocal("achievements", achievements);
                      console.log("Achievement 'Green Thumb' completed!");
                    }

                    // Check if all plants have been collected for "Master Gardener" achievement
                    this.checkMasterGardenerAchievement();
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
            text: "Try again later",
            callback: () => {
              this.destroyDialogueUI();
              this.dialogueActive = false;
              this.updateHUDState();
              this.dialogueOnComplete = null;
            }
          }
        ]
      }
    );
  }

  showPlantMissing() {
    showDialogue(this, "You found a rare plant, but its data is missing!", {});
    this.dialogueOnComplete = () => {
      this.destroyDialogueUI();
      this.dialogueActive = false;
      this.updateHUDState();
      this.dialogueOnComplete = null;
    };
  }

  
  setupInputHandling() {
    // Basic input handling for the shard garden scene
    console.log("Setting up input handling for ShardGardenScene...");
    
    // Cursor keys for character movement (if needed)
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // WASD keys
    this.wasd = this.input.keyboard.addKeys('W,S,A,D');
    
    // Other useful keys
    this.keys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      inventory: Phaser.Input.Keyboard.KeyCodes.I,
      journal: Phaser.Input.Keyboard.KeyCodes.J
    });

    // Handle dialogue advancement with mouse clicks
    this.input.on("pointerdown", () => {
      if (this.sound && this.sound.play) {
        this.sound.play("click", { volume: 0.5 });
      }
      
      // Handle ANY active dialogue - including the stage 3+ message
      if (this.dialogueActive) {
        console.log('Dialogue active - checking for destruction');
        
        // If there's a completion callback, execute it
        if (this.dialogueOnComplete) {
          this.dialogueOnComplete();
          return;
        }
        
        // Handle normal dialogue or simple messages
        if (!this.activeDialogue) {
          // This handles the stage 3+ message that doesn't have activeDialogue
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();
          return;
        }
        
        // Skip if there are option buttons visible
        if (this.dialogueBox && this.dialogueBox.optionButtons && this.dialogueBox.optionButtons.length > 0) {
          return;
        }

        this.activeDialogueIndex++;

        if (this.activeDialogueIndex < this.activeDialogue.length) {
          // Continue with next dialogue line
          const imageKey = this.dialogueStage === 0 ? "butterflySad" : 
                          this.dialogueStage === 1 ? "butterflyHappy" : "butterflyHappy";
          showDialogue(this, this.activeDialogue[this.activeDialogueIndex], { imageKey });
        } else {
          // End of dialogue
          this.destroyDialogueUI();
          this.dialogueActive = false;
          this.updateHUDState();
          this.dialogueStage++;

          // Execute any completion callback
          if (this.dialogueOnComplete) {
            this.dialogueOnComplete();
          }
        }
      }
    });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ESC', () => {
      // Handle escape key - could pause or show menu
      console.log("Escape pressed in ShardGardenScene");
    });

    this.input.keyboard.on('keydown-I', () => {
      // Open inventory
      if (!this.dialogueActive) {
        this.scene.launch('OpenInventory');
      }
    });

    this.input.keyboard.on('keydown-J', () => {
      // Open journal
      if (!this.dialogueActive) {
        this.scene.launch('OpenJournal');
      }
    });

    console.log("Input handling setup complete for ShardGardenScene");
  }

  // Also add the missing setupSaveSystem method that's called on line 206
  setupSaveSystem() {
    console.log("Setting up save system for ShardGardenScene...");
    
    // Auto-save every 30 seconds
    this.saveTimer = this.time.addEvent({
      delay: 30000, // 30 seconds
      callback: () => {
        this.saveSceneState();
      },
      loop: true
    });

    // Save when scene shuts down
    this.events.on('shutdown', () => {
      this.saveSceneState();
    });

    console.log("Save system setup complete for ShardGardenScene");
  }

  // Add the saveSceneState method if it's missing
  saveSceneState() {
    const state = {
      shardCounts: this.shardCounts,
      happySprites: this.happySprites,
      dialogueStage: this.dialogueStage,
      dialogueActive: this.dialogueActive,
      activeDialogueIndex: this.activeDialogueIndex,
      garlicFound: this.garlicFound,
      thymeFound: this.thymeFound,
      bushDispensed: this.bushDispensed,
      // Fix the timeOfDay access with proper error checking
      timeOfDay: this.getTimeOfDaySafely(),
      inventory: this.inventoryManager.getItems ? this.inventoryManager.getItems() : []
    };
    
    saveToLocal('shardGardenSceneState', state);
    console.log('ShardGarden state saved:', state);
  }

  // Add this helper method to safely get time of day
  getTimeOfDaySafely() {
    try {
      // Check if globalTimeManager exists and has the expected structure
      if (globalTimeManager && 
          globalTimeManager.dayCycle && 
          typeof globalTimeManager.dayCycle.getTimeOfDay === 'function') {
        return globalTimeManager.dayCycle.getTimeOfDay();
      }
      
      // Alternative: check if globalTimeManager has a direct getTimeOfDay method
      if (globalTimeManager && 
          typeof globalTimeManager.getTimeOfDay === 'function') {
        return globalTimeManager.getTimeOfDay();
      }
      
      // Alternative: check if globalTimeManager has a timeOfDay property
      if (globalTimeManager && globalTimeManager.timeOfDay !== undefined) {
        return globalTimeManager.timeOfDay;
      }
      
      console.warn('globalTimeManager.dayCycle.getTimeOfDay not available, using default');
      return 'morning'; // Default fallback
      
    } catch (error) {
      console.error('Error getting time of day:', error);
      return 'morning'; // Default fallback
    }
  }

  // Add this helper method to check distance
  isPlayerNearNPC(npc, range = 100) {
    if (!this.mainChar || !npc) return false;
    
    const distance = Phaser.Math.Distance.Between(
      this.mainChar.x, this.mainChar.y,
      npc.x, npc.y
    );
    
    return distance <= range;
  }
}

export default ShardGardenScene;