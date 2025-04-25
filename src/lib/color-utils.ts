// src/lib/color-utils.ts
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

      // Calculate luminance to determine if color is light or dark
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isLight = luminance > 0.6;

      // Convert to hex
      const dominantHex = `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

      resolve({
        dominant: dominantHex,
        isLight,
      });
    };

    img.onerror = () => {
      resolve({ dominant: "#1E1E1E", isLight: false });
    };

    img.src = imageUrl;
  });
}
