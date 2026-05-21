// js/vault.js — Collateral vault hero (Three.js ES module)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

// Module-level state (needed for disposal and scroll animation)
let renderer, composer, scene, camera, animFrameId;
let vaultGroup, handleGroup;
const boltMeshes = [];
const goldMaterials = [];
let bloomPass;

function buildVaultDoor() {
  vaultGroup = new THREE.Group();
  scene.add(vaultGroup);

  const steelMat = new THREE.MeshPhysicalMaterial({
    color: 0x2A2A2A,
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xC9A84C,
    metalness: 0.9,
    roughness: 0.2,
    emissive: new THREE.Color(0xC9A84C),
    emissiveIntensity: 0.0,
  });
  goldMaterials.push(goldMat);

  const goldMat2 = goldMat.clone();
  goldMaterials.push(goldMat2);

  // Door face
  vaultGroup.add(new THREE.Mesh(new THREE.CircleGeometry(2.4, 128), steelMat));

  // Outer rim
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 32, 128), steelMat));

  // Inner decorative ring (gold)
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 128), goldMat));

  // Centre ring (gold)
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 16, 64), goldMat2));

  // Bolts — 6x at 60° intervals, radius 2.1
  const boltBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x3A3A3A,
    metalness: 0.98,
    roughness: 0.08,
  });

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bx = Math.cos(angle) * 2.1;
    const by = Math.sin(angle) * 2.1;

    // Bolt housing ring
    const housing = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.04, 8, 32),
      steelMat
    );
    housing.position.set(bx, by, 0.06);
    vaultGroup.add(housing);

    // Bolt pin — cylinder along Z axis, protrudes from face
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16),
      boltBodyMat
    );
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(bx, by, 0.35);
    vaultGroup.add(bolt);
    boltMeshes.push(bolt);
  }

  // Handle group (rotates independently)
  handleGroup = new THREE.Group();
  handleGroup.position.z = 0.12;
  vaultGroup.add(handleGroup);

  const hubMat = goldMat.clone();
  goldMaterials.push(hubMat);
  const barMat = goldMat.clone();
  goldMaterials.push(barMat);

  // Hub disc
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32), hubMat);
  hub.rotation.x = Math.PI / 2;
  handleGroup.add(hub);

  // Horizontal bar
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.9, 16), barMat);
  bar.position.z = 0.04;
  handleGroup.add(bar);

  // Shadow receiver floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 1, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4;
  floor.receiveShadow = true;
  scene.add(floor);

  vaultGroup.traverse(function (obj) {
    if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; }
  });
}

function buildLighting() {
  // Key: warm spot front-left with shadow
  const key = new THREE.SpotLight(0xFFF5E0, 3);
  key.position.set(-4, 6, 5);
  key.angle = Math.PI / 8;
  key.penumbra = 0.3;
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  scene.add(key);
  scene.add(key.target);

  // Fill: cool blue right
  const fill = new THREE.DirectionalLight(0xC8D8FF, 0.6);
  fill.position.set(5, 2, 3);
  scene.add(fill);

  // Rim: gold tint from behind
  const rim = new THREE.PointLight(0xC9A84C, 1.0, 15);
  rim.position.set(0, -3, -4);
  scene.add(rim);

  // Ambient base
  scene.add(new THREE.AmbientLight(0x111111, 1.0));
}

function buildPostprocessing() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.0,   // strength — starts at 0, animated to 0.6 on door open
    0.4,   // radius
    0.8    // threshold — only bright gold emissive blooms
  );
  composer.addPass(bloomPass);
  composer.addPass(new ShaderPass(GammaCorrectionShader));
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}

function startRenderLoop() {
  function loop() {
    animFrameId = requestAnimationFrame(loop);
    composer.render();
  }
  loop();
}

function initVault() {
  const canvas = document.getElementById('vault-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0A0A);

  const isMobile = window.innerWidth < 768;
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 8 : 6);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  buildVaultDoor();
  buildLighting();
  buildPostprocessing();
  startRenderLoop();

  window.addEventListener('resize', onResize);
}

// ES modules are deferred — DOM is ready by execution time
initVault();
