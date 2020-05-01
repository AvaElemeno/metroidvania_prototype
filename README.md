
# TODO LIST


1. Need to add up and down directions for inter scene movement

2. Add stage object LADDER which allows player to move up and down

3. Change health into its own png, make it a spritesheet

4. Find a better way of implementing Globals than localStorage

5. Add ability to interact with signs / a dialog system

6. Add attack animation / ability to break crates

7. Add enemies


---
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