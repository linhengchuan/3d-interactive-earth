import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { MARKER_CONFIG } from "../config.js";

export class Markers {
  constructor(scene, earthGroup) {
    this.scene = scene;
    this.earthGroup = earthGroup;
    this.markers = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Load font
    const fontLoader = new THREE.FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        this.font = font;
        this.textConfig = {
          font: font,
          size: 0.2,
          height: 0.05,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.001,
          bevelSize: 0.001,
          bevelSegments: 1,
        };
        if (this.pendingLocations) {
          this.pendingLocations.forEach((location) =>
            this.createMarker(location)
          );
          this.pendingLocations = null;
        }
      }
    );
    this.pendingLocations = [];
  }

  createMarker(location) {
    if (!this.font) {
      this.pendingLocations.push(location);
      return;
    }

    const position = this.latLngToVector3(location.lat, location.lng);
    const marker = this.createRadiatingRing(position);
    marker.userData = location;

    // Create hit area for better click detection
    const hitAreaGeometry = new THREE.SphereGeometry(0.4);
    const hitAreaMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
    hitArea.position.copy(position);
    hitArea.userData = location;

    // Create text label
    const textGeometry = new THREE.TextGeometry(location.name, this.textConfig);
    textGeometry.computeBoundingBox();
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position text above the marker
    const textOffset = 0.5;
    const labelPosition = this.latLngToVector3(
      location.lat,
      location.lng,
      10 + textOffset
    );
    textMesh.position.copy(labelPosition);

    // Updated billboard behavior
    textMesh.onBeforeRender = (renderer, scene, camera) => {
      // Get the direction from the text to the camera
      const cameraDirection = new THREE.Vector3()
        .subVectors(camera.position, textMesh.position)
        .normalize();

      // Make text face the camera
      textMesh.quaternion.copy(camera.quaternion);

      // Counter-rotate for Earth's rotation to maintain correct orientation
      const earthRotation = new THREE.Quaternion();
      this.earthGroup.getWorldQuaternion(earthRotation);
      textMesh.quaternion.multiply(earthRotation.invert());
    };

    this.markers.push(hitArea);
    this.earthGroup.add(marker);
    this.earthGroup.add(hitArea);
    this.earthGroup.add(textMesh);
  }

  latLngToVector3(lat, lng, radius = 10) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;

    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  createRadiatingRing(position) {
    const ring = new THREE.Group();

    // Calculate elevated position
    const surfaceNormal = position.clone().normalize();
    const elevatedPosition = position
      .clone()
      .add(surfaceNormal.multiplyScalar(0.2));

    // Create center dot
    const centerGeometry = new THREE.CircleGeometry(0.1, 16);
    const centerPoint = new THREE.Mesh(
      centerGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
      })
    );
    centerPoint.renderOrder = 999;
    ring.add(centerPoint);

    // Create radiating ring
    const ringGeometry = new THREE.RingGeometry(0.2, 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.renderOrder = 999;

    // Setup animation properties
    ringMesh.userData.initialScale = 0.1;
    ringMesh.userData.maxScale = 2.0;
    ringMesh.userData.animationSpeed = 0.02;
    ringMesh.scale.set(
      ringMesh.userData.initialScale,
      ringMesh.userData.initialScale,
      ringMesh.userData.initialScale
    );

    ring.add(ringMesh);
    ring.position.copy(elevatedPosition);

    // Orient ring to face Earth's surface
    const lookAtPoint = position.clone();
    ring.lookAt(lookAtPoint);

    return ring;
  }

  updateAnimation() {
    this.earthGroup.traverse((object) => {
      if (object.geometry instanceof THREE.RingGeometry) {
        const userData = object.userData;
        if (userData.initialScale !== undefined) {
          // Update scale
          object.scale.x += userData.animationSpeed;
          object.scale.y += userData.animationSpeed;
          object.scale.z += userData.animationSpeed;

          // Update opacity
          const progress =
            (object.scale.x - userData.initialScale) /
            (userData.maxScale - userData.initialScale);
          object.material.opacity = 1 * (1 - progress * 0.8);

          // Reset animation
          if (object.scale.x >= userData.maxScale) {
            object.scale.set(
              userData.initialScale,
              userData.initialScale,
              userData.initialScale
            );
            object.material.opacity = 1;
          }
        }
      }
    });
  }

  handleClick(event, camera) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, camera);

    // Debug logs
    console.log("Mouse position:", this.mouse);
    console.log("Number of markers:", this.markers.length);

    const intersects = this.raycaster.intersectObjects(this.markers);
    console.log("Intersects:", intersects);

    if (intersects.length > 0) {
      const marker = intersects[0].object;
      console.log("Marker clicked:", marker.userData);
      return marker.userData;
    }

    return null;
  }
}
