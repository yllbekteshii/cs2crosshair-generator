// This module handles the settings for the crosshair generator

/**
 * Default settings for the crosshair
 */
export const settings = {
  style: 4,
  red: 0,
  green: 255,
  blue: 0,
  alpha: 200,
  thickness: 1,
  length: 5,
  gap: 3,
  outline: 0.5,
  outlineEnabled: false,
  centerDotEnabled: false,
  tStyleEnabled: false,
  followRecoil: false,
  fixedCrosshairGap: 0,
  innerSplitAlpha: 1,
  outerSplitAlpha: 0.5,
  splitSizeRatio: 1,
  splitDistance: 7,
  deployedWeaponGapEnabled: false,
  alphaEnabled: true,
  color: 1,
};

/**
 * Configuration for each setting, including min/max values and type
 */
export const settingsConfig = {
  style: ["style", 0, 5, "int"],
  red: ["red", 0, 255, "int"],
  green: ["green", 0, 255, "int"],
  blue: ["blue", 0, 255, "int"],
  alpha: ["alpha", 0, 255, "int"],
  thickness: ["thickness", 0, 3, "float"],
  length: ["length", 0, 15, "float"],
  gap: ["gap", -5, 5, "float"],
  outline: ["outline", 0, 3, "float"],
  outlineEnabled: ["outlineEnabled", 0, 1, "bool"],
  centerDotEnabled: ["centerDotEnabled", 0, 1, "bool"],
  tStyleEnabled: ["tStyleEnabled", 0, 1, "bool"],
  followRecoil: ["followRecoil", 0, 1, "bool"],
  fixedCrosshairGap: ["fixedCrosshairGap", -10, 10, "float"],
  innerSplitAlpha: ["innerSplitAlpha", 0, 1, "float"],
  outerSplitAlpha: ["outerSplitAlpha", 0, 1, "float"],
  splitSizeRatio: ["splitSizeRatio", 0, 1, "float"],
  splitDistance: ["splitDistance", 0, 16, "int"],
  deployedWeaponGapEnabled: ["deployedWeaponGapEnabled", 0, 1, "bool"],
  alphaEnabled: ["alphaEnabled", 0, 1, "bool"],
  color: ["color", 0, 7, "int"],
};

/**
 * Updates a specific setting with a new value
 * @param {string} setting - The setting to update
 * @param {*} value - The new value for the setting
 * @returns {boolean} - Whether the update was successful
 */
export function updateSettings(setting, value) {
  const config = settingsConfig[setting];
  if (config) {
    const [_, min, max, type] = config;
    if (type === "int") {
      value = Math.round(Math.max(min, Math.min(max, value)));
    } else if (type === "float") {
      if (setting === "gap") {
        value = Math.max(min, Math.min(max, Math.round(value * 10) / 10));
      } else {
        value = Math.max(min, Math.min(max, parseFloat(value.toFixed(1))));
      }
    } else if (type === "bool") {
      value = Boolean(value);
    }
    settings[setting] = value;
    return true;
  }
  return false;
}
