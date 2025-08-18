import Phaser from 'phaser';

class LoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoaderScene' });
    this.nextSceneKey = null;
    this.nextSceneData = null;
    this.progressBar = null;
    this.progressFill = null;
  }

  init(data) {
    this.nextSceneKey = data.nextSceneKey || 'WallGardenScene';
    this.nextSceneData = data.nextSceneData || {};
  }

  preload() {
    const { width, height } = this.sys.game.config;

    // Soft pastel background
    this.cameras.main.setBackgroundColor('#f3f0e9');

    // Add floating decorative elements (e.g. leaves)
    this.leaves = this.add.group();
    for (let i = 0; i < 8; i++) {
      const leaf = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        10,
        6,
        0x8bb174
      );
      leaf.alpha = 0.7;
      this.leaves.add(leaf);
    }

    // Title text
    this.titleText = this.add.text(width / 2, height / 2 - 100, 'Preparing the Garden...', {
      fontFamily: 'Georgia',
      fontSize: '36px',
      color: '#3e7d3a'
    }).setOrigin(0.5);

    // Progress bar background
    this.progressBar = this.add.rectangle(width / 2, height / 2, 300, 20, 0xe0d8c3);
    this.progressFill = this.add.rectangle(width / 2 - 150, height / 2, 0, 20, 0x8bb174).setOrigin(0, 0.5);

    // Progress text
    this.progressText = this.add.text(width / 2, height / 2 + 40, '0%', {
      fontFamily: 'Georgia',
      fontSize: '20px',
      color: '#5a6c57'
    }).setOrigin(0.5);

    // Animate leaves drifting down
    this.tweens.add({
      targets: this.leaves.getChildren(),
      y: `+=${height + 20}`,
      repeat: -1,
      duration: Phaser.Math.Between(4000, 8000),
      delay: (_, i) => i * 200,
      onRepeat: (tween, target) => {
        target.x = Phaser.Math.Between(0, width);
        target.y = -20;
      }
    });

    // Progress tracking
    this.load.on('progress', (value) => {
      this.progressFill.width = 300 * value;
      this.progressText.setText(Math.floor(value * 100) + '%');
    });

    // --- Preload assets (same as before) ---
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

    this.load.image('greenhouseBackground', '/assets/backgrounds/greenhouse/greenhouse.png');

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

    this.load.image('shopBackground', '/assets/backgrounds/shop/shop.jpg');
    this.load.image('oilBaseImage', '/assets/shopItems/oil.png');
    this.load.audio('shopTheme', '/assets/music/shop-theme.mp3');

    this.load.image('dialogueBoxBg', '/assets/ui-items/dialogue.png');
    this.load.audio('click', '/assets/sound-effects/click.mp3');
    this.load.audio('sparkle', '/assets/sound-effects/sparkle.mp3');
  }

  create() {
    // Fade out everything before switching
    this.tweens.add({
      targets: [this.titleText, this.progressBar, this.progressFill, this.progressText, ...this.leaves.getChildren()],
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.scene.start(this.nextSceneKey, this.nextSceneData);
      }
    });
  }
}

export default LoaderScene;
