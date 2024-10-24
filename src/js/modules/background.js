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
let loadedImages = [];
let animationFrameId = null;

/**
 * Preloads all background images
 * @returns {Promise} A promise that resolves when all images are loaded
 */
function preloadImages() {
  const loadingPromises = backgrounds.map((bg, index) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        loadedImages[index] = img;
        resolve();
      };
      img.onerror = reject;
      img.src = bg.url;
    });
  });

  return Promise.all(loadingPromises);
}

/**
 * Updates the crosshair preview with the current background and crosshair
 */
export function updateCrosshair() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  function animate() {
    const canvas = document.getElementById("crosshairPreview");
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    
    // Set the desired aspect ratio
    const aspectRatio = 970 / 300;
    
    // Get the container dimensions
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate the dimensions to maintain aspect ratio and fit within the container
    let width, height;
    if (containerWidth / containerHeight > aspectRatio) {
      height = containerHeight;
      width = height * aspectRatio;
    } else {
      width = containerWidth;
      height = width / aspectRatio;
    }

    // Update canvas attributes and style
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${Math.round(width)}px`;
    canvas.style.height = `${Math.round(height)}px`;
    
    // Center the canvas within its container
    canvas.style.position = 'absolute';
    canvas.style.left = `${Math.round((containerWidth - width) / 2)}px`;
    canvas.style.top = `${Math.round((containerHeight - height) / 2)}px`;

    // Scale the context to account for the device pixel ratio
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);

    drawCrosshair(settings, canvas);
    animationFrameId = requestAnimationFrame(animate);
  }
  
  animate();
}

export function stopCrosshairAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Updates the background image
 */
export function updateBackground() {
  const backgroundContainer = document.getElementById("backgroundContainer");
  if (loadedImages[currentBackgroundIndex]) {
    backgroundContainer.style.backgroundImage = `url(${loadedImages[currentBackgroundIndex].src})`;
  }
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
  const dots = dotsContainer.querySelectorAll('.map-dot');
  
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentBackgroundIndex);
    
    // Remove existing click event listeners to avoid duplicates
    dot.removeEventListener('click', dot.clickHandler);
    
    // Add new click event listener
    dot.clickHandler = () => {
      currentBackgroundIndex = index;
      updateBackground();
      updateMapDots();
    };
    dot.addEventListener('click', dot.clickHandler);
  });
}

// Export a function to force update the crosshair
export function forceUpdateCrosshair() {
  stopCrosshairAnimation(); // Stop any existing animation
  updateCrosshair(); // Start a new animation
}

// Initial setup
export function initializeBackgrounds() {
  updateMapDots();
  updateCrosshair();
  
  // Preload images
  preloadImages().then(() => {
    console.log('All background images loaded');
    updateBackground();
  }).catch(error => {
    console.error('Error loading background images:', error);
  });
}
