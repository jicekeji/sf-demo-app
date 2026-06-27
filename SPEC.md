# SPEC: Hero Section

## Summary
Replace the "under construction" placeholder in `index.html` with a hero block:
a large headline, a one-line subtitle, and a single call-to-action (CTA) button.

## Scope
**In scope**
- Remove the construction placeholder markup (`.tag` and `.meta` lines) from `main`.
- Add a hero block containing:
  - **Headline** — a large `<h1>` title.
  - **Subtitle** — a single-line supporting `<p>`.
  - **CTA** — one action button/link styled as a prominent button.
- Styling for the hero in `style.css`, reusing the existing dark gradient theme.

**Out of scope**
- Routing or navigation, additional page sections, forms.
- CTA target behavior beyond a placeholder link/anchor.
- Backend, analytics, i18n changes (page stays `lang="zh"`).

## Behavior
- The hero renders centered on the page (keeps the existing centered `main` layout).
- Headline is the dominant visual element; subtitle sits directly beneath it.
- The CTA appears below the subtitle and is clearly clickable (hover/focus state).
- Layout remains responsive and readable on mobile (≤480px) and desktop.

## Acceptance Criteria
- [ ] The construction placeholder text is no longer present.
- [ ] Page shows a large headline, a one-line subtitle, and one CTA button.
- [ ] CTA is keyboard-focusable and has a visible hover/focus state.
- [ ] Layout is centered and does not overflow horizontally at 320–1280px widths.
- [ ] No console errors; page is a static file servable as-is (per `render.yaml`).
