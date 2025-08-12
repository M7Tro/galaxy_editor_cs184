import {
  BASE_LAYER,
  HAZE_MAX,
  HAZE_MIN,
  HAZE_OPACITY,
} from "../config/renderConfig.js";
import { clamp } from "./utils.js";
import * as THREE from "three";
import { config } from "../config/galaxyConfig.js"; // Added for scales

const nebulaTexture = new THREE.TextureLoader().load(
  "../resources/nebula.png"
);
const nebulaSprite = new THREE.SpriteMaterial({
  map: nebulaTexture,
  color: 0x00ffff,
  opacity: 0.5,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

export class Nebula {
  constructor(position, region = 'arms') {
    this.position = position;
    this.region = region;
    this.obj = null;
  }

  updateScale(camera) {
    let dist = this.position.distanceTo(camera.position) / 250;
    this.obj.material.opacity = clamp(
      0.5 * Math.pow(dist / 5, 2),
      0,
      0.5
    );
  }

  toThreeObject(scene) {
  let material = nebulaSprite.clone();
  if (this.region === 'arms') {
    material.color.set(0x0000ff); // Blue for arms
  } else if (this.region === 'core') {
    material.color.set(0xff00ff); // Magenta for core
  }

  // Create multiple sprite layers for a cloud-like glow effect
  const layers = 3; // Number of layers for depth
  for (let i = 0; i < layers; i++) {
    let layerMaterial = material.clone();
    // Add slight color variation
    let color = layerMaterial.color.clone();
    const variation = 0.1 * (1 - i / layers); // Subtle variation, less for outer layers
    color.r = Math.min(Math.max(color.r + (Math.random() - 0.5) * variation, 0), 1);
    color.g = Math.min(Math.max(color.g + (Math.random() - 0.5) * variation, 0), 1);
    color.b = Math.min(Math.max(color.b + (Math.random() - 0.5) * variation, 0), 1);
    layerMaterial.color.setRGB(color.r, color.g, color.b);
    
    // Adjust opacity and scale for each layer
    layerMaterial.opacity = clamp(0.5 * (1 - i / layers * 0.5), 0.2, 0.5); // Fade outer layers
    let nebula = new THREE.Sprite(layerMaterial);
    nebula.layers.set(BASE_LAYER);
    nebula.position.copy(this.position);
    const baseScale = clamp(
      Math.random() * (config.NEBULA_SCALE_MAX - config.NEBULA_SCALE_MIN) + config.NEBULA_SCALE_MIN,
      config.NEBULA_SCALE_MIN,
      config.NEBULA_SCALE_MAX
    );
    const layerScale = baseScale * (1 + i * 0.2); // Larger scale for outer layers
    nebula.scale.multiplyScalar(layerScale);
    scene.add(nebula);
    
    // Store the primary sprite as obj for raytracing
    if (i === 0) this.obj = nebula;
  }
}
}