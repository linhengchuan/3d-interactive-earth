import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { EARTH_CONFIG } from "../config.js";

export class Earth {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.init();
  }

  async init() {
    try {
      await this.loadTextures();
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  }

  async loadTextures() {
    const textureLoader = new THREE.TextureLoader();

    try {
      const earthTexture = textureLoader.load(
        "./assets/earth_daymap.jpg",
        (texture) => console.log("Earth texture loaded"),
        undefined,
        (error) => console.error("Error loading earth texture:", error)
      );

      const specularTexture = textureLoader.load(
        "./assets/earth_specular_map.jpg"
      );
      const normalTexture = textureLoader.load("./assets/earth_normal_map.jpg");
      const cloudTexture = textureLoader.load("./assets/earth_clouds.jpg");

      this.createEarth(earthTexture, specularTexture, normalTexture);
      this.createClouds(cloudTexture);
    } catch (error) {
      console.error("Error loading specific texture:", error);
      this.createBasicEarth();
    }
  }

  createBasicEarth() {
    const geometry = new THREE.SphereGeometry(
      EARTH_CONFIG.radius,
      EARTH_CONFIG.segments,
      EARTH_CONFIG.segments
    );
    const material = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      shininess: 5,
    });
    const earth = new THREE.Mesh(geometry, material);
    this.group.add(earth);
  }

  createEarth(earthTexture, specularTexture, normalTexture) {
    const geometry = new THREE.SphereGeometry(
      EARTH_CONFIG.radius,
      EARTH_CONFIG.segments,
      EARTH_CONFIG.segments
    );
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: specularTexture,
      normalMap: normalTexture,
      shininess: 5,
    });
    const earth = new THREE.Mesh(geometry, material);
    this.group.add(earth);
  }

  createClouds(cloudTexture) {
    const geometry = new THREE.SphereGeometry(
      EARTH_CONFIG.radius + 0.2,
      EARTH_CONFIG.segments,
      EARTH_CONFIG.segments
    );
    const material = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.3,
    });
    const clouds = new THREE.Mesh(geometry, material);
    this.group.add(clouds);
  }
}
