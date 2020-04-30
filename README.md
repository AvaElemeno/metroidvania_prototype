
# TODO LIST


1. Add ability to go to multiple maps

partially implemented, need to make a big configuration that can actually
store which maps lineup to others and where

2. Find a better way of implementing Globals than localStorage

3. Add ability to interact with signs / a dialog system

4. Add attack animation / ability to break crates

5. Add enemies

-----
// Depricated emoji script (which is funny)
for (let i = 0; i < 35; i++) {
  const x = this.player.sprite.x + Phaser.Math.RND.integerInRange(-50, 50);
  const y = this.player.sprite.y - 150 + Phaser.Math.RND.integerInRange(-10, 10);
  this.matter.add
    .image(x, y, "emoji", "1f60d", {
      restitution: 1,
      friction: 0,
      density: 0.0001,
      shape: "circle"
    })
    .setScale(0.5);
}