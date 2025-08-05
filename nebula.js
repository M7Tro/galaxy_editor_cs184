import {
  BASE_LAYER,
  HAZE_MAX,
  HAZE_MIN,
  HAZE_OPACITY,
} from "./config/renderConfig.js";
import { clamp } from "./utils.js";
import * as THREE from "three";
import { config } from "./config/galaxyConfig.js"; // Added for scales

const nebulaTexture = new THREE.TextureLoader().load(
  "./resources/nebula.png"
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
      material.color.set(0x0000ff);
    } else if (this.region === 'core') {
      material.color.set(0xff00ff);
    }
    let nebula = new THREE.Sprite(material);
    nebula.layers.set(BASE_LAYER);
    nebula.position.copy(this.position);
    nebula.scale.multiplyScalar(
      clamp(Math.random() * (config.NEBULA_SCALE_MAX - config.NEBULA_SCALE_MIN) + config.NEBULA_SCALE_MIN, config.NEBULA_SCALE_MIN, config.NEBULA_SCALE_MAX)
    ); // Updated: Use config scales
    this.obj = nebula;
    scene.add(nebula);
  }
}