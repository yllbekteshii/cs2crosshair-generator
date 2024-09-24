const DICTIONARY = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789';
const DICTIONARY_LENGTH = BigInt(DICTIONARY.length);
const SHARECODE_PATTERN = /^CSGO(-?[\w]{5}){5}$/;

// Helper Functions
function uint8ToInt8(number) {
    return (number << 24) >> 24;
}

function sumArray(array) {
    return array.reduce((previousValue, value) => previousValue + value, 0);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Converts Share Code to Bytes
function shareCodeToBytes(shareCode) {
    if (!shareCode.match(SHARECODE_PATTERN)) {
        throw new Error('Invalid share code');
    }

    shareCode = shareCode.replace(/CSGO|-/g, '');
    const chars = Array.from(shareCode).reverse();
    let big = 0n;

    for (let i = 0; i < chars.length; i++) {
        big = big * DICTIONARY_LENGTH + BigInt(DICTIONARY.indexOf(chars[i]));
    }

    const bytes = new Uint8Array(18);
    for (let i = 17; i >= 0; i--) {
        bytes[i] = Number(big & 255n);
        big >>= 8n;
    }

    if (bytes.length !== 18) {
        throw new Error('Invalid byte length for crosshair code');
    }

    return bytes;
}

// Converts Bytes to Share Code
function bytesToShareCode(bytes) {
    let value = 0n;
    for (let i = 0; i < bytes.length; i++) {
        value = value * 256n + BigInt(bytes[i]);
    }

    let result = '';
    while (value > 0n) {
        const index = Number(value % DICTIONARY_LENGTH);
        result = DICTIONARY[index] + result;
        value /= DICTIONARY_LENGTH;
    }

    while (result.length < 25) {
        result = 'A' + result;
    }

    return `CSGO-${result.slice(0, 5)}-${result.slice(5, 10)}-${result.slice(10, 15)}-${result.slice(15, 20)}-${result.slice(20, 25)}`;
}

// Decoding Functions
function decodeColor(bytes) {
    return {
        red: clamp(bytes[4], 0, 255),
        green: clamp(bytes[5], 0, 255),
        blue: clamp(bytes[6], 0, 255),
        alpha: clamp(bytes[7], 0, 255),
    };
}

function decodeStyle(bytes) {
    return {
        style: (bytes[13] & 0xf) >> 1,
        centerDotEnabled: ((bytes[13] >> 4) & 1) === 1,
        deployedWeaponGapEnabled: ((bytes[13] >> 4) & 2) === 2,
        alphaEnabled: ((bytes[13] >> 4) & 4) === 4,
        tStyleEnabled: ((bytes[13] >> 4) & 8) === 8,
    };
}

function decodeCrosshairShareCode(shareCode) {
    const bytes = shareCodeToBytes(shareCode);
    const size = sumArray(Array.from(bytes.slice(1))) % 256;

    if (bytes[0] !== size) {
        throw new Error('Invalid crosshair share code');
    }

    return {
        gap: uint8ToInt8(bytes[2]) / 10,
        outline: bytes[3] / 2,
        ...decodeColor(bytes),
        splitDistance: bytes[8] & 7,
        followRecoil: ((bytes[8] >> 4) & 8) === 8,
        fixedCrosshairGap: uint8ToInt8(bytes[9]) / 10,
        color: bytes[10] & 7,
        outlineEnabled: (bytes[10] & 8) === 8,
        innerSplitAlpha: (bytes[10] >> 4) / 10,
        outerSplitAlpha: (bytes[11] & 0xf) / 10,
        splitSizeRatio: (bytes[11] >> 4) / 10,
        thickness: bytes[12] / 10,
        ...decodeStyle(bytes),
        length: bytes[14] / 10,
    };
}

// Encoding Functions
function encodeColor(crosshair, bytes) {
    bytes[4] = clamp(crosshair.red, 0, 255);
    bytes[5] = clamp(crosshair.green, 0, 255);
    bytes[6] = clamp(crosshair.blue, 0, 255);
    bytes[7] = clamp(crosshair.alpha, 0, 255);
}

function encodeStyle(crosshair, bytes) {
    bytes[13] = (crosshair.style << 1) |
        (Number(crosshair.centerDotEnabled) << 4) |
        (Number(crosshair.deployedWeaponGapEnabled) << 5) |
        (Number(crosshair.alphaEnabled) << 6) |
        (Number(crosshair.tStyleEnabled) << 7);
}

function encodeCrosshair(crosshair) {
    const bytes = new Uint8Array(18);
    bytes[1] = 1;
    bytes[2] = Math.round(crosshair.gap * 10) & 0xff;
    bytes[3] = Math.round(crosshair.outline * 2);
    
    encodeColor(crosshair, bytes);
    
    bytes[8] = (crosshair.splitDistance & 7) | (Number(crosshair.followRecoil) << 7);
    bytes[9] = Math.round(crosshair.fixedCrosshairGap * 10) & 0xff;
    bytes[10] = (crosshair.color & 7) | (Number(crosshair.outlineEnabled) << 3) | (Math.round(crosshair.innerSplitAlpha * 10) << 4);
    bytes[11] = (Math.round(crosshair.outerSplitAlpha * 10) & 0xf) | (Math.round(crosshair.splitSizeRatio * 10) << 4);
    bytes[12] = Math.round(crosshair.thickness * 10);
    
    encodeStyle(crosshair, bytes);
    
    bytes[14] = Math.round(crosshair.length * 10);
    bytes[15] = 0;
    bytes[16] = 0;
    bytes[17] = 0;

    bytes[0] = sumArray(Array.from(bytes.slice(1))) & 0xff;

    return bytesToShareCode(bytes);
}

// Export Functions to Window
window.encodeCrosshair = encodeCrosshair;
window.decodeCrosshairShareCode = decodeCrosshairShareCode;
