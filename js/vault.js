// js/vault.js — Metro Pawn vault hero (Three.js ES module)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

let renderer, composer, scene, camera, animFrameId;
let envTexture, vaultST;
let vaultGroup, handleGroup;
let onOrientationChange;
const boltMeshes = [];
const goldMaterials = [];
let bloomPass;
let disposed = false;

// ─── Geometry ────────────────────────────────────────────────────────────────

function buildVaultDoor() {
  vaultGroup = new THREE.Group();
  scene.add(vaultGroup);

  const steelMat = new THREE.MeshPhysicalMaterial({
    color: 0x2A2A2A,
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
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

  vaultGroup.add(new THREE.Mesh(new THREE.CircleGeometry(2.4, 128), steelMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 32, 128), steelMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 128), goldMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 16, 64), goldMat2));

  const boltBodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x3A3A3A,
    metalness: 0.98,
    roughness: 0.08,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bx = Math.cos(angle) * 2.1;
    const by = Math.sin(angle) * 2.1;

    const housing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 32), steelMat);
    housing.position.set(bx, by, 0.06);
    vaultGroup.add(housing);

    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), boltBodyMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(bx, by, 0.35);
    vaultGroup.add(bolt);
    boltMeshes.push(bolt);
  }

  handleGroup = new THREE.Group();
  handleGroup.position.z = 0.12;
  vaultGroup.add(handleGroup);

  const hubMat = goldMat.clone();
  goldMaterials.push(hubMat);
  const barMat = goldMat.clone();
  goldMaterials.push(barMat);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32), hubMat);
  hub.rotation.x = Math.PI / 2;
  handleGroup.add(hub);

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.9, 16), barMat);
  bar.position.z = 0.04;
  handleGroup.add(bar);

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

// ─── Lighting ─────────────────────────────────────────────────────────────────

function buildLighting() {
  const key = new THREE.SpotLight(0xFFF5E0, 3);
  key.position.set(-4, 6, 5);
  key.angle = Math.PI / 8;
  key.penumbra = 0.3;
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0002;
  scene.add(key);
  scene.add(key.target);

  const fill = new THREE.DirectionalLight(0xC8D8FF, 0.6);
  fill.position.set(5, 2, 3);
  scene.add(fill);

  const rim = new THREE.PointLight(0xC9A84C, 1.0, 15);
  rim.position.set(0, -3, -4);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0x111111, 1.0));
}

// ─── Post-processing ─────────────────────────────────────────────────────────

function buildPostprocessing() {
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.0, 0.4, 0.8
  );
  composer.addPass(bloomPass);
  composer.addPass(new ShaderPass(GammaCorrectionShader));
}

// ─── Resize / render ─────────────────────────────────────────────────────────

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
    camera.updateProjectionMatrix(); // in case fov was tweened
    composer.render();
  }
  loop();
}

// ─── Disposal (called on page unload) ────────────────────────────────────────

function disposeVault() {
  if (disposed) return;
  disposed = true;

  cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', onResize);
  if (onOrientationChange) window.removeEventListener('orientationchange', onOrientationChange);

  if (vaultST) { vaultST.kill(); vaultST = null; }

  scene.traverse(function (obj) {
    if (obj.isMesh) {
      obj.geometry.dispose();
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(function (m) { m.dispose(); });
    }
  });

  renderer.dispose();
  composer.dispose();
  if (envTexture) envTexture.dispose();
  // Vault-hero stays in the DOM as a permanent design element — do not remove.
}

// ─── Scroll sequence ─────────────────────────────────────────────────────────

function initScrollSequence() {
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    console.warn('Metro Pawn: GSAP not available — vault scroll sequence disabled');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.innerWidth < 768;

  // ── Initial states ────────────────────────────────────────────────────────
  // Nav hides above the viewport; reveals when site opens up in stage 4.
  gsap.set('.nav', { yPercent: -100 });

  // Hero text elements start invisible and 30-40px below their resting positions.
  gsap.set('.hero-eyebrow',  { opacity: 0, y: 24 });
  gsap.set('.hero-headline', { opacity: 0, y: 40 });
  gsap.set('.hero-sub',      { opacity: 0, y: 28 });
  gsap.set('.hero-actions',  { opacity: 0, y: 20 });

  // ── Timeline ─────────────────────────────────────────────────────────────
  // Total: 8 units → 400vh pinned scroll.
  //
  // Stage 1  (0 → 2.05): bolts retract
  // Stage 2  (2.5 → 5.0): handle/latch rotates
  // Stage 3  (5.0 → 8.0): camera pulls far back, vault repositions as a
  //                         design element, hero content and nav stagger in
  //                         (no door swing — latch turns, site opens immediately)

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#vault-hero',
      start: 'top top',
      end: '+=400%',
      pin: true,
      anticipatePin: 1,
      scrub: 2,

      onLeave: function () {
        // Activate home-content sections below and make hero panel interactive
        var homeContent = document.getElementById('home-content');
        if (homeContent) homeContent.classList.add('visible');

        var panel = document.getElementById('hero-content-panel');
        if (panel) {
          panel.style.pointerEvents = 'auto';
          panel.removeAttribute('aria-hidden');
        }

        // Let scroll.js triggers recalculate positions after the pin releases
        if (window.ScrollTrigger) {
          setTimeout(function () { window.ScrollTrigger.refresh(); }, 50);
        }
      },
    }
  });

  vaultST = tl.scrollTrigger;

  // ── Stage 1 — Bolts retract ───────────────────────────────────────────────
  boltMeshes.forEach(function (bolt, i) {
    tl.to(bolt.position, {
      z: bolt.position.z - 0.65,
      duration: 0.3,
      ease: 'power2.in',
    }, i * 0.35);
  });

  // ── Stage 2 — Handle rotates ──────────────────────────────────────────────
  tl.to(handleGroup.rotation, {
    z: -Math.PI * 0.4,
    duration: 2.5,
    ease: 'power3.inOut',
  }, 2.5);

  // ── Stage 3 — Latch done, site opens (5.0 → 8.0) ────────────────────────
  //
  // Camera pulls back so the vault shrinks into the right side of the hero
  // frame. Vault drifts right. Gold flares briefly then settles to ambient.
  // Nav drops, hero text staggers in. Door stays closed throughout.

  tl.to(camera.position, {
    z: isMobile ? 12 : 14,
    duration: 3.0,
    ease: 'power3.out',
  }, 5.0);

  tl.to(vaultGroup.position, {
    x: isMobile ? 0 : 3.5,
    duration: 3.0,
    ease: 'power3.out',
  }, 5.0);

  // Gold "ACCESS GRANTED" flare, then ambient settle
  goldMaterials.forEach(function (mat) {
    tl.to(mat, { emissiveIntensity: 1.2, duration: 0.7, ease: 'power2.in'  }, 5.0);
    tl.to(mat, { emissiveIntensity: 0.15, duration: 2.0, ease: 'power2.out' }, 5.7);
  });

  tl.to(bloomPass, { strength: 0.5, duration: 0.7, ease: 'power2.in'  }, 5.0);
  tl.to(bloomPass, { strength: 0.0, duration: 2.0, ease: 'power2.out' }, 5.7);

  // Nav drops in from above
  tl.to('.nav', {
    yPercent: 0,
    duration: 1.2,
    ease: 'power3.out',
  }, 5.3);

  // Hero text staggers in with vertical rise (each slightly after the last)
  tl.to('.hero-eyebrow', {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'power2.out',
  }, 5.7);

  tl.to('.hero-headline', {
    opacity: 1, y: 0,
    duration: 1.0,
    ease: 'power2.out',
  }, 6.05);

  tl.to('.hero-sub', {
    opacity: 1, y: 0,
    duration: 0.9,
    ease: 'power2.out',
  }, 6.4);

  tl.to('.hero-actions', {
    opacity: 1, y: 0,
    duration: 0.8,
    ease: 'power2.out',
  }, 6.7);

  // Scroll hint fades the moment scrolling begins
  tl.to('.vault-hint', { opacity: 0, duration: 0.3 }, 0.1);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initVault() {
  const canvas = document.getElementById('vault-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  // No scene.background — canvas is alpha: true; transparent areas let the
  // dark body background through, creating the impression of depth behind the vault.

  const isMobile = window.innerWidth < 768;
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 8 : 6);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  pmrem.dispose();

  buildVaultDoor();
  buildLighting();
  buildPostprocessing();
  startRenderLoop();

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Skip animation: show vault in its final design-element position immediately.
    // Door stays closed (rotation.y = 0); camera and vault position are settled.
    camera.position.z = isMobile ? 12 : 14;
    vaultGroup.position.x = isMobile ? 0 : 3.5;
    goldMaterials.forEach(function (m) { m.emissiveIntensity = 0.15; });

    // Immediately reveal all hero content
    var gsap = window.gsap;
    if (gsap) {
      gsap.set('.nav', { yPercent: 0 });
      gsap.set('.hero-eyebrow, .hero-headline, .hero-sub, .hero-actions', { opacity: 1, y: 0 });
    }

    var panel = document.getElementById('hero-content-panel');
    if (panel) { panel.style.pointerEvents = 'auto'; panel.removeAttribute('aria-hidden'); }

    var homeContent = document.getElementById('home-content');
    if (homeContent) homeContent.classList.add('visible');
  } else {
    initScrollSequence();
  }

  window.addEventListener('resize', onResize);
  // iOS fires orientationchange before resize; the 100ms delay lets the
  // viewport dimensions settle before we recalculate.
  onOrientationChange = function () { setTimeout(onResize, 100); };
  window.addEventListener('orientationchange', onOrientationChange);
  // Dispose WebGL cleanly when user leaves the page
  window.addEventListener('pagehide', disposeVault);
}

initVault();
