// src/lib/color-utils.ts

/**
 * Adjust color to ensure good contrast on dark backgrounds
 */
function ensureColorContrast(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Convert RGB to HSL
  const { h, s, l } = rgbToHsl(r, g, b);

  // If color is too dark (luminance < 40%), increase brightness and saturation
  let adjustedL = l;
  let adjustedS = s;

  if (l < 0.4) {
    adjustedL = Math.min(0.6, l + 0.3); // Ensure brightness is at least 40%
  }

  // If color is not saturated enough (saturation < 50%), increase saturation
  if (s < 0.5) {
    adjustedS = Math.min(0.8, s + 0.3); // Ensure saturation is at least 50%
  }

  // Convert back to RGB
  const { r: newR, g: newG, b: newB } = hslToRgb(h, adjustedS, adjustedL);

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, "0")}${newG
    .toString(16)
    .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export async function extractColors(
  imageUrl: string
): Promise<{ dominant: string; isLight: boolean }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        resolve({ dominant: "#1E1E1E", isLight: false });
        return;
      }

      const width = img.width;
      const height = img.height;

      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height).data;
      const colorCounts: Record<string, number> = {};

      // Sample pixels at regular intervals
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // Skip transparent pixels
        if (imageData[i + 3] < 128) continue;

        // Skip very dark pixels (likely background)
        if (r + g + b < 30) continue;

        // Skip very desaturated colors (grays)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max - min < 10) continue;

        // Create a simple color bucket (less precision for better grouping)
        const bucket = `${Math.floor(r / 10) * 10},${Math.floor(g / 10) * 10},${
          Math.floor(b / 10) * 10
        }`;

        colorCounts[bucket] = (colorCounts[bucket] || 0) + 1;
      }

      // Find the most common color
      const dominantBucket = Object.keys(colorCounts).reduce((a, b) =>
        colorCounts[a] > colorCounts[b] ? a : b
      );

      // Convert back to RGB values
      const [r, g, b] = dominantBucket.split(",").map(Number);

      // Convert to hex
      let dominantHex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      // Ensure the color has good contrast on dark backgrounds
      dominantHex = ensureColorContrast(dominantHex);

      // Calculate luminance to determine if color is light or dark
      const [adjustedR, adjustedG, adjustedB] = dominantHex
        .slice(1)
        .match(/.{2}/g)!
        .map((hex) => parseInt(hex, 16));

      const luminance =
        (0.299 * adjustedR + 0.587 * adjustedG + 0.114 * adjustedB) / 255;
      const isLight = luminance > 0.6;

      resolve({
        dominant: dominantHex,
        isLight,
      });
    };

    img.onerror = () => {
      // Return a bright default color instead of dark
      resolve({ dominant: "#1ED760", isLight: false }); // Spotify green
    };

    img.src = imageUrl;
  });
}
