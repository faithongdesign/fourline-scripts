# Fourline Scripts — Project Context

## What This Is
Custom CSS and JS for the Fourline Webflow website, hosted on GitHub and served to Webflow via jsDelivr CDN. This replaces all inline custom code in Webflow with externally hosted files that Claude Code can edit directly.

## Repository
- **GitHub:** https://github.com/faithongdesign/fourline-scripts
- **Branch:** main

## Files
- `styles.css` — All custom CSS (glow lines, nav animation, carousel styles, custom cursor, nav hover, magnetic text, Lenis overrides)
- `main.js` — All custom JS (Lenis smooth scroll, hero video delay, scroll marquee rows, works carousel with drag/infinite loop, custom cursor, magnetic text, CTA image grow)

## CDN URLs (jsDelivr)
- **CSS:** `https://cdn.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/styles.css`
- **JS:** `https://cdn.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/main.js`

## Webflow Custom Code Setup

### Inside Head Tag:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/styles.css">
```

### Before Body Tag:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/main.js"></script>
```

## Dependencies (loaded via CDN in Webflow, NOT in this repo)
- GSAP 3.12.5
- GSAP ScrollTrigger 3.12.5
- Lenis 1.3.17

## Workflow: Making Changes
1. Edit `main.js` and/or `styles.css`
2. Commit and push to GitHub
3. Purge jsDelivr cache (it caches for ~24hrs):
   - `https://purge.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/main.js`
   - `https://purge.jsdelivr.net/gh/faithongdesign/fourline-scripts@main/styles.css`
4. Hard refresh the Webflow site (Cmd+Shift+R)

## main.js Sections (in order)
1. **Lenis Smooth Scroll** — Buttery weighted scroll, skipped on mobile touch devices, uses GSAP ticker, `virtualScroll` callback prevents conflict with carousel horizontal gestures. Exposed as `window._fourlineLenis` for stop/start.
2. **Hero Video Delay** — Delays video playback by 3500ms to sync with reveal animation
3. **Scroll Shift Marquee Rows** — Horizontal marquee rows that shift based on scroll direction, reads `[data-marquee="row"]` and `[data-direction]` attributes
4. **Works Carousel** — Infinite loop carousel with auto-scroll, mouse/touch drag, momentum, trackpad gesture locking. Shared state via `window._fourlineCarousel`
5. **Custom Cursor** — Arrow cursor that appears over carousel, smooth follow via RAF
6. **Magnetic Text** — GSAP-powered hover effect on `.magnetic-text` > `.magnetic-inner` elements
7. **CTA Image Grow** — ScrollTrigger scrub animation that removes padding from `.cta-image-wrapper`

## styles.css Sections (in order)
1. Glow Lines Animation (vertical/horizontal grid line glows)
2. Nav Menu Animation (kills Webflow default slide)
3. Lock Horizontal Movement (overflow-x clip)
4. Lenis Smooth Scroll (lenis-stopped override)
5. Works Carousel (grayscale-to-color cards, image opacity)
6. Custom Cursor (dot + arrow triangles, drag states)
7. Nav Links Hover (dim siblings on hover)
8. Magnetic Text (cursor + inline-block inner)

## Lenis Config Details
- `duration: 1.4` — Long coast for weighted feel
- `easing: expo ease-out` — Fast start, slow deceleration
- `wheelMultiplier: 0.9` — Slightly dampened for heavier feel
- `syncTouch: false` — Native scroll on mobile
- Carousel conflict handled via `virtualScroll` callback (horizontal gestures ignored by Lenis)
- Driven by GSAP ticker (single RAF loop)
- ScrollTrigger synced via `lenis.on('scroll', ScrollTrigger.update)`
