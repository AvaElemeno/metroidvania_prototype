/**
 * A small class to handle colliding with map exit areas
 * thus going to destination map
 */
export default class MapExit {
  constructor(scene, sceneDataProp, sensorName, spawnSide) {
    
    // Declarations
    this.scene = scene;
    this.sceneData = scene.sceneData;
    this.map = scene.map;
    this.player = scene.player;
    this.sceneDataProp = sceneDataProp;
    this.spawnSide = spawnSide;

    // Create map exit sensor 
    if (this.map.findObject("Sensors", obj => obj.name === sensorName)) {
      const exitRect = this.map.findObject("Sensors", obj => obj.name === sensorName);
      const exitSensor = this.scene.matter.add.rectangle(
        exitRect.x + exitRect.width / 2,
        exitRect.y + exitRect.height / 2,
        exitRect.width,
        exitRect.height,
        { isSensor: true, isStatic: true }
      );

      // Add collision to exit sensor
      this.unsubscribeExit = this.scene.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: exitSensor,
        callback: this.exitStage,
        context: this
      });
    }
  }

  exitStage() {
    // Set Destination and then load it
    if (!!this.sceneData && !!this.sceneData[this.sceneDataProp]) {
      this.unsubscribeExit();
      localStorage.setItem("spawn_side", this.spawnSide);
      localStorage.setItem("current_map", this.sceneData[this.sceneDataProp]);

      const cam = this.scene.cameras.main;
      cam.fade(250, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => this.scene.scene.restart());
    }
  }
}
