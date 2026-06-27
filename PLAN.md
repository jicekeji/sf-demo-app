# PLAN: Apply dark-theme static CSS (no external dependencies)

Derived from `SPEC.md`. Small, verifiable steps. No frameworks, no external
assets, no JavaScript.

## 1. Baseline & constraints
- [ ] Confirm `index.html` markup is unchanged (`<h1>`, `.tag`, `.meta` inside `<main>`).
- [ ] Confirm the only stylesheet reference is the local `./style.css` (no CDN/font/script links).
- [ ] Keep all existing text content byte-for-byte identical.

## 2. CSS foundation (`style.css`)
- [ ] Keep `box-sizing: border-box` reset and `:root { color-scheme: dark; }`.
- [ ] Define a small palette as CSS custom properties (bg, surface, text, muted, accent).
- [ ] Set dark background (gradient or solid) and light foreground text on `body`.
- [ ] Use only system/web-safe font stack — no `@font-face`, no remote fonts.

## 3. Layout & centering
- [ ] Center `<main>` horizontally and vertically (`min-height: 100vh`, grid/flex `place-items: center`).
- [ ] Add responsive padding and a max content width so lines don't stretch on desktop.
- [ ] Use relative units (`rem`/`clamp`) so text scales cleanly.

## 4. Typography & hierarchy
- [ ] Style `h1` as the most prominent element (largest, strongest weight).
- [ ] Style `.tag` as secondary (medium, slightly muted).
- [ ] Style `.meta` as least prominent (smallest, most muted) — preserve clear visual hierarchy.

## 5. Contrast & accessibility
- [ ] Verify body text contrast meets WCAG AA (≥ 4.5:1) against the dark background.
- [ ] Verify `.meta` muted color still meets the required contrast for its size.

## 6. Responsiveness
- [ ] Check no horizontal overflow / clipped text at 320px width.
- [ ] Check composition remains balanced at large desktop widths.
- [ ] Use `clamp()` or a media query if heading needs to scale between extremes.

## 7. Self-containment verification
- [ ] Confirm zero external requests: no CDN, font, image, or script URLs.
- [ ] Confirm page renders identically with the network disabled.
- [ ] Confirm no CSS framework/library present (Bootstrap, Tailwind, normalize.css, etc.).
- [ ] Confirm no JavaScript added.

## 8. Final review against acceptance criteria
- [ ] Re-read `SPEC.md` acceptance criteria 1–8 and check each is satisfied.
- [ ] Validate CSS is syntactically valid and self-contained.
