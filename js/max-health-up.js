/**
 * A small class to handle colliding with map exit areas
 * thus going to destination map
 */
export default class MaxHealthUp {
  constructor(scene) {
    
    // Declarations
    this.scene = scene;
    this.map = scene.map;
    this.player = scene.player;
    this.itemAlreadyHit = false;
    this.whichStorage = localStorage.getItem("current_map") + "_max_hp_up";

    // Create map exit sensor 
    if (this.map.findObject("Sensors", obj => obj.name === "max-health-up") &&
      localStorage.getItem(this.whichStorage) == "false") {

      // Figure out location
      const itemRect = this.map.findObject("Sensors", obj => obj.name === "max-health-up");
      const itemSensor = this.scene.matter.add.rectangle(
        itemRect.x + itemRect.width / 2,
        itemRect.y + itemRect.height / 2,
        itemRect.width,
        itemRect.height,
        { isSensor: true, isStatic: true }
      );

      // Add a sprite for the item
      this.healthItem = this.scene.matter.add.sprite(
        itemRect.x + itemRect.width / 2, 
        itemRect.y + itemRect.height / 2, "health", 0)
        .setStatic(true)
        .setDepth(999)
        .setTexture("health", 40);

      // Add collision to exit sensor
      this.unsubscribeItem = this.scene.matterCollision.addOnCollideStart({
        objectA: this.player.sprite,
        objectB: itemSensor,
        callback: this.obtainItem,
        context: this
      });
    }
  }

  obtainItem() {
    if (!this.itemAlreadyHit) {
      // Handle Item sprite
      this.healthItem.destroy();
      this.scene.cameras.main.fadeIn(250, 0, 255, 0)
        .once("camerafadeincomplete", () => this.scene.cameras.main.fadeEffect.alpha = 0);
      
      // Handle Storage
      this.itemAlreadyHit = true;
      localStorage.setItem(this.whichStorage, "true");

      // Increase player health
      this.scene.player.numMaxHpUps +=1;
      this.scene.player.health = 5 + this.scene.player.numMaxHpUps;
      this.scene.player.modifyHealth(false);
    }
  }
}
