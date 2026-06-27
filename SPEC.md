# SPEC: Dark-theme static CSS for the landing page

## Summary
Style the existing landing page (`index.html`) with a polished dark theme using
only static, self-contained CSS. No CSS frameworks, no external fonts, no CDNs,
no JavaScript, and no network-fetched assets.

## Scope

### In scope
- Visual styling of the existing landing page markup (`<h1>`, `.tag`, `.meta`
  inside `<main>`).
- Dark-theme color palette, typography, spacing, and responsive centering.
- CSS delivered as a local stylesheet (`style.css`) and/or inline `<style>` —
  no build step.

### Out of scope
- Changing the page's content, copy, or HTML structure (beyond adding
  class/style hooks if strictly needed).
- Adding new pages, sections, frameworks, fonts, icons, images, or scripts.
- Light-theme design or a theme toggle.

## Behavior
- The page renders a dark background with light, readable foreground text.
- Content is centered both horizontally and vertically in the viewport.
- Typography uses only system/web-safe font stacks (no `@font-face`, no Google
  Fonts).
- Layout is responsive and legible from ~320px wide up to large desktop widths.
- All styling resolves offline with zero external requests.

## Acceptance criteria
1. The rendered page uses a dark theme: dark background, light text, sufficient
   contrast (body text meets WCAG AA, ≥ 4.5:1).
2. `index.html` references no external stylesheet, font, script, image, or other
   remote asset; loading with the network disabled looks identical.
3. No CSS framework or third-party library is present (no Bootstrap, Tailwind,
   normalize.css, etc.).
4. No JavaScript is added.
5. Content (`<h1>`, tagline, meta line) is centered and the visual hierarchy is
   clear (heading most prominent, meta least).
6. Layout has no horizontal overflow or clipped text at 320px width and remains
   well-composed on desktop.
7. The HTML's existing text content is unchanged.
8. CSS is valid and self-contained (single local `style.css` and/or inline
   `<style>` only).

## Notes
The current skeleton already ships a minimal dark gradient in `style.css`; this
feature hardens and refines that into the documented, dependency-free baseline.
