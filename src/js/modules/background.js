// This module handles the background management for the crosshair preview

import { drawCrosshair } from './crosshair.js';
import { settings } from './settings.js';
import { debounce } from '../utils.js';

/**
 * Array of available background maps
 */
export const backgrounds = [
  { name: "Ancient", url: "/maps/ancient.png" },
  { name: "Mirage", url: "/maps/mirage.png" },
  { name: "Inferno", url: "/maps/inferno.png" },
  { name: "Nuke", url: "/maps/nuke.png" },
  { name: "Overpass", url: "/maps/overpass.png" },
];

export let currentBackgroundIndex = 0;

/**
 * Updates the crosshair preview with the current background and crosshair
 */
export const updateCrosshair = debounce(() => {
  const canvas = document.getElementById("crosshairPreview");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCrosshair(settings, canvas);
}, 16); // 60fps

/**
 * Updates the background image
 */
export function updateBackground() {
  const backgroundContainer = document.getElementById("backgroundContainer");
  const currentBackground = backgrounds[currentBackgroundIndex];
  backgroundContainer.style.backgroundImage = `url(${currentBackground.url})`;
}

/**
 * Switches to the next background
 */
export function nextBackground() {
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
  updateBackground();
  updateMapDots();
}

/**
 * Switches to the previous background
 */
export function prevBackground() {
  currentBackgroundIndex = (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
  updateBackground();
  updateMapDots();
}

/**
 * Updates the map navigation dots
 */
export function updateMapDots() {
  const dotsContainer = document.getElementById('mapDots');
  if (dotsContainer.children.length !== backgrounds.length) {
    dotsContainer.innerHTML = '';
    backgrounds.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('map-dot');
      dot.addEventListener('click', () => {
        currentBackgroundIndex = index;
        updateBackground();
        updateMapDots();
      });
      dotsContainer.appendChild(dot);
    });
  }
  
  Array.from(dotsContainer.children).forEach((dot, index) => {
    dot.classList.toggle('active', index === currentBackgroundIndex);
  });
}

// Export a function to force update the crosshair
export function forceUpdateCrosshair() {
  updateCrosshair.flush(); // Immediately execute any pending debounced calls
  updateCrosshair(); // Call updateCrosshair again to ensure it runs
}

// Initial setup
updateBackground();
updateMapDots();
updateCrosshair();
