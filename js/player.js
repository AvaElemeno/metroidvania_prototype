import MultiKey from "./multi-key.js";

export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Create the animations we need from the player spritesheet
    const anims = scene.anims;
    anims.create({
      key: "player-idle",
      frames: anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 3,
      repeat: -1
    });
    anims.create({
      key: "player-run",
      frames: anims.generateFrameNumbers("player", { start: 8, end: 15 }),
      frameRate: 12,
      repeat: -1
    });

    // Create the physics-based sprite that we will move around and animate
    this.sprite = scene.matter.add.sprite(0, 0, "player", 0);

    // Create help text box
    this.helpToggledState = false;
    this.help = scene.add.text(16, 550, "Arrows/WASD to move the player.", {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    }).setScrollFactor(0).setDepth(1000);
    this.help.setVisible(false);

    // Handle Game Over Text
    this.gameOver = false;
    this.gameOverScreen = scene.add.text(0, 0, "GAME OVER", {
      fontSize: "64px",
      fontFamily: "sans-serif",
      padding: { x: 210, y: 265 },
      backgroundColor: "#000c1f",
      fill: "#ff0000"
    }).setScrollFactor(0).setDepth(1000);
    this.gameOverScreen.setVisible(false);
    this.gameOverExplanation = scene.add.text(16, 550, "Press R to continue...", {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#000c1f",
      fill: "#ffffff"
    }).setScrollFactor(0).setDepth(1000);
    this.gameOverExplanation.setVisible(false);

    // Create health bar
    this.health = (!!localStorage.getItem("health")) ? 
      localStorage.getItem("health") : 5;

    // Add the hearts
    this.healthbar_1 = scene.matter.add.sprite(32, 32, "health", 0).setStatic(true).setScrollFactor(0).setDepth(1000);
    this.healthbar_2 = scene.matter.add.sprite(64, 32, "health", 0).setStatic(true).setScrollFactor(0).setDepth(1000);
    this.healthbar_3 = scene.matter.add.sprite(96, 32, "health", 0).setStatic(true).setScrollFactor(0).setDepth(1000);
    this.healthbar_4 = scene.matter.add.sprite(128, 32, "health", 0).setStatic(true).setScrollFactor(0).setDepth(1000);
    this.healthbar_5 = scene.matter.add.sprite(160, 32, "health", 0).setStatic(true).setScrollFactor(0).setDepth(1000);
    
    // Determine how many hearts show
    this.modifyHealth = function(setData) {
      this.healthbar_1.setTexture("health", (this.health < 1) ? 35 : 37);
      this.healthbar_2.setTexture("health", (this.health < 2) ? 35 : 37);
      this.healthbar_3.setTexture("health", (this.health < 3) ? 35 : 37);
      this.healthbar_4.setTexture("health", (this.health < 4) ? 35 : 37);
      this.healthbar_5.setTexture("health", (this.health < 5) ? 35 : 37);
      if (this.health < 1) { //329
        
        // Hide health sprites
        this.healthbar_1.setDepth(-1000);
        this.healthbar_2.setDepth(-1000);
        this.healthbar_3.setDepth(-1000);
        this.healthbar_4.setDepth(-1000);
        this.healthbar_5.setDepth(-1000);
        
        // Do Game Over
        this.gameOver = true; 
        this.gameOverScreen.setVisible(true); 
        this.gameOverExplanation.setVisible(true);
      }
      if (setData) { localStorage.setItem("health", (this.health > 0) ? this.health -=1 : (this.gameOver)? 0:5); }
    }  
    this.modifyHealth(false);



    // The player's body is going to be a compound body that looks something like this:
    //
    //                  A = main body
    //
    //                   +---------+
    //                   |         |
    //                 +-+         +-+
    //       B = left  | |         | |  C = right
    //    wall sensor  |B|    A    |C|  wall sensor
    //                 | |         | |
    //                 +-+         +-+
    //                   |         |
    //                   +-+-----+-+
    //                     |  D  |
    //                     +-----+
    //
    //                D = ground sensor
    //
    // The main body is what collides with the world. The sensors are used to determine if the
    // player is blocked by a wall or standing on the ground.

    const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
    const { width: w, height: h } = this.sprite;
    const mainBody = Bodies.rectangle(0, 0, w * 0.6, h, { chamfer: { radius: 10 } });
    this.sensors = {
      bottom: Bodies.rectangle(0, h * 0.5, w * 0.25, 2, { isSensor: true }),
      left: Bodies.rectangle(-w * 0.35, 0, 2, h * 0.5, { isSensor: true }),
      right: Bodies.rectangle(w * 0.35, 0, 2, h * 0.5, { isSensor: true })
    };
    const compoundBody = Body.create({
      parts: [mainBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
      frictionStatic: 0,
      frictionAir: 0.02,
      friction: 0.1
    });
    this.sprite
      .setExistingBody(compoundBody)
      .setScale(2)
      .setFixedRotation() // Sets inertia to infinity so the player can't rotate
      .setPosition(x, y);

    // Track which sensors are touching something
    this.isTouching = { left: false, right: false, ground: false };

    // Jumping is going to have a cooldown
    this.canJump = true;
    this.jumpCooldownTimer = null;

    // Before matter's update, reset our record of which surfaces the player is touching.
    scene.matter.world.on("beforeupdate", this.resetTouching, this);

    scene.matterCollision.addOnCollideStart({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });
    scene.matterCollision.addOnCollideActive({
      objectA: [this.sensors.bottom, this.sensors.left, this.sensors.right],
      callback: this.onSensorCollide,
      context: this
    });

    // Track the keys
    const { LEFT, RIGHT, UP, A, D, W, SPACE, H, R, DOWN, S } = Phaser.Input.Keyboard.KeyCodes;
    this.leftInput = new MultiKey(scene, [LEFT, A]);
    this.rightInput = new MultiKey(scene, [RIGHT, D]);
    this.upInput = new MultiKey(scene, [UP, W, SPACE]);
    this.downInput = new MultiKey(scene, [DOWN, S]);
    this.helpInput = new MultiKey(scene, [H]);
    this.contInput = new MultiKey(scene, [R]);

    // Handle scene destruction
    this.destroyed = false;
    this.scene.events.on("update", this.update, this);
    this.scene.events.once("shutdown", this.destroy, this);
    this.scene.events.once("destroy", this.destroy, this);
  }

  onSensorCollide({ bodyA, bodyB, pair }) {
    // Watch for the player colliding with walls/objects on either side and the ground below, so
    // that we can use that logic inside of update to move the player.
    // Note: we are using the "pair.separation" here. That number tells us how much bodyA and bodyB
    // overlap. We want to teleport the sprite away from walls just enough so that the player won't
    // be able to press up against the wall and use friction to hang in midair. This formula leaves
    // 0.5px of overlap with the sensor so that the sensor will stay colliding on the next tick if
    // the player doesn't move.
    if (bodyB.isSensor) return; // We only care about collisions with physical objects
    if (bodyA === this.sensors.left) {
      this.isTouching.left = true;
      if (pair.separation > 0.5) this.sprite.x += pair.separation - 0.5;
    } else if (bodyA === this.sensors.right) {
      this.isTouching.right = true;
      if (pair.separation > 0.5) this.sprite.x -= pair.separation - 0.5;
    } else if (bodyA === this.sensors.bottom) {
      this.isTouching.ground = true;
    }
  }

  resetTouching() {
    this.isTouching.left = false;
    this.isTouching.right = false;
    this.isTouching.ground = false;
  }

  freeze() {
    this.modifyHealth(true);
    this.sprite.setStatic(true);
  }

  update() {
    if (this.destroyed) return;

    // Declarations
    const sprite = this.sprite;
    const velocity = sprite.body.velocity;
    const isOnGround = this.isTouching.ground;
    const isInAir = !isOnGround;
    
    // Keyboard input states
    const isRightKeyDown = this.rightInput.isDown();
    const isLeftKeyDown = this.leftInput.isDown();
    const isUpKeyDown = this.upInput.isDown();
    const isDownKeyDown = this.downInput.isDown();
    const isHelpKeyDown = this.helpInput.isDown();
    const isHelpKeyUp = this.helpInput.isUp();
    const isContKeyDown = this.contInput.isDown();

    // Show help text
    if (isHelpKeyDown && !this.gameOver) {
      if (!this.helpToggledState) {
        this.help.setVisible(!this.help._visible);
        this.helpToggledState = true;
      } 
    }
    if (isHelpKeyUp) {
      this.helpToggledState = false;
    }

    // Check for continue when Game Over
    if (this.gameOver && isContKeyDown) {
      this.gameOverScreen.setVisible(false);
      this.gameOverExplanation.setVisible(false);
      this.gameOver = false;
      this.health = 6;
      this.modifyHealth(true);
    }

    // Make player slower in air, and limit horizontal speed
    const moveForce = isOnGround ? 0.01 : 0.005;
    if (velocity.x > 7) sprite.setVelocityX(7);
    else if (velocity.x < -7) sprite.setVelocityX(-7);

    // Left directional movement
    if (isLeftKeyDown && !this.gameOver && !(this.scene.touchingLadder && !isOnGround)) {
      sprite.setFlipX(true);
      if (!(isInAir && this.isTouching.left)) {
        sprite.applyForce({ x: -moveForce, y: 0 });
      }
    } 

    // Right directional movement
    if (isRightKeyDown && !this.gameOver && !(this.scene.touchingLadder && !isOnGround)) {
      sprite.setFlipX(false);
      if (!(isInAir && this.isTouching.right)) {
        sprite.applyForce({ x: moveForce, y: 0 });
      }
    }

    // Ladder logic
    if (this.scene.checkLadder()) {
      // TODO possibly remove gravity while on ladder?
      if (!isOnGround && isDownKeyDown) {
          sprite.applyForce({ x: 0, y: 0.005 });
      }
      if (isUpKeyDown) {
        sprite.applyForce({ x: 0, y: -0.005 });
        sprite.setVelocityX(0);
      }

    } else {

      // Jump movement (with delay between jumps so bottom sensor doesnt collide)
      if (isUpKeyDown && this.canJump && isOnGround && !this.gameOver) {
        sprite.setVelocityY(-11);
        this.canJump = false;
        this.jumpCooldownTimer = this.scene.time.addEvent({
          delay: 250,
          callback: () => (this.canJump = true)
        });
      }
    }

    // Update the animation/texture based on the state of the player's state
    if (isOnGround) {
      if (sprite.body.force.x !== 0) sprite.anims.play("player-run", true);
      else sprite.anims.play("player-idle", true);
    } else {
      sprite.anims.stop();
      sprite.setTexture("player", 10);
    }
  }

  destroy() {
    // Clean up any listeners that might trigger events after the player is officially destroyed
    this.scene.events.off("update", this.update, this);
    this.scene.events.off("shutdown", this.destroy, this);
    this.scene.events.off("destroy", this.destroy, this);
    if (this.scene.matter.world) {
      this.scene.matter.world.off("beforeupdate", this.resetTouching, this);
    }
    const sensors = [this.sensors.bottom, this.sensors.left, this.sensors.right];
    this.scene.matterCollision.removeOnCollideStart({ objectA: sensors });
    this.scene.matterCollision.removeOnCollideActive({ objectA: sensors });
    if (this.jumpCooldownTimer) this.jumpCooldownTimer.destroy();

    this.destroyed = true;
    this.sprite.destroy();
  }
}
