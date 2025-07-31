import Phaser from 'phaser';

class LoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoaderScene' });
    this.nextSceneKey = null;
    this.nextSceneData = null;
  }

  init(data) {
    this.nextSceneKey = data.nextSceneKey || 'WallGardenScene';
    this.nextSceneData = data.nextSceneData || {};
  }

  preload() {
    // Show loading text
    const { width, height } = this.sys.game.config;
    this.loadingText = this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: 'Georgia',
      fontSize: '32px',
      color: '#3e7d3a',
      backgroundColor: '#fff',
      align: 'center'
    }).setOrigin(0.5).setDepth(1000);

    // Preload all assets used in updated scenes
    // --- WallGardenScene ---
    this.load.tilemapTiledJSON("wallGardenMap", "/assets/maps/wallGardenMap.json");
    this.load.image('wall1', '/assets/backgrounds/wallGarden/wall1.png');
    this.load.image('wall2', '/assets/backgrounds/wallGarden/wall2.png');
    this.load.image('trees', '/assets/backgrounds/wallGarden/trees.png');
    this.load.image('wallGardenBackground', '/assets/backgrounds/wallGarden/wallGarden.png');
    this.load.image('butterfly', '/assets/npc/butterfly/front-butterfly.png');
    this.load.image('butterflyHappy', '/assets/npc/butterfly/happy-butterfly-dio.png');
    this.load.image('chestClosed', '/assets/misc/chest-closed.png');
    this.load.image('chestOpen', '/assets/misc/chest-open.png');
    this.load.image('bush', '/assets/misc/bush.png');
    this.load.image('elephant', '/assets/npc/elephant/elephant.png');
    this.load.image('elephantHappy', '/assets/npc/elephant/happy.png');
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.image('coin', '/assets/misc/coin.png');
    this.load.image('springShard', '/assets/items/spring.png');
    this.load.image('autumnShard', '/assets/items/autumn.png');
    this.load.image('foxglovePlant', '/assets/plants/foxglove.png');
    this.load.image('periwinklePlant', '/assets/plants/periwinkle.png');
    this.load.image('jasminePlant', '/assets/plants/jasmine.PNG');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');

    // --- GreenhouseScene ---
    this.load.image('greenhouseBackground', '/assets/backgrounds/greenhouse/greenhouse.png');

    // --- MiddleGardenScene ---
    this.load.image('finalGardenBackground', '/assets/backgrounds/finalGarden/middleBackground.png');
    this.load.image('folliage1', '/assets/backgrounds/finalGarden/folliage1.png');
    this.load.image('folliage2', '/assets/backgrounds/finalGarden/folliage2.png');
    this.load.image('garlicPlant', '/assets/plants/garlic.PNG');
    this.load.image('thymePlant', '/assets/plants/thyme.PNG');
    this.load.image('wolf', '/assets/npc/wolf/wolf.png');
    this.load.image('wolfHappy', '/assets/npc/wolf/happy.png');
    this.load.image('summerShard', '/assets/items/summer.png');
    this.load.image('winterShard', '/assets/items/winter.png');
    this.load.image('deer', '/assets/npc/deer/deer.png');
    this.load.image('deerHappy', '/assets/npc/deer/deerHappy.png');
    this.load.image('marigoldPlant', '/assets/plants/marigold.PNG');

    // --- PersonalGarden ---
    this.load.image('hoe', '/assets/tools/hoe.png');
    this.load.image('wateringCan', '/assets/tools/wateringCan.png');
    this.load.image('shovel', '/assets/tools/shovel.png');
    this.load.image('sign', '/assets/misc/sign.png');
    this.load.image('gardenBackground', '/assets/backgrounds/personal/personalBackground.png');
    this.load.image('tent', '/assets/backgrounds/personal/tent.png');
    this.load.image('fence', '/assets/backgrounds/personal/fence.png');
    this.load.image('seeds', '/assets/plants/seeds.png');
    this.load.image('preoparedPlot', '/assets/farming/prepared.PNG');
    this.load.image('foxgloveSeeds', '/assets/shopItems/seeds/foxgloveSeeds.png');
    this.load.image('marigoldSeeds', '/assets/shopItems/seeds/marigoldSeeds.png');
    this.load.image('jasmineSeeds', '/assets/shopItems/seeds/jasmineSeeds.png');
    this.load.image('aloeSeeds', '/assets/shopItems/seeds/aloeSeeds.png');
    this.load.image('lavenderSeeds', '/assets/shopItems/seeds/lavenderSeeds.png');
    this.load.image('periwinkleSeeds', '/assets/shopItems/seeds/periwinkleSeeds.png');
    this.load.image('garlicSeeds', '/assets/shopItems/seeds/garlicSeeds.png');
    this.load.image('thymeSeeds', '/assets/shopItems/seeds/thymeSeeds.png');
    this.load.image('willowSeeds', '/assets/shopItems/seeds/willowSeeds.png');
    this.load.image('aloePlant', '/assets/plants/aloe.PNG');
    this.load.image('lavenderPlant', '/assets/plants/lavender.PNG');
    this.load.image('willowPlant', '/assets/plants/willow.PNG');

    // --- ShopScene ---
    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('oilBaseImage', '/assets/shopItems/oil.png');
    this.load.audio('shopTheme', '/assets/music/shop-theme.mp3');

    // --- MinigameScene ---
    // (Assume minigame assets are loaded in their own scenes, but preload common UI/audio here)
    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
  
  }

  create() {
    // Fade out loading text
    this.tweens.add({
      targets: this.loadingText,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.scene.start(this.nextSceneKey, this.nextSceneData);
      }
    });
  }
}

export default LoaderScene;
