// This is the main entry point for the application

import { settings, settingsConfig, updateSettings } from './modules/settings.js';
import { updateUI, initializeUI } from './modules/ui.js';
import { updateCrosshair, updateMapDots, forceUpdateCrosshair, initializeBackgrounds } from './modules/background.js';
import { updateSliderBackground } from './utils.js';
import { encodeCrosshair, decodeCrosshairShareCode } from './modules/sharecode.js';
import { debounce } from './utils.js';
import { players, initializePlayerSearch } from './modules/players.js';

// Wait for the DOM to be fully loaded before initializing the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the user interface
  initializeUI();
  
  // Update the UI with current settings
  updateUI();
  
  // Initialize backgrounds (this will preload images)
  initializeBackgrounds();

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
      
      forceUpdateCrosshair();
      updateUI();
    } catch (error) {
      console.error("Invalid share code in URL", error);
    }
  }

  // Set up paste functionality
  document.getElementById('pasteButton').addEventListener('click', () => {
    navigator.clipboard.readText().then(text => {
      try {
        const pastedSettings = JSON.parse(text);
        Object.keys(pastedSettings).forEach(key => {
          updateSettings(key, pastedSettings[key]);
        });
        forceUpdateCrosshair(); // Force an immediate update of the crosshair
        updateUI(); // Update the UI to reflect the new settings
      } catch (error) {
        console.error('Failed to parse pasted crosshair settings:', error);
        // Optionally show an error message to the user
      }
    }).catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  });

  // Add resize event listener
  window.addEventListener('resize', debounce(() => {
    forceUpdateCrosshair();
  }, 250));

  initializePlayerSearch();
});

// Add this function to handle sharing
export function shareCurrentSettings() {
  const shareCode = encodeCrosshair(settings);
  const url = new URL(window.location);
  url.searchParams.set("c", shareCode);
  history.pushState({}, "", url);
  return url.toString();
}
