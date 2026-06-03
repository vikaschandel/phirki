# PHIRKI — Design Direction

## Brand Identity
- **Product**: PHIRKI Premium Foam Sprayer by Trumart
- **Tagline**: Precision. Power. Control.
- **Aesthetic**: Dark luxury — Apple meets Rolls Royce meets Dyson

## Color Palette
- `--bg`: #050810 (near-black with blue undertone)
- `--gold`: #C9A84C (warm gold — matches packaging)
- `--gold-light`: #E8C86A
- `--white`: #F5F5F0 (warm white)
- `--muted`: #8A9BB0 (blue-grey)
- `--dark-blue`: #0A1628

## Typography
- **Display**: "Cormorant Garamond" — ultra-elegant serif for hero/section titles
- **Body**: "Inter" — clean, readable for descriptions
- **Accent**: letter-spacing 0.3em caps for taglines

## Motion Philosophy
- Scroll-driven frame scrubbing (Apple iPhone style) — 281 frames across a tall scroll container
- GSAP ScrollTrigger pinning + scrub
- Section reveals: opacity + translateY with stagger
- Text: character-level split animation on section entry
- Gold shimmer effect on headings
- Parallax on atmospheric elements
- Smooth scroll with Lenis

## Layout
- Full-bleed dark canvas
- Canvas-based frame animation takes full viewport
- Sticky sections with GSAP pinning
- Horizontal feature scroller
- Final CTA with radial glow

## Sections
1. Hero — Logo drop + "Scroll to reveal" prompt
2. Frame Scrub — 281-frame cinematic playback driven by scroll
3. "The Reveal" — Text overlay as frames show box opening
4. Product Emerges — Copy appears as sprayer rises
5. Detail Mastery — Close-up frame section with feature callouts
6. Power & Precision — Spec highlights with animated counters
7. The Arsenal — Accessories grid
8. Final CTA — "Experience Control"
