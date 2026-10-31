# SageVerve: landing page

A landing page for SageVerve with **Rohit Johar** as its face. Built with **Next.js (App Router)** and **Three.js**.

```bash
npm install
npm run dev        # http://localhost:5175
npm run build
npm run typecheck
```

## The hero: "People make performance"

Rohit's portrait byline (name, role, Amazon India · Genpact · Syneos Health) opens the hero copy, above the fold at every width. Beside it sits a miniature 3D office whose state follows the scroll:

1. **Fragmented**: four department islands drift apart, each tinted differently, each team working alone
2. **Aligned**: the islands lock together, corridors fill the gaps, people start crossing departments
3. **Leadership**: a hub table rises, a leader from every team gathers there, connections arc to the centre
4. **Performance**: a skyline of growth bars and a trend line rise behind the organisation

The people are instanced body parts on one shared rig, so all ~20 of them take only a handful of draw calls. Each one runs a looping script per stage: walking, typing, presenting, a welcome handshake at reception, mentoring, meetings behind a glass door that opens as they approach. Three.js is lazy-loaded and pauses off screen. With reduced motion you get one still frame per stage, and without WebGL a static SVG.

| Path | What it is |
|---|---|
| `app/page.tsx` | All page markup (server component) |
| `app/layout.tsx` | Metadata, Open Graph, self-hosted General Sans |
| `src/content.ts` | All copy and data. Edit text here |
| `src/client/hero.ts` | Scroll → stage mapping, HUD, lazy-loading, pause, pointer parallax |
| `src/client/office/scene.ts` | The 3D environment, rig, camera and stage transitions |
| `src/client/office/cast.ts` | Every character's look and per-stage activity loop |
| `src/client/boot.ts` | Header, nav state, mobile menu, reveals, counters, scroll lines, tabs |
| `src/components/Motifs.tsx` | Small SVG visual metaphors used across sections |
| `src/styles/site.css` | Design tokens (top of file) and all styles |

## Content rules
- Only facts from the deck, LinkedIn and press. No invented clients, quotes or outcomes.
- Research figures are attributed (Gallup), and the deck's own ranges are labelled **Indicative**.
- `testimonials` in `content.ts` is empty until Rohit has permission to quote each recommendation. The section shows the HR Katha press quote and links to his LinkedIn recommendations until then.

## Still to do before launch
- Logo (text wordmark for now), a professional photo, approved testimonial quotes
- Confirm the Syneos title and dates, and Rohit's SageVerve title
- A sageverve.com email address instead of the personal Gmail
