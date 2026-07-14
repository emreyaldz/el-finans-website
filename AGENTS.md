# Repository Rules

## Production URL policy

- User-facing production page URLs must never expose the .html extension.
- Use /support, /privacy-policy, /terms, and /account-deletion in HTML links.
- Keep the physical .html files because GitHub Pages serves the clean routes from them.
- Preserve the local-preview fallback in script.js; update localizeStaticRoutes whenever a page route is added or changed.
- When CSS or JavaScript changes, bump the shared asset version query in every public HTML page.