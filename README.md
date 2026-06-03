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
packages/
  web/                       Web application (Vite + Hono + React)
    src/
      web/
        pages/               Page components
        components/          UI components
        lib/                 Utilities & API clients
      api/                   Hono backend routes
      server.ts              Server entry point
  mobile/                    Expo React Native app
  desktop/                   Electron desktop shell
```

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Hono (API routes)
- **Database**: Turso/LibSQL + Drizzle ORM
- **Animation**: GSAP + ScrollTrigger + Lenis (smooth scroll)
- **Desktop**: Electron
- **Mobile**: Expo/React Native
- **Styling**: Tailwind CSS

## 📝 Development

Install dependencies and start dev servers:
```sh
bun install
cd packages/web && bun run dev
```

For database operations:
```sh
bun run db:push        # Push schema
bun run db:generate    # Generate migrations
bun run db:studio      # Drizzle Studio
```
