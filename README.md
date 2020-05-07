---
# FEATURES TODO LIST

+	Add a locked door in front of right exit and fix ceiling not colliding

+	Add ability for multiple ladders per scene

+	Find a better way of implementing Globals than localStorage

+	Add ability to interact with signs / a dialog system

+	Add attacking code (also ablitiy to break crates)

+	Add enemies

---
# REFACTORING TODO LIST

+	Make the MaxHealthUp class generic so it can be used by other kinds of items

+	Refactor how health works -> its a messs

+	Refactor ladders (maybe give them their own layer in tiled) (possibly remove gravity)

---
# BUG LIST
***BUG***: When hitting game over, even if mxHpUp not obtained, health is set to 6 and
	the sprite for death animation doesnt disapear .... but this does not always occur?

***BUG***: Diagonal slope tiles (other than the blue ones) act as solid blocks instead of
	as a slope

---
# ART TODO LIST

+	(ONGOING) add more levels 

+	Make a map including all levels (to keep track of everything)

+	Need to create sprite attack animation

+	Need to add castle-like tiles

+	Add ceiling tiles

+	Need to add alternate crate images

+	Change health into its own png, make it a spritesheet (for when tileset is maybe changed)

+	Add attack animation

+	Add ememy sprites

---
# FINISHED ITEMS LIST

***DONE*** Add a health increase on the plant on map_2

***DONE*** Add an animated version of the player dying to the game over screen

***DONE*** Edit tileset in gimp - specifically add ceiling tiles (or like stalagtites or something)

***DONE*** Add a camera phase in after scene restart

***DONE*** Make the empty health sprite transparent (alpha value)


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