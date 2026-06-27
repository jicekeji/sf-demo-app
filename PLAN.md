# PLAN: Three Capability Cards

Implementation checklist for the feature described in `SPEC.md`. Static site only — no JS, no new dependencies.

## 1. HTML — add the cards section (`index.html`)
- [ ] Add a new `<section class="cards">` inside `<main>`, directly below the existing `.meta` paragraph (after intro content, preserving title/tagline/meta).
- [ ] Add exactly three card elements in source order: 自动构建, 质量门禁, 自治运维.
- [ ] For each card use a structure like `<article class="card">` containing:
  - [ ] A leading emoji/icon span (e.g. 🏗️ / 🛡️ / 🤖) for visual identity.
  - [ ] An `<h2>`/`<h3>` title with the fixed Chinese title.
  - [ ] A `<p>` one-line description (use suggested copy from SPEC's table).
- [ ] Card 1: 自动构建 — 从需求到可部署应用，自动完成构建。
- [ ] Card 2: 质量门禁 — 自动化测试与审查，守住质量底线。
- [ ] Card 3: 自治运维 — 持续监控与自愈，无人值守运行。
- [ ] Confirm no `<script>`, links, or click handlers are added.

## 2. CSS — style the cards (`style.css`)
- [ ] Add a `.cards` container rule: flex (or grid) row, gap, top margin, `flex-wrap: wrap` for reflow.
- [ ] On wide viewports (≥ ~640px): three equal-width columns in one horizontal row.
- [ ] On narrow viewports (< ~640px): cards stack vertically (via wrap/flex-basis or a `@media` query) and stay readable without overflow.
- [ ] Add a `.card` rule using the existing dark palette: dark surface (e.g. slate `#1e293b`/`#334155` tint), subtle border/shadow, rounded corners, padding, light text — visually distinct from the page gradient background.
- [ ] Style the card title and description (sizes/colors consistent with existing `h1`/`.tag` tones).
- [ ] Ensure text alignment/spacing reads well inside the centered `main`.

## 3. Verify against acceptance criteria
- [ ] Exactly three cards render, titles correct and in order.
- [ ] Each card shows a title + one-line description.
- [ ] Cards use dark theme, distinct from background.
- [ ] Wide viewport: one horizontal row of equal width.
- [ ] Mobile width: cards stack, no overflow/clipping.
- [ ] No new build steps, dependencies, or JS introduced.
- [ ] Existing title, tagline, and meta line preserved.
- [ ] Open `index.html` in a browser and resize to confirm responsive behavior.
