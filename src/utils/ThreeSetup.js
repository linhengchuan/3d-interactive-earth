import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { CAMERA_CONFIG } from "../config.js";

export class ThreeSetup {
  constructor() {
    this.scene = new THREE.Scene();
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.handleResize();
  }

  setupScene() {
    this.scene.fog = new THREE.FogExp2(0x000010, 0.00025);
    this.scene.background = new THREE.Color(0x000010);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    this.camera.position.set(...CAMERA_CONFIG.position);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(15, 15, 15);
    this.scene.add(ambientLight, pointLight);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = CAMERA_CONFIG.minDistance;
    this.controls.maxDistance = CAMERA_CONFIG.maxDistance;
  }

  handleResize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
