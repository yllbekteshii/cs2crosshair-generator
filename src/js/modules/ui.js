// This module handles the user interface interactions

import { settings, settingsConfig, updateSettings } from './settings.js';
import { updateCrosshair, nextBackground, prevBackground, updateMapDots, stopCrosshairAnimation } from './background.js';
import { updateSliderBackground } from '../utils.js';
import { encodeCrosshair, decodeCrosshairShareCode } from './sharecode.js';
import { shareCurrentSettings } from '../main.js';
import { debounce } from '../utils.js';

/**
 * Updates the UI elements to reflect current settings
 */
export function updateUI() {
  for (const [key, config] of Object.entries(settingsConfig)) {
    const element = document.getElementById(key);
    const valueDisplay = document.getElementById(`${key}Value`);
    if (element) {
      const value = settings[key];
      if (element.type === "checkbox") {
        element.checked = value;
      } else if (element.type === "range" || element.type === "crosshair-style") {
        element.value = value;
        updateSliderBackground(element); // Update slider background
        if (valueDisplay) {
          valueDisplay.textContent = value;
          valueDisplay.contentEditable = true;
          
          valueDisplay.addEventListener("input", () => {
            const [_, min, max, type] = config;
            let currentValue = valueDisplay.textContent;
            
            currentValue = currentValue.replace(/[^\d.-]/g, '');
            
            let numValue = parseFloat(currentValue);
            if (!isNaN(numValue)) {
              numValue = Math.max(min, Math.min(max, numValue));
              valueDisplay.textContent = numValue;
              element.value = numValue; // Update slider value
              updateSliderBackground(element); // Update slider background
              
              const range = document.createRange();
              const sel = window.getSelection();
              range.setStart(valueDisplay.childNodes[0], valueDisplay.textContent.length);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          });

          valueDisplay.addEventListener("blur", () => {
            const newValue = parseFloat(valueDisplay.textContent);
            if (!isNaN(newValue)) {
              updateSettings(key, newValue);
              element.value = newValue; // Update slider value
              updateSliderBackground(element); // Update slider background
              updateCrosshair();
            } else {
              valueDisplay.textContent = value;
            }
          });

          valueDisplay.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              valueDisplay.blur();
            }
          });
        }
      }
    }
  }
}

/**
 * Initializes all UI elements and sets up event listeners
 */
export function initializeUI() {
  const inputHandler = (e) => {
    const setting = e.target.id.replace("Number", "");
    let value;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    } else if (e.target.type === "number" || e.target.type === "range") {
      value = parseFloat(e.target.value);
    } else if (e.target.type === "select-one") {
      value = parseInt(e.target.value);
    }
    if (updateSettings(setting, value)) {
      updateCrosshair(); // This now starts the animation loop
      updateUI();
    }
  };

  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", inputHandler, { passive: true });
    input.addEventListener("change", stopCrosshairAnimation); // Stop animation when input changes end
  });

  // Set up "Copy" button functionality
  document.getElementById("copyButton").addEventListener("click", () => {
    const shareCode = encodeCrosshair(settings);
    navigator.clipboard.writeText(shareCode);
    alert("Share code copied to clipboard!");
  });

  // Set up "Paste" button functionality
  document.getElementById("pasteButton").addEventListener("click", () => {
    navigator.clipboard.readText().then((text) => {
      try {
        const importedSettings = decodeCrosshairShareCode(text.trim());
        Object.assign(settings, importedSettings);
        updateCrosshair();
        updateUI();
      } catch (error) {
        alert("Invalid share code");
      }
    });
  });

  // Set up "Randomize" button functionality
  document.getElementById("randomizeButton").addEventListener("click", () => {
    for (const [key, config] of Object.entries(settingsConfig)) {
      let value;
      if (config[3] === "bool") {
        value = Math.random() < 0.5;
      } else if (config[3] === "int") {
        value = Math.floor(config[1] + Math.random() * (config[2] - config[1] + 1));
      } else {
        value = config[1] + Math.random() * (config[2] - config[1]);
        value = parseFloat(value.toFixed(1));
      }
      updateSettings(key, value);
    }
    updateCrosshair();
    updateUI();
  });

  // Update the "Share" button functionality
  document.getElementById("shareButton").addEventListener("click", () => {
    const shareUrl = shareCurrentSettings();
    navigator.clipboard.writeText(shareUrl);
    alert("Share URL copied to clipboard!");
  });

  // Set up background navigation buttons
  document.getElementById("nextBackground").addEventListener("click", nextBackground);
  document.getElementById("prevBackground").addEventListener("click", prevBackground);

  // Initialize slider backgrounds
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    updateSliderBackground(slider);
    slider.addEventListener('input', function() {
      updateSliderBackground(this);
    });
  });
}
