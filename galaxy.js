import * as THREE from "three";
import { Star } from "./star.js";
import { config } from "./config/galaxyConfig.js";
import { gaussianRandom, spiral } from "./utils.js";
import { Haze } from "./haze.js";
import { Nebula } from "./nebula.js";


//galaxy class
export class Galaxy {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    scene.add(this.group);

    this.stars = this.generateStars();
    this.haze = this.generateHaze();
    this.nebulae = this.generateNebulae();

    this.stars.forEach((star) => star.toThreeObject(this.group));
    this.haze.forEach((h) => h.toThreeObject(this.group));
    this.nebulae.forEach((n) => n.toThreeObject(this.group));
  }

  update(dt, camera) {
    this.group.rotation.z += 0.05 * dt;
    this.updateScale(camera);
  }
  
  updateScale(camera) {
    this.stars.forEach((star) => {
      star.updateScale(camera);
    });

    this.haze.forEach((haze) => {
      haze.updateScale(camera);
    });

    this.nebulae.forEach((nebula) => {
      nebula.updateScale(camera);
    });
  }
  regenerate() {
    // this.group.clear()

    // this.stars   = this.generateStars();
    // this.haze    = this.generateHaze();
    // this.nebulae = this.generateNebulae();


    this.stars.forEach((star) => this.scene.remove(star.obj));
    this.haze.forEach((haze) => this.scene.remove(haze.obj));
    this.nebulae.forEach((nebula) => this.scene.remove(nebula.obj));
    this.stars = this.generateStars();
    this.haze = this.generateHaze();
    this.nebulae = this.generateNebulae();
    this.stars.forEach((star) => star.toThreeObject(this.scene));
    this.haze.forEach((haze) => haze.toThreeObject(this.scene));
    this.nebulae.forEach((nebula) => nebula.toThreeObject(this.scene));
 
    this.stars.forEach((s)     => s.toThreeObject(this.group));
    this.haze.forEach((h)      => h.toThreeObject(this.group));
    this.nebulae.forEach((n)   => n.toThreeObject(this.group));
  }
  generateStars() {
    let stars = [];
    const diskStars = config.NUM_STARS * (1 - config.HALO_DENSITY);

    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.CORE_X_DIST),
        gaussianRandom(0, config.CORE_Y_DIST),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let star = new Star(pos, 'core');
      stars.push(star);
    }

    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.OUTER_CORE_X_DIST),
        gaussianRandom(0, config.OUTER_CORE_Y_DIST),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let star = new Star(pos, 'core');
      stars.push(star);
    }

    // Central bar
    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.BAR_LENGTH),
        gaussianRandom(0, config.BAR_WIDTH),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let star = new Star(pos, 'bar');
      stars.push(star);
    }

    for (let j = 0; j < config.ARMS; j++) {
      for (let i = 0; i < diskStars / 4 / config.ARMS; i++) {
        let pos = spiral(
          gaussianRandom(config.ARM_X_MEAN, config.ARM_X_DIST),
          gaussianRandom(config.ARM_Y_MEAN, config.ARM_Y_DIST),
          gaussianRandom(0, config.GALAXY_THICKNESS),
          (j * 2 * Math.PI) / config.ARMS,
          config.ARM_PITCH
        );
        let star = new Star(pos, 'arms');
        stars.push(star);
      }
    }

    // Stellar halo
    for (let i = 0; i < config.NUM_STARS * config.HALO_DENSITY; i++) {
      let u = Math.random();
      let r = Math.pow(u, 1/3) * config.HALO_RADIUS;
      let theta = Math.random() * 2 * Math.PI;
      let phi = Math.acos(2 * Math.random() - 1);
      let pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      let star = new Star(pos, 'halo');
      stars.push(star);
    }

    return stars;
  }
  generateHaze() {
    let haze = [];
    const diskStars = config.NUM_STARS * (1 - config.HALO_DENSITY);

    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.CORE_X_DIST),
        gaussianRandom(0, config.CORE_Y_DIST),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let h = new Haze(pos, 'core');
      haze.push(h);
    }

    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.OUTER_CORE_X_DIST),
        gaussianRandom(0, config.OUTER_CORE_Y_DIST),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let h = new Haze(pos, 'core');
      haze.push(h);
    }

    // Central bar
    for (let i = 0; i < diskStars / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.BAR_LENGTH),
        gaussianRandom(0, config.BAR_WIDTH),
        gaussianRandom(0, config.GALAXY_THICKNESS)
      );
      let h = new Haze(pos, 'bar');
      haze.push(h);
    }

    for (let j = 0; j < config.ARMS; j++) {
      for (let i = 0; i < diskStars / 4 / config.ARMS; i++) {
        let pos = spiral(
          gaussianRandom(config.ARM_X_MEAN, config.ARM_X_DIST),
          gaussianRandom(config.ARM_Y_MEAN, config.ARM_Y_DIST),
          gaussianRandom(0, config.GALAXY_THICKNESS),
          (j * 2 * Math.PI) / config.ARMS,
          config.ARM_PITCH
        );
        let h = new Haze(pos, 'arms');
        haze.push(h);
      }
    }

    // Stellar halo
    for (let i = 0; i < config.NUM_STARS * config.HALO_DENSITY; i++) {
      let u = Math.random();
      let r = Math.pow(u, 1/3) * config.HALO_RADIUS;
      let theta = Math.random() * 2 * Math.PI;
      let phi = Math.acos(2 * Math.random() - 1);
      let pos = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      let h = new Haze(pos, 'halo');
      haze.push(h);
    }

    return haze;
  }
  generateNebulae() {
    let nebulae = [];
    const numNebulae = Math.floor(config.NUM_STARS * config.NEBULA_DENSITY); // Updated: Use density

    // Core nebulae
    for (let i = 0; i < numNebulae / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.CORE_X_DIST * 1.5),
        gaussianRandom(0, config.CORE_Y_DIST * 1.5),
        gaussianRandom(0, config.GALAXY_THICKNESS * 2)
      );
      let nebula = new Nebula(pos, 'core');
      nebulae.push(nebula);
    }

    // Outer core
    for (let i = 0; i < numNebulae / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, config.OUTER_CORE_X_DIST * 1.5),
        gaussianRandom(0, config.OUTER_CORE_Y_DIST * 1.5),
        gaussianRandom(0, config.GALAXY_THICKNESS * 2)
      );
      let nebula = new Nebula(pos, 'core');
      nebulae.push(nebula);
    }

    // Arms
    for (let j = 0; j < config.ARMS; j++) {
      for (let i = 0; i < (numNebulae / 2) / config.ARMS; i++) {
        let pos = spiral(
          gaussianRandom(config.ARM_X_MEAN, config.ARM_X_DIST * 1.2),
          gaussianRandom(config.ARM_Y_MEAN, config.ARM_Y_DIST * 1.2),
          gaussianRandom(0, config.GALAXY_THICKNESS * 2),
          (j * 2 * Math.PI) / config.ARMS,
          config.ARM_PITCH
        );
        let nebula = new Nebula(pos, 'arms');
        nebulae.push(nebula);
      }
    }

    return nebulae;
  }
}