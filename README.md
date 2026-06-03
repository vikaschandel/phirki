# PHIRKI — Precision. Power. Control.

**PHIRKI Premium Foam Sprayer by Trumart** — A dark luxury e-commerce experience driven by scroll-based frame animation.

## 🎨 Brand Identity

- **Aesthetic**: Dark luxury — Apple meets Rolls Royce meets Dyson
- **Color Palette**:
  - Background: `#050810` (near-black with blue undertone)
  - Gold Accent: `#C9A84C` (warm gold, matches packaging)
  - Typography: "Cormorant Garamond" (display) + "Inter" (body)
- **Motion**: Scroll-driven cinematic experience with GSAP ScrollTrigger

## 🚀 Experience Highlights

- **Hero Section** — Logo drop with scroll-to-reveal prompt
- **Frame Scrubbing** — 281-frame cinematic playback synchronized to scroll position
- **Product Reveal** — Box opening animation as you scroll, with product emergence
- **Detail Mastery** — Close-up feature callouts with smooth parallax
- **Power & Precision** — Animated spec counters and highlights
- **The Arsenal** — Accessories showcase grid
- **Final CTA** — "Experience Control" conversion experience

## 📦 Project Structure

```
src/
  web/                       Web components & pages
    pages/                   Page components
    components/              UI components & layouts
    lib/                     API clients & utilities
    styles.css               Tailwind CSS entry
    main.tsx                 App entry
    app.tsx                  Root component & routing
  api/                       Hono backend
    index.ts                 API routes
    database/
      schema.ts              Drizzle schema
      index.ts               Database client
  server.ts                  Server entry point
index.html                   HTML template
vite.config.ts               Vite configuration
drizzle.config.ts            Database configuration
public/                      Static assets
  frames/                    Animation frame images
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Animation**: GSAP + ScrollTrigger + Lenis (smooth scroll)
- **Styling**: Tailwind CSS

## 📝 Development

Install dependencies and start dev:

