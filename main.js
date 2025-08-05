import * as THREE from "three";

// Data and visualization
import { CompositionShader } from "./shaders/CompositionShader.js";
import { BlackWhiteShader } from "./shaders/BlackWhiteShader.js";
import { InvertShader } from "./shaders/InvertShader.js";
import { RainbowCycleShader } from "./shaders/RainbowCycleShader.js"; // Added
import { HeatmapShader } from "./shaders/HeatmapShader.js"; // Added
import {
  BASE_LAYER,
  BLOOM_LAYER,
  BLOOM_PARAMS,
  OVERLAY_LAYER,
} from "./config/renderConfig.js";

// Rendering
import { MapControls } from "three/addons/controls/MapControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Galaxy } from "./galaxy.js";
import { config } from "./config/galaxyConfig.js";

let canvas,
  renderer,
  camera,
  scene,
  orbit,
  baseComposer,
  bloomComposer,
  overlayComposer,
  shaderPasses;

function initThree() {
  canvas = document.querySelector("#canvas");
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xebe2db, 0.00003);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000000
  );
  camera.position.set(0, 50, 50);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  orbit = new MapControls(camera, canvas);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.05;
  orbit.screenSpacePanning = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 16384;
  orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 360;

  initRenderPipeline();
}

function initRenderPipeline() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = BLOOM_PARAMS.bloomThreshold;
  bloomPass.strength = BLOOM_PARAMS.bloomStrength;
  bloomPass.radius = BLOOM_PARAMS.bloomRadius;

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  overlayComposer = new EffectComposer(renderer);
  overlayComposer.renderToScreen = false;
  overlayComposer.addPass(renderScene);

  shaderPasses = {
    composition: new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          overlayTexture: { value: overlayComposer.renderTarget2.texture },
        },
        vertexShader: CompositionShader.vertex,
        fragmentShader: CompositionShader.fragment,
        defines: {},
      }),
      "baseTexture"
    ),
    blackwhite: new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          overlayTexture: { value: overlayComposer.renderTarget2.texture },
        },
        vertexShader: BlackWhiteShader.vertex,
        fragmentShader: BlackWhiteShader.fragment,
        defines: {},
      }),
      "baseTexture"
    ),
    invert: new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          overlayTexture: { value: overlayComposer.renderTarget2.texture },
        },
        vertexShader: InvertShader.vertex,
        fragmentShader: InvertShader.fragment,
        defines: {},
      }),
      "baseTexture"
    ),
    rainbowcycle: new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          overlayTexture: { value: overlayComposer.renderTarget2.texture },
          time: { value: 0.0 }, // Added for animation
        },
        vertexShader: RainbowCycleShader.vertex,
        fragmentShader: RainbowCycleShader.fragment,
        defines: {},
      }),
      "baseTexture"
    ),
    heatmap: new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
          overlayTexture: { value: overlayComposer.renderTarget2.texture },
        },
        vertexShader: HeatmapShader.vertex,
        fragmentShader: HeatmapShader.fragment,
        defines: {},
      }),
      "baseTexture"
    ),
  };

  baseComposer = new EffectComposer(renderer);
  baseComposer.addPass(renderScene);
  baseComposer.addPass(shaderPasses[config.SHADER_TYPE]);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

async function render() {
  orbit.update();

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  galaxy.updateScale(camera);

  // Update time for rainbowcycle if active
  if (config.SHADER_TYPE === 'rainbowcycle') {
    shaderPasses['rainbowcycle'].material.uniforms.time.value = performance.now() * 0.001;
  }

  renderPipeline();

  requestAnimationFrame(render);
}

function renderPipeline() {
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();

  camera.layers.set(OVERLAY_LAYER);
  overlayComposer.render();

  camera.layers.set(BASE_LAYER);
  baseComposer.render();
}

initThree();
let axes = new THREE.AxesHelper(5.0);
scene.add(axes);

let galaxy = new Galaxy(scene);

window.config = config;
window.regenerateGalaxy = () => {
  galaxy.regenerate();
  baseComposer.passes[1] = shaderPasses[config.SHADER_TYPE];
};

requestAnimationFrame(render);