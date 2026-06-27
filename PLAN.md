# PLAN: Page Footer with Copyright

Implementation checklist for the footer described in `SPEC.md`.

## Markup (`index.html`)
- [ ] Add a `<footer>` element as the last child of `<body>`, after `</main>`.
- [ ] Inside the footer, add a copyright line: `© 2026 SuperFactory Demo. All rights reserved.` (static year is acceptable per spec).
- [ ] Use the literal `©` character (or `&copy;`) so the symbol renders.

## Layout (`style.css`)
- [ ] Change `body` from `display: grid; place-items: center` to a column flex/grid layout so `main` grows and `footer` sits at the bottom.
- [ ] Keep `main` vertically centered within the remaining space (e.g. `main { margin: auto }` or a flex spacer) so existing content stays put.
- [ ] Make `<footer>` span the full page width and anchor to the bottom on short pages (sticky footer pattern, no overlap of `main`).

## Styling (`style.css`)
- [ ] Style footer text as muted/secondary (reuse a tone like `#475569` / `#64748b`) consistent with the dark gradient theme.
- [ ] Add small padding and centered text; use a small font size (~`.8rem`).
- [ ] Ensure the footer is legible and not cramped on mobile and desktop widths (responsive padding, no fixed widths).

## Verify against acceptance criteria
- [ ] `<footer>` exists after `<main>` in `index.html`.
- [ ] Footer shows visible text containing `©`, the year `2026`, and the site name.
- [ ] Footer stays at the bottom of the viewport on short pages without overlapping `main`.
- [ ] Footer styling matches the theme and reads well on mobile and desktop.
- [ ] No console errors; existing page content and layout remain intact.
