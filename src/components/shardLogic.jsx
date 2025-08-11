export function shardLogic(scene) {
  const shardCounts = scene.shardCounts;
  // Clamp counts to 0
  if (shardCounts.spring < 0) shardCounts.spring = 0;
  if (shardCounts.summer < 0) shardCounts.summer = 0;
  if (shardCounts.autumn < 0) shardCounts.autumn = 0;
  if (shardCounts.winter < 0) shardCounts.winter = 0;

  // Update shard sprite textures if a count reaches 0
  if (shardCounts.spring === 0 && scene.springShardSprite && scene.springShardSprite.texture.key !== 'springHappy') {
    scene.springShardSprite.setTexture('springHappy');
  }
  if (shardCounts.summer === 0 && scene.summerShardSprite && scene.summerShardSprite.texture.key !== 'summerHappy') {
    scene.summerShardSprite.setTexture('summerHappy');
  }
  if (shardCounts.autumn === 0 && scene.autumnShardSprite && scene.autumnShardSprite.texture.key !== 'autumnHappy') {
    scene.autumnShardSprite.setTexture('autumnHappy');
  }
  if (shardCounts.winter === 0 && scene.winterShardSprite && scene.winterShardSprite.texture.key !== 'winterHappy') {
    scene.winterShardSprite.setTexture('winterHappy');
  }

  // If all shards are complete, set all sprites to happy (in case any were missed)
  if (
    shardCounts.spring === 0 &&
    shardCounts.summer === 0 &&
    shardCounts.autumn === 0 &&
    shardCounts.winter === 0
  ) {
    if (scene.springShardSprite && scene.springShardSprite.texture.key !== 'springHappy') {
      scene.springShardSprite.setTexture('springHappy');
    }
    if (scene.summerShardSprite && scene.summerShardSprite.texture.key !== 'summerHappy') {
      scene.summerShardSprite.setTexture('summerHappy');
    }
    if (scene.autumnShardSprite && scene.autumnShardSprite.texture.key !== 'autumnHappy') {
      scene.autumnShardSprite.setTexture('autumnHappy');
    }
    if (scene.winterShardSprite && scene.winterShardSprite.texture.key !== 'winterHappy') {
      scene.winterShardSprite.setTexture('winterHappy');
    }
    // Use scene for sound and scene transitions
    if (scene.sound && typeof scene.sound.stopByKey === "function") {
      scene.sound.stopByKey("theme1");
    }
    if (scene.scene && typeof scene.scene.start === "function") {
      scene.scene.start("EndGameScene");
    }
  }
  return shardCounts;
}
