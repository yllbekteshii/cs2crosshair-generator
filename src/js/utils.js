/**
 * Updates the background of a slider to reflect its current value
 * @param {HTMLInputElement} slider - The slider element to update
 */
export function updateSliderBackground(slider) {
  const min = parseFloat(slider.min);
  const max = parseFloat(slider.max);
  const value = parseFloat(slider.value);
  const percentage = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, #3460D8 0%, #3460D8 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
