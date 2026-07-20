# EL Finans Site Context

This file records layout constraints that must survive future design changes. Read it before editing `index.html`, `style.css`, phone frames, screenshots, or full-screen sections.

## Non-negotiable viewport behavior

- The 27-inch, 1920-class desktop composition is the source of truth. Its reference layout canvas is 1920x930 CSS pixels, including the 64px fixed navigation allowance.
- The complete primary content of the hero, Features showcase, AI Assistant, Gallery, and Security sections must remain visible without clipping on desktop viewports from 1280x720 through 2560x1440 CSS pixels.
- Representative acceptance sizes are 1280x720, 1366x768, 1440x900, 1920x930, 1920x1080, and 2560x1440.
- On viewports at least 901px wide, the reference scene must scale as one unit from the available width and height. Headings, phones, cards, gaps, and panel dimensions must keep the same relative placement seen at the 1920-class reference.
- Sticky/full-screen scenes may use the available viewport height, but their visible content must fit between the fixed navigation and the bottom edge.
- On viewports below 901px wide, sections must return to natural document flow and may grow vertically. Do not force stacked mobile content into one viewport.

## Preserve content and section proportions

- Do not hide, truncate, line-clamp, or remove headings, descriptions, feature cards, AI demo output, security cards, or gallery items to make a section fit.
- Keep the established reference maximum widths, grid columns, card widths, and spacing inside the scaled desktop canvas.
- Do not make the section containers artificially shorter. Preserve the full-screen/sticky experience where it is safe.
- Do not add independent compact-height rules that shrink only headings, gaps, cards, panels, or phone mockups. Use the shared `--desktop-layout-scale` so the complete scene changes proportionally.
- The Features and AI scenes use a shared 8% safe inset scale on desktop so their complete compositions keep visible space above and below without changing internal proportions.
- The Gallery uses an inverse-width wrapper before the shared scale so its marquee remains full bleed while its cards and spacing retain reference proportions.
- Gallery preview images are small, duplicated from the same 15 cached URLs, and must load eagerly so transformed marquee items never remain blank until hover. Do not promote every `.shot` to its own compositor layer; the moving track is the only layer that needs `will-change`.
- Screenshots inside phone frames must use `object-fit: contain`, remain top-aligned, and be fully visible.
- Larger displays should retain the spacious layout and the maximum phone size; compact-height rules must not affect 1080p/1440p layouts unnecessarily.

## Phone frame invariants

- All `feature-sections` screenshots in the hero, Features showcase, and AI Assistant use the shared `.phone > .screen` structure.
- Keep the metallic grey outer frame, black inner bezel, Dynamic Island, left-side controls, and right-side power button consistent.
- On desktop, phone size follows the same shared scene scale as its surrounding content. Do not scale the phone independently from the section composition.
- The screenshot must never be cropped to make the device fit.

## Regression checks

- After layout changes, verify the representative desktop sizes above with special attention to 1366x768 and 2560x1440.
- Compare the 14-inch result with the 27-inch reference: section headings, text blocks, phones, panels, grids, and gallery cards must preserve their relative positions and proportions.
- Confirm the shared desktop scale is `1` at or above the reference canvas and decreases uniformly on smaller desktop viewports; below 901px it must reset to `1` for natural mobile flow.
- Confirm there is no vertical clipping from `overflow: hidden` in `.hero`, `.showcase-stage`, or `.immersive-stage`.
- Confirm the Security sticky stage and desktop CTA center their content in the viewport below the fixed navigation.
- Confirm all public pages reference the same current `style.css` and `script.js` asset versions.
- When CSS or JavaScript changes, bump its shared version query in every public HTML page.
- Keep production links extensionless and preserve the local-preview route fallback described in `AGENTS.md`.
