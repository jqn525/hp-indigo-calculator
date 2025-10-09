# CLAUDE.md

SFU Document Solutions streamlined pricing calculator: Universal Configurator + Inventory Management (/inventory/)

## Project Overview

- **Tech Stack**: Vanilla JS, Bootstrap 5.3.3, Supabase, PWA
- **Architecture**: Streamlined single-page app with universal configurator, database for user data only
- **Hosting**: Netlify with custom domain (docsol.ca)
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
# Auto-deploys via Netlify
```

### Cache Busting
- Increment `CACHE_NAME` in `sw.js` (current: v183) and `/inventory/sw.js` (current: v1)
- Required when deploying CSS/JS changes

## Architecture

### Streamlined Application Structure
- **Main App** (`/`): Single-page pricing tool with universal configurator
- **Inventory App** (`/inventory/`): Complete inventory management system
- **Shared**: Authentication, branding, domain

### Pricing Engine (Static-First)
- **Formula**: `C(Q) = (S + F_setup + S_total^e × k + Q × v + Q × f) × r`
- **Sheet-Based Production**: S_total = total sheets through press (quantity × sheets per unit for complex products, or ceil(quantity / imposition) for simple products)
- **Standardized Values**: e=0.80 (all products), k=$1.50 (per sheet)
- **Data Sources**: `/js/pricingConfig.js` + `/js/paperStocks.js` (authoritative)
- **Database**: User data only (accounts, carts, quotes) - NO pricing data
- **Cache**: Service worker v183 with cache-first strategy

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
- `/js/universalConfigurator.js`: Main configurator orchestrator (354 lines, refactored)
- `/js/universalConfigurator/`: Modular architecture (14 files)
  - `ConfigurationManager.js`: State management
  - `UIManager.js`: DOM operations
  - `PricingManager.js`: Pricing coordination
  - `products/`: Product-specific handlers (FlatPrintHandler, FoldedPrintHandler, BookletHandler, PosterHandler, StickerHandler)
  - `utils/`: Helper utilities (FormDataBuilder, ValidationHelper, EventBindingHelper)
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
- **Main App**: v183 (latest: material markup standardization + calculator streamlining)
- **Inventory App**: v1 (unchanged)

## Development Notes

- **External Drives**: Use `npx serve` instead of Python server to avoid connection drops
- **Bootstrap**: Currently using 5.3.3 with integrity verification
- **Environment**: Service worker auto-detects localhost vs production paths
- **Manifest**: Uses SVG icons (no PNG conversion needed)
- **Streamlined Focus**: Application optimized for staff use with minimal navigation

## Staff Workflow

1. **Login**: Staff authenticate via `/pages/signin.html`
2. **Auto-Redirect**: Immediately redirected to universal configurator
3. **Price Products**: Use single configurator for all product types
4. **Manage Cart**: Add items, edit configurations, save quotes
5. **View History**: Access previous quotes and cart items
6. **Admin Functions**: Manage users and system settings (admin only)

## Recent Updates

### Sheet-Based Production Cost Formula (2025-01-08)
- **Implemented** sheet-based production costs: production term now uses S_total^e × k instead of Q^e × k
- **Standardized** efficiency exponent to e=0.80 for all products (removed custom exponents)
- **Unified** production rate to k=$1.50 for all products (aligned with per-sheet cost derivation)
- **S_total Calculation**:
  - Simple products: S_total = ceil(Q / imposition)
  - Booklets: S_total = Q × (cover sheets + text sheets per booklet)
  - Perfect Bound: S_total = Q × (interior sheets + cover sheets per book)
  - Notebooks: S_total = Q × (cover sheets + text sheets per notebook)
  - Notepads: S_total = press sheets needed
- **Benefits**: Logically consistent with k=$1.50 per-sheet derivation, accurate scaling with actual press time
- **Impact**: e=0.80 provides balanced volume discounts based on original research documentation

### Modular Architecture Refactoring (2025-10-08)
- **Refactored** `universalConfigurator.js` from 2,262 lines to 354 lines (84% reduction)
- **Created** modular structure with separation of concerns:
  - ConfigurationManager: Centralized state management
  - UIManager: All DOM operations isolated
  - PricingManager: Pricing calculation coordination
  - ProductHandler base class with 5 product-specific handlers
  - Utility classes for form building, validation, and event binding
- **Maintained** backwards compatibility with existing calculator functions
- **Updated** to ES6 module system (`type="module"`)

### Critical Bug Fix: Printing Sides Logic
- **Fixed** fundamental error where double-sided printing was incorrectly calculated as cheaper than single-sided for flat products
- **Root Cause**: Imposition was incorrectly multiplied by sidesMultiplier, treating double-sided as if it fits MORE pieces per sheet
- **Correct Logic**: For flat products (postcards, flyers, brochures), imposition doesn't change with printing sides - only click charges change (single = $0.05, double = $0.10)
- **Functions Fixed** (8 total in calculator.js):
  - calculateBrochurePrice()
  - calculatePostcardPrice()
  - calculateTableTentPrice()
  - calculateNameTagPrice()
  - calculateFlyerPrice()
  - calculateBookmarkPrice()
  - calculateFlatPrintPrice()
  - calculateFoldedPrintPrice()
- **Preserved** correct logic for folded products (booklets, notebooks, perfect bound books) where sidesMultiplier affects pages per sheet

### Material Cost Markup Standardization (2025-10-09)
- **Implemented** differentiated markup strategy based on product complexity:
  - **Multi-sheet products** (booklets, notebooks, notepads, perfect bound books): **1.25x markup**
  - **Simple/flat products** (postcards, name tags, flyers, bookmarks, brochures, table tents): **1.5x markup**
- **Rationale**: Prevents cost snowballing on high-page-count products while maintaining healthy margins on multi-up products
- **Formula Impact**: `materialsCostPerUnit = (coverCost + textCost + clickCost) × multiplier`
- **Benefits**: Balanced pricing that accounts for taxes, shipping, and service charges without excessive markup on complex products

### Calculator Streamlining (2025-10-09)
- **Removed** 6 legacy calculator functions (776 lines, 40% code reduction)
- **Deleted Functions** (all replaced by Universal Configurator handlers):
  - calculateBrochurePrice() → FoldedPrintHandler
  - calculatePostcardPrice() → FlatPrintHandler
  - calculateTableTentPrice() → FoldedPrintHandler
  - calculateNameTagPrice() → FlatPrintHandler
  - calculateFlyerPrice() → FlatPrintHandler
  - calculateBookmarkPrice() → FlatPrintHandler
- **File Size**: calculator.js reduced from 1,952 to 1,176 lines
- **Cleaned Up**: Window exports (11 → 7 active functions)
- **Active Functions**: calculateFlatPrintPrice, calculateFoldedPrintPrice, calculateBookletPrice, calculateNotebookPrice, calculateNotepadPrice, calculatePosterPrice, calculatePerfectBoundPrice
- **Benefits**: Cleaner codebase, reduced bundle size, easier maintenance

### New Product Handlers (2025-10-09)
- **Created** PerfectBoundHandler.js (4-500 pages with flexible page counts)
- **Created** NotebookHandler.js (plastic coil, wire-o, perfect binding options)
- **Created** NotepadHandler.js (glue-bound tear-away pads with backing cardboard)
- **Registered** all handlers in ProductHandlerFactory.js
- **Features**: Full multi-paper support, proper material cost calculations, comprehensive configuration options

## Next Session Priorities

1. Performance optimization for modular configurator
2. Enhanced material selection interface
3. Advanced quote management features
4. Staff training documentation
5. Additional product handler implementations