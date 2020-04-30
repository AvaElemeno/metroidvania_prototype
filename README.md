
# TODO LIST

1. Add ability to interact with signs / a dialog system

2. Add ability to go to multiple maps

3. Add attack animation / ability to break crates

4. Add enemies


// Depricated emoji script
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