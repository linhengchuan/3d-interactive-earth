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

    console.log("Showing popup for:", location); // Debug log
    this.panelContent.innerHTML = `
      <h2>${location.name}</h2>
      <p>${location.content}</p>
    `;
    this.popup.style.display = "block";
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
