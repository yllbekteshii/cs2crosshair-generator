(() => {
    "use strict";

    const canvas = document.getElementById('crosshairPreview');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

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
        color: 1
    };

    const settingsConfig = {
        style: ["style", 0, 5, "int"],
        red: ["red", 0, 255, "int"],
        green: ["green", 0, 255, "int"],
        blue: ["blue", 0, 255, "int"],
        alpha: ["alpha", 0, 255, "int"],
        thickness: ["thickness", 0, 3, "float"],
        length: ["length", 0, 15, "float"],
        gap: ["gap", -10, 10, "float"],
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
        color: ["color", 0, 7, "int"]
    };

    const backgrounds = [
        { name: "Dust2", url: "https://totalcsgo.com/assets/crosshair-generator/backgrounds/small/dust2-a.png" },
        { name: "Mirage", url: "https://totalcsgo.com/image/cache/catalog/crosshair-generator/backgrounds/mirage-a-site-1280x720.jpg" },
        { name: "Inferno", url: "https://totalcsgo.com/image/cache/catalog/crosshair-generator/backgrounds/inferno-a-site-1280x720.jpg" },
        { name: "Nuke", url: "https://totalcsgo.com/image/cache/catalog/crosshair-generator/backgrounds/nuke-outside-1280x720.jpg" },
        { name: "Overpass", url: "https://totalcsgo.com/image/cache/catalog/crosshair-generator/backgrounds/overpass-b-site-1280x720.jpg" }
    ];

    let currentBackgroundIndex = 0;
    const backgroundImages = backgrounds.map(bg => {
        const img = new Image();
        img.src = bg.url;
        return img;
    });

    function updateCrosshair() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (backgroundImages[currentBackgroundIndex].complete) {
            ctx.drawImage(backgroundImages[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);
            drawCrosshair(settings, ctx, canvas.width / 2, canvas.height / 2);
        } else {
            backgroundImages[currentBackgroundIndex].onload = () => {
                ctx.drawImage(backgroundImages[currentBackgroundIndex], 0, 0, canvas.width, canvas.height);
                drawCrosshair(settings, ctx, canvas.width / 2, canvas.height / 2);
            };
        }
        
        drawCrosshair(settings, ctx, canvas.width / 2, canvas.height / 2);
    }

    function drawCrosshair(settings, ctx, centerX, centerY) {
        const color = `rgba(${settings.red}, ${settings.green}, ${settings.blue}, ${settings.alpha / 255})`;

        const length = Math.max(0, Math.min(settings.length * 2, 30));
        const thickness = Math.max(1, Math.min(Math.round(settings.thickness * 2), 6));
        const gap = Math.max(-20, Math.min(settings.gap * 2, 20));
        const outline = settings.outlineEnabled ? Math.max(0, Math.min(settings.outline, 3)) : 0;

        ctx.save();
        ctx.translate(centerX, centerY);

        if (outline > 0) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = thickness + outline * 2;
            drawCrosshairLines(ctx, length, gap, thickness + outline * 2, settings.tStyleEnabled);
        }

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = thickness;
        drawCrosshairLines(ctx, length, gap, thickness, settings.tStyleEnabled);

        if (settings.centerDotEnabled) {
            const dotSize = Math.max(thickness, 2);
            ctx.beginPath();
            ctx.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        if (settings.style === 2 || settings.style === 3 || settings.style === 5) {
            drawDynamicCrosshair(settings, ctx, centerX, centerY, length, gap, thickness);
        }
    }

    function drawCrosshairLines(ctx, length, gap, thickness, tStyle) {
        const halfThickness = thickness / 2;

        // Top
        ctx.beginPath();
        ctx.moveTo(-halfThickness, -gap);
        ctx.lineTo(-halfThickness, -gap - length);
        ctx.lineTo(halfThickness, -gap - length);
        ctx.lineTo(halfThickness, -gap);
        ctx.stroke();

        // Right
        ctx.beginPath();
        ctx.moveTo(gap, -halfThickness);
        ctx.lineTo(gap + length, -halfThickness);
        ctx.lineTo(gap + length, halfThickness);
        ctx.lineTo(gap, halfThickness);
        ctx.stroke();

        // Bottom
        ctx.beginPath();
        ctx.moveTo(-halfThickness, gap);
        ctx.lineTo(-halfThickness, gap + length);
        ctx.lineTo(halfThickness, gap + length);
        ctx.lineTo(halfThickness, gap);
        ctx.stroke();

        // Left
        ctx.beginPath();
        ctx.moveTo(-gap, -halfThickness);
        ctx.lineTo(-gap - length, -halfThickness);
        ctx.lineTo(-gap - length, halfThickness);
        ctx.lineTo(-gap, halfThickness);
        ctx.stroke();

        if (tStyle) {
            ctx.beginPath();
            ctx.moveTo(-length, -halfThickness);
            ctx.lineTo(length, -halfThickness);
            ctx.lineTo(length, halfThickness);
            ctx.lineTo(-length, halfThickness);
            ctx.stroke();
        }
    }

    function drawDynamicCrosshair(settings, ctx, centerX, centerY, length, gap, thickness) {
        const splitDist = Math.min(settings.splitDistance * 2, 32);
        const innerAlpha = ctx.globalAlpha * settings.innerSplitAlpha;
        const outerAlpha = ctx.globalAlpha * settings.outerSplitAlpha;

        ctx.globalAlpha = innerAlpha;
        drawCrosshairLines(ctx, length, gap, thickness, settings.tStyleEnabled);

        ctx.globalAlpha = outerAlpha;
        drawCrosshairLines(ctx, length * settings.splitSizeRatio, gap + splitDist, thickness, settings.tStyleEnabled);

        ctx.globalAlpha = 1;
    }

    function updateSettings(setting, value) {
        const config = settingsConfig[setting];
        if (config) {
            const [_, min, max, type] = config;
            if (type === "int") {
                value = Math.round(Math.max(min, Math.min(max, value)));
            } else if (type === "float") {
                value = Math.max(min, Math.min(max, parseFloat(value.toFixed(1))));
            } else if (type === "bool") {
                value = Boolean(value);
            }
            settings[setting] = value;
            updateCrosshair(); // Ensure crosshair is updated
            updateUI();
        }
    }

    function updateUI() {
        for (const [key, config] of Object.entries(settingsConfig)) {
            const element = document.getElementById(key);
            if (element) {
                const value = settings[key];
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range' || element.type === 'crosshair-style') {
                    element.value = value;
                    const valueDisplay = document.getElementById(`${key}Value`);
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                }
            }
        }
    }

    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', (e) => {
            const setting = e.target.id;
            let value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'crosshair-style' ? parseInt(e.target.value) : parseFloat(e.target.value);
            updateSettings(setting, value);
        });
    });

    document.getElementById('copyButton').addEventListener('click', () => {
        const shareCode = encodeCrosshair(settings);
        navigator.clipboard.writeText(shareCode);
        alert('Share code copied to clipboard!');
    });

    document.getElementById('pasteButton').addEventListener('click', () => {
        navigator.clipboard.readText().then(text => {
            try {
                const importedSettings = decodeCrosshairShareCode(text.trim());
                Object.assign(settings, importedSettings);
                updateCrosshair();
                updateUI();
            } catch (error) {
                alert('Invalid share code');
            }
        });
    });

    document.getElementById('randomizeButton').addEventListener('click', () => {
        for (const [key, config] of Object.entries(settingsConfig)) {
            let value;
            if (config[3] === 'bool') {
                value = Math.random() < 0.5;
            } else if (config[3] === 'int') {
                value = Math.floor(config[1] + Math.random() * (config[2] - config[1] + 1));
            } else {
                value = config[1] + Math.random() * (config[2] - config[1]);
                value = parseFloat(value.toFixed(1));
            }
            updateSettings(key, value);
        }
    });

    document.getElementById('shareButton').addEventListener('click', () => {
        const shareCode = encodeCrosshair(settings);
        const url = new URL(window.location);
        url.searchParams.set('c', shareCode);
        history.pushState({}, '', url);
        alert('URL updated with share code!');
    });

    function nextBackground() {
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
        updateCrosshair();
    }

    function prevBackground() {
        currentBackgroundIndex = (currentBackgroundIndex - 1 + backgrounds.length) % backgrounds.length;
        updateCrosshair();
    }

    document.getElementById('nextBackground').addEventListener('click', nextBackground);
    document.getElementById('prevBackground').addEventListener('click', prevBackground);

    updateUI();
    updateCrosshair();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('c')) {
        const shareCode = urlParams.get('c');
        console.log('Share code from URL:', shareCode);
        try {
            const importedSettings = decodeCrosshairShareCode(shareCode);
            Object.assign(settings, importedSettings);
            updateCrosshair();
            updateUI();
        } catch (error) {
            console.error('Invalid share code in URL', error);
        }
    }

    function preloadImages() {
        backgrounds.forEach((bg, index) => {
            backgroundImages[index] = new Image();
            backgroundImages[index].src = bg.url;
        });
    }

    preloadImages();
})();

