# Collateral — Design Spec
**Date:** 2026-05-21  
**Status:** Approved  
**Project path:** `~/Desktop/collateral`

---

## 1. Brand Summary

**Name:** Collateral  
**Location:** Waller, TX  
**Business:** Premium pawn shop — buy, sell, loan  
**Audience:** Local and regional customers seeking premium, trustworthy transactions  
**Tone:** Dark luxury. Heavy, refined, guarded. High-end jeweler meets bank vault.

---

## 2. Visual Thesis

> Dark-weighted luxury interface: `#0A0A0A` ground, `#C9A84C` gold as the single accent — used sparingly on edges and keylines only. Heavy serif display (Cormorant Garamond) at large weights paired with Barlow Condensed for body. Spacing is deliberate and generous; sections breathe. Components are sharp-edged — zero border-radius on structural elements, hairline gold borders as the primary decorative device. No gradients, no glassmorphism, no shadows that glow.

---

## 3. Interaction Thesis

> Slow, weighted motion (400–700ms) with custom cubic-bezier curves that ease-in hard and settle with authority — no bounce, no elastic. The vault sequence is the only scroll-pinned experience on the site; all four stages fire sequentially via GSAP ScrollTrigger with mechanical-weight easing. Hover states: gold underline sweeps left-to-right (200ms). Page transitions: opacity fade only. Forbidden: bounce easing, parallax outside vault, gratuitous micro-interactions, scroll jacking anywhere except the vault pin.

---

## 4. Design Tokens (MASTER)

### Colors
```css
--color-bg:       #0A0A0A;   /* primary black */
--color-gold:     #C9A84C;   /* gold accent */
--color-text:     #F5F2EC;   /* off-white */
--color-text-dim: #8A8680;   /* muted text */
--color-border:   #1E1E1E;   /* subtle dividers */
--color-surface:  #111111;   /* card/section surfaces */
```

### Typography
```css
/* Display — Cormorant Garamond (Google Fonts) */
--font-display: 'Cormorant Garamond', Georgia, serif;
--font-display-weight-bold: 700;
--font-display-weight-light: 300;

/* Body — Barlow Condensed (Google Fonts) */
--font-body: 'Barlow Condensed', 'Helvetica Neue', sans-serif;
--font-body-weight-regular: 400;
--font-body-weight-medium: 500;
```

### Type Scale
```css
--text-hero:   clamp(4rem, 10vw, 9rem);   /* vault/hero headline */
--text-h1:     clamp(2.5rem, 5vw, 5rem);  /* page titles */
--text-h2:     clamp(1.8rem, 3vw, 3rem);  /* section headings */
--text-h3:     clamp(1.2rem, 2vw, 1.8rem);/* subsection labels */
--text-body:   1rem;                        /* 16px body */
--text-small:  0.875rem;                    /* captions, meta */
--text-label:  0.75rem;                     /* all-caps labels */
```

### Spacing
```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
--space-32: 128px;
```

### Borders & Radii
```css
--border-hairline: 1px solid var(--color-gold);
--border-dim:      1px solid var(--color-border);
--radius:          0;   /* sharp edges everywhere — no border-radius */
```

### Motion Tokens
```css
--ease-vault:    cubic-bezier(0.76, 0, 0.24, 1);  /* heavy mechanical */
--ease-settle:   cubic-bezier(0.22, 1, 0.36, 1);  /* ease out authority */
--ease-hover:    cubic-bezier(0.4, 0, 0.2, 1);    /* standard UI */

--dur-fast:    200ms;
--dur-normal:  400ms;
--dur-slow:    700ms;
--dur-vault:   1200ms; /* per vault stage */
```

---

## 5. Site Architecture

```
collateral/
├── index.html          # Home (vault hero + sections)
├── about.html
├── services.html
├── inventory.html
├── contact.html
├── css/
│   ├── tokens.css      # design tokens (:root variables)
│   ├── base.css        # reset, body, typography
│   ├── layout.css      # nav, footer, page wrapper
│   └── components.css  # buttons, cards, forms, sections
├── js/
│   ├── vault.js        # Three.js vault scene (self-contained)
│   ├── scroll.js       # GSAP ScrollTrigger sequences (non-vault)
│   └── nav.js          # navigation, mobile menu
└── docs/
    └── superpowers/specs/
```

---

## 6. Vault Hero — Technical Specification

### 6a. Three.js Scene Architecture

**Renderer:**
- `WebGLRenderer({ antialias: true, alpha: true })`
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`
- `renderer.shadowMap.enabled = true`, type: `PCFSoftShadowMap`
- `renderer.toneMapping = THREE.ACESFilmicToneMapping`, exposure: 1.0
- `renderer.outputColorSpace = THREE.SRGBColorSpace`

**Camera:**
- `PerspectiveCamera(45, aspect, 0.1, 100)`
- Position: `(0, 0, 6)`, looking at origin
- On mobile (< 768px): position pushed to `(0, 0, 8)` for scale

**Vault Door Geometry (Approach A):**

| Part | Geometry | Role |
|---|---|---|
| Door face | `CircleGeometry(2.4, 128)` | Main circular face |
| Outer rim | `TorusGeometry(2.4, 0.12, 32, 128)` | Raised circular border |
| Inner ring | `TorusGeometry(1.8, 0.06, 16, 128)` | Decorative inner ring |
| Bolt slots (×6) | `TorusGeometry(0.18, 0.04, 8, 32)` — instanced at 60° intervals | Bolt housing rings |
| Bolts (×6) | `CylinderGeometry(0.1, 0.1, 0.5, 16)` — instanced | Retractable pins |
| Handle center | `CylinderGeometry(0.25, 0.25, 0.1, 32)` | Central handle hub |
| Handle bar | `CylinderGeometry(0.06, 0.06, 0.8, 16)` — rotated 90° | Handle grip |
| Floor plane | `PlaneGeometry(10, 10)` | Shadow receiver |

**Materials:**

```javascript
// Primary vault steel — MeshPhysicalMaterial
vaultMaterial = new THREE.MeshPhysicalMaterial({
  color:      0x2A2A2A,
  metalness:  0.95,
  roughness:  0.12,
  clearcoat:  0.8,
  clearcoatRoughness: 0.1,
})

// Gold trim — MeshStandardMaterial with emissive
goldMaterial = new THREE.MeshStandardMaterial({
  color:             0xC9A84C,
  metalness:         0.9,
  roughness:         0.2,
  emissive:          0xC9A84C,
  emissiveIntensity: 0.0,  // animated to 0.4 on door open
})

// Floor — shadow receiver only
floorMaterial = new THREE.MeshStandardMaterial({
  color:    0x0A0A0A,
  roughness: 1,
  metalness: 0,
})
```

**Lighting Setup (dramatic three-point):**

```javascript
// Key light — warm, front-left
keyLight = new THREE.SpotLight(0xFFF5E0, 3)
keyLight.position.set(-4, 6, 5)
keyLight.angle = Math.PI / 8
keyLight.penumbra = 0.3
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)

// Fill — cool, right  
fillLight = new THREE.DirectionalLight(0xC8D8FF, 0.6)
fillLight.position.set(5, 2, 3)

// Rim — back, gold tint
rimLight = new THREE.PointLight(0xC9A84C, 0.8, 15)
rimLight.position.set(0, -3, -4)

// Ambient base
ambient = new THREE.AmbientLight(0x111111, 1)
```

**Post-processing (EffectComposer):**
- `RenderPass` — base scene
- `UnrealBloomPass` — threshold: 0.8, strength: 0.0 (animated to 0.6 at door open), radius: 0.4
- `ShaderPass(GammaCorrectionShader)` — final gamma correction
- Bloom applies to gold trim objects only (selective bloom via layer mask)

### 6b. Scroll Sequence — 4 Stages

Page pinned for full vault sequence via GSAP `ScrollTrigger` with `pin: true`.

```
Total scroll distance for pin: 400vh
```

| Stage | Scroll% | Action | GSAP target | Duration |
|---|---|---|---|---|
| 0 → 25% | 0–25 | **Bolts retract** one by one (staggered 120ms apart) — each bolt `position.z -= 0.6` | bolt meshes | 1200ms |
| 25 → 50% | 25–50 | **Handle rotates** — `vaultHandle.rotation.z` from `0` to `-Math.PI * 0.4` | handle group | 800ms |
| 50 → 80% | 50–80 | **Door swings open** — `vaultDoor.rotation.y` from `0` to `-Math.PI * 0.65`, camera nudges back `z += 1` | door group | 1400ms |
| 80 → 100% | 80–100 | **Content reveal** — homepage sections fade in from `opacity: 0, translateY: 40px`; bloom activates; gold emissive rises | DOM + uniforms | 700ms |

**Reduced motion fallback:**
- Detected via `window.matchMedia('(prefers-reduced-motion: reduce)')`
- If true: vault renders static (door ajar at 30%), no scroll sequence, sections visible immediately, no bloom

**Disposal after open:**
```javascript
function disposeVault() {
  cancelAnimationFrame(vaultRaf)
  scene.traverse(obj => {
    if (obj.isMesh) {
      obj.geometry.dispose()
      obj.material.dispose()
    }
  })
  renderer.dispose()
  composer.dispose()
  vaultCanvas.remove()
}
```
Called via `onLeave` ScrollTrigger callback after stage 4 completes + 2s delay.

---

## 7. Page Specifications

### 7a. Home (index.html)

Sections after vault:
1. **Services strip** — 3-column grid: "Bring It In → Get Valued → Walk Out Paid". Gold numbered labels, thin gold top border, serif headline per step.
2. **Testimonials** — 3 placeholder quotes, off-white italic serif text, gold quotation marks, customer name in small-caps label style.
3. **CTA section** — Full-width, centered. "Ready to trade?" headline. Two buttons: "Get an Appraisal" (gold border, transparent fill) + "Browse Inventory" (gold fill, black text). Hairline gold top border separating from testimonials.
4. **Footer** — Minimal. Logo mark, nav links, "Waller, TX" location line, placeholder phone.

### 7b. About (about.html)
- Hero: page title "About Collateral" — display serif, left-aligned, gold underline keyline
- Brand story section: long-form editorial text, generous line-height
- Values: 3–4 value statements as large-type pull quotes, separated by hairline gold borders

### 7c. Services (services.html)
- Three service blocks (Buy / Sell / Loan) — each full-width, alternating layout (text left / right)
- Gold section number label ("01", "02", "03")
- Each service gets a brief paragraph + "Learn more →" gold text link

### 7d. Inventory (inventory.html)
- Section intro: "Current Inventory" heading + short description
- Grid: 12 placeholder cards (4×3 desktop, 2×6 tablet, 1×12 mobile)
- Each card: dark surface `#111111`, placeholder image area, item name, price placeholder, gold hairline border
- "Inquire" CTA per card

### 7e. Contact (contact.html)
- Two-column layout: info left (address placeholder, phone placeholder, hours) / form right
- Form: name, email, message, subject — all inputs styled dark with gold focus border
- Submit button: gold border, transparent, hover fills gold
- Embedded map placeholder (static div with "Waller, TX" text — no external dependency)

---

## 8. Navigation

- Fixed top nav, `background: rgba(10,10,10,0.92)`, `backdrop-filter: blur(8px)`
- Logo: "COLLATERAL" in display serif, gold color, letter-spacing 0.2em
- Nav links: Barlow Condensed, uppercase, 0.12em letter-spacing
- Hover: gold underline sweep (left-to-right, 200ms, CSS pseudo-element)
- Mobile: hamburger (3 horizontal lines → × icon), full-screen overlay menu, same dark aesthetic
- Active page: gold underline persists

---

## 9. CDN Dependencies

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- GSAP + ScrollTrigger (UMD global, loaded before vault.js) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Three.js — full importmap (avoids UMD/ESM conflict with postprocessing addons) -->
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
  }
}
</script>

<!-- vault.js loaded as ES module after importmap -->
<script type="module" src="js/vault.js"></script>
```

> **Loading order:** GSAP scripts load as classic scripts first (they set `window.gsap` and `window.ScrollTrigger`). Three.js uses the importmap. `vault.js` is `type="module"` and imports from the importmap. `scroll.js` and `nav.js` are classic scripts that can reference `window.gsap`.

---

## 10. Testing Checkpoints

After each task:
- Open in browser, check console for zero errors
- Verify at 375px / 768px / 1440px via DevTools responsive mode
- Confirm design tokens — no rogue hex values, no Inter/Roboto

Vault-specific:
- Three.js scene renders frame 1 with no console errors
- All 4 scroll stages fire in sequence
- Pin activates and releases
- Disposal confirmed (canvas removed from DOM post-sequence)
- Reduced-motion: static vault renders, no scroll pin

Final:
- All 5 pages load from `index.html` links
- No broken asset paths
- Full genjutsu audit passes
- Superpowers code review passes

---

## 11. Definition of Done

- [ ] Browser opens `index.html` — vault renders, zero console errors
- [ ] All 4 vault scroll stages fire correctly
- [ ] All 5 pages load and link correctly
- [ ] Reduced-motion fallback implemented and tested
- [ ] Full genjutsu audit passes
- [ ] Looks premium — not like a template
