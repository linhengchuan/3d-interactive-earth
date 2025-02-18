import { locations } from "../data/locations.js";

export class UI {
  constructor() {
    this.popup = document.getElementById("popup");
    this.panelContent = document.getElementById("panelContent");
    this.refreshButton = document.getElementById("refreshButton");
    this.rotateButton = document.getElementById("rotateButton");

    if (!this.popup || !this.panelContent) {
      console.error(
        "UI elements not found! Make sure popup and panelContent exist in HTML"
      );
      return;
    }

    // Setup close button
    const closeButton = document.getElementById("closePanel");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.hidePopup());
    }

    // Add click event listener for clicking outside
    document.addEventListener("click", (event) => {
      if (this.popup && this.popup.style.display === "block") {
        // Check if click is outside the popup
        if (!this.popup.contains(event.target)) {
          this.hidePopup();
        }
      }
    });

    // Initialize callbacks
    this.refreshCallback = null;
    this.rotateToggleCallback = null;

    // Setup refresh and rotate buttons
    if (this.refreshButton) {
      this.refreshButton.addEventListener("click", () => {
        if (this.refreshCallback) this.refreshCallback();
      });
    }

    if (this.rotateButton) {
      this.rotateButton.addEventListener("click", () => {
        if (this.rotateToggleCallback) {
          this.rotateToggleCallback();
          this.rotateButton.classList.toggle("rotating");
        }
      });
    }
  }

  showPopup(location) {
    if (!this.popup || !this.panelContent) return;

    console.log("Showing popup for:", location);

    // Create content with interactive map
    const content = `
      <div class="popup-header">
        <h2>${location.name}</h2>
      </div>
      <div class="popup-content">
        <div class="country-map" id="countryMapContainer">
          <div class="map-markers">
            ${this.createMapMarkers(location)}
          </div>
          ${
            location.mapUrl
              ? `<img src="${location.mapUrl}" alt="Map of ${location.name}" onerror="this.onerror=null; this.src='./assets/maps/contour-fallback.png';">`
              : `<img src="./assets/maps/contour-fallback.png" alt="Contour map of ${location.name}">`
          }
        </div>
        <div class="location-description">
          <p>${location.content}</p>
        </div>
      </div>
    `;

    this.panelContent.innerHTML = content;
    this.popup.style.display = "block";

    // Add click handlers for markers after content is added
    this.setupMapMarkerListeners();
  }

  createMapMarkers(location) {
    // Check if location has markers
    if (!location.mapMarkers) return "";

    return location.mapMarkers
      .map(
        (marker) => `
      <div class="map-marker" 
           style="left: ${marker.x}%; top: ${marker.y}%;"
           data-marker-id="${marker.id}"
           title="${marker.name}">
        <div class="marker-dot"></div>
        <div class="marker-pulse"></div>
      </div>
    `
      )
      .join("");
  }

  setupMapMarkerListeners() {
    const markers = document.querySelectorAll(".map-marker");
    markers.forEach((marker) => {
      marker.addEventListener("click", (e) => {
        e.stopPropagation();
        const markerId = marker.dataset.markerId;
        this.showNestedPopup(markerId);
      });
    });
  }

  showNestedPopup(markerId) {
    // Create nested popup
    const nestedPopup = document.createElement("div");
    nestedPopup.className = "nested-popup";

    // Find marker data
    const markerData = this.findMarkerData(markerId);

    if (markerData) {
      nestedPopup.innerHTML = `
        <div class="nested-popup-content">
          <button class="close-nested-popup">&times;</button>
          <h3>${markerData.name}</h3>
          <p>${markerData.description}</p>
        </div>
      `;

      document.body.appendChild(nestedPopup);

      // Add close button listener
      const closeButton = nestedPopup.querySelector(".close-nested-popup");
      closeButton.addEventListener("click", () => {
        nestedPopup.remove();
      });

      // Add click-outside listener
      document.addEventListener("click", (event) => {
        if (
          !nestedPopup
            .querySelector(".nested-popup-content")
            .contains(event.target) &&
          !event.target.closest(".map-marker")
        ) {
          nestedPopup.remove();
        }
      });
    }
  }

  findMarkerData(markerId) {
    // Debug logs
    console.log("Looking for marker:", markerId);

    // Look through the current location's markers
    const currentLocation = this.panelContent.querySelector("h2").textContent;
    const locationData = locations.find((loc) => loc.name === currentLocation);

    console.log("Current location:", currentLocation);
    console.log("Location data:", locationData);

    if (locationData && locationData.mapMarkers) {
      const marker = locationData.mapMarkers.find((m) => m.id === markerId);
      if (marker) {
        return {
          name: marker.name,
          description: marker.description,
        };
      }
    }

    // Fallback if marker not found
    return {
      name: "Location not found",
      description: "No description available",
    };
  }

  hidePopup() {
    if (!this.popup) return;
    this.popup.style.display = "none";
  }

  setRefreshCallback(callback) {
    this.refreshCallback = callback;
  }

  setRotateToggleCallback(callback) {
    this.rotateToggleCallback = callback;
  }
}

// Add these styles to your CSS
const styles = document.createElement("style");
styles.textContent = `
  #popup {
    position: fixed;
    right: 20px;
    top: 20px;
    bottom: 20px;
    width: 70%;
    min-width: 400px;
    max-width: 1200px;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    padding: 20px;
    color: white;
    display: none;
    backdrop-filter: blur(10px);
    z-index: 1000;
    overflow-y: auto;
  }

  .popup-header {
    margin-bottom: 20px;
  }

  .popup-header h2 {
    margin: 0;
    font-size: 24px;
  }

  .popup-content {
    height: calc(100% - 60px);
    overflow-y: auto;
  }

  .country-map {
    position: relative;
    width: 100%;
    margin: 0 0 20px 0;
    text-align: center;
  }

  .country-map img {
    width: 100%;
    height: auto;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  .map-markers {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .map-marker {
    position: absolute;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .marker-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #ff4444;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .marker-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    background: rgba(255, 68, 68, 0.4);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 1.5s infinite;
  }

  .nested-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    padding: 20px;
    border-radius: 8px;
    z-index: 1100;
    color: white;
    max-width: 400px;
    backdrop-filter: blur(10px);
  }

  .nested-popup-content {
    position: relative;
    padding: 20px;
  }

  .close-nested-popup {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  #closePanel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
    z-index: 1001;
  }

  #closePanel:hover {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    #popup {
      width: 80%;
      min-width: 300px;
      right: 10px;
      top: 10px;
      bottom: 10px;
    }
  }
`;

document.head.appendChild(styles);
