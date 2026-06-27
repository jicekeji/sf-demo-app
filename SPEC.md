# SPEC: Page Footer with Copyright

## Summary
Add a persistent page footer to the site displaying copyright information.

## Scope
- **In scope:** A single footer element rendered at the bottom of the page (`index.html`), styled in `style.css`, showing copyright text.
- **Out of scope:** Navigation links, social icons, newsletter signup, multi-column layouts, or any back-end/dynamic content.

## Behavior
- A `<footer>` element is rendered as the last child of `<body>`, below `<main>`.
- The footer displays a copyright line in the format: `© <year> SuperFactory Demo. All rights reserved.`
- `<year>` reflects the current year (4-digit). Static text is acceptable for this static site; the seeded year is 2026.
- The footer spans the full page width and stays at the bottom of the viewport when content is short (does not float over content on long pages).
- Footer text is visually subdued (secondary/muted color) and consistent with the existing dark theme.
- The footer is responsive and legible on small (mobile) and large (desktop) viewports.

## Acceptance Criteria
1. A `<footer>` element exists in `index.html` after `<main>`.
2. The footer renders visible copyright text containing the `©` symbol, the year, and the site name.
3. The footer is anchored to the bottom of the page and remains within the viewport on short pages without overlapping `main` content.
4. Footer styling matches the existing theme (muted text on the dark gradient background) and is readable on mobile and desktop widths.
5. No console errors are introduced; existing page content and layout remain intact.
