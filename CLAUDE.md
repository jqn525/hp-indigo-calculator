# CLAUDE.md

SFU Document Solutions dual-app suite: Pricing Calculator (main) + Inventory Management (/inventory/)

## Project Overview

- **Tech Stack**: Vanilla JS, Bootstrap 5.3.3, Supabase, PWA
- **Architecture**: Static-first pricing, database for user data only
- **Hosting**: Vercel with custom domain (docsol.ca)
- **Live URLs**: https://docsol.ca (pricing) | https://docsol.ca/inventory/ (inventory)

## Essential Commands

### Development
```bash
# Start local server (recommended for external drives)
npx serve -p 8000 -s .

# Alternative (Python)
python -m http.server 8000
```

### Deployment
```bash
git add -A
git commit -m "Description"
git push origin main
# Auto-deploys via Vercel
```

### Cache Busting
- Increment `CACHE_NAME` in `sw.js` (current: v157) and `/inventory/sw.js` (current: v1)
- Required when deploying CSS/JS changes

## Architecture

### Dual Application Structure
- **Main App** (`/`): Pricing calculator with 25+ products
- **Inventory App** (`/inventory/`): Complete inventory management system
- **Shared**: Authentication, branding, domain

### Pricing Engine (Static-First)
- **Formula**: `C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r`
- **Data Sources**: `/js/pricingConfig.js` + `/js/paperStocks.js` (authoritative)
- **Database**: User data only (accounts, carts, quotes) - NO pricing data
- **Cache**: Service worker v157 with cache-first strategy

### Current Products
- **Small Format**: brochures, postcards, flyers, bookmarks, name-tags, booklets, notebooks, notepads, table-tents
- **Large Format**: posters
- **Promotional**: magnets, stickers, apparel, tote-bags

## Code Conventions

- **Indentation**: 2 spaces
- **Comments**: None unless explicitly requested
- **Imports**: ES6 modules where applicable
- **Naming**: camelCase for JS, kebab-case for HTML/CSS
- **Files**: `/pages/*.html` for calculators, `/js/*.js` for modules

## File Structure

### Core Configuration
- `/js/pricingConfig.js`: Product constraints, formulas, imposition data
- `/js/paperStocks.js`: Paper specs and costs
- `/js/calculator.js`: Core pricing functions
- `sw.js`: Service worker (increment version for cache updates)
- `manifest.json`: PWA configuration

### Key Directories
- `/pages/`: Calculator pages (safe to edit)
- `/js/`: JavaScript modules (safe to edit)
- `/inventory/`: Complete inventory app (separate PWA)
- `/sql/`: Database schema and migrations
- `/icons/`: PWA and product icons

## Development Workflow

### Adding New Product Calculator
1. Check existing functional page (e.g., `brochures.html`) for HTML structure
2. Copy approved page structure, then customize
3. Add constraints to `pricingConfig.js` (`productConstraints` object)
4. Add imposition data to `pricingConfig.js` (`impositionData` object)
5. Create pricing function in `calculator.js`
6. Add to service worker `urlsToCache` array
7. Increment cache version

### Product Implementation Pattern
- Use existing working pages as templates
- Follow selection card UI pattern
- Implement real-time pricing updates
- Add quantity preset buttons
- Match SFU branding (red #CC0633)

## Critical Safety Rules

### Git Operations
- **Main Branch**: Always deploy from main
- **Commits**: Required before major changes
- **Never Commit**: Secrets, keys, or database credentials

### Pricing Updates
- **Static Files Only**: Edit `/js/pricingConfig.js` or `/js/paperStocks.js`
- **Database**: Never store pricing data in database
- **Deployment**: Auto-deploys pricing changes via git push

### Cache Management
- **CSS/JS Changes**: Always increment cache version
- **Service Worker**: Update both main app and inventory app versions
- **Deployment**: Verify cache invalidation after major changes

### Authentication
- **Front-Door Security**: All pages require login except index.html
- **Supabase**: Cloud authentication with session management
- **Development**: Demo mode available for testing

## Current State

### Latest Features (2025-09-11)
- Universal configurator with real-time pricing
- Complete cart edit functionality
- Inventory management system at `/inventory/`
- PWA features with offline support
- 25+ product calculators implemented

### Git Status
- **Current Branch**: main
- **Modified Files**: .DS_Store, js/calculator.js, js/universalConfigurator.js, pages/notepads.html
- **Database Files**: sql/fix_database_issues.sql, supabase/migrations/

### Service Worker Versions
- **Main App**: v157 (increment for main app updates)
- **Inventory App**: v1 (increment for inventory updates)

## Development Notes

- **External Drives**: Use `npx serve` instead of Python server to avoid connection drops
- **Bootstrap**: Currently using 5.3.3 with integrity verification
- **Environment**: Service worker auto-detects localhost vs Vercel paths
- **Manifest**: Uses SVG icons (no PNG conversion needed)

## Next Session Priorities

1. Performance optimization and lazy loading
2. SEO enhancement with structured data
3. Advanced filtering for product hubs
4. Quote management improvements
5. Business intelligence dashboard