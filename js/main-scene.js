import Player from "./player.js";
import createRotatingPlatform from "./create-rotating-platform.js";

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map_1", "assets/tilemaps/level_1/level_1.json");
    this.load.tilemapTiledJSON("map_2", "assets/tilemaps/level_2/level_2.json");

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
    // Declare initial setup for the map
    this.map = this.make.tilemap({ key: localStorage.getItem("current_map") });
    const tileset = this.map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = this.map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = this.map.createDynamicLayer("Lava", tileset, 0, 0);
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
    const whichSpawn = (localStorage.getItem("travelingLeft") == "false") ? "Spawn Point" : "Back Spawn Point";
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

    // Create Next (traveling right) map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "next")) {
      const nextRect = this.map.findObject("Sensors", obj => obj.name === "next");
      const nextSensor = this.matter.add.rectangle(
        nextRect.x + nextRect.width / 2,
        nextRect.y + nextRect.height / 2,
        nextRect.width,
        nextRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeNext = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: nextSensor,
        callback: this.goNextStage,
        context: this
      });
    }

    // Create Back (traveling left) map sensor
    if (this.map.findObject("Sensors", obj => obj.name === "back")) {
      const backRect = this.map.findObject("Sensors", obj => obj.name === "back");
      const backSensor = this.matter.add.rectangle(
        backRect.x + backRect.width / 2,
        backRect.y + backRect.height / 2,
        backRect.width,
        backRect.height,
        { isSensor: true, isStatic: true }
      );
      this.unsubscribeBack = this.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: backSensor,
        callback: this.goBackStage,
        context: this
      });
    }
  }


  onPlayerCollide({ gameObjectB }) {
    if (!gameObjectB || !(gameObjectB instanceof Phaser.Tilemaps.Tile)) return;

    // Set tile, then if lethal initiate death
    const tile = gameObjectB;
    if (tile.properties.isLethal) {
      this.unsubscribePlayerCollide();
      this.player.freeze();
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.restart());
    }
  }

  goBackStage() {
    // Set destination and then load it
    this.unsubscribeBack();
    localStorage.setItem("travelingLeft", true);
    localStorage.setItem("current_map", "map_1");
    this.scene.restart();
  }

  goNextStage() {
    // Set destination and then load it
    this.unsubscribeNext();
    localStorage.setItem("travelingLeft", false);
    localStorage.setItem("current_map", "map_2");
    this.scene.restart();
  }
}
