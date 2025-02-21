import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";

export class Stars {
  constructor(scene) {
    this.scene = scene;
    this.createStars();
  }

  createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 400;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      positions[i] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i + 2] = radius * Math.cos(theta);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
    });

    this.starSystem = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starSystem);
  }

  rotate(speed) {
    if (this.starSystem) {
      this.starSystem.rotation.y += speed;
    }
  }
}
