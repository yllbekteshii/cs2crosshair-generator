(() => {
  "use strict";

  const canvas = document.getElementById("crosshairPreview");
  const ctx = canvas.getContext("2d");

  canvas.width = 970;
  canvas.height = 300;

  const settings = {
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

  const settingsConfig = {
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

  const backgrounds = [
    { name: "Ancient", url: "/maps/ancient.png" },
    { name: "Mirage", url: "/maps/mirage.png" },
    { name: "Inferno", url: "/maps/inferno.png" },
    { name: "Nuke", url: "/maps/nuke.png" },
    { name: "Overpass", url: "/maps/overpass.png" },
  ];

  let currentBackgroundIndex = 0;
  const backgroundImages = backgrounds.map((bg) => {
    const img = new Image();
    img.src = bg.url;
    img.onerror = () => {};
    return img;
  });

  let zoomFactor = 1;

  let crosshairStyle = 2; // Default to Classic Static

  function updateCrosshair() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentImage = backgroundImages[currentBackgroundIndex];

    if (currentImage.complete) {
      // Calculate scaling factors
      const scaleX = canvas.width / currentImage.naturalWidth;
      const scaleY = canvas.height / currentImage.naturalHeight;
      const scale = Math.max(scaleX, scaleY);

      // Calculate new dimensions
      const newWidth = currentImage.naturalWidth * scale;
      const newHeight = currentImage.naturalHeight * scale;

      // Calculate positioning to center the image
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;

      // Draw the image
      ctx.drawImage(currentImage, x, y, newWidth, newHeight);
      drawCrosshair(settings, canvas);
    } else {
      currentImage.onload = () => {
        // Calculate scaling factors
        const scaleX = canvas.width / currentImage.naturalWidth;
        const scaleY = canvas.height / currentImage.naturalHeight;
        const scale = Math.max(scaleX, scaleY);

        // Calculate new dimensions
        const newWidth = currentImage.naturalWidth * scale;
        const newHeight = currentImage.naturalHeight * scale;

        // Calculate positioning to center the image
        const x = (canvas.width - newWidth) / 2;
        const y = (canvas.height - newHeight) / 2;

        // Draw the image
        ctx.drawImage(currentImage, x, y, newWidth, newHeight);
        drawCrosshair(settings, canvas);
      };
    }
  }

  function drawCrosshair(config, canvas, isDeployed = false) {
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-centerX, -centerY);

    ctx.strokeStyle = "#000";
    ctx.globalAlpha = 0.03;
    ctx.strokeText("cscdb.net", 0, canvas.height);

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

  function drawCrosshairPart(
    ctx,
    x,
    y,
    width,
    height,
    outlineOffset,
    outlines
  ) {
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

  function updateSettings(setting, value) {
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
      updateCrosshair();
      updateUI();
    }
  }

  function updateUI() {
    for (const [key, config] of Object.entries(settingsConfig)) {
      const element = document.getElementById(key);
      const valueDisplay = document.getElementById(`${key}Value`);
      if (element) {
        const value = settings[key];
        if (element.type === "checkbox") {
          element.checked = value;
        } else if (
          element.type === "range" ||
          element.type === "crosshair-style"
        ) {
          element.value = value;
          if (valueDisplay) {
            valueDisplay.textContent = value;
            valueDisplay.contentEditable = true;
            valueDisplay.addEventListener("blur", () => {
              const newValue = parseFloat(valueDisplay.textContent);
              if (!isNaN(newValue)) {
                updateSettings(key, newValue);
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
    const alphaInput = document.getElementById("alpha");
    // if (alphaInput) {
    //     alphaInput.style.display = settings.alphaEnabled ? 'block' : 'none';
    // }
  }

  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", (e) => {
      const setting = e.target.id.replace("Number", "");
      let value;
      if (e.target.type === "checkbox") {
        value = e.target.checked;
      } else if (e.target.type === "number" || e.target.type === "range") {
        value = parseFloat(e.target.value);
      } else if (e.target.type === "select-one") {
        value = parseInt(e.target.value);
      }
      updateSettings(setting, value);
    });
  });

  document.getElementById("copyButton").addEventListener("click", () => {
    const shareCode = encodeCrosshair(settings);
    navigator.clipboard.writeText(shareCode);
    alert("Share code copied to clipboard!");
  });

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

  document.getElementById("randomizeButton").addEventListener("click", () => {
    for (const [key, config] of Object.entries(settingsConfig)) {
      let value;
      if (config[3] === "bool") {
        value = Math.random() < 0.5;
      } else if (config[3] === "int") {
        value = Math.floor(
          config[1] + Math.random() * (config[2] - config[1] + 1)
        );
      } else {
        value = config[1] + Math.random() * (config[2] - config[1]);
        value = parseFloat(value.toFixed(1));
      }
      updateSettings(key, value);
    }
  });

  document.getElementById("shareButton").addEventListener("click", () => {
    const shareCode = encodeCrosshair(settings);
    const url = new URL(window.location);
    url.searchParams.set("c", shareCode);
    history.pushState({}, "", url);
    alert("URL updated with share code!");
  });

  function nextBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
    updateCrosshair();
  }
  function prevBackground() {
    currentBackgroundIndex =
      (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
    updateCrosshair();
  }
  document
    .getElementById("nextBackground")
    .addEventListener("click", nextBackground);
  document
    .getElementById("prevBackground")
    .addEventListener("click", prevBackground);

  updateUI();
  updateCrosshair();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("c")) {
    const shareCode = urlParams.get("c");
    try {
      const importedSettings = decodeCrosshairShareCode(shareCode);
      Object.assign(settings, importedSettings);
      updateCrosshair();
      updateUI();
    } catch (error) {
      // Invalid share code in URL, ignore
    }
  }

  function preloadImages() {
    backgrounds.forEach((bg, index) => {
      backgroundImages[index] = new Image();
      backgroundImages[index].src = bg.url;
    });
  }

  preloadImages();
  updateUI();
  updateCrosshair();

  document.getElementById("alphaEnabled").addEventListener("change", (e) => {
    updateSettings("alphaEnabled", e.target.checked);
  });

  function updateZoom(newZoomFactor) {
    zoomFactor = newZoomFactor;
    updateCrosshair();
  }

  document.getElementById("zoomSlider").addEventListener("input", (e) => {
    const newZoom = parseFloat(e.target.value);
    updateZoom(newZoom);
    document.getElementById("zoomSliderValue").textContent = newZoom.toFixed(1);
  });

  document.getElementById("zoomSliderValue").addEventListener("blur", (e) => {
    const newZoom = parseFloat(e.target.textContent);
    if (!isNaN(newZoom) && newZoom >= 1 && newZoom <= 4) {
      updateZoom(newZoom);
      document.getElementById("zoomSlider").value = newZoom;
    } else {
      e.target.textContent = zoomFactor.toFixed(1);
    }
  });

  document
    .getElementById("zoomSliderValue")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });

  document.getElementById("crosshairStyle").value = crosshairStyle;

  document
    .getElementById("crosshairStyle")
    .addEventListener("change", function () {
      crosshairStyle = parseInt(this.value);
      updateCrosshair();
    });

  updateCrosshair();
})();