import { config } from "./config/galaxyConfig.js";

// Simple Perlin noise for subtle variation
function perlinNoise(x, y, scale, seed) {
  const rand = (seed) => {
    const value = Math.sin(seed * 127.1 + x * 11.3 + y * 7.7) * 43758.5453;
    return value - Math.floor(value);
  };
  x *= scale;
  y *= scale;
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const y0 = Math.floor(y);
  const y1 = y0 + 1;
  const fx = x - x0;
  const fy = y - y0;
  const n00 = rand(seed + x0 + y0 * 57);
  const n01 = rand(seed + x0 + y1 * 57);
  const n10 = rand(seed + x1 + y0 * 57);
  const n11 = rand(seed + x1 + y1 * 57);
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const nx0 = n00 + u * (n10 - n00);
  const nx1 = n01 + u * (n11 - n01);
  return nx0 + v * (nx1 - nx0);
}

export function generateSpiralArray(width, height) {
  const data = Array(height).fill().map(() => Array(width).fill(0));
  const seed = Math.random() * 1000; // Random seed for variation
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2;
  const armCount = config.ARMS; // Use config for number of arms
  const armPitch = config.ARM_PITCH; // Use config for spiral tightness

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Logarithmic spiral for distinct arms
      const spiralIntensity = Math.cos(angle * armCount + radius / armPitch);
      // Radial falloff for galaxy-like structure
      const falloff = Math.exp(-radius / maxRadius);
      // Subtle noise for natural variation
      const noise = perlinNoise(x, y, 0.05, seed) * 0.2;

      // Combine for spiral arm intensity
      data[y][x] = Math.max(0, (spiralIntensity + 1) / 2 * falloff + noise);
      data[y][x] = Math.min(1, Math.max(0, data[y][x])); // Clamp to [0, 1]
    }
  }

  return { data, width, height };
}