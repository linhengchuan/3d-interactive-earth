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
controls.minDistance = 12;
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
  { lat: 35.6762, lng: 139.6503, name: "Japan", content: "Tokyo, Japan" },
  { lat: 37.5665, lng: 126.978, name: "Korea", content: "Seoul, South Korea" },
  {
    lat: 52.3676,
    lng: 4.9041,
    name: "Netherlands",
    content: "Amsterdam, Netherlands",
  },
  { lat: 46.8182, lng: 8.2275, name: "Switzerland", content: "Switzerland" },
  { lat: 41.9028, lng: 12.4964, name: "Italy", content: "Rome, Italy" },
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
// Pin geometry settings
const pinHeight = 0.1;
const pinHeadSize = 0.06;
const hitAreaSize = 0.4;
const ringRadius = 0.3; // Increased ring size
const ringSegments = 32;

// Create hit area geometry
const hitAreaGeometry = new THREE.SphereGeometry(hitAreaSize, 8, 8);

// Create materials
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const hitAreaMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

// Function to create a radiating ring
function createRadiatingRing(position) {
  const ring = new THREE.Group();

  // Calculate elevated position
  const surfaceNormal = position.clone().normalize();
  const elevatedPosition = position
    .clone()
    .add(surfaceNormal.multiplyScalar(0.095));

  // Center dot using CircleGeometry for flat 2D look
  const centerGeometry = new THREE.CircleGeometry(pinHeadSize, 16);
  const centerPoint = new THREE.Mesh(centerGeometry, markerMaterial.clone());
  ring.add(centerPoint);

  // Single radiating ring
  const ringGeometry = new THREE.RingGeometry(
    ringRadius * 1.3,
    ringRadius,
    ringSegments
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

  // Add animation properties
  ringMesh.userData.initialScale = 0.1; // Start small again
  ringMesh.userData.maxScale = 2.0;
  ringMesh.userData.animationSpeed = 0.02;
  ringMesh.scale.set(
    ringMesh.userData.initialScale,
    ringMesh.userData.initialScale,
    ringMesh.userData.initialScale
  );

  ring.add(ringMesh);
  ring.position.copy(elevatedPosition);

  // Make the ring align with the surface of the Earth
  const lookAtPoint = position.clone();
  ring.lookAt(lookAtPoint);

  return ring;
}

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
      const surfacePosition = latLngToVector3(
        location.lat,
        location.lng,
        earth_radius
      );
      const pinPosition = latLngToVector3(
        location.lat,
        location.lng,
        earth_radius + pinHeight
      );

      // Create hit area (invisible larger sphere)
      const hitArea = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
      hitArea.position.copy(pinPosition);
      hitArea.userData = location;
      markers.push(hitArea);

      // Create radiating ring marker
      const ring = createRadiatingRing(pinPosition);
      ring.lookAt(surfacePosition);

      // Create pin line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        surfacePosition,
        pinPosition,
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const line = new THREE.Line(lineGeometry, lineMaterial);

      // Add all elements to earth group
      earthGroup.add(hitArea);
      earthGroup.add(ring);
      earthGroup.add(line);

      // Create label
      const textGeometry = new THREE.TextGeometry(location.name, textConfig);
      textGeometry.computeBoundingBox();
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Changed to white
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Position text above and slightly to the right of the pin
      const textOffset = 0.5; // Adjust this value to change text position
      const labelPosition = latLngToVector3(
        location.lat,
        location.lng,
        earth_radius + pinHeight + textOffset
      );
      textMesh.position.copy(labelPosition);

      // Make text billboard (always face camera)
      textMesh.onBeforeRender = function (renderer, scene, camera) {
        textMesh.quaternion.copy(camera.quaternion);
      };

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

// Add rotation toggle functionality
document.getElementById("rotateButton").addEventListener("click", () => {
  rotateObjects = !rotateObjects;
  document.getElementById("rotateButton").classList.toggle("rotating");
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (rotateObjects) {
    earthGroup.rotation.y += 0.0005;
    starSystem.rotation.y += 0.0002;
  }

  // Animate the radiating rings
  earthGroup.traverse((object) => {
    if (object.geometry instanceof THREE.RingGeometry) {
      const userData = object.userData;
      if (userData.initialScale !== undefined) {
        // Update scale
        object.scale.x += userData.animationSpeed;
        object.scale.y += userData.animationSpeed;
        object.scale.z += userData.animationSpeed;

        // Update opacity based on scale
        const progress =
          (object.scale.x - userData.initialScale) /
          (userData.maxScale - userData.initialScale);
        object.material.opacity = 1 * (1 - progress * 0.8); // Keep more opacity throughout animation

        // Reset when reaching max scale
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

    // Existing text billboard code
    if (
      object instanceof THREE.Mesh &&
      object.geometry instanceof THREE.TextGeometry
    ) {
      object.lookAt(camera.position);
      object.rotation.y += earthGroup.rotation.y;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
