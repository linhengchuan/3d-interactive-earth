import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

// Create scene
const scene = new THREE.Scene();
// Earth group includes earth, cloud, pointers, texts
const earthGroup = new THREE.Group();
var earth_radius = 10;

// Generate random star positions
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
starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
});
const starSystem = new THREE.Points(starGeometry, starMaterial);
scene.add(starSystem);
scene.fog = new THREE.FogExp2(0x000010, 0.00025);
scene.background = new THREE.Color(0x000010);

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, -20);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaffaa);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(15, 15, 15);
scene.add(pointLight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 8;
controls.maxDistance = 30;

// Create earth model
const loadManager = new THREE.LoadingManager();
loadManager.onProgress = function (url, loaded, total) {
  console.log(`Loading: ${url} - ${(loaded / total) * 100}%`);
};
// Texture loader
const textureLoader = new THREE.TextureLoader(loadManager);

// Load Earth texture
const earthTexture = textureLoader.load(
  "./assets/earth_daymap.jpg",
  function (texture) {
    console.log("Texture loaded");
  },
  undefined,
  function (err) {
    console.error("Error loading texture:", err);
  }
);

const specularTexture = textureLoader.load("./assets/earth_specular_map.jpg");
const normalTexture = textureLoader.load("./assets/earth_normal_map.jpg");
const cloudTexture = textureLoader.load("./assets/earth_clouds.jpg");

// Sphere with texture
const geometry = new THREE.SphereGeometry(earth_radius, 64, 64);
const material = new THREE.MeshPhongMaterial({
  map: earthTexture,
  specularMap: specularTexture,
  normalMap: normalTexture,
  shininess: 5,
});
const sphere = new THREE.Mesh(geometry, material);
earthGroup.add(sphere);

// Add clouds
const cloudGeometry = new THREE.SphereGeometry(earth_radius + 0.2, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.3, // Adjust cloud transparency
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
earthGroup.add(clouds);

// Location markers data
const locations = [
  { lat: 1.3521, lng: 103.8198, name: "Singapore", content: "Singapore" },
  { lat: 51.5074, lng: -0.1278, name: "London", content: "Testing" },
  { lat: 22.3193, lng: 114.1694, name: "Hong Kong", content: "Hong Kong SAR" },
];

// Convert lat/lng to 3D position
function latLngToVector3(lat, lng, radius) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Create markers and labels
const markers = [];
const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const fontLoader = new THREE.FontLoader();
fontLoader.load(
  "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
  (font) => {
    // Create text geometry configuration object
    const textConfig = {
      font: font,
      size: 0.2,
      height: 0.05,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.001,
      bevelSize: 0.001,
      bevelSegments: 1,
    };

    // Function to create and position both marker and label
    function createLocationMarker(location) {
      // Create marker
      const position = latLngToVector3(
        location.lat,
        location.lng,
        earth_radius
      );
      const marker = new THREE.Mesh(markerGeometry, markerMaterial.clone());
      marker.position.copy(position);
      marker.userData = location;
      markers.push(marker);
      earthGroup.add(marker);

      // Create label
      const textGeometry = new THREE.TextGeometry(location.name, textConfig);
      const textMaterial = new THREE.MeshStandardMaterial({ color: "black" });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      const labelPosition = latLngToVector3(
        location.lat,
        location.lng,
        earth_radius + 0.2
      );
      textMesh.position.copy(labelPosition);

      // Orient label
      textMesh.lookAt(0, 0, 0);
      textMesh.rotateX(Math.PI);
      textMesh.rotateZ(Math.PI);

      earthGroup.add(textMesh);
    }

    // Create markers and labels for all locations
    locations.forEach(createLocationMarker);
  }
);

scene.add(earthGroup);

// Popup handling
const popup = document.getElementById("popup");
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updatePopup(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers);

  if (intersects.length > 0) {
    const marker = intersects[0].object;
    const location = marker.userData;

    // Update panel content
    document.getElementById("panelContent").innerHTML = `
            <h2>${location.name}</h2>
            <p>${location.content}</p>
        `;
    popup.style.display = "block";

    // Highlight marker
    marker.material.color.setHex(0xffff00);
  }
}

// Modify the event listener to click instead of mousemove
window.addEventListener("click", updatePopup);

// Add close button functionality
document.getElementById("closePanel").addEventListener("click", () => {
  popup.style.display = "none";
  // Reset marker colors
  markers.forEach((marker) => marker.material.color.setHex(0xff0000));
});

// Create a refresh button
document.getElementById("refreshButton").addEventListener("click", () => {
  earthGroup.rotation.set(0, 0, 0);
  camera.position.set(0, 0, -20);
});

// Rotation toggle variables
let rotateObjects = false; // Track whether rotation is enabled
let rotationInterval = null; // Store the interval ID

// Add rotation toggle functionality
document.getElementById("rotateButton").addEventListener("click", () => {
  rotateObjects = !rotateObjects;
  if (rotateObjects) {
    startRotation();
  } else {
    stopRotation();
  }
});

// Function to start Earth rotation
function startRotation() {
  if (!rotationInterval) {
    rotationInterval = setInterval(() => {
      earthGroup.rotation.y += 0.005;
      starSystem.rotation.y += 0.001;
    }, 100);
  }
}

// Function to stop Earth rotation
function stopRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Required for damping
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
