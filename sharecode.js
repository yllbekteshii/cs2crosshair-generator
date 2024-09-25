const DICTIONARY = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijkmnopqrstuvwxyz23456789";
const DICTIONARY_LENGTH = BigInt(DICTIONARY.length);
const SHARECODE_PATTERN = /^CSGO(-?[\w]{5}){5}$/;

function uint8ToInt8(number) {
    return (number << 24) >> 24;
}

function sumArray(array) {
    return array.reduce((previousValue, value) => previousValue + value, 0);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

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

function decodeCrosshairShareCode(shareCode) {
    const bytes = shareCodeToBytes(shareCode);
    const size = sumArray(Array.from(bytes.slice(1))) % 256;

    if (bytes[0] !== size) {
        console.warn('Checksum mismatch, but continuing to decode');
    }

    return {
        gap: (uint8ToInt8(bytes[2]) / 10) * (5/31), 
        outline: (bytes[3] & 0xFF) / 2,
        red: bytes[4],
        green: bytes[5],
        blue: bytes[6],
        alpha: bytes[7],
        splitDistance: bytes[8],
        fixedCrosshairGap: uint8ToInt8(bytes[9]) / 10,
        color: bytes[10] & 7,
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

function encodeCrosshair(crosshair) {
    const bytes = [
        0,
        1,
        Math.round((crosshair.gap / (5/31)) * 10) & 0xFF, 
        (crosshair.outline * 2) & 7,
        crosshair.red,
        crosshair.green,
        crosshair.blue,
        crosshair.alpha,
        crosshair.splitDistance,
        (crosshair.fixedCrosshairGap * 10) & 0xFF,
        (crosshair.color & 7) |
            (crosshair.outlineEnabled ? 8 : 0) |
            (crosshair.innerSplitAlpha * 10) << 4,
        ((crosshair.outerSplitAlpha * 10) & 0xF) |
            ((crosshair.splitSizeRatio * 10) << 4),
        (crosshair.thickness * 10) & 0x3F,
        ((crosshair.style << 1) & 0xE) |
            (crosshair.centerDotEnabled ? 0x10 : 0) |
            (crosshair.deployedWeaponGapEnabled ? 0x20 : 0) |
            (crosshair.alphaEnabled ? 0x40 : 0) |
            (crosshair.tStyleEnabled ? 0x80 : 0),
        (crosshair.length * 10) & 0xFF,
        ((crosshair.length * 10) >> 8) & 0x1F,
        0,
        0
    ];

    let sum = 0;
    for (let i = 1; i < bytes.length; ++i) {
        sum += bytes[i];
    }
    bytes[0] = sum & 0xFF;

    return bytesToShareCode(bytes);
}

window.encodeCrosshair = encodeCrosshair;
window.decodeCrosshairShareCode = decodeCrosshairShareCode;
