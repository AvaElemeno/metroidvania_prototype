
# TODO LIST

1. Actually design some interesting levels (better test)
	(this might include some real life drawing ideas)

2. Make the empty health sprite transparent (alpha value)

3. Change health into its own png, make it a spritesheet

4. Find a better way of implementing Globals than localStorage

5. Add ability to interact with signs / a dialog system

6. Add attack animation / ability to break crates

7. Add Collectables?

8. Add enemies

9. Add a camera phase in after scene restart

10. Play around with removing player gravity while on ladder

11. Possibly refactor ladder code?



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