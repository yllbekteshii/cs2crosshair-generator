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
  img.onerror = () => console.error(`Failed to load image: ${bg.url}`);
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

  if (currentImage.complete && currentImage.naturalWidth !== 0) {
    try {
      drawBackground(ctx, currentImage, canvas);
    } catch (error) {
      console.error("Error drawing background:", error);
      // Draw a fallback background or leave it blank
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawCrosshair(settings, canvas);
  } else {
    currentImage.onload = () => {
      try {
        drawBackground(ctx, currentImage, canvas);
      } catch (error) {
        console.error("Error drawing background:", error);
        // Draw a fallback background or leave it blank
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      drawCrosshair(settings, canvas);
    };
    currentImage.onerror = () => {
      console.error(`Failed to load image: ${backgrounds[currentBackgroundIndex].url}`);
      // Draw a fallback background or leave it blank
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  if (image.complete && image.naturalWidth !== 0) {
    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;
    const scale = Math.max(scaleX, scaleY);

    const newWidth = image.naturalWidth * scale;
    const newHeight = image.naturalHeight * scale;

    const x = (canvas.width - newWidth) / 2;
    const y = (canvas.height - newHeight) / 2;

    ctx.drawImage(image, x, y, newWidth, newHeight);
  } else {
    throw new Error("Image not fully loaded or broken");
  }
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
