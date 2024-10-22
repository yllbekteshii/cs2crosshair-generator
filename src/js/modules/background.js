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
 * Preload background images
 */
const backgroundImages = backgrounds.map((bg) => {
  const img = new Image();
  img.src = bg.url;
  return img;
});

/**
 * Updates the crosshair preview with the current background and crosshair
 */
export const updateCrosshair = debounce(() => {
  const canvas = document.getElementById("crosshairPreview");
  const ctx = canvas.getContext("2d");
  canvas.width = 970;
  canvas.height = 300;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentImage = backgroundImages[currentBackgroundIndex];

  if (currentImage.complete) {
    drawBackground(ctx, currentImage, canvas);
    drawCrosshair(settings, canvas);
  } else {
    currentImage.onload = () => {
      drawBackground(ctx, currentImage, canvas);
      drawCrosshair(settings, canvas);
    };
  }
}, 16); // 60fps

/**
 * Draws the background image on the canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {HTMLImageElement} image - The background image to draw
 * @param {HTMLCanvasElement} canvas - The canvas element
 */
function drawBackground(ctx, image, canvas) {
  const scaleX = canvas.width / image.naturalWidth;
  const scaleY = canvas.height / image.naturalHeight;
  const scale = Math.max(scaleX, scaleY);

  const newWidth = image.naturalWidth * scale;
  const newHeight = image.naturalHeight * scale;

  const x = (canvas.width - newWidth) / 2;
  const y = (canvas.height - newHeight) / 2;

  ctx.drawImage(image, x, y, newWidth, newHeight);
}

/**
 * Switches to the next background
 */
export function nextBackground() {
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
  updateCrosshair();
  updateMapDots();
}

/**
 * Switches to the previous background
 */
export function prevBackground() {
  currentBackgroundIndex = (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
  updateCrosshair();
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
        updateCrosshair();
        updateMapDots();
      });
      dotsContainer.appendChild(dot);
    });
  }
  
  Array.from(dotsContainer.children).forEach((dot, index) => {
    dot.classList.toggle('active', index === currentBackgroundIndex);
  });
}
