// This module handles the drawing of the crosshair

/**
 * Draws the crosshair on the canvas
 * @param {Object} config - The crosshair configuration
 * @param {HTMLCanvasElement} canvas - The canvas to draw on
 * @param {boolean} isDeployed - Whether the weapon is deployed
 * @returns {HTMLCanvasElement} - The canvas with the drawn crosshair
 */
export function drawCrosshair(config, canvas, isDeployed = false) {
  const ctx = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.save();
  ctx.translate(centerX, centerY);
//   ctx.scale(zoomFactor, zoomFactor);
  ctx.translate(-centerX, -centerY);

  ctx.strokeStyle = "#000";
  ctx.globalAlpha = 0.03;

  const outlines = { enabled: config.outlineEnabled, value: config.outline };
  const outlineThickness = Math.max(1, Math.floor(outlines.value));
  const outlineOffset = {
    xy: 0.5 * outlineThickness,
    wh: 1 * outlineThickness,
  };

  ctx.fillStyle = `rgb(${config.red}, ${config.green}, ${config.blue})`;
  ctx.lineWidth = outlineThickness;
  ctx.globalAlpha = (config.alphaEnabled ? config.alpha : 200) / 255;

  const thickness = Math.max(
    1,
    Math.floor((config.thickness + 0.2222) / 0.4444)
  );
  let length = Math.floor((config.length + 0.2222) / 0.4445);
  const startX = centerX - Math.floor(thickness / 2);
  const startY = centerY - Math.floor(thickness / 2);
  let gap =
    (config.gap < 0 ? -Math.floor(-config.gap) : Math.floor(config.gap)) + 4;

  if (config.style !== 2 || isDeployed) {
    gap =
      (config.gap < -4 ? -Math.floor(-config.gap) : Math.floor(config.gap)) +
      4;
    if (isDeployed && config.deployedWeaponGapEnabled) gap += 3;
  } else if (config.splitDistance < 3) {
    const splitLength = Math.ceil(length * (1 - config.splitSizeRatio));
    const originalAlpha = ctx.globalAlpha;
    length = Math.floor(length * config.splitSizeRatio);
    ctx.globalAlpha =
      originalAlpha * (1 - Math.pow(1 - config.outerSplitAlpha, 0.45));
    drawCrosshairPart(
      ctx,
      startX + thickness + gap + splitLength + 1,
      startY,
      length,
      thickness,
      outlineOffset,
      outlines
    );
    drawCrosshairPart(
      ctx,
      startX - gap - length - splitLength - 1,
      startY,
      length,
      thickness,
      outlineOffset,
      outlines
    );
    if (!config.tStyleEnabled)
      drawCrosshairPart(
        ctx,
        startX,
        startY - gap - length - splitLength - 1,
        thickness,
        length,
        outlineOffset,
        outlines
      );
    drawCrosshairPart(
      ctx,
      startX,
      startY + thickness + gap + splitLength + 1,
      thickness,
      length,
      outlineOffset,
      outlines
    );
    ctx.globalAlpha =
      originalAlpha * (1 - Math.pow(1 - config.innerSplitAlpha, 0.45));
    length = splitLength;
    gap += 2 * config.splitDistance - 4;
  } else {
    gap += 1;
  }

  drawCrosshairPart(
    ctx,
    startX + thickness + gap,
    startY,
    length,
    thickness,
    outlineOffset,
    outlines
  );
  drawCrosshairPart(
    ctx,
    startX - gap - length,
    startY,
    length,
    thickness,
    outlineOffset,
    outlines
  );
  if (!config.tStyleEnabled)
    drawCrosshairPart(
      ctx,
      startX,
      startY - gap - length,
      thickness,
      length,
      outlineOffset,
      outlines
    );
  drawCrosshairPart(
    ctx,
    startX,
    startY + thickness + gap,
    thickness,
    length,
    outlineOffset,
    outlines
  );
  if (config.centerDotEnabled)
    drawCrosshairPart(
      ctx,
      startX,
      startY,
      thickness,
      thickness,
      outlineOffset,
      outlines
    );

  ctx.restore();

  return canvas;
}

/**
 * Draws a part of the crosshair
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} x - The x coordinate
 * @param {number} y - The y coordinate
 * @param {number} width - The width of the part
 * @param {number} height - The height of the part
 * @param {Object} outlineOffset - The outline offset
 * @param {Object} outlines - The outline configuration
 */
export function drawCrosshairPart(ctx, x, y, width, height, outlineOffset, outlines) {
  ctx.fillRect(x, y, width, height);
  if (outlines.enabled && outlines.value !== 0) {
    if (outlines.value < 1) {
      ctx.beginPath();
      ctx.moveTo(x - outlineOffset.xy, y + height);
      ctx.lineTo(x - outlineOffset.xy, y - outlineOffset.xy);
      ctx.lineTo(x + width, y - outlineOffset.xy);
      ctx.stroke();
    } else {
      ctx.strokeRect(
        x - outlineOffset.xy,
        y - outlineOffset.xy,
        width + outlineOffset.wh,
        height + outlineOffset.wh
      );
    }
  }
}