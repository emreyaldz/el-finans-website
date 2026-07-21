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
- Keep site animations enabled independently of the operating system's `prefers-reduced-motion` preference. Do not add reduced-motion rules that leave animated content or phone screenshots in an initial hidden, transparent, transformed, or partially rendered state.
- Keep the established reference maximum widths, grid columns, card widths, and spacing inside the scaled desktop canvas.
- Do not make the section containers artificially shorter. Preserve the full-screen/sticky experience where it is safe.
- Do not add independent compact-height rules that shrink only headings, gaps, cards, panels, or phone mockups. Use the shared `--desktop-layout-scale` so the complete scene changes proportionally.
- The Features and AI scenes use a shared 8% safe inset scale on desktop so their complete compositions keep visible space above and below without changing internal proportions.
- The Gallery uses an inverse-width wrapper before the shared scale so its marquee remains full bleed while its cards and spacing retain reference proportions.
- Gallery preview images are small, duplicated from the same 15 cached URLs, and must load eagerly so transformed marquee items never remain blank until hover. Do not promote every `.shot` to its own compositor layer; the moving track is the only layer that needs `will-change`.
- Keep the Gallery marquee at the current calm reference pace of `54 CSS pixels per second` (roughly `54s` for the original 15-card track). After adding any wide-screen clones, JavaScript must derive `--gallery-marquee-duration` from each track's final `scrollWidth` so a longer track never moves faster. It must remain continuously animated, pause while hovered or while the preview modal is open, and must not be accelerated without a deliberate visual review.
- Screenshots inside phone frames must use `object-fit: contain`, remain top-aligned, and be fully visible.
- Larger displays should retain the spacious layout and the maximum phone size; compact-height rules must not affect 1080p/1440p layouts unnecessarily.

## Phone frame invariants

- All `feature-sections` screenshots in the hero, Features showcase, and AI Assistant use the shared `.phone > .screen` structure.
- Keep the metallic grey outer frame, black inner bezel, Dynamic Island, left-side controls, and right-side power button consistent.
- On desktop, phone size follows the same shared scene scale as its surrounding content. Do not scale the phone independently from the section composition.
- The screenshot must never be cropped to make the device fit.
- On desktop, the active showcase image must be fully loaded and match the `.screen` content box in both width and height throughout every scroll-driven transition.
- Feature screenshots use an overlapping crossfade: the outgoing screenshot stays fully opaque while the incoming screenshot fades above it. Never expose the black screen background or add a scale transition that creates a dark flash, shadow, or ghosting between screenshots.

## Support privacy-link behavior

- The Privacy Policy link beside the support form consent checkbox must open the embedded policy reader without changing pages.
- The Privacy Policy links inside the FAQ must navigate to the standalone `/privacy-policy` page and must not open the embedded reader.
- The embedded reader's “Okudum ve anladım / I have read and understood” button must remain immediately available; do not make it depend on iframe scroll position, cross-window messages, timers, or end-of-document detection.
- Confirming the embedded policy must check the consent box belonging to the active language's support form and then close the reader.

## Legal content source and release workflow

- The canonical Privacy Policy and Terms content lives in the app repository's `src/constants/legalDocuments.js`; the English counterparts live in `src/constants/legalTranslations.js`, while the app's other languages remain in their separate localization file.
- After changing either legal document, run `npm run legal:sync-site` from the app repository. Do not manually let `privacy-policy.html` or `terms.html` diverge from the generated app content.
- Keep the Turkish and English last-updated labels synchronized between both legal pages. The current shared legal date is July 21, 2026 / 21 Temmuz 2026.
- Material legal changes must increment the app's legal-text version and require renewed in-app acceptance, as described by the Terms.
- Before production release, follow the app repository's `docs/deploy-runbook.md` to verify the actual data-controller identity, production Gemini billing/data-use configuration, the AdMob UMP message, and the store privacy declarations.

## Product, security, and privacy claim invariants

- Do not describe every EL Finans data path as end-to-end encrypted. Personal device data, personal cloud sync, and personal backups use AES-256-GCM with plaintext keys kept off the server; shared-account synchronization is the explicit exception.
- Shared-account transactions and related synchronization data are stored as unencrypted JSONB in Supabase so authorized members can collaborate. They are not public and must be described as protected by Row Level Security, membership, and owner/admin role checks.
- A member leaving or deleting their personal account does not automatically delete shared-account data retained for the other authorized members. Only the shared-account owner can permanently delete the shared account.
- Account deletion closes the account, removes user-scoped Supabase data and private Storage backups, clears local app data and device keys, and removes the cloud recovery envelope. Limited purchase/security records may remain for legal, store-verification, or fraud-prevention needs, and shared-account data may remain as described above.
- AI features are for users aged 18 or older, run only after a user-initiated request and separate explicit consent, and route through an authenticated Supabase Edge Function to Google Gemini API. Production must use the billing-enabled Gemini data-processing configuration documented in the policy.
- Free users may see banner or rewarded AdMob ads, but personal financial records are not used for ad targeting. Production diagnostics use Sentry only with the documented sensitive-field scrubbing.
- Keep the security wording consistent across homepage metadata and security cards, Support FAQ, Account Deletion, Privacy Policy, Terms, and all shared footers. Prefer “encrypted personal data, secure shared accounts” over blanket end-to-end-encryption claims.
- The shared footer description is currently “Şifreli kişisel veriler, güvenli ortak hesaplar ve yapay zekâ destekli finans yönetimi.” / “Encrypted personal data, secure shared accounts, and AI-powered finance management.” Keep it identical on every public page.

## Regression checks

- After layout changes, verify the representative desktop sizes above with special attention to 1366x768 and 2560x1440.
- Compare the 14-inch result with the 27-inch reference: section headings, text blocks, phones, panels, grids, and gallery cards must preserve their relative positions and proportions.
- Confirm the shared desktop scale is `1` at or above the reference canvas and decreases uniformly on smaller desktop viewports; below 901px it must reset to `1` for natural mobile flow.
- Confirm there is no vertical clipping from `overflow: hidden` in `.hero`, `.showcase-stage`, or `.immersive-stage`.
- Confirm hero entrance animations, reveal effects, showcase screen transitions, the AI typing demo, gallery marquee, phone parallax, and pointer tilt remain active even when the host operating system requests reduced motion.
- Confirm the Security and desktop CTA sticky stages center their content in the viewport below the fixed navigation. The CTA card must stay inside an outer `.viewport-layout` wrapper so it follows the shared desktop scale without overriding its reveal animation.
- Confirm all public pages reference the same current `style.css` and `script.js` asset versions.
- When CSS or JavaScript changes, bump its shared version query in every public HTML page.
- Keep production links extensionless and preserve the local-preview route fallback described in `AGENTS.md`.
- After legal-content changes, confirm the Privacy Policy and Terms have matching TR/EN dates and that the homepage, Support, Account Deletion, and shared footer claims still reflect the personal-data/shared-account distinction.
