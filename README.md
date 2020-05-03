
# TODO LIST

1. Actually design some interesting levels (better test)
	(this might include some real life drawing ideas)

2. **DONE** Make the empty health sprite transparent (alpha value)

3. Change health into its own png, make it a spritesheet (for when tileset is maybe changed)

4. Find a better way of implementing Globals than localStorage

5. Add ability to interact with signs / a dialog system

6. Add attack animation / ability to break crates

7. Add Collectables?

8. Add enemies

9. **DONE** Add a camera phase in after scene restart

10. Play around with removing player gravity while on ladder

11. Refactor ladder code and maybe ladders should be their own layer in tiled

12. Edit tileset in gimp - specifically add ceiling tiles (or like stalagtites or something)

13. Add a pause button

14. Add an animated version of the player dying to the game over screen

15. Fix diagonal slope tiles not working outside of the starting map colors

16. *Immediate* on map_2 change crate block (which comes from /images/block.png)

17. *Immediate* add ceiling tiles to the tileset image

18. *Immediate* map_3 should contain vines that are actually ladders
	...this means we need to be able to have multiple ladders per stage

19. Add a locked door in front of right exit and fix ceiling not colliding

20. Add a health increase on the plant on map_2

21. Make the MaxHealthUp class generic so it can be used by other kinds of items

22. Refactor how health works -> its a messs

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