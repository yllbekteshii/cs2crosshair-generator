// This module handles encoding and decoding of crosshair settings

const DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
const DICTIONARY_LENGTH = BigInt(DICTIONARY.length);
const SHARECODE_PATTERN = /^CSGO(-?[\w]{5}){5}$/;
const predefinedColors = [
    [255, 0, 0],   // Red
    [0, 255, 0],   // Green
    [255, 255, 0], // Yellow
    [0, 0, 255],   // Blue
    [0, 255, 255], // Cyan
];

/**
 * Converts an unsigned 8-bit integer to a signed 8-bit integer
 * @param {number} number - The unsigned 8-bit integer
 * @returns {number} The signed 8-bit integer
 */
function uint8ToInt8(number) {
    return (number << 24) >> 24;
}

/**
 * Sums all elements in an array
 * @param {number[]} array - The array of numbers to sum
 * @returns {number} The sum of all elements in the array
 */
function sumArray(array) {
    return array.reduce((previousValue, value) => previousValue + value, 0);
}

/**
 * Clamps a value between a minimum and maximum
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {number} The clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Converts a share code to a byte array
 * @param {string} shareCode - The share code to convert
 * @returns {Uint8Array} The byte array representation of the share code
 */
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

    return bytes;
}

/**
 * Converts a byte array to a share code
 * @param {Uint8Array} bytes - The byte array to convert
 * @returns {string} The share code
 */
function bytesToShareCode(bytes) {
    let acc = 0n;
    let pos = 1n;
    for (let i = bytes.length - 1; i >= 0; i--) {
        acc += BigInt(bytes[i]) * pos;
        pos *= 256n;
    }
    
    let result = '';
    for (let i = 0; i < 25; ++i) {
        const digit = acc % DICTIONARY_LENGTH;
        acc = acc / DICTIONARY_LENGTH;
        result += DICTIONARY.charAt(Number(digit));
    }
    
    return `CSGO-${result.slice(0, 5)}-${result.slice(5, 10)}-${result.slice(10, 15)}-${result.slice(15, 20)}-${result.slice(20, 25)}`;
}

/**
 * Decodes a crosshair share code into settings
 * @param {string} shareCode - The share code to decode
 * @returns {Object} The decoded crosshair settings
 */
export function decodeCrosshairShareCode(shareCode) {
    const bytes = shareCodeToBytes(shareCode);
    const size = sumArray(Array.from(bytes.slice(1))) % 256;

    if (bytes[0] !== size) {
        console.warn('Checksum mismatch, but continuing to decode');
    }

    const rawGap = decodeSignedByte(bytes[2]);
    const gap = rawGap / 10;

    // Color handling
    const colorIndex = bytes[10] & 7;
    let red = bytes[4];
    let green = bytes[5];
    let blue = bytes[6];

    if (colorIndex !== 5) {
        if (colorIndex >= 0 && colorIndex < predefinedColors.length) {
            [red, green, blue] = predefinedColors[colorIndex];
        } else {
            red = 0;
            green = 255;
            blue = 0;
        }
    }

    return {
        gap: gap,
        outline: (bytes[3] & 0xFF) / 2,
        red: red,
        green: green,
        blue: blue,
        alpha: bytes[7],
        splitDistance: bytes[8] & 0x7F,
        followRecoil: (bytes[8] & 0x80) !== 0,
        fixedCrosshairGap: decodeSignedByte(bytes[9]) / 10,
        color: colorIndex,
        outlineEnabled: (bytes[10] & 8) === 8,
        innerSplitAlpha: ((bytes[10] >> 4) & 0xF) / 10,
        outerSplitAlpha: (bytes[11] & 0xF) / 10,
        splitSizeRatio: ((bytes[11] >> 4) & 0xF) / 10,
        thickness: (bytes[12] & 0x3F) / 10,
        style: (bytes[13] & 0xE) >> 1,
        centerDotEnabled: (bytes[13] & 0x10) === 0x10,
        deployedWeaponGapEnabled: (bytes[13] & 0x20) === 0x20,
        alphaEnabled: (bytes[13] & 0x40) === 0x40,
        tStyleEnabled: (bytes[13] & 0x80) === 0x80,
        length: (((bytes[15] & 0x1F) << 8) + bytes[14]) / 10,
    };
}

/**
 * Decodes a signed byte
 * @param {number} byte - The byte to decode
 * @returns {number} The decoded signed value
 */
function decodeSignedByte(byte) {
    return byte > 127 ? byte - 256 : byte;
}

/**
 * Encodes crosshair settings into a share code
 * @param {Object} config - The crosshair settings to encode
 * @returns {string} The encoded share code
 */
export function encodeCrosshair(config) {
    const bytes = [0, 1];
    bytes.push(encodeSignedByte(Math.round(10 * config.gap)));
    bytes.push(Math.floor(2 * config.outline));
    bytes.push(config.red);
    bytes.push(config.green);
    bytes.push(config.blue);
    bytes.push(config.alpha);
    bytes.push((127 & config.splitDistance) | (config.followRecoil ? 128 : 0));
    bytes.push(encodeSignedByte(Math.round(10 * config.fixedCrosshairGap)));
    bytes.push(config.color | (config.outlineEnabled ? 8 : 0) | (Math.round(10 * config.innerSplitAlpha) << 4));
    bytes.push((15 & Math.round(10 * config.outerSplitAlpha)) | (Math.round(10 * config.splitSizeRatio) << 4));
    bytes.push(Math.round(10 * config.thickness));
    bytes.push(((7 & config.style) << 1) | (config.centerDotEnabled ? 0x10 : 0) | (config.deployedWeaponGapEnabled ? 0x20 : 0) | (config.alphaEnabled ? 0x40 : 0) | (config.tStyleEnabled ? 0x80 : 0));
    bytes.push(Math.round(10 * config.length) % 256);
    bytes.push(Math.floor(Math.round(10 * config.length) / 256));
    bytes.push(0);
    bytes.push(0);
    bytes[0] = calculateChecksum(bytes);
    return bytesToShareCode(bytes);
}

/**
 * Calculates the checksum for the byte array
 * @param {number[]} bytes - The byte array to calculate the checksum for
 * @returns {number} The calculated checksum
 */
function calculateChecksum(bytes) {
    let sum = 0;
    for (let i = 1; i < bytes.length; i++) {
        sum += bytes[i];
    }
    return sum % 256;
}

/**
 * Encodes a signed byte
 * @param {number} value - The value to encode
 * @returns {number} The encoded unsigned byte
 */
function encodeSignedByte(value) {
    return value < 0 ? value + 256 : value;
}
