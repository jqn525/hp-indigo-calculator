# CLAUDE.md

SFU Document Solutions streamlined pricing calculator: Universal Configurator + Inventory Management (/inventory/)

## Project Overview

- **Tech Stack**: Vanilla JS, Bootstrap 5.3.3, Supabase, PWA
- **Architecture**: Streamlined single-page app with universal configurator, database for user data only
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
- Increment `CACHE_NAME` in `sw.js` (current: v164) and `/inventory/sw.js` (current: v1)
- Required when deploying CSS/JS changes

## Architecture

### Streamlined Application Structure
- **Main App** (`/`): Single-page pricing tool with universal configurator
- **Inventory App** (`/inventory/`): Complete inventory management system
- **Shared**: Authentication, branding, domain

### Pricing Engine (Static-First)
- **Formula**: `C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r`
- **Data Sources**: `/js/pricingConfig.js` + `/js/paperStocks.js` (authoritative)
- **Database**: User data only (accounts, carts, quotes) - NO pricing data
- **Cache**: Service worker v164 with cache-first strategy

### Supported Products (via Universal Configurator)
- **Small Format**: brochures, postcards, flyers, bookmarks, name-tags, booklets, notebooks, notepads, table-tents
- **Large Format**: posters with dynamic material constraints
- **Promotional**: magnets, stickers, apparel, tote-bags
- **Custom Products**: Any product with custom dimensions and specifications

## Code Conventions

- **Indentation**: 2 spaces
- **Comments**: None unless explicitly requested
- **Imports**: ES6 modules where applicable
- **Naming**: camelCase for JS, kebab-case for HTML/CSS
- **Files**: Essential pages only in `/pages/`, `/js/*.js` for modules

## File Structure

### Core Configuration
- `/js/pricingConfig.js`: Product constraints, formulas, imposition data
- `/js/paperStocks.js`: Paper specs and costs
- `/js/calculator.js`: Core pricing functions
- `/js/universalConfigurator.js`: Main configurator logic
- `sw.js`: Service worker (increment version for cache updates)
- `manifest.json`: PWA configuration

### Essential Pages
- `index.html`: Auto-redirects to universal configurator after authentication
- `/pages/universal-configurator.html`: Main pricing interface
- `/pages/cart.html`: Cart management
- `/pages/quotes.html`: Quote history
- `/pages/signin.html`: Authentication
- `/pages/admin.html`: Administrative functions

### Key Directories
- `/pages/`: Essential pages only (streamlined)
- `/js/`: JavaScript modules (safe to edit)
- `/inventory/`: Complete inventory app (separate PWA)
- `/sql/`: Database schema and migrations
- `/icons/`: PWA and product icons

## Development Workflow

### Staff-Focused Design
- Users authenticate and are immediately redirected to the universal configurator
- No marketing content or promotional material
- Streamlined navigation with essential functions only
- Optimized for staff efficiency and minimal clicks

### Updating Universal Configurator
1. Edit `pricingConfig.js` for product constraints and formulas
2. Edit `paperStocks.js` for material specifications
3. Update `universalConfigurator.js` for new features
4. Increment cache version in `sw.js`
5. Deploy via git push

### Adding New Product Support
1. Add product constraints to `pricingConfig.js` (`productConstraints` object)
2. Add imposition data to `pricingConfig.js` (`impositionData` object)
3. Update pricing logic in `calculator.js` if needed
4. Test in universal configurator interface
5. Deploy changes

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
- **Direct Access**: Login redirects immediately to universal configurator
- **Supabase**: Cloud authentication with session management
- **Staff-Focused**: No marketing content or customer-facing material

## Current State

### Streamlined Features (2025-09-22)
- Universal configurator as single entry point
- Removed all individual product calculators
- Direct staff access without marketing content
- Simplified navigation (Calculator, Cart, Quotes, Admin)
- Complete cart edit functionality
- Inventory management system at `/inventory/`
- PWA features with offline support

### File Structure Changes
- **Removed**: 19 individual product calculator pages
- **Removed**: Product hub pages (small-format, large-format, promo)
- **Removed**: Marketing content and hero sections
- **Kept**: Essential pages only (6 total)

### Service Worker Versions
- **Main App**: v164 (updated for streamlined app)
- **Inventory App**: v1 (unchanged)

## Development Notes

- **External Drives**: Use `npx serve` instead of Python server to avoid connection drops
- **Bootstrap**: Currently using 5.3.3 with integrity verification
- **Environment**: Service worker auto-detects localhost vs Vercel paths
- **Manifest**: Uses SVG icons (no PNG conversion needed)
- **Streamlined Focus**: Application optimized for staff use with minimal navigation

## Staff Workflow

1. **Login**: Staff authenticate via `/pages/signin.html`
2. **Auto-Redirect**: Immediately redirected to universal configurator
3. **Price Products**: Use single configurator for all product types
4. **Manage Cart**: Add items, edit configurations, save quotes
5. **View History**: Access previous quotes and cart items
6. **Admin Functions**: Manage users and system settings (admin only)

## Next Session Priorities

1. Performance optimization for universal configurator
2. Enhanced material selection interface
3. Improved imposition calculations
4. Advanced quote management features
5. Staff training documentation