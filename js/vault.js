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

// Set once in initVault() before any build functions run
let isMobile, isSmallMobile;

// ─── Geometry ────────────────────────────────────────────────────────────────

function buildVaultDoor() {
  vaultGroup = new THREE.Group();
  scene.add(vaultGroup);

  // Reduce vertex counts on mobile — fills same pixels, far less GPU work.
  const segRing  = isSmallMobile ? 48 : isMobile ? 80 : 128;
  const segTube  = isSmallMobile ? 10 : isMobile ? 20 : 32;

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

  vaultGroup.add(new THREE.Mesh(new THREE.CircleGeometry(2.4, segRing), steelMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, segTube, segRing), steelMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, Math.floor(segTube / 2), segRing), goldMat));
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, Math.floor(segTube / 2), Math.floor(segRing / 2)), goldMat2));

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

    const housing = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.04, isMobile ? 6 : 8, isMobile ? 20 : 32),
      steelMat
    );
    housing.position.set(bx, by, 0.06);
    vaultGroup.add(housing);

    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.5, isMobile ? 10 : 16),
      boltBodyMat
    );
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

  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.08, isMobile ? 20 : 32),
    hubMat
  );
  hub.rotation.x = Math.PI / 2;
  handleGroup.add(hub);

  const bar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.9, isMobile ? 10 : 16),
    barMat
  );
  bar.position.z = 0.04;
  handleGroup.add(bar);

  // Floor plane — shadows off on mobile (no shadow map allocated)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x0A0A0A, roughness: 1, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4;
  if (!isMobile) floor.receiveShadow = true;
  scene.add(floor);

  // Shadow casting/receiving is expensive — skip entirely on mobile.
  vaultGroup.traverse(function (obj) {
    if (obj.isMesh) {
      obj.castShadow    = !isMobile;
      obj.receiveShadow = !isMobile;
    }
  });
}

// ─── Lighting ─────────────────────────────────────────────────────────────────

function buildLighting() {
  const key = new THREE.SpotLight(0xFFF5E0, 3);
  key.position.set(-4, 6, 5);
  key.angle = Math.PI / 8;
  key.penumbra = 0.3;

  if (isMobile) {
    // Shadows are the single biggest GPU cost — disable completely on mobile.
    key.castShadow = false;
  } else {
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0002;
  }

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
  // On mobile, skip EffectComposer entirely — render directly to screen.
  // renderer.outputColorSpace = SRGBColorSpace already handles gamma correction,
  // so GammaCorrectionShader is redundant. Bloom is a luxury we skip on mobile.
  if (isMobile) return;

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
  if (composer) composer.setSize(w, h);
}

function startRenderLoop() {
  function loop() {
    animFrameId = requestAnimationFrame(loop);
    camera.updateProjectionMatrix();
    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
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
  if (composer) { composer.dispose(); composer = null; }
  if (envTexture) envTexture.dispose();
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

  // ── Initial states ────────────────────────────────────────────────────────
  gsap.set('.nav', { yPercent: -100 });

  // Larger y offsets on mobile — more pronounced slide-up feel as text rises.
  gsap.set('.hero-eyebrow',  { opacity: 0, y: isMobile ? 32 : 24 });
  gsap.set('.hero-headline', { opacity: 0, y: isMobile ? 56 : 40 });
  gsap.set('.hero-sub',      { opacity: 0, y: isMobile ? 40 : 28 });
  gsap.set('.hero-actions',  { opacity: 0, y: isMobile ? 32 : 20 });

  // Pre-position home-content below natural position on mobile so it can
  // slide up into view when the vault sequence hands off.
  if (isMobile) {
    gsap.set('#home-content', { y: 60 });
  }

  // ── Timeline ─────────────────────────────────────────────────────────────
  // Total: 8 units → 400vh pinned scroll.
  //
  // Stage 1  (0 → 2.05): bolts retract
  // Stage 2  (2.5 → 5.0): handle/latch rotates
  // Stage 3  (5.0 → 8.0): site opens
  //   Mobile:  vault drifts upward, hero text rises from below, home-content
  //            slides up on pin release — vertical motion throughout.
  //   Desktop: camera pulls far back, vault shifts right as design element.

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#vault-hero',
      start: 'top top',
      end: '+=400%',
      pin: true,
      anticipatePin: 1,
      // Higher scrub value on mobile = smoother feel under finger drag.
      scrub: isMobile ? 3 : 2,
      // Snap to end state when user stops scrolling mid-sequence.
      fastScrollEnd: true,

      onLeave: function () {
        var homeContent = document.getElementById('home-content');
        if (homeContent) {
          homeContent.style.pointerEvents = 'auto';
          if (isMobile) {
            // CSS opacity transition fires when .visible is added;
            // GSAP independently animates the y slide-up (no property conflict).
            homeContent.classList.add('visible');
            gsap.to(homeContent, {
              y: 0,
              duration: 0.75,
              ease: 'power3.out',
              clearProps: 'transform',
            });
          } else {
            homeContent.classList.add('visible');
          }
        }

        var panel = document.getElementById('hero-content-panel');
        if (panel) {
          panel.style.pointerEvents = 'auto';
          panel.removeAttribute('aria-hidden');
        }

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

  // ── Stage 3 — Site opens (5.0 → 8.0) ─────────────────────────────────────

  // Camera pulls back on both platforms (vault shrinks to a design element).
  tl.to(camera.position, {
    z: isMobile ? 12 : 14,
    duration: 3.0,
    ease: 'power3.out',
  }, 5.0);

  if (isMobile) {
    // Vault drifts upward into the top half of the viewport, leaving the lower
    // half open for hero text that rises from below to meet it.
    tl.to(vaultGroup.position, {
      x: 0,
      y: 2.2,
      duration: 3.0,
      ease: 'power3.out',
    }, 5.0);
  } else {
    // Desktop: vault shifts right so hero text can live on the left.
    tl.to(vaultGroup.position, {
      x: 3.5,
      duration: 3.0,
      ease: 'power3.out',
    }, 5.0);
  }

  // Gold "ACCESS GRANTED" flare then ambient settle.
  goldMaterials.forEach(function (mat) {
    tl.to(mat, { emissiveIntensity: 1.2,  duration: 0.7, ease: 'power2.in'  }, 5.0);
    tl.to(mat, { emissiveIntensity: 0.15, duration: 2.0, ease: 'power2.out' }, 5.7);
  });

  // bloomPass is null on mobile (composer skipped).
  if (bloomPass) {
    tl.to(bloomPass, { strength: 0.5, duration: 0.7, ease: 'power2.in'  }, 5.0);
    tl.to(bloomPass, { strength: 0.0, duration: 2.0, ease: 'power2.out' }, 5.7);
  }

  // Nav drops in from above.
  tl.to('.nav', {
    yPercent: 0,
    duration: 1.2,
    ease: 'power3.out',
  }, 5.3);

  // Hero text staggers in with a pronounced upward rise.
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 5.7);
  tl.to('.hero-headline', { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' }, 6.05);
  tl.to('.hero-sub',      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 6.4);
  tl.to('.hero-actions',  { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 6.7);

  // Scroll hint fades as soon as scrolling begins.
  tl.to('.vault-hint', { opacity: 0, duration: 0.3 }, 0.1);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initVault() {
  const canvas = document.getElementById('vault-canvas');
  if (!canvas) return;

  // Viewport flags — set before any build function so all helpers can read them.
  isMobile      = window.innerWidth < 768;
  isSmallMobile = window.innerWidth < 480;

  scene = new THREE.Scene();
  // No scene.background — alpha: true lets the dark body show through.

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  // Start slightly further back on very small screens so the vault fits.
  camera.position.set(0, 0, isSmallMobile ? 9 : isMobile ? 8 : 6);

  renderer = new THREE.WebGLRenderer({
    canvas,
    // Antialiasing is expensive; skip on very small screens where pixel density
    // already masks jaggies.
    antialias: !isSmallMobile,
    alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Cap pixel ratio lower on very small screens to reduce fill-rate pressure.
  renderer.setPixelRatio(isSmallMobile
    ? Math.min(devicePixelRatio, 1.5)
    : Math.min(devicePixelRatio, 2)
  );
  // Shadows are disabled on mobile (set per-object in buildVaultDoor).
  renderer.shadowMap.enabled = !isMobile;
  if (!isMobile) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    camera.position.z = isMobile ? 12 : 14;
    vaultGroup.position.x = isMobile ? 0 : 3.5;
    if (isMobile) vaultGroup.position.y = 2.2;
    goldMaterials.forEach(function (m) { m.emissiveIntensity = 0.15; });

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
  // iOS fires orientationchange before resize; the 100ms delay lets viewport
  // dimensions settle before recalculating.
  onOrientationChange = function () { setTimeout(onResize, 100); };
  window.addEventListener('orientationchange', onOrientationChange);
  window.addEventListener('pagehide', disposeVault);
}

initVault();
