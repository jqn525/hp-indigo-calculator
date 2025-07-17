# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HP Indigo Pricing Calculator - A Progressive Web App (PWA) for calculating pricing for HP Indigo digital press products. Built as a vanilla JavaScript application with no framework dependencies, designed for internal print shop teams using tablets.

### ⭐ **Latest Updates (2025-01-16)**
- **NEW PRODUCT**: Bookmarks calculator (2x6, 2x7, 2x8) with 130# Cover Uncoated/Silk options
- **CART SYSTEM**: Complete cart functionality with localStorage, quote batching, and export  
- **MOBILE UX**: Apple Music-style navigation optimization for iPhone 14 Pro Max
- **BUTTON LAYOUT**: Professional 3-column button grid matching selection card design

### Current Products Available:
- **Brochures** (tri-fold, bi-fold) - 25-2500 units, e=0.75
- **Postcards** (4x6, 5x7, 5.5x8.5, 6x9) - 100-5000 units, e=0.70
- **Flyers** (5.5x8.5, 8.5x11, 8.5x14, 11x17) - 25-2500 units, e=0.70
- **Bookmarks** (2x6, 2x7, 2x8) - 100-2500 units, e=0.65 - *NEW*
- **Large Format** (placeholder page)

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
- `pricingConfig` object in `/js/pricingConfig.js` contains all pricing rules and constraints
- `paperStocks` object in `/js/paperStocks.js` contains paper costs and specifications
- Core pricing formula: `C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r`
  - S = Setup fee ($30)
  - F_setup = Finishing setup fee ($15, if finishing required)
  - Q = Quantity
  - e = Efficiency exponent (0.75 for brochures, 0.70 for postcards/flyers)
  - k = Base production rate ($1.50)
  - v = Variable cost per piece (paper + clicks × 1.5 / imposition)
  - f = Finishing cost per piece
  - r = Rush multiplier (1.0-2.0x)

### Products Implemented
- **Brochures**: qty 25-2500, 3 sizes, folding options, e=0.75
- **Postcards**: qty 100-5000, 4 sizes, no finishing, e=0.70
- **Flyers**: qty 25-2500, 4 sizes, text + cover stock subset, e=0.70
- **Bookmarks**: qty 100-2500, 3 sizes (2x6, 2x7, 2x8), 130# Cover Uncoated/Silk, e=0.65

### Cart System (NEW)
- **localStorage Persistence**: Cart items saved across browser sessions
- **Quote Batching**: Add multiple product configurations to cart
- **Export Functionality**: Generate text file quotes for customer delivery
- **Real-time Badge**: Cart item count displayed on navigation
- **Product Integration**: Seamless Add to Cart from all calculators

### Service Worker Strategy
- Cache name: `indigo-calc-v25` (increment version to force cache update)
- Environment detection for localhost vs GitHub Pages paths
- Pre-caches all static assets on install
- Cache-first strategy for all requests
- Auto-cleanup of old caches on activation

### File Structure Patterns
- `/pages/*.html` - Individual calculator pages (brochures, postcards, flyers, bookmarks, large-format, cart)
- `/js/calculator.js` - Product-specific pricing functions
- `/js/cart.js` - Cart management system with localStorage
- `/js/pricingConfig.js` - Centralized pricing rules and constraints
- `/js/paperStocks.js` - Paper specifications and costs
- `/js/sw-register.js` - Service worker registration with environment detection
- `/icons/` - PWA icons and product SVG icons
- Navigation: Bottom-positioned 3-tab structure (Small Format + Large Format + Cart)

## Key Implementation Details

### Adding New Product Calculators
1. Add product constraints to `pricingConfig.js` (`productConstraints` object)
2. Add imposition data to `pricingConfig.js` (`impositionData` object)
3. Create new HTML file in `/pages/` with appropriate form fields
4. Add new pricing function to `calculator.js` (follow existing patterns)
5. Add to service worker `urlsToCache` array
6. Increment cache version in `sw.js`

### Updating Pricing
- Paper costs: Modify `paperStocks.js`
- Formula constants: Modify `pricingConfig.formula` object
- Product constraints: Modify `pricingConfig.productConstraints`
- Rush multipliers: Modify `pricingConfig.rushMultipliers`

### UI Components & Styling
- **Apple Music-style Navigation**: Compact mobile-first navigation with large icons, small text
- **Selection Cards**: Consistent card-based interface for size, paper, and option selection  
- **Button Grid**: 3-column button layout (Calculate, Add to Cart, Clear) matching selection cards
- **Responsive Design**: Optimized for iPhone 14 Pro Max and all mobile devices
- **Color Scheme**: Primary blue (#0096D6), secondary teal (#00B0A6), consistent throughout

### Cache Busting
To force users to get updated files:
1. Change `CACHE_NAME` in `sw.js` (e.g., from `indigo-calc-v25` to `indigo-calc-v26`)
2. This triggers service worker update cycle and clears old cache

### Environment Compatibility
- Service worker uses environment detection for localhost vs GitHub Pages
- `sw-register.js` handles different service worker paths automatically
- Manifest references SVG icons (no PNG conversion needed)

## GitHub Pages Specifics
- `.nojekyll` file prevents Jekyll processing
- All asset paths must be absolute (`/path/to/file`)
- Deployed at: https://jqn525.github.io/hp-indigo-calculator/

---

## Recent Session Summary (2025-07-17)

### Major Updates Completed:

#### 1. **Magnet Pricing Formula Overhaul** 
- **Replaced simple markup system** with linear interpolation pricing
- **New Formula**: `C(Q) = C1 + (Q - Q1) × (C2 - C1) / (Q2 - Q1)` then `× 1.25 markup`
- **Supplier Cost Data**: Exact pricing matrices for all sizes (2x2, 3x3, 4x4, 5x5)
- **Quantity Brackets**: [25, 50, 100, 250, 500, 1000] with interpolation between points
- **Validation**: 5-piece increments only (25, 30, 35, etc.), 25-piece minimum
- **Files Updated**: `pages/magnets.html`, `js/promoConfig.js`, `js/promoCalculator.js`

#### 2. **Version Timestamp System** 
- **Real-time Version Display**: Bottom-right corner shows "v29 - July 17, 2025 - 22:57:30"
- **Files Added**: `js/version.js` with APP_VERSION object
- **Styling**: Subtle dark overlay with monospace font
- **Coverage**: All pages (index, calculators, cart)
- **Easy Updates**: Just edit timestamp in version.js and bump cache version in sw.js

#### 3. **Bug Fixes**
- **Magnet Calculator**: Fixed missing `promoConfig.js` dependency in magnets.html
- **Linear Interpolation**: Tested against formula examples - all calculations match exactly
- **Service Worker**: Updated cache to v29, includes new version.js file

### Technical Notes:

#### Development Server Issues:
- **Problem**: Python server drops frequently on external drive (Lexar ES3)
- **Solution**: Use `npx serve -p 8000 -s .` instead of `python3 -m http.server 8000`
- **Cause**: External USB drives + macOS power management + Python server limitations
- **Prevention**: Keep terminal active, prevent Mac sleep, consider moving to internal drive

#### Magnet Pricing Validation:
✅ **75 pieces 2x2**: Supplier $81.00 → Customer $101.25  
✅ **350 pieces 3x3**: Supplier $392.20 → Customer $490.25  
✅ **35 pieces 4x4**: Supplier $88.60 → Customer $110.75  

#### Current Cache Version: v29
- Incremented for magnet pricing changes and version system addition
- Next update should use v30

---

## Previous Session Summary (2025-01-16)

### Major Features Implemented Today:

#### 1. **Complete Cart System** 
- **Files**: `js/cart.js`, `pages/cart.html`
- **Features**: localStorage persistence, quote batching, export functionality
- **Integration**: Add to Cart buttons on all product pages
- **Badge System**: Real-time cart count on navigation

#### 2. **New Product: Bookmarks**
- **Files**: `pages/bookmarks.html`, updates to `pricingConfig.js`, `calculator.js`
- **Specifications**: 
  - Sizes: 2x6, 2x7 (recommended), 2x8
  - Paper: 130# Cover Uncoated (`COUDCCDIC123513FSC`), 130# Cover Silk (`PACDISC12413FSC`)
  - Quantity: 100-2500 units (10-up imposition)
  - Efficiency: e=0.65 (excellent volume discounts)

#### 3. **Mobile UX Optimization**
- **Apple Music-style Navigation**: Compact 3-column layout with larger icons
- **iPhone 14 Pro Max Optimized**: Proper spacing and touch targets
- **Responsive Design**: Maintains usability across all screen sizes

#### 4. **Button Layout Redesign**
- **Professional 3-Column Grid**: Calculate, Add to Cart, Clear buttons
- **Card-based Design**: Buttons match selection card styling
- **Consistent Spacing**: Proper gaps and responsive behavior
- **Improved Text**: "Reset Form" → "Clear"

### Technical Updates:
- **Service Worker**: Updated to v25, includes all new files
- **CSS Enhancements**: Button grid system, mobile optimizations
- **Code Organization**: Modular cart system, consistent patterns

### Ready for Tomorrow:
- All major features implemented and tested
- Documentation updated with current state
- Service worker cache updated for deployment
- Mobile experience optimized for production use

### Potential Next Steps:
- Additional product types (business cards, door hangers, etc.)
- Advanced cart features (customer info, delivery options)
- Analytics integration
- Print-ready quote formatting

## Development Startup

### Startup Instructions
- always start up the application using this method.