# PLAN: Hero Section

Implementation checklist for the hero block per `SPEC.md`. Keep it a static, single-file page (no build step, no new files).

## 1. Markup (`index.html`)
- [ ] Remove the construction placeholder `<p class="tag">` line from `<main>`.
- [ ] Remove the `<p class="meta">` line from `<main>`.
- [ ] Wrap hero content in a `<section class="hero">` inside `<main>`.
- [ ] Add a large headline `<h1>` with the product title.
- [ ] Add a one-line subtitle `<p class="subtitle">` beneath the headline.
- [ ] Add a single CTA as an `<a class="cta" href="#">…</a>` styled as a button.
- [ ] Keep `lang="zh"` and use Chinese copy consistent with the existing page.

## 2. Styling (`style.css`)
- [ ] Add `.hero` layout (centered, vertical stack, sensible max-width/gap).
- [ ] Style `h1` as the dominant element (larger size, tight line-height).
- [ ] Style `.subtitle` as muted single-line supporting text.
- [ ] Style `.cta` as a prominent button (padding, radius, accent color from the dark theme palette).
- [ ] Add `.cta:hover` and `.cta:focus-visible` states for clear interactivity.
- [ ] Remove or repurpose now-unused `.tag` / `.meta` rules.
- [ ] Add responsive sizing (e.g. `clamp()` headline; verify ≤480px mobile).

## 3. Verify (acceptance criteria)
- [ ] Construction placeholder text is gone.
- [ ] Page shows headline + one-line subtitle + one CTA button.
- [ ] CTA is keyboard-focusable with visible hover/focus state.
- [ ] Layout stays centered and does not overflow horizontally at 320–1280px.
- [ ] No console errors; page still serves as a static file (per `render.yaml`).
