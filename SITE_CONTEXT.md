# EL Finans Site Context

This file records layout constraints that must survive future design changes. Read it before editing `index.html`, `style.css`, phone frames, screenshots, or full-screen sections.

## Non-negotiable viewport behavior

- The complete primary content of the hero, Features showcase, AI Assistant, Gallery, and Security sections must remain visible without clipping on desktop viewports from 1280x720 through 2560x1440 CSS pixels.
- Representative acceptance sizes are 1280x720, 1366x768, 1440x900, 1920x1080, and 2560x1440.
- On viewports at least 901px wide, sticky/full-screen scenes may use the available viewport height, but their visible content must fit between the fixed navigation and the bottom edge.
- On viewports below 901px wide, sections must return to natural document flow and may grow vertically. Do not force stacked mobile content into one viewport.

## Preserve content and section proportions

- Do not hide, truncate, line-clamp, or remove headings, descriptions, feature cards, AI demo output, security cards, or gallery items to make a section fit.
- Do not reduce the established maximum content widths, grid column widths, or card widths as a shortcut for solving vertical overflow.
- Do not make the section containers artificially shorter. Preserve the full-screen/sticky experience where it is safe.
- When vertical room is limited, reduce decorative outer whitespace and inter-component gaps first. Then scale height-sensitive media such as phone mockups from the available viewport height while preserving their aspect ratio.
- Screenshots inside phone frames must use `object-fit: contain`, remain top-aligned, and be fully visible.
- Larger displays should retain the spacious layout and the maximum phone size; compact-height rules must not affect 1080p/1440p layouts unnecessarily.

## Phone frame invariants

- All `feature-sections` screenshots in the hero, Features showcase, and AI Assistant use the shared `.phone > .screen` structure.
- Keep the metallic grey outer frame, black inner bezel, Dynamic Island, left-side controls, and right-side power button consistent.
- Phone size may respond to viewport height, but the screenshot must never be cropped to make the device fit.

## Regression checks

- After layout changes, verify the representative desktop sizes above with special attention to 1366x768 and 2560x1440.
- Confirm there is no vertical clipping from `overflow: hidden` in `.hero`, `.showcase-stage`, or `.immersive-stage`.
- Confirm all public pages reference the same current `style.css` and `script.js` asset versions.
- When CSS or JavaScript changes, bump its shared version query in every public HTML page.
- Keep production links extensionless and preserve the local-preview route fallback described in `AGENTS.md`.
