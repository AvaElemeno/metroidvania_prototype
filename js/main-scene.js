import Player from "./player.js";
import createRotatingPlatform from "./create-rotating-platform.js";

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map_1", "assets/tilemaps/level_1/level_1.json");
    this.load.tilemapTiledJSON("map_2", "assets/tilemaps/level_2/level_2.json");
    this.load.tilemapTiledJSON("map_3", "assets/tilemaps/level_3/level_3.json");

    this.load.image(
      "kenney-tileset-64px-extruded",
      "assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    this.load.image("wooden-plank", "assets/images/wooden-plank.png");
    this.load.image("block", "assets/images/block.png");

    this.load.spritesheet(
      "player",
      "assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );

    this.load.spritesheet(
      "health",
      "assets/tilesets/kenney-tileset-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );

    this.load.atlas("emoji", "assets/atlases/emoji.png", "assets/atlases/emoji.json");
  }

  create() {

    // Declare globalScenesMap (which will be moved later possibly to its own file)
    const globalScenesMap = {
      "map_1":{
        above: "map_3",
        below: null,
        left: null,
        right: "map_2"
      },
      "map_2":{
        above: null,
        below: null,
        left: "map_1",
        right: null
      },
      "map_3":{
        above: null,
        below: "map_1",
        left: null,
        right: null
      },
    }
    this.sceneData = globalScenesMap[localStorage.getItem("current_map")];


    // Declare initial setup for the map
    this.map = this.make.tilemap({ key: localStorage.getItem("current_map") });
    const tileset = this.map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = this.map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = this.map.createDynamicLayer("Lava", tileset, 0, 0).setDepth(15);
    this.map.createDynamicLayer("Background", tileset, 0, 0);
    this.map.createDynamicLayer("Foreground", tileset, 0, 0).setDepth(10);

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    // Set the bounds for the camera
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // The spawn point is set using a point object inside of Tiled (within the "Spawn" object layer)
    const whichSpawn = localStorage.getItem("spawn_side");
    const { x, y } = this.map.findObject("Spawn", obj => obj.name === whichSpawn);
    this.player = new Player(this, x, y);

    // Smoothly follow the player
    this.cameras.main.startFollow(this.player.sprite, false, 0.5, 0.5);

    // Set collision
    this.unsubscribePlayerCollide = this.matterCollision.addOnCollideStart({
      objectA: this.player.sprite,
      callback: this.onPlayerCollide,
      context: this
    });

    // Load up some crates from the "Crates" object layer created in Tiled
    this.map.getObjectLayer("Crates").objects.forEach(crateObject => {
      const { x, y, width, height } = crateObject;
      this.matter.add
        .image(x + width / 2, y - height / 2, "block")
        .setBody({ shape: "rectangle", density: 0.001 });
    });

    // Create platforms at the point locations in the "Platform Locations" layer created in Tiled
    this.map.getObjectLayer("Platform Locations").objects.forEach(point => {
      createRotatingPlatform(this, point.x, point.y);
    });

    // Create Top map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "top")) {
      const topRect = this.map.findObject("Sensors", obj => obj.name === "top");
      const topSensor = this.matter.add.rectangle(
        topRect.x + topRect.width / 2,
        topRect.y + topRect.height / 2,
        topRect.width,
        topRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeTop = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: topSensor,
        callback: this.goUpStage,
        context: this
      });
    }

    // Create Bottom map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "bottom")) {
      const bottomRect = this.map.findObject("Sensors", obj => obj.name === "bottom");
      const bottomSensor = this.matter.add.rectangle(
        bottomRect.x + bottomRect.width / 2,
        bottomRect.y + bottomRect.height / 2,
        bottomRect.width,
        bottomRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeBottom = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: bottomSensor,
        callback: this.goDownStage,
        context: this
      });
    }

    // Create Right map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "right")) {
      const rightRect = this.map.findObject("Sensors", obj => obj.name === "right");
      const rightSensor = this.matter.add.rectangle(
        rightRect.x + rightRect.width / 2,
        rightRect.y + rightRect.height / 2,
        rightRect.width,
        rightRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeRight = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: rightSensor,
        callback: this.goRightStage,
        context: this
      });
    }

    // Create Left map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "left")) {
      const leftRect = this.map.findObject("Sensors", obj => obj.name === "left");
      const leftSensor = this.matter.add.rectangle(
        leftRect.x + leftRect.width / 2,
        leftRect.y + leftRect.height / 2,
        leftRect.width,
        leftRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeLeft = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: leftSensor,
        callback: this.goLeftStage,
        context: this
      });
    }

    // Create Ladder Sensor
    this.touchingLadder = false;
    if (this.map.findObject("Sensors", obj => obj.name === "ladder")) {
      const ladderRect = this.map.findObject("Sensors", obj => obj.name === "ladder");
      this.ladderSensor = this.matter.add.rectangle(
        ladderRect.x + ladderRect.width / 2,
        ladderRect.y + ladderRect.height / 2,
        ladderRect.width,
        ladderRect.height,
        { isSensor: true, isStatic: true }
      );
    }
  }

  goUpStage() {
    // Set Top and then load it
    if (!!this.sceneData && !!this.sceneData.above) {
      this.unsubscribeTop();
      localStorage.setItem("spawn_side", "Bottom Spawn");
      localStorage.setItem("current_map", this.sceneData.above);
      this.scene.restart();
    }
  }

  goDownStage() {
    // Set Top and then load it
    if (!!this.sceneData && !!this.sceneData.below) {
      this.unsubscribeBottom();
      localStorage.setItem("spawn_side", "Top Spawn");
      localStorage.setItem("current_map", this.sceneData.below);
      this.scene.restart();
    }
  }

  goRightStage() {
    // Set Right and then load it
    if (!!this.sceneData && !!this.sceneData.right) {
      this.unsubscribeRight();
      localStorage.setItem("spawn_side", "Left Spawn");
      localStorage.setItem("current_map", this.sceneData.right);
      this.scene.restart();
    }
  }

  goLeftStage() {
    // Set Left and then load it
    if (!!this.sceneData && !!this.sceneData.left) {
      this.unsubscribeLeft();
      localStorage.setItem("spawn_side", "Right Spawn");
      localStorage.setItem("current_map", this.sceneData.left);
      this.scene.restart();
    }
  }

  checkLadder() {
    // Get ladder and player coords
    var ladderLocation = this.ladderSensor.bounds;
    var spriteLocation = this.player.sprite.getBounds();
    spriteLocation.x += this.player.sprite.width;

    // return if sprite/player is within the ladder's bounds
    return (spriteLocation.x > ladderLocation.min.x &&
      spriteLocation.x < ladderLocation.max.x &&
      spriteLocation.y > ladderLocation.min.y &&
      spriteLocation.y < ladderLocation.max.x);
  }

  onPlayerCollide({ gameObjectB }) {
    if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

    // Set tile, then if lethal initiate death
    const tile = gameObjectB;
    if (tile.properties.isLethal) {

      // If game over then reset Globals
      if (!!localStorage.getItem("health") && localStorage.getItem("health") == 1) {
        localStorage.setItem("current_map", "map_1");
        localStorage.setItem("spawn_side", "Left Spawn"); 
      }

      // Create a player death and scene restart
      this.unsubscribePlayerCollide();
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.restart());
    }
  }
}
