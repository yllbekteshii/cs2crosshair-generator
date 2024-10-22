// This is the main entry point for the application

import { settings, settingsConfig } from './modules/settings.js';
import { updateUI, initializeUI } from './modules/ui.js';
import { updateCrosshair, updateMapDots } from './modules/background.js';
import { updateSliderBackground } from './utils.js';
import { encodeCrosshair, decodeCrosshairShareCode } from './modules/sharecode.js';

// Wait for the DOM to be fully loaded before initializing the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the user interface
  initializeUI();
  
  // Update the UI with current settings
  updateUI();
  
  // Draw the initial crosshair
  updateCrosshair();
  
  // Set up the map navigation dots
  updateMapDots();

  // Check for share code in URL and apply if present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("c")) {
    const shareCode = urlParams.get("c");
    try {
      const importedSettings = decodeCrosshairShareCode(shareCode);
      
      // Ensure color values are properly set
      if (importedSettings.color !== undefined) {
        const colorIndex = importedSettings.color;
        if (colorIndex === 5) {
          // Custom color, use the RGB values
          settings.red = importedSettings.red;
          settings.green = importedSettings.green;
          settings.blue = importedSettings.blue;
        } else {
          // Predefined color, set RGB based on the color index
          const predefinedColors = [
            [255, 0, 0],   // Red
            [0, 255, 0],   // Green
            [255, 255, 0], // Yellow
            [0, 0, 255],   // Blue
            [0, 255, 255], // Cyan
          ];
          if (colorIndex >= 0 && colorIndex < predefinedColors.length) {
            [settings.red, settings.green, settings.blue] = predefinedColors[colorIndex];
          }
        }
      }
      
      // Apply other settings
      Object.assign(settings, importedSettings);
      
      updateCrosshair();
      updateUI();
    } catch (error) {
      console.error("Invalid share code in URL", error);
    }
  }

  let animationFrameId;

  function animate() {
    updateCrosshair();
    animationFrameId = requestAnimationFrame(animate);
  }

  animate(); // Start the animation loop
});

// Add this function to handle sharing
export function shareCurrentSettings() {
  const shareCode = encodeCrosshair(settings);
  const url = new URL(window.location);
  url.searchParams.set("c", shareCode);
  history.pushState({}, "", url);
  return url.toString();
}
