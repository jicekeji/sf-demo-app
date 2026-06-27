# SPEC: Three Capability Cards

## Summary
Add a row of three dark-themed capability cards to the demo home page, highlighting the
platform's three core capabilities: **自动构建** (Automated Build), **质量门禁** (Quality
Gate), and **自治运维** (Autonomous Operations).

## Scope

### In scope
- A new section below the existing intro content on `index.html` containing exactly three cards.
- Each card displays:
  - A title (one of 自动构建 / 质量门禁 / 自治运维).
  - A short one-line description of that capability (Chinese, consistent with page language).
  - An optional leading icon/emoji for visual identity.
- Cards are laid out as a horizontal row on wide viewports.
- Dark-themed styling consistent with the existing slate/dark gradient palette in `style.css`.
- Responsive behavior: the row reflows to stack vertically on narrow viewports.

### Out of scope
- Card interactivity (links, click handlers, navigation, modals).
- New dependencies, build tooling, or JavaScript frameworks.
- Backend, data fetching, or dynamic content.
- Adding more or fewer than three cards.

## Card content

| Card | Title | Description (suggested) |
|------|-------|-------------------------|
| 1 | 自动构建 | 从需求到可部署应用，自动完成构建。 |
| 2 | 质量门禁 | 自动化测试与审查，守住质量底线。 |
| 3 | 自治运维 | 持续监控与自愈，无人值守运行。 |

> Descriptions are suggested copy and may be refined during implementation; titles are fixed.

## Behavior
- The three cards render in source order (自动构建, 质量门禁, 自治运维) and remain in that order across all viewports.
- On viewports ≥ ~640px the cards sit in a single horizontal row with equal width.
- On narrower viewports the cards stack vertically and remain readable.
- Cards are static: no hover navigation, no state, no scripts required.

## Acceptance criteria
1. The page renders exactly three cards with the titles 自动构建, 质量门禁, and 自治运维, in that order.
2. Each card shows a title and a one-line description.
3. The cards use the page's dark theme (dark surface, light text) and are visually distinct from the page background.
4. On a wide viewport the three cards appear in one horizontal row of equal width.
5. On a mobile-width viewport the cards stack vertically without overflow or clipping.
6. No new build steps, runtime dependencies, or JavaScript are introduced; the page remains a static site.
7. Existing page content (title, tagline, meta line) is preserved.
