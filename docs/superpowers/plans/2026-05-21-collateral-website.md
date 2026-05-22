# Collateral Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully functional 5-page premium pawn shop website with a Three.js scroll-driven vault hero, GSAP animations, and a complete design system — all as plain HTML/CSS/JS, no build process.

**Architecture:** CSS design tokens drive every visual decision. vault.js is a self-contained ES module (Three.js via importmap) that builds the 3D vault, runs a 4-stage GSAP scroll sequence, then disposes itself. All other pages share the same CSS and nav/footer structure.

**Tech Stack:** Vanilla HTML/CSS/JS · Three.js r165 (importmap/ESM) · GSAP 3.12.5 + ScrollTrigger (CDN classic scripts) · Cormorant Garamond + Barlow Condensed (Google Fonts)

**Spec:** `docs/superpowers/specs/2026-05-21-collateral-design.md`

---

## File Map

```
collateral/
├── index.html
├── about.html
├── services.html
├── inventory.html
├── contact.html
├── css/
│   ├── tokens.css       — :root design variables (single source of truth)
│   ├── base.css         — reset, body, typography, selection
│   ├── layout.css       — nav, footer, page hero, #vault-hero, .home-content
│   └── components.css   — buttons, cards, sections, forms, inventory grid
├── js/
│   ├── vault.js         — Three.js ES module: scene + scroll sequence + disposal
│   ├── scroll.js        — GSAP section reveals (classic script)
│   └── nav.js           — mobile menu toggle (classic script)
└── docs/superpowers/
    ├── specs/2026-05-21-collateral-design.md
    └── plans/2026-05-21-collateral-website.md  ← this file
```

---

## Task 1: CSS Design System

**Files:**
- Create: `css/tokens.css`
- Create: `css/base.css`
- Create: `css/layout.css`
- Create: `css/components.css`

- [ ] **Step 1: Create `css/tokens.css`**

```css
/* css/tokens.css — Single source of truth for all design tokens */
:root {
  /* Colors */
  --color-bg:       #0A0A0A;
  --color-gold:     #C9A84C;
  --color-text:     #F5F2EC;
  --color-text-dim: #8A8680;
  --color-border:   #1E1E1E;
  --color-surface:  #111111;

  /* Typography */
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'Barlow Condensed', 'Helvetica Neue', sans-serif;
  --font-display-bold:   700;
  --font-display-light:  300;
  --font-body-regular:   400;
  --font-body-medium:    500;

  /* Type scale */
  --text-hero:   clamp(4rem, 10vw, 9rem);
  --text-h1:     clamp(2.5rem, 5vw, 5rem);
  --text-h2:     clamp(1.8rem, 3vw, 3rem);
  --text-h3:     clamp(1.2rem, 2vw, 1.8rem);
  --text-body:   1rem;
  --text-small:  0.875rem;
  --text-label:  0.75rem;

  /* Spacing */
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

  /* Borders */
  --border-gold: 1px solid var(--color-gold);
  --border-dim:  1px solid var(--color-border);
  --radius: 0;

  /* Motion */
  --ease-vault:  cubic-bezier(0.76, 0, 0.24, 1);
  --ease-settle: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-hover:  cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast:    200ms;
  --dur-normal:  400ms;
  --dur-slow:    700ms;
}
```

- [ ] **Step 2: Create `css/base.css`**

```css
/* css/base.css — Reset, body, typography */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-weight: var(--font-body-regular);
  font-size: var(--text-body);
  line-height: 1.6;
  overflow-x: hidden;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: var(--font-display-bold);
  line-height: 1.1;
  letter-spacing: -0.01em;
}

a {
  color: var(--color-text);
  text-decoration: none;
}

img, canvas {
  display: block;
  max-width: 100%;
}

::selection {
  background: var(--color-gold);
  color: var(--color-bg);
}

.label {
  font-family: var(--font-body);
  font-size: var(--text-label);
  font-weight: var(--font-body-medium);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-gold);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Create `css/layout.css`**

```css
/* css/layout.css — Nav, footer, vault hero, page structure */

/* ── Navigation ── */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  background: rgba(10, 10, 10, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: var(--border-dim);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: var(--font-display-bold);
  color: var(--color-gold);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
}

.nav-links a {
  font-family: var(--font-body);
  font-size: var(--text-small);
  font-weight: var(--font-body-medium);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  position: relative;
  padding-bottom: 3px;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 0; height: 1px;
  background: var(--color-gold);
  transition: width var(--dur-normal) var(--ease-hover);
}

.nav-links a:hover::after,
.nav-links a.active::after { width: 100%; }

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-1);
}

.nav-toggle span {
  display: block;
  width: 24px; height: 1px;
  background: var(--color-text);
  transition: transform var(--dur-fast) var(--ease-hover),
              opacity var(--dur-fast) var(--ease-hover);
}

.nav-toggle.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-toggle.open span:nth-child(2) { opacity: 0; }
.nav-toggle.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* ── Mobile overlay ── */
.nav-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 199;
  background: var(--color-bg);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-8);
}

.nav-overlay.open { display: flex; }

.nav-overlay a {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--font-display-bold);
  transition: color var(--dur-fast) var(--ease-hover);
}

.nav-overlay a:hover { color: var(--color-gold); }

@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-toggle { display: flex; }
}

/* ── Vault hero ── */
#vault-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

#vault-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
}

.vault-hint {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  opacity: 0.5;
  pointer-events: none;
}

.vault-hint-text {
  font-size: var(--text-label);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.vault-hint-line {
  width: 1px; height: 32px;
  background: var(--color-gold);
  animation: hint-pulse 2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.2; transform: scaleY(0.6); }
  50%       { opacity: 1;   transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .vault-hint { display: none; }
}

/* ── Home content (revealed after vault) ── */
.home-content {
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--dur-slow) var(--ease-settle);
}

.home-content.visible {
  opacity: 1;
  pointer-events: auto;
}

@media (prefers-reduced-motion: reduce) {
  .home-content { opacity: 1; pointer-events: auto; }
}

/* ── Page wrapper (non-home pages) ── */
.page-wrapper {
  padding-top: 72px;
  min-height: 100vh;
}

/* ── Page hero (non-home) ── */
.page-hero {
  padding: var(--space-24) var(--space-8) var(--space-16);
  border-bottom: var(--border-dim);
}

.page-hero-label { margin-bottom: var(--space-4); }

.page-hero-title {
  font-size: var(--text-h1);
  position: relative;
  display: inline-block;
}

.page-hero-title::after {
  content: '';
  position: absolute;
  bottom: -var(--space-3);
  left: 0;
  width: 48px; height: 1px;
  background: var(--color-gold);
  margin-top: var(--space-3);
}

/* ── Section ── */
.section {
  padding: var(--space-24) var(--space-8);
  border-bottom: var(--border-dim);
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: var(--space-12);
}

.section-title {
  font-size: var(--text-h2);
  margin-top: var(--space-3);
}

/* ── Footer ── */
.footer {
  border-top: var(--border-dim);
  padding: var(--space-12) var(--space-8);
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--space-4) var(--space-8);
  align-items: start;
}

.footer-logo {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: var(--font-display-bold);
  color: var(--color-gold);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  grid-column: 1;
  grid-row: 1;
}

.footer-nav {
  display: flex;
  gap: var(--space-6);
  grid-column: 2;
  grid-row: 1;
}

.footer-nav a {
  font-size: var(--text-small);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  transition: color var(--dur-fast) var(--ease-hover);
}

.footer-nav a:hover { color: var(--color-gold); }

.footer-location {
  font-size: var(--text-small);
  color: var(--color-text-dim);
  letter-spacing: 0.08em;
  grid-column: 3;
  grid-row: 1;
  text-align: right;
}

.footer-copy {
  font-size: var(--text-label);
  color: var(--color-text-dim);
  letter-spacing: 0.08em;
  grid-column: 1 / -1;
  grid-row: 2;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .footer-logo, .footer-nav, .footer-location, .footer-copy {
    grid-column: 1;
    grid-row: auto;
    text-align: left;
  }
  .footer-nav { flex-wrap: wrap; }
}
```

- [ ] **Step 4: Create `css/components.css`**

```css
/* css/components.css — Buttons, cards, services, testimonials, forms, inventory */

/* ── Buttons ── */
.btn {
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--text-small);
  font-weight: var(--font-body-medium);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: var(--space-4) var(--space-8);
  cursor: pointer;
  border: var(--border-gold);
  transition: background var(--dur-fast) var(--ease-hover),
              color var(--dur-fast) var(--ease-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--color-gold);
}

.btn-ghost:hover {
  background: var(--color-gold);
  color: var(--color-bg);
}

.btn-gold {
  background: var(--color-gold);
  color: var(--color-bg);
}

.btn-gold:hover {
  background: transparent;
  color: var(--color-gold);
}

/* ── Services strip ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  border: var(--border-dim);
}

.service-step {
  padding: var(--space-12) var(--space-8);
  border-right: var(--border-dim);
  position: relative;
}

.service-step:last-child { border-right: none; }

.service-number {
  display: block;
  margin-bottom: var(--space-4);
}

.service-title {
  font-size: var(--text-h3);
  margin-bottom: var(--space-4);
}

.service-desc {
  color: var(--color-text-dim);
  font-size: var(--text-body);
  line-height: 1.7;
}

@media (max-width: 768px) {
  .services-grid { grid-template-columns: 1fr; }
  .service-step { border-right: none; border-bottom: var(--border-dim); }
  .service-step:last-child { border-bottom: none; }
}

/* ── Testimonials ── */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.testimonial-card {
  padding: var(--space-8);
  border: var(--border-dim);
  position: relative;
}

.testimonial-card::before {
  content: '\201C';
  font-family: var(--font-display);
  font-size: 4rem;
  color: var(--color-gold);
  opacity: 0.4;
  position: absolute;
  top: var(--space-3);
  left: var(--space-6);
  line-height: 1;
}

.testimonial-text {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-text);
  padding-top: var(--space-6);
}

.testimonial-author {
  margin-top: var(--space-6);
  font-size: var(--text-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-dim);
}

@media (max-width: 768px) {
  .testimonials-grid { grid-template-columns: 1fr; }
}

/* ── CTA section ── */
.cta-section {
  text-align: center;
  border-bottom: none !important;
}

.cta-heading {
  font-size: var(--text-h1);
  margin-bottom: var(--space-6);
}

.cta-sub {
  color: var(--color-text-dim);
  max-width: 480px;
  margin: 0 auto var(--space-12);
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

/* ── About: brand story ── */
.brand-story {
  max-width: 720px;
}

.brand-story p {
  font-size: 1.1rem;
  line-height: 1.9;
  color: var(--color-text-dim);
  margin-bottom: var(--space-6);
}

.brand-story p:first-child {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  color: var(--color-text);
  font-style: italic;
}

/* ── About: values ── */
.values-list {
  list-style: none;
}

.value-item {
  padding: var(--space-8) 0;
  border-bottom: var(--border-dim);
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: var(--space-6);
  align-items: start;
}

.value-item:first-child { border-top: var(--border-dim); }

.value-number { color: var(--color-gold); font-size: var(--text-label); letter-spacing: 0.15em; }

.value-title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  margin-bottom: var(--space-2);
}

.value-desc { color: var(--color-text-dim); line-height: 1.7; }

/* ── Services page: service blocks ── */
.service-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
  padding: var(--space-16) var(--space-8);
  border-bottom: var(--border-dim);
  max-width: 1280px;
  margin: 0 auto;
}

.service-block:nth-child(even) { direction: rtl; }
.service-block:nth-child(even) > * { direction: ltr; }

.service-block-number {
  font-size: clamp(6rem, 12vw, 10rem);
  font-family: var(--font-display);
  font-weight: var(--font-display-light);
  color: var(--color-border);
  line-height: 1;
  margin-bottom: var(--space-4);
}

.service-block-title {
  font-size: var(--text-h2);
  margin-bottom: var(--space-6);
}

.service-block-desc {
  color: var(--color-text-dim);
  line-height: 1.8;
  margin-bottom: var(--space-8);
  max-width: 480px;
}

.service-block-visual {
  background: var(--color-surface);
  border: var(--border-dim);
  aspect-ratio: 4/3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-dim);
  font-size: var(--text-label);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .service-block { grid-template-columns: 1fr; direction: ltr; }
  .service-block:nth-child(even) { direction: ltr; }
}

/* ── Inventory grid ── */
.inventory-intro {
  padding: var(--space-16) var(--space-8) var(--space-8);
  max-width: 1280px;
  margin: 0 auto;
  border-bottom: var(--border-dim);
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-left: var(--border-dim);
  border-top: var(--border-dim);
  max-width: 1280px;
  margin: 0 auto;
}

.inventory-card {
  border-right: var(--border-dim);
  border-bottom: var(--border-dim);
  padding: var(--space-6);
  transition: background var(--dur-fast) var(--ease-hover);
}

.inventory-card:hover { background: var(--color-surface); }

.inventory-card-image {
  width: 100%;
  aspect-ratio: 1;
  background: var(--color-surface);
  border: var(--border-dim);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-dim);
  font-size: var(--text-label);
  letter-spacing: 0.1em;
}

.inventory-card-name {
  font-family: var(--font-display);
  font-size: 1.1rem;
  margin-bottom: var(--space-2);
}

.inventory-card-price {
  color: var(--color-gold);
  font-size: var(--text-small);
  letter-spacing: 0.08em;
  margin-bottom: var(--space-4);
}

@media (max-width: 1024px) { .inventory-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px)  { .inventory-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .inventory-grid { grid-template-columns: 1fr; } }

/* ── Contact ── */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-16);
  align-items: start;
}

.contact-info-item {
  margin-bottom: var(--space-8);
}

.contact-info-label { margin-bottom: var(--space-2); }

.contact-info-value {
  font-family: var(--font-display);
  font-size: var(--text-h3);
}

.contact-map-placeholder {
  background: var(--color-surface);
  border: var(--border-dim);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-dim);
  font-size: var(--text-label);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: var(--space-8);
}

/* ── Form ── */
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-size: var(--text-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-dim);
  margin-bottom: var(--space-2);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  background: var(--color-surface);
  border: var(--border-dim);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--text-body);
  padding: var(--space-3) var(--space-4);
  outline: none;
  transition: border-color var(--dur-fast) var(--ease-hover);
  appearance: none;
  border-radius: 0;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus { border-color: var(--color-gold); }

.form-textarea {
  min-height: 160px;
  resize: vertical;
}

@media (max-width: 768px) {
  .contact-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Verify fonts load**

Create a temporary test file, open it in browser, confirm fonts render:

```html
<!-- Save as test.html in collateral/, open in browser, then delete -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Test</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
</head>
<body style="padding:2rem">
  <p class="label">Label text — should be Barlow Condensed gold uppercase</p>
  <h1 style="font-size:3rem">Collateral — should be Cormorant Garamond bold</h1>
  <p style="color:var(--color-text-dim)">Body text — Barlow Condensed regular</p>
</body>
</html>
```

Open `file:///Users/smoov/Desktop/collateral/test.html`  
Expected: Cormorant Garamond on h1, Barlow Condensed on p, gold label, dark background  
Console: zero errors

- [ ] **Step 6: Delete test.html**

```bash
rm /Users/smoov/Desktop/collateral/test.html
```

- [ ] **Step 7: Commit**

```bash
cd ~/Desktop/collateral && git init && git add css/ && git commit -m "feat: CSS design system — tokens, base, layout, components"
```

---

## Task 2: Navigation JS

**Files:**
- Create: `js/nav.js`

- [ ] **Step 1: Create `js/nav.js`**

```javascript
// js/nav.js — Mobile menu and active page highlight (classic script)
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');

  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      var isOpen = overlay.classList.contains('open');
      overlay.classList.toggle('open');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close overlay when a link is clicked
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Mark active nav link based on current page
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-overlay a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();
```

- [ ] **Step 2: Commit**

```bash
cd ~/Desktop/collateral && git add js/nav.js && git commit -m "feat: navigation mobile menu and active state"
```

---

## Task 3: Home Page HTML Structure

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Collateral — Premium Pawn | Waller, TX</title>
  <meta name="description" content="Collateral is Waller, TX's premium pawn shop. Buy, sell, or get a loan on jewelry, watches, electronics, and more.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.165.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.165.0/examples/jsm/"
    }
  }
  </script>
</head>
<body>

  <nav class="nav" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">Collateral</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="nav-overlay" role="dialog" aria-label="Mobile navigation">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="services.html">Services</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Contact</a>
  </div>

  <section id="vault-hero" aria-label="Vault entrance">
    <canvas id="vault-canvas" aria-hidden="true"></canvas>
    <div class="vault-hint" aria-hidden="true">
      <span class="vault-hint-text">Scroll to enter</span>
      <div class="vault-hint-line"></div>
    </div>
  </section>

  <main class="home-content" id="home-content">

    <section class="section" aria-labelledby="services-heading">
      <div class="section-header">
        <p class="label" id="services-heading">How It Works</p>
        <h2 class="section-title">Three steps. No games.</h2>
      </div>
      <div class="services-grid">
        <div class="service-step">
          <span class="service-number label">01</span>
          <h3 class="service-title">Bring It In</h3>
          <p class="service-desc">Bring your valuables to our Waller location. Jewelry, watches, electronics, tools, firearms — if it has value, we want to see it.</p>
        </div>
        <div class="service-step">
          <span class="service-number label">02</span>
          <h3 class="service-title">Get Valued</h3>
          <p class="service-desc">Our specialists give you an honest, transparent appraisal on the spot. No pressure, no games, no lowballing.</p>
        </div>
        <div class="service-step">
          <span class="service-number label">03</span>
          <h3 class="service-title">Walk Out Paid</h3>
          <p class="service-desc">Sell outright or take a collateral loan. Walk out with cash in hand, same day. Terms are clear before you sign anything.</p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="testimonials-heading">
      <div class="section-header">
        <p class="label" id="testimonials-heading">What Clients Say</p>
        <h2 class="section-title">Straight talk from straight deals.</h2>
      </div>
      <div class="testimonials-grid">
        <blockquote class="testimonial-card">
          <p class="testimonial-text">"Fair prices and straight talk. I've been coming here for three years and never once felt taken advantage of."</p>
          <footer class="testimonial-author">— J. Morales, Waller TX</footer>
        </blockquote>
        <blockquote class="testimonial-card">
          <p class="testimonial-text">"Needed cash fast and they made it simple. Appraised my watch, explained everything, and I walked out in 20 minutes."</p>
          <footer class="testimonial-author">— R. Thompson, Hempstead TX</footer>
        </blockquote>
        <blockquote class="testimonial-card">
          <p class="testimonial-text">"Best pawn shop in the area. The inventory is quality and the staff actually know what things are worth."</p>
          <footer class="testimonial-author">— D. Castillo, Cypress TX</footer>
        </blockquote>
      </div>
    </section>

    <section class="section cta-section" aria-labelledby="cta-heading">
      <h2 class="cta-heading" id="cta-heading">Ready to trade?</h2>
      <p class="cta-sub">Walk in with something worth having. Walk out with what you need.</p>
      <div class="cta-buttons">
        <a href="contact.html" class="btn btn-ghost">Get an Appraisal</a>
        <a href="inventory.html" class="btn btn-gold">Browse Inventory</a>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <a href="index.html" class="footer-logo">Collateral</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="inventory.html">Inventory</a>
          <a href="contact.html">Contact</a>
        </nav>
        <p class="footer-location">Waller, TX &mdash; (555) 000-0000</p>
        <p class="footer-copy">&copy; 2026 Collateral. All rights reserved.</p>
      </div>
    </footer>

  </main>

  <script type="module" src="js/vault.js"></script>
  <script src="js/scroll.js"></script>
  <script src="js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `file:///Users/smoov/Desktop/collateral/index.html`  
Expected: Dark background, gold "COLLATERAL" nav logo, vault canvas area (black), home-content invisible (opacity 0)  
Console: one expected 404 for vault.js (not written yet), no CSS errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/collateral && git add index.html && git commit -m "feat: home page HTML structure"
```

---

## Task 4: Vault — Static Three.js Scene

**Files:**
- Create: `js/vault.js` (phase 1 — static render, no scroll)

- [ ] **Step 1: Create `js/vault.js` with the static scene**

```javascript
// js/vault.js — Collateral vault hero (Three.js ES module)
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

// Module-level state (needed for disposal)
let renderer, composer, scene, camera, animFrameId;
let vaultGroup, handleGroup;
export const boltMeshes = [];
export const goldMaterials = [];
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
  const face = new THREE.Mesh(new THREE.CircleGeometry(2.4, 128), steelMat);
  vaultGroup.add(face);

  // Outer rim
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.12, 32, 128), steelMat));

  // Inner decorative ring (gold)
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.05, 16, 128), goldMat));

  // Centre ring (gold)
  vaultGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 16, 64), goldMat2));

  // Bolts (6x at 60° intervals, r=2.1)
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

    // Bolt pin — cylinder oriented along Z axis, protrudes from face
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16),
      boltBodyMat
    );
    bolt.rotation.x = Math.PI / 2; // cylinder lies along Z
    bolt.position.set(bx, by, 0.35);
    vaultGroup.add(bolt);
    boltMeshes.push(bolt);
  }

  // Handle group (nested — rotates independently)
  handleGroup = new THREE.Group();
  handleGroup.position.z = 0.12;
  vaultGroup.add(handleGroup);

  const hubMat = goldMat.clone();
  goldMaterials.push(hubMat);

  // Hub disc
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 32), hubMat);
  hub.rotation.x = Math.PI / 2;
  handleGroup.add(hub);

  // Horizontal bar
  const barMat = hubMat.clone();
  goldMaterials.push(barMat);
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

  vaultGroup.traverse(obj => {
    if (obj.isMesh) { obj.castShadow = true; obj.receiveShadow = true; }
  });
}

function buildLighting() {
  // Key: warm spot front-left
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
    0.0,   // strength — animated to 0.6 on door open
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

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0A0A0A);

  // Camera
  const isMobile = window.innerWidth < 768;
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 8 : 6);

  // Renderer
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

// ES modules are deferred; DOM is ready by execution time
initVault();
```

- [ ] **Step 2: Verify vault renders**

Open `file:///Users/smoov/Desktop/collateral/index.html`  
Expected: Full-screen 3D vault door visible on dark background — circular steel door with gold rings, 6 bolt pins, gold handle  
Check: dramatic side lighting with shadow, metallic sheen visible on door face  
Console: **zero errors** — any Three.js error here must be fixed before continuing

- [ ] **Step 3: Verify at breakpoints**

Open DevTools → Toggle device toolbar  
- 375px: vault fills screen, door visible (slightly smaller due to camera pullback)
- 768px: vault fills screen
- 1440px: vault fills screen, full detail visible  
Console: zero errors at each width

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/collateral && git add js/vault.js && git commit -m "feat: vault — static Three.js scene with PBR materials and lighting"
```

---

## Task 5: Vault — GSAP Scroll Sequence

**Files:**
- Modify: `js/vault.js` — add `initScrollSequence()` and call it from `initVault()`

- [ ] **Step 1: Add `initScrollSequence()` to `vault.js` — insert before `initVault()`**

```javascript
function initScrollSequence() {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    console.warn('GSAP not available — vault scroll sequence disabled');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Timeline drives all 4 stages; scrub maps it to scroll position
  // Timeline total: ~10 units → maps to 400vh of scroll
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#vault-hero',
      start: 'top top',
      end: '+=400%',
      pin: true,
      anticipatePin: 1,
      scrub: 2,
      onLeave: function () {
        var homeContent = document.getElementById('home-content');
        if (homeContent) homeContent.classList.add('visible');
        setTimeout(disposeVault, 2000);
        // Refresh scroll triggers so section reveals recalculate positions
        setTimeout(function () { ScrollTrigger.refresh(); }, 800);
      },
    }
  });

  // Stage 1 — Bolts retract (timeline 0 → ~2.05)
  // Each bolt: duration 0.3, staggered 0.35 apart
  boltMeshes.forEach(function (bolt, i) {
    tl.to(bolt.position, {
      z: bolt.position.z - 0.65,
      duration: 0.3,
      ease: 'power2.in',
    }, i * 0.35);
  });

  // Stage 2 — Handle rotates (timeline 2.5 → 5.0)
  tl.to(handleGroup.rotation, {
    z: -Math.PI * 0.4,
    duration: 2.5,
    ease: 'power3.inOut',
  }, 2.5);

  // Stage 3 — Door swings open (timeline 5.0 → 8.0)
  tl.to(vaultGroup.rotation, {
    y: -Math.PI * 0.65,
    duration: 3.0,
    ease: 'power2.inOut',
  }, 5.0);

  tl.to(camera.position, {
    z: camera.position.z + 1.0,
    duration: 3.0,
    ease: 'power2.out',
  }, 5.0);

  // Stage 4 — Bloom + gold emissive (timeline 8.0 → 10.0)
  tl.to(bloomPass, {
    strength: 0.6,
    duration: 2.0,
    ease: 'power1.in',
  }, 8.0);

  goldMaterials.forEach(function (mat) {
    tl.to(mat, {
      emissiveIntensity: 1.5,
      duration: 2.0,
      ease: 'power1.in',
    }, 8.0);
  });

  // Fade out scroll hint on first scroll movement
  tl.to('.vault-hint', { opacity: 0, duration: 0.3 }, 0.1);
}
```

- [ ] **Step 2: Update `initVault()` to call `initScrollSequence()`**

In `vault.js`, find the `initVault()` function. After `startRenderLoop()`, replace the line `window.addEventListener('resize', onResize);` block so it reads:

```javascript
  buildVaultDoor();
  buildLighting();
  buildPostprocessing();
  startRenderLoop();
  initScrollSequence();
  window.addEventListener('resize', onResize);
```

- [ ] **Step 3: Verify scroll sequence in browser**

Open `file:///Users/smoov/Desktop/collateral/index.html`  
Scroll slowly:
- 0–100vh scroll: 6 bolt pins retract one by one into the door face ✓
- 100–200vh scroll: handle rotates ~144° clockwise ✓
- 200–320vh scroll: vault door swings open to left, camera pulls back slightly ✓
- 320–400vh scroll: gold trim brightens, bloom glow appears on gold elements ✓
- After 400vh: home-content fades in, vault still visible briefly ✓
- Console: zero errors throughout

- [ ] **Step 4: Verify pin behavior**

While scrolling through vault sequence:  
- Nav bar stays fixed above vault ✓ (z-index: 200 > vault z-index)
- Vault section is pinned to viewport during entire 400vh scroll ✓
- After pin releases, normal page scroll continues into home sections ✓

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/collateral && git add js/vault.js && git commit -m "feat: vault — GSAP 4-stage scroll sequence with pin"
```

---

## Task 6: Vault — Reduced Motion + Disposal

**Files:**
- Modify: `js/vault.js` — add `disposeVault()`, add reduced-motion branch

- [ ] **Step 1: Add `disposeVault()` to `vault.js` — insert before `initVault()`**

```javascript
function disposeVault() {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener('resize', onResize);

  // Kill all ScrollTrigger instances from this page
  if (window.ScrollTrigger) {
    window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
  }

  // Dispose all Three.js resources
  scene.traverse(function (obj) {
    if (obj.isMesh) {
      obj.geometry.dispose();
      var mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(function (m) { m.dispose(); });
    }
  });

  renderer.dispose();
  composer.dispose();

  // Remove vault DOM element
  var hero = document.getElementById('vault-hero');
  if (hero) hero.remove();
}
```

- [ ] **Step 2: Add reduced-motion branch in `initVault()`**

Replace `initScrollSequence();` in `initVault()` with:

```javascript
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Static: door partially open, content immediately visible
    vaultGroup.rotation.y = -Math.PI * 0.3;
    var homeContent = document.getElementById('home-content');
    if (homeContent) homeContent.classList.add('visible');
  } else {
    initScrollSequence();
  }
```

- [ ] **Step 3: Verify reduced-motion fallback**

In Chrome DevTools: Rendering tab → check "Emulate CSS media feature prefers-reduced-motion: reduce"  
Open `file:///Users/smoov/Desktop/collateral/index.html`  
Expected: Vault door rendered statically at 30° open, home-content immediately visible, no scroll pin, no animations  
Console: zero errors

- [ ] **Step 4: Verify disposal in normal mode**

Disable reduced-motion emulation.  
Open page, scroll through full 400vh vault sequence.  
After vault completes: open DevTools → Memory tab → take heap snapshot.  
Scroll 2 more seconds (disposal timer fires).  
Take second heap snapshot.  
Expected: Three.js objects (`WebGLRenderer`, `Scene`, etc.) no longer in retained objects. `#vault-hero` element removed from DOM Elements panel.

- [ ] **Step 5: Commit**

```bash
cd ~/Desktop/collateral && git add js/vault.js && git commit -m "feat: vault — reduced-motion fallback and memory disposal"
```

---

## Task 7: Home Content Reveals

**Files:**
- Create: `js/scroll.js`

- [ ] **Step 1: Create `js/scroll.js`**

```javascript
// js/scroll.js — Section reveal animations (classic script)
// Runs after vault sequence; ScrollTrigger.refresh() is called by vault.js on open
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Service steps — stagger in from below
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.service-step', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      });
    },
  });

  // Testimonial cards — stagger in
  ScrollTrigger.create({
    trigger: '.testimonials-grid',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power2.out',
      });
    },
  });

  // CTA section
  ScrollTrigger.create({
    trigger: '.cta-section',
    start: 'top 85%',
    once: true,
    onEnter: function () {
      gsap.from('.cta-heading, .cta-sub, .cta-buttons', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
      });
    },
  });
})();
```

- [ ] **Step 2: Verify reveals**

Open `file:///Users/smoov/Desktop/collateral/index.html`  
Scroll through vault → scroll into home sections:
- Service steps animate in with stagger ✓
- Testimonial cards animate in with stagger ✓
- CTA heading, subtext, buttons animate in sequence ✓
Console: zero errors

- [ ] **Step 3: Verify at 375px**

DevTools: 375px width. Service steps stack vertically. All reveals still fire. No broken layout.

- [ ] **Step 4: Commit**

```bash
cd ~/Desktop/collateral && git add js/scroll.js && git commit -m "feat: home section scroll reveals"
```

---

## Task 8: About Page

**Files:**
- Create: `about.html`

- [ ] **Step 1: Create `about.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About — Collateral | Waller, TX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>

  <nav class="nav" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">Collateral</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="nav-overlay" role="dialog" aria-label="Mobile navigation">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="services.html">Services</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Contact</a>
  </div>

  <div class="page-wrapper">

    <header class="page-hero">
      <p class="label page-hero-label">Our Story</p>
      <h1 class="page-hero-title">About Collateral</h1>
    </header>

    <section class="section" aria-labelledby="story-heading">
      <p class="label" id="story-heading">The Brand</p>
      <div class="brand-story">
        <p>"We built Collateral because trust was missing from this industry. Every piece that crosses our counter gets treated like it matters — because to someone, it does."</p>
        <p>Collateral is a premium pawn shop rooted in Waller, TX. We serve buyers, sellers, and borrowers across the greater Houston area who want honest appraisals and fair terms — no theatrics, no pressure.</p>
        <p>Our specialists are trained in jewelry, watches, electronics, firearms, and collectibles. When you bring something in, you get a real number from a real person who knows what they're talking about.</p>
        <p>We've been operating in Waller long enough to know our customers by name. That's how we like it.</p>
      </div>
    </section>

    <section class="section" aria-labelledby="values-heading">
      <p class="label" id="values-heading">What We Stand For</p>
      <ul class="values-list">
        <li class="value-item">
          <span class="value-number label">01</span>
          <div>
            <h2 class="value-title">Transparency</h2>
            <p class="value-desc">Every appraisal is explained. Every number has a reason. You leave knowing exactly what we paid and why.</p>
          </div>
        </li>
        <li class="value-item">
          <span class="value-number label">02</span>
          <div>
            <h2 class="value-title">Expertise</h2>
            <p class="value-desc">We don't guess. Our team has deep knowledge across categories — and when something is outside our wheelhouse, we say so.</p>
          </div>
        </li>
        <li class="value-item">
          <span class="value-number label">03</span>
          <div>
            <h2 class="value-title">Respect</h2>
            <p class="value-desc">People bring us things that matter to them. We treat every transaction with the weight it deserves.</p>
          </div>
        </li>
        <li class="value-item">
          <span class="value-number label">04</span>
          <div>
            <h2 class="value-title">Fairness</h2>
            <p class="value-desc">We don't win by taking advantage. We build long-term relationships. Repeat business is our proof of concept.</p>
          </div>
        </li>
      </ul>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <a href="index.html" class="footer-logo">Collateral</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="inventory.html">Inventory</a>
          <a href="contact.html">Contact</a>
        </nav>
        <p class="footer-location">Waller, TX &mdash; (555) 000-0000</p>
        <p class="footer-copy">&copy; 2026 Collateral. All rights reserved.</p>
      </div>
    </footer>

  </div>

  <script src="js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `file:///Users/smoov/Desktop/collateral/about.html`  
Expected: Nav fixed, page hero with "About Collateral" in large serif, brand story section, values list with gold numbers, footer  
Test at 375px / 768px / 1440px — no layout breaks  
Console: zero errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/collateral && git add about.html && git commit -m "feat: about page"
```

---

## Task 9: Services Page

**Files:**
- Create: `services.html`

- [ ] **Step 1: Create `services.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services — Collateral | Waller, TX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>

  <nav class="nav" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">Collateral</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="nav-overlay" role="dialog" aria-label="Mobile navigation">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="services.html">Services</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Contact</a>
  </div>

  <div class="page-wrapper">

    <header class="page-hero">
      <p class="label page-hero-label">What We Do</p>
      <h1 class="page-hero-title">Services</h1>
    </header>

    <article class="service-block" aria-labelledby="buy-heading">
      <div>
        <p class="service-block-number">01</p>
        <h2 class="service-block-title" id="buy-heading">Buy</h2>
        <p class="service-block-desc">Looking for quality goods at honest prices? Our floor inventory turns over constantly — jewelry, watches, electronics, tools, collectibles. Everything is vetted before it hits the floor.</p>
        <p class="service-block-desc">Browse online or come in. No pressure. We'll tell you everything we know about a piece before you decide.</p>
        <a href="inventory.html" class="btn btn-ghost">Browse Inventory</a>
      </div>
      <div class="service-block-visual" aria-hidden="true">Inventory Photography</div>
    </article>

    <article class="service-block" aria-labelledby="sell-heading">
      <div>
        <p class="service-block-number">02</p>
        <h2 class="service-block-title" id="sell-heading">Sell</h2>
        <p class="service-block-desc">Bring in what you want to sell. Our specialists appraise on-site and make an offer the same day. We buy jewelry, precious metals, watches, electronics, firearms (with proper documentation), and more.</p>
        <p class="service-block-desc">No appointment needed. Walk-ins welcome during business hours.</p>
        <a href="contact.html" class="btn btn-ghost">Get an Appraisal</a>
      </div>
      <div class="service-block-visual" aria-hidden="true">Appraisal Photography</div>
    </article>

    <article class="service-block" aria-labelledby="loan-heading">
      <div>
        <p class="service-block-number">03</p>
        <h2 class="service-block-title" id="loan-heading">Loan</h2>
        <p class="service-block-desc">Need cash without selling? Leave your item as collateral and take a short-term loan. Repay the loan within the term and your item comes back. Simple.</p>
        <p class="service-block-desc">Loan terms are clearly stated upfront. No hidden fees, no surprises. Your item is stored securely for the duration.</p>
        <a href="contact.html" class="btn btn-ghost">Start a Loan</a>
      </div>
      <div class="service-block-visual" aria-hidden="true">Vault Photography</div>
    </article>

    <footer class="footer">
      <div class="footer-inner">
        <a href="index.html" class="footer-logo">Collateral</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="inventory.html">Inventory</a>
          <a href="contact.html">Contact</a>
        </nav>
        <p class="footer-location">Waller, TX &mdash; (555) 000-0000</p>
        <p class="footer-copy">&copy; 2026 Collateral. All rights reserved.</p>
      </div>
    </footer>

  </div>

  <script src="js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `file:///Users/smoov/Desktop/collateral/services.html`  
Expected: 3 service blocks alternating text-left / text-right, large ghost number, placeholder visual panel  
At 768px: blocks stack to single column, direction reset  
Console: zero errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/collateral && git add services.html && git commit -m "feat: services page"
```

---

## Task 10: Inventory Page

**Files:**
- Create: `inventory.html`

- [ ] **Step 1: Create `inventory.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventory — Collateral | Waller, TX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>

  <nav class="nav" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">Collateral</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="nav-overlay" role="dialog" aria-label="Mobile navigation">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="services.html">Services</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Contact</a>
  </div>

  <div class="page-wrapper">

    <header class="page-hero">
      <p class="label page-hero-label">Available Now</p>
      <h1 class="page-hero-title">Inventory</h1>
    </header>

    <div class="inventory-intro">
      <p style="color:var(--color-text-dim); max-width:600px; line-height:1.8;">
        Our inventory changes weekly. Every item is inspected and priced fairly before it hits the floor. See something? <a href="contact.html" style="color:var(--color-gold); border-bottom:1px solid var(--color-gold);">Contact us to inquire.</a>
      </p>
    </div>

    <div class="inventory-grid" role="list">

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">18K Gold Chain</h3>
        <p class="inventory-card-price">$480</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Rolex Datejust 36</h3>
        <p class="inventory-card-price">$4,200</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Milwaukee Tool Set</h3>
        <p class="inventory-card-price">$220</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Diamond Solitaire Ring</h3>
        <p class="inventory-card-price">$1,100</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Sony A7 III Camera</h3>
        <p class="inventory-card-price">$1,350</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Gibson Les Paul</h3>
        <p class="inventory-card-price">$890</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Sterling Silver Set</h3>
        <p class="inventory-card-price">$310</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">MacBook Pro 14"</h3>
        <p class="inventory-card-price">$1,050</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Vintage Pocket Watch</h3>
        <p class="inventory-card-price">$640</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Dewalt Drill Set</h3>
        <p class="inventory-card-price">$145</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Gold Hoop Earrings</h3>
        <p class="inventory-card-price">$280</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

      <div class="inventory-card" role="listitem">
        <div class="inventory-card-image" aria-label="Item photo placeholder">Photo</div>
        <h3 class="inventory-card-name">Canon EOS R6</h3>
        <p class="inventory-card-price">$1,600</p>
        <a href="contact.html" class="btn btn-ghost" style="width:100%;text-align:center;">Inquire</a>
      </div>

    </div>

    <footer class="footer" style="margin-top:var(--space-12)">
      <div class="footer-inner">
        <a href="index.html" class="footer-logo">Collateral</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="inventory.html">Inventory</a>
          <a href="contact.html">Contact</a>
        </nav>
        <p class="footer-location">Waller, TX &mdash; (555) 000-0000</p>
        <p class="footer-copy">&copy; 2026 Collateral. All rights reserved.</p>
      </div>
    </footer>

  </div>

  <script src="js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `file:///Users/smoov/Desktop/collateral/inventory.html`  
Expected: 4-column inventory grid, each card dark surface with placeholder image area, gold prices, ghost buttons  
At 768px: 2 columns. At 480px: 1 column.  
Console: zero errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/collateral && git add inventory.html && git commit -m "feat: inventory page with placeholder items"
```

---

## Task 11: Contact Page

**Files:**
- Create: `contact.html`

- [ ] **Step 1: Create `contact.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — Collateral | Waller, TX</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,700&family=Barlow+Condensed:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
</head>
<body>

  <nav class="nav" aria-label="Primary navigation">
    <a href="index.html" class="nav-logo">Collateral</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="inventory.html">Inventory</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="nav-overlay" role="dialog" aria-label="Mobile navigation">
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="services.html">Services</a>
    <a href="inventory.html">Inventory</a>
    <a href="contact.html">Contact</a>
  </div>

  <div class="page-wrapper">

    <header class="page-hero">
      <p class="label page-hero-label">Get In Touch</p>
      <h1 class="page-hero-title">Contact</h1>
    </header>

    <section class="section" aria-label="Contact information and form">
      <div class="contact-grid">

        <div class="contact-info">
          <div class="contact-info-item">
            <p class="label contact-info-label">Location</p>
            <p class="contact-info-value">123 Placeholder Rd<br>Waller, TX 77484</p>
          </div>
          <div class="contact-info-item">
            <p class="label contact-info-label">Phone</p>
            <p class="contact-info-value">(555) 000-0000</p>
          </div>
          <div class="contact-info-item">
            <p class="label contact-info-label">Hours</p>
            <p class="contact-info-value" style="font-size:1rem; font-family:var(--font-body); line-height:2;">
              Mon–Fri: 9am – 6pm<br>
              Saturday: 10am – 4pm<br>
              Sunday: Closed
            </p>
          </div>
          <div class="contact-map-placeholder" aria-label="Map placeholder — Waller, TX">
            Waller, TX
          </div>
        </div>

        <form class="contact-form" action="#" method="post" novalidate aria-label="Contact form">
          <div class="form-group">
            <label class="form-label" for="name">Name</label>
            <input class="form-input" type="text" id="name" name="name" required autocomplete="name" placeholder="Your name">
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" type="email" id="email" name="email" required autocomplete="email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label class="form-label" for="subject">Subject</label>
            <select class="form-select" id="subject" name="subject">
              <option value="">Select a topic</option>
              <option value="appraisal">Request an Appraisal</option>
              <option value="inventory">Inventory Inquiry</option>
              <option value="loan">Loan Information</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="message">Message</label>
            <textarea class="form-textarea" id="message" name="message" required placeholder="Tell us what you're looking for or what you'd like to bring in."></textarea>
          </div>
          <button type="submit" class="btn btn-gold" style="width:100%;">Send Message</button>
        </form>

      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <a href="index.html" class="footer-logo">Collateral</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="about.html">About</a>
          <a href="services.html">Services</a>
          <a href="inventory.html">Inventory</a>
          <a href="contact.html">Contact</a>
        </nav>
        <p class="footer-location">Waller, TX &mdash; (555) 000-0000</p>
        <p class="footer-copy">&copy; 2026 Collateral. All rights reserved.</p>
      </div>
    </footer>

  </div>

  <script src="js/nav.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `file:///Users/smoov/Desktop/collateral/contact.html`  
Expected: Two-column layout — info left (address, phone, hours, map placeholder), form right  
Form inputs: dark surface, gold focus border on click  
At 768px: stacks to single column  
Console: zero errors

- [ ] **Step 3: Commit**

```bash
cd ~/Desktop/collateral && git add contact.html && git commit -m "feat: contact page with form"
```

---

## Task 12: Final Audit + Polish

**Files:**
- May modify any CSS or HTML file to resolve audit findings

### Part A — Navigation Link Audit

- [ ] **Step 1: Verify all nav links resolve**

Open each page, click every nav link:
- From `index.html`: About ✓ Services ✓ Inventory ✓ Contact ✓
- From `about.html`: Home ✓ Services ✓ Inventory ✓ Contact ✓
- From `services.html`: Inventory "Browse Inventory" btn ✓ Contact "Get Appraisal" btn ✓
- From `inventory.html`: Contact "Inquire" btns × 12 ✓
- From `contact.html`: All nav links ✓
- Footer links on every page ✓

Expected: No 404s, no broken hrefs, active page gets gold underline

### Part B — Responsive Audit

- [ ] **Step 2: Test every page at 375px / 768px / 1440px**

For each breakpoint, verify:
- [ ] Nav: hamburger shows at 375px, links show at 1440px
- [ ] Services grid (home): 1 col at 375px, 3 col at 1440px
- [ ] Testimonials: 1 col at 375px, 3 col at 1440px
- [ ] Inventory: 1 col at 375px, 2 col at 768px, 4 col at 1440px
- [ ] Service blocks (services.html): 1 col at 375px, 2 col at 1440px
- [ ] Contact: 1 col at 375px, 2 col at 1440px
- [ ] Footer: stacks at 375px

### Part C — Genjutsu Design Audit Checklist

- [ ] **Step 3: Run genjutsu audit checklist**

**Colors — no rogue hex values:**
Search all HTML/CSS for any hex color that is not `#0A0A0A`, `#C9A84C`, `#F5F2EC`, `#8A8680`, `#1E1E1E`, `#111111`, `#2A2A2A`, `#3A3A3A`:
```bash
grep -rn '#[0-9A-Fa-f]\{3,6\}' ~/Desktop/collateral/css/ ~/Desktop/collateral/*.html \
  | grep -v 'tokens.css' \
  | grep -vE '#(0A0A0A|C9A84C|F5F2EC|8A8680|1E1E1E|111111|2A2A2A|3A3A3A|000000|ffffff|FFFFFF)'
```
Expected: empty output. Any hits must be replaced with CSS variables.

**Typography — no banned fonts:**
```bash
grep -rni 'inter\|roboto\|arial\|space.grotesk\|system-ui' ~/Desktop/collateral/css/
```
Expected: empty output.

**Border radius — none anywhere:**
```bash
grep -rn 'border-radius' ~/Desktop/collateral/css/ | grep -v 'border-radius: 0'
```
Expected: empty output (only `--radius: 0` in tokens.css is allowed).

**Gradients — none:**
```bash
grep -rn 'gradient\|linear-gradient\|radial-gradient' ~/Desktop/collateral/css/
```
Expected: empty output.

- [ ] **Step 4: Reduced motion — verify CSS media query coverage**

```bash
grep -n 'prefers-reduced-motion' ~/Desktop/collateral/css/base.css ~/Desktop/collateral/css/layout.css ~/Desktop/collateral/js/vault.js
```
Expected: hits in `base.css` (global animation disable), `layout.css` (vault-hint hide, home-content visible), `vault.js` (static mode branch)

- [ ] **Step 5: Accessibility — interactive elements**

Check every page for:
- [ ] All `<button>` elements have `aria-label` or visible text
- [ ] All nav `<a>` elements have descriptive text
- [ ] Form inputs have associated `<label for="...">` matching input `id`
- [ ] `<canvas>` has `aria-hidden="true"` (it's decorative)
- [ ] `role="img"` on vault hero section

- [ ] **Step 6: Console errors — full sweep**

Open each page, open DevTools Console, verify zero errors:
- `index.html` — vault loads, scroll works ✓
- `about.html` ✓
- `services.html` ✓
- `inventory.html` ✓
- `contact.html` ✓

Any errors found here are blocking — fix before declaring done.

- [ ] **Step 7: Fix any audit findings**

If Step 3 grep commands return results, fix each one:
- Rogue hex → replace with CSS variable
- border-radius → remove or set to 0
- gradient → remove
- Missing aria → add

- [ ] **Step 8: Final commit**

```bash
cd ~/Desktop/collateral && git add -A && git commit -m "fix: audit pass — design tokens, accessibility, zero console errors"
```

---

## Definition of Done Verification

Run through this checklist before declaring the project complete:

- [ ] `file:///Users/smoov/Desktop/collateral/index.html` opens — vault renders, zero console errors
- [ ] Vault scroll sequence: all 4 stages fire in order (bolts → handle → door → bloom)
- [ ] Page pin activates at vault top, releases after 400vh
- [ ] After vault completes, `#vault-hero` is removed from DOM (check Elements panel)
- [ ] All 5 pages (`index.html`, `about.html`, `services.html`, `inventory.html`, `contact.html`) load without errors
- [ ] All nav links on all pages resolve correctly
- [ ] Reduced-motion: vault static at 30°, home content immediately visible, no scroll pin
- [ ] At 375px: no horizontal scroll, no broken layouts
- [ ] Audit grep commands return empty output
- [ ] Zero console errors across all 5 pages
- [ ] Looks premium — serif headlines, gold accents on borders only, dark luxury aesthetic throughout
