# V11.0.1 Mobile Menu Hotfix Report

## Files modified
- `src/_includes/components/header.njk`
- `src/_includes/layouts/base.njk`
- `src/assets/js/site-core.js`

## Root cause
- The mobile menu was using HTMX-related navigation handling and hidden menu state based on the markup plus legacy script.
- HTMX attributes in navigation were causing client-side mobile menu interaction to trigger HTTP requests for navigation links such as `trekking/fixed-departures/` and `trekking/k2-base-camp-baltoro-trek/`.

## Solution
- Converted mobile menu open/close state to Alpine.js using `x-data`, `x-show`, and `@click.prevent`.
- Preserved desktop navigation and existing markup while updating only mobile navigation behavior.
- Removed HTMX navigation-related behavior from mobile and recursive menu items.
- Ensured Alpine initialization occurs after loading Alpine itself by reordering script tags in `src/_includes/layouts/base.njk`.
- Kept HTMX in place for non-navigation features such as search and catalog.

## Verification results
- `npm run build` completed successfully twice after changes.
- No navigation HTMX attributes remain in `src/_includes/components/header.njk` except the search form's legitimate `hx-boost="false"`.
- Mobile menu is now controlled by Alpine state, not HTMX.
- Desktop navigation remains untouched.

## Remaining issues
- None detected during build verification.
