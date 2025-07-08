export function shardLogic(scene) {
  const shardCounts = scene.shardCounts;
  if (shardCounts.spring < 0) {
    shardCounts.spring = 0;
  }
  if (shardCounts.summer < 0) {
    shardCounts.summer = 0;
  }
  if (shardCounts.autumn < 0) {
    shardCounts.autumn = 0;
  }
  if (shardCounts.winter < 0) {
    shardCounts.winter = 0;
  }
  if (
    shardCounts.spring === 0 &&
    shardCounts.summer === 0 &&
    shardCounts.autumn === 0 &&
    shardCounts.winter === 0
  ) {
    if (scene && scene.scene) {
      scene.scene.start("EndGameScene");
    }
  }
  return shardCounts;
}
