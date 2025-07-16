# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HP Indigo Pricing Calculator - A Progressive Web App (PWA) for calculating pricing for HP Indigo digital press products. Built as a vanilla JavaScript application with no framework dependencies, designed for internal print shop teams using tablets.

## Development Commands

### Local Development
```bash
# Start local server (Python)
python -m http.server 8000

# Start local server (Node.js)
npx serve
```

Access at: http://localhost:8000

### Deployment
```bash
# Push to GitHub
git add -A
git commit -m "Your commit message"
git push origin main
```

GitHub Pages automatically deploys from main branch root folder.

## Architecture

### Core Technologies
- **Vanilla JavaScript** - No build process or framework
- **Service Worker** (`sw.js`) - Offline caching with cache-first strategy
- **PWA Manifest** (`manifest.json`) - App installation configuration

### Pricing Engine
The pricing calculation logic is centralized in `/js/calculator.js`:
- `pricingData` object contains all pricing rules and multipliers
- Quantity-based discount tiers (100-10,000+ units)
- Price calculation factors: base price, paper type, color mode, coating, folding
- Formula: `(basePrice × paperMultiplier × colorMultiplier + coatingCost + foldingCost) × (1 - quantityDiscount)`

### Service Worker Strategy
- Cache name: `indigo-calc-v1` (increment version to force cache update)
- Pre-caches all static assets on install
- Cache-first strategy for all requests
- Auto-cleanup of old caches on activation

### File Structure Patterns
- `/pages/*.html` - Individual calculator pages (brochures, postcards, flyers)
- `/icons/` - PWA icons and product SVG icons
- All paths now use relative URLs for GitHub Pages subdirectory compatibility
- Service worker and manifest use full paths including repository name

## Key Implementation Details

### Adding New Product Calculators
1. Create new HTML file in `/pages/`
2. Add to service worker `urlsToCache` array
3. Extend `calculator.js` with new pricing function
4. Update navigation in all HTML files

### Updating Pricing
All pricing data is in `pricingData` object in `calculator.js`. Modify multipliers and base prices there.

### Cache Busting
To force users to get updated files:
1. Change `CACHE_NAME` in `sw.js` (e.g., to `indigo-calc-v2`)
2. This triggers service worker update cycle

### PWA Icon Requirements
- Must create `icon-192.png` and `icon-512.png` in `/icons/`
- Currently using SVG placeholders that need conversion to PNG

## GitHub Pages Specifics
- `.nojekyll` file prevents Jekyll processing
- All asset paths must be absolute (`/path/to/file`)
- Deployed at: https://jqn525.github.io/hp-indigo-calculator/