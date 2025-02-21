import { ThreeSetup } from "./utils/ThreeSetup.js";
import { Earth } from "./components/Earth.js";
import { Stars } from "./components/Stars.js";
import { Markers } from "./components/Markers.js";
import { UI } from "./components/UI.js";
import { locations } from "./data/locations.js";
import { ANIMATION_CONFIG } from "./config.js";

class App {
  constructor() {
    this.threeSetup = new ThreeSetup();
    this.earth = new Earth(this.threeSetup.scene);
    this.stars = new Stars(this.threeSetup.scene);
    this.markers = new Markers(this.threeSetup.scene, this.earth.group);
    this.ui = new UI();

    this.isRotating = false;
    this.setupLocations();
    this.setupUICallbacks();
    this.animate();
  }

  setupLocations() {
    locations.forEach((location) => {
      this.markers.createMarker(location);
    });
  }

  setupUICallbacks() {
    this.ui.setRefreshCallback(() => {
      this.earth.group.rotation.set(0, 0, 0);
      this.threeSetup.camera.position.set(0, 0, -20);
    });

    this.ui.setRotateToggleCallback(() => {
      this.isRotating = !this.isRotating;
    });

    window.addEventListener("click", (event) => {
      console.log("Click detected");
      const location = this.markers.handleClick(event, this.threeSetup.camera);
      console.log("Location clicked:", location);
      if (location) {
        this.ui.showPopup(location);
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.isRotating) {
      this.earth.group.rotation.y += ANIMATION_CONFIG.rotationSpeed;
      this.stars.rotate(ANIMATION_CONFIG.starRotationSpeed);
    }

    this.markers.updateAnimation();
    this.threeSetup.controls.update();
    this.threeSetup.renderer.render(
      this.threeSetup.scene,
      this.threeSetup.camera
    );
  }
}

// Start the application
new App();
