# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SFU Document Solutions Dual Application Suite** - Two integrated Progressive Web Apps serving SFU Document Solutions:

1. **Pricing Calculator** (`/`) - Main pricing calculator for digital printing services
2. **Inventory Management** (`/inventory/`) - Complete inventory management system for supplies and materials

Both applications share the same domain, branding, authentication system, and infrastructure.

**Live URL**: https://docsol.ca
**Inventory URL**: https://docsol.ca/inventory/

### ⭐ **Latest Updates (2025-08-15)**
- **INVENTORY MANAGEMENT SYSTEM COMPLETE**: Full-featured inventory management application at `/inventory/`
  - **Professional UI**: Matches pricing calculator styling with SFU branding and Bootstrap 5.3.3
  - **Action Grid Interface**: Clean 2x2 grid with Request, Search, Receive, and Pending actions
  - **Static Inventory Data**: Complete inventory structure in `/inventory/js/inventoryStructure.js`
  - **Request System**: Submit inventory requests with approval workflow
  - **Admin Panel**: Full administrative interface for managing requests
  - **Search & Browse**: Collapsible tree navigation and search functionality
  - **Emoji-Free Design**: Professional text-based icons throughout (REQ, FIND, RCV, LIST, INV)
  - **PWA Features**: Service worker, offline support, and mobile installation
  - **Supabase Integration**: Request tracking with user authentication

### Previous Updates (2025-08-14)
- **CART EDIT FUNCTIONALITY COMPLETE**: Full cart item editing system with professional implementation
  - **Edit Mode Detection**: Product pages automatically detect edit mode via URL parameters
  - **Field Population**: All configuration fields pre-populated with saved values for all product types
  - **Button Management**: "Add to Cart" becomes "Update Cart Item" with proper event handling
  - **Database Integration**: Edit functionality works seamlessly with Supabase cloud storage
  - **No Duplicates**: Fixed event listener conflicts that caused item duplication
  - **Pricing Integrity**: Resolved $0.00 pricing corruption during edits
  - **UI Polish**: Removed unwanted gray background from configuration sections
  - **Save Quote Button**: Changed to red for better visual prominence
  - **Product Support**: Works with all products (brochures, postcards, flyers, bookmarks, booklets, notebooks, notepads, name tags)

### Previous Updates (2025-08-13)
- **NOTEPAD PRICING OPTIMIZATION COMPLETE**: Major pricing formula improvements for competitive bulk pricing
  - **Efficiency Exponent**: Improved from 0.80 to 0.65 for aggressive bulk discounts
  - **Per-Sheet Labor Pricing**: Changed from flat $1.50/unit to $0.01 per sheet (scales with pad size)
  - **Corrected Click Costs**: Fixed excessive materials pricing by properly calculating press sheet clicks
  - **Universal Click Charges**: All notepads (blank, lined, custom) incur press clicks for accuracy
  - **Real-Time UI Updates**: Fixed pricing updates when changing sheet count selections
  - **Production Cost Formula**: Q^0.65 × $1.50 provides excellent volume economies
- **NOTEBOOKS PRODUCT COMPLETE**: Added professional coil-bound, wire-o, and perfect-bound notebooks
  - **Configuration Options**: 5.5×8.5" and 8.5×11" sizes, 50 or 100 pages
  - **Binding Types**: Plastic coil, wire-o, and perfect binding with proper cost calculations
  - **Paper Options**: Cover and interior paper selections with premium options
  - **Content Types**: Lined or blank pages with setup cost logic
  - **Quantity Range**: 10-500 units with preset buttons (25, 50, 100, 250, 500)
- **NOTEPADS PRODUCT COMPLETE**: Added custom tear-away notepads with glue-bound construction
  - **Size Options**: 4×6", 5×7", 5.5×8.5", 8.5×11" for marketing flexibility
  - **Sheet Options**: 25, 50, 75, 100 sheets per pad for various use cases
  - **Content Types**: Blank (no setup fee), lined, and custom printed options
  - **Paper Selection**: Text paper and cardstock backing options
  - **Quantity Range**: 25-1000 units with comprehensive preset buttons
- **QUANTITY PRESET ENHANCEMENT**: Added clickable quantity suggestion buttons to both products
- **PROFESSIONAL UI**: Both products match existing product page design patterns perfectly


### Current Products Available:

#### Small Format Products:
- **Small Format Hub** (`/pages/small-format.html`) - Unified product selection with filtering
- **Brochures** (tri-fold, bi-fold) - 25-2500 units, e=0.75
- **Postcards** (4x6, 5x7, 5.5x8.5, 6x9) - 100-5000 units, e=0.70
- **Flyers** (5.5x8.5, 8.5x11, 8.5x14, 11x17) - 25-2500 units, e=0.70
- **Bookmarks** (2x6, 2x7, 2x8) - 100-2500 units, e=0.65
- **Name Tags** (2.33x3, 3x4, 4x6) - 50-5000 units, e=0.65, optimized pricing
- **Booklets** (8-48 pages, multiples of 4) - 10-1000 units, e=0.75, dual paper selection
- **Notebooks** (5.5x8.5, 8.5x11) - 10-500 units, 50/100 pages, coil/wire-o/perfect binding
- **Notepads** (4x6, 5x7, 5.5x8.5, 8.5x11) - 25-1000 units, 25/50/75/100 sheets, tear-away pads
- **Table Tents** - Professional table tents for events and marketing

#### Product Information Pages:
- **Product Notebooks** (`/pages/product-notebooks.html`) - Notebook specifications and features
- **Product Notepads** (`/pages/product-notepads.html`) - Notepad details and configuration
- **Templates** (`/pages/templates.html`) - Design templates and guidelines

#### Large Format Products:
- **Posters** (18x24, 22x28, 24x36, 36x48) - 1-20 units, square-footage pricing
  - Rite-Media Paper: $6/sqft (9mil matte)
  - Fabric Material: $9/sqft (8mil matte coated)

#### Promotional Products:
- **Magnets** (2x2, 3x3, 4x4, 5x5) - 25-1000 units, linear interpolation pricing
- **Stickers** (various sizes) - Quantity-based pricing
- **Apparel** (t-shirts, hoodies) - Size and color options
- **Tote Bags** (standard canvas) - Bulk pricing tiers


## Development Commands

### Local Development
```bash
# Start local server (Python)
python -m http.server 8000

# Start local server (Node.js) - Recommended for external drives
npx serve -p 8000 -s .
```

Access applications at:
- **Pricing Calculator**: http://localhost:8000
- **Inventory Management**: http://localhost:8000/inventory/

**Note**: Use `npx serve` instead of Python server when working on external drives (Lexar ES3) to avoid connection drops due to macOS power management.

### Deployment
```bash
# Push to GitHub (triggers Vercel deployment)
git add -A
git commit -m "Your commit message"
git push origin main
```

**Live Site**: https://docsol.ca (Vercel hosting with custom domain)
**Staging**: Vercel preview deployments for pull requests

## Architecture

### Dual Application Structure
The repository contains two separate but integrated applications:

1. **Main Pricing Calculator** (`/`) - Core pricing application
2. **Inventory Management** (`/inventory/`) - Complete inventory management system

Both share authentication, branding, and infrastructure but operate as independent PWAs.

### Core Technologies
- **Vanilla JavaScript** - No build process or framework
- **Service Worker** (`sw.js` + `/inventory/sw.js`) - Offline caching with cache-first strategy
- **PWA Manifest** (`manifest.json` + `/inventory/manifest.json`) - App installation configuration
- **Bootstrap 5.3.3** - UI framework with integrity verification
- **Supabase** - Authentication, cart storage, quotes, and inventory requests

### Pricing Engine (Static-First Architecture)
The pricing calculation logic is centralized in `/js/calculator.js`:
- **Static Files Authoritative**: All pricing data comes from static files only
- `pricingConfig` object in `/js/pricingConfig.js` contains all pricing rules and constraints
- `paperStocks` object in `/js/paperStocks.js` contains paper costs and specifications
- **Database**: Used only for user data (accounts, carts, quotes) - NO pricing data
- Core pricing formula: `C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r`
  - S = Setup fee (varies by product: $30 standard, $15 for name tags, $0-30 for notepads)
  - F_setup = Finishing setup fee ($15, if finishing required)
  - Q = Quantity
  - e = Efficiency exponent (0.75 brochures, 0.70 postcards/flyers, 0.65 name tags/bookmarks/notepads)
  - k = Base production rate ($1.50)
  - v = Variable cost per piece (paper + clicks × 1.5 / imposition)
  - f = Finishing cost per piece
  - r = Rush multiplier (1.0-2.0x)

#### Notepad-Specific Pricing (Optimized 2025-08-13):
- **Formula**: `C(Q) = S + F_setup + Q^0.65 × 1.50 + Q × (M + L)`
- **Setup Fees**: Blank ($0), Lined ($15), Custom ($30) + $15 padding setup
- **Materials (M)**: (Text + Backing + Clicks) × 1.25 markup per unit
  - Text Cost: (Press Sheets × Paper Cost) / Quantity
  - Backing Cost: (1/Imposition) × Cardstock Cost
  - Click Cost: (Press Sheets × $0.10) / Quantity (all content types)
- **Labor (L)**: $0.01 per sheet per notepad (scales with pad size)
- **Production**: Q^0.65 × $1.50 (aggressive bulk discounts)
- **Press Sheets**: (Quantity × Sheets per Pad) / Imposition

### Inventory Management System (`/inventory/`)
Complete inventory management application with static-first architecture:

#### Core Features
- **Request System**: Team members can request inventory items with quantity and notes
- **Admin Approval**: Admins can approve, reject, or mark requests as fulfilled
- **Search & Browse**: Full-text search and category browsing with collapsible tree structure
- **Status Tracking**: Real-time status updates (pending → approved/rejected → fulfilled)

#### Architecture
- **Static Inventory Data**: Complete inventory structure in `/inventory/js/inventoryStructure.js`
- **Database Usage**: Only for requests and status tracking, not inventory items
- **Authentication**: Shared Supabase authentication with main application
- **PWA Features**: Independent service worker and manifest for mobile installation

#### User Roles
- **Team Members**: Can request items, view their requests, search inventory
- **Admins**: Full access to approve/reject requests, admin panel, delivery management

#### Database Schema
```sql
-- Single table for all inventory requests
inventory_requests (
  id UUID PRIMARY KEY,
  user_email VARCHAR NOT NULL,
  items JSONB NOT NULL,           -- Array of requested items
  status VARCHAR DEFAULT 'pending',
  priority VARCHAR DEFAULT 'normal',
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP,
  processed_at TIMESTAMP
)
```

#### File Structure
```
/inventory/
├── index.html          # Main dashboard with 2x2 action grid
├── request.html        # Request items with tree navigation
├── search.html         # Search and browse inventory
├── pending.html        # User's request history
├── receive.html        # Mark approved requests as fulfilled
├── admin.html          # Admin panel for request management
├── js/
│   ├── app.js          # Core application logic
│   ├── inventoryStructure.js  # Static inventory data
│   ├── auth.js         # Shared authentication
│   └── supabase.js     # Database configuration
├── css/styles.css      # SFU branding matching main app
└── sql/create-tables.sql # Database schema
```

### Products Implemented
- **Brochures**: qty 25-2500, 3 sizes, folding options, e=0.75
- **Postcards**: qty 100-5000, 4 sizes, no finishing, e=0.70
- **Flyers**: qty 25-2500, 4 sizes, text + cover stock subset, e=0.70
- **Bookmarks**: qty 100-2500, 3 sizes (2x6, 2x7, 2x8), 130# Cover Uncoated/Silk, e=0.65
- **Name Tags**: qty 50-5000, 3 sizes (2.33x3, 3x4, 4x6), optimized pricing, e=0.65
- **Booklets**: qty 10-1000, 8-48 pages, saddle-stitched, dual paper selection, e=0.75
- **Notebooks**: qty 10-500, 50/100 pages, coil/wire-o/perfect binding, premium options, e=0.80
- **Notepads**: qty 25-1000, 25/50/75/100 sheets, glue-bound, optimized bulk pricing, e=0.65
- **Posters**: qty 1-20, 4 sizes (18x24 to 36x48), square-footage pricing ($6-9/sqft)

### Cart & Quote System
- **localStorage Persistence**: Cart items saved across sessions
- **Cloud Sync**: Supabase integration for cross-device cart syncing
- **Quote Management**: Save, export, and manage customer quotes
- **Real-time Updates**: Live cart count and pricing updates

### Service Worker Strategy
- Cache name: `sfu-calc-v154` (increment version to force cache update)
- Environment detection for localhost vs Vercel paths
- Pre-caches all static assets on install
- Cache-first strategy for all requests
- Auto-cleanup of old caches on activation

### File Structure Patterns
- `/pages/*.html` - Individual calculator pages and product pages
- `/pages/product-*.html` - Detailed product information pages
- `/pages/small-format.html` - Unified small format product hub
- `/js/calculator.js` - Product-specific pricing functions
- `/js/configurator.js` - Product configuration management
- `/js/header.js` - Header component functionality
- `/js/small-format-filters.js` - Product filtering and search
- `/js/cart.js` - Cart management system with localStorage
- `/js/pricingConfig.js` - Centralized pricing rules and constraints
- `/js/paperStocks.js` - Paper specifications and costs
- `/js/sw-register.js` - Service worker registration with environment detection
- `/icons/` - PWA icons and product SVG icons
- Navigation: Bottom-positioned 3-tab structure (Small Format + Large Format + Cart)

## Key Implementation Details

### Key JavaScript Components

- **Product Configurator** (`js/configurator.js`) - Real-time pricing and configuration management
- **Header Navigation** (`js/header.js`) - Desktop header with dropdowns and mobile support
- **Product Filters** (`js/*-filters.js`) - Filtering systems for product hubs
- **Authentication** (`js/auth.js`, `js/auth-guard.js`) - Supabase authentication with page protection
- **Cart System** (`js/cart.js`) - Shopping cart with cloud sync and localStorage

### Adding New Product Calculators
**IMPORTANT**: Always check existing functional pages (like `brochures.html` or `notebooks.html`) for HTML structure and CSS patterns when creating new product pages. Copy the approved/functional page structure first, then customize for the specific product. This approach ensures consistency and reduces debugging time.

1. Add product constraints to `pricingConfig.js` (`productConstraints` object)
2. Add imposition data to `pricingConfig.js` (`impositionData` object)
3. Create new HTML file in `/pages/` using existing working page as template
4. Add new pricing function to `calculator.js` (follow existing patterns)
5. Add to service worker `urlsToCache` array
6. Increment cache version in `sw.js`

### Working with Inventory Management
**Adding New Inventory Items**:
1. Edit `/inventory/js/inventoryStructure.js` to add new items or categories
2. Follow existing structure with `id`, `name`, `sku`, `unit`, `location` fields
3. Use text-based icons only (no emojis) - examples: "PAPER", "INK", "TONER"
4. Test search functionality after adding new items

**Updating Inventory Database Schema**:
1. Modify `/inventory/sql/create-tables.sql` for schema changes
2. Use JSONB for flexible item data storage
3. Maintain RLS policies for proper user access control

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
- **Color Scheme**: SFU Light Red (#CC0633), SFU Dark Red (#A6192E), consistent SFU branding
- **Button Styling**: All buttons use SFU red colors including outline buttons (btn-outline-primary)
- **Professional Border Radius System**: Tiered radius hierarchy for visual consistency
  - `--radius-sm: 4px` - Small elements (badges, tags)
  - `--radius-md: 8px` - Interactive elements (buttons, inputs)
  - `--radius-lg: 12px` - Content containers (cards, panels)
  - `--radius-xl: 16px` - Large containers (modals, hero sections)

### Cache Busting
To force users to get updated files:

**Pricing Calculator**:
1. Change `CACHE_NAME` in `sw.js` (current version: `sfu-calc-v154`)
2. This triggers service worker update cycle and clears old cache
3. Always increment version when deploying CSS/JS changes

**Inventory Management**:
1. Change `CACHE_NAME` in `/inventory/sw.js` (current version: `sfu-inventory-v1`)
2. Update Bootstrap URLs to match main app (currently using 5.3.3)
3. Both applications have independent cache systems

### Environment Compatibility
- Service worker uses environment detection for localhost vs Vercel
- `sw-register.js` handles different service worker paths automatically
- Manifest references SVG icons (no PNG conversion needed)

## Vercel Deployment Specifics
- Automatic deployment on push to main branch
- Custom domain configured: docsol.ca
- All asset paths are absolute (`/path/to/file`)
- Production URL: https://docsol.ca

---

## Current File Structure

### Core Application Files
```
├── index.html                 # Main homepage with PWA features
├── login.html                 # SFU-branded authentication page
├── manifest.json              # PWA manifest configuration
├── sw.js                      # Service worker (v154) with caching
├── vercel.json               # Vercel deployment configuration
├── README.md                 # Project documentation
├── CLAUDE.md                 # This file - development instructions
├── PRICING_FORMULAS.md       # Detailed pricing formula documentation
└── migrate_database.js      # Database migration script
```

### JavaScript Architecture
```
├── js/
│   ├── app.js                # Main application initialization
│   ├── auth.js               # Supabase authentication system
│   ├── auth-guard.js         # Page-level authentication protection
│   ├── calculator.js         # Core pricing calculation engine
│   ├── cart.js               # Shopping cart with cloud sync
│   ├── configurator.js       # Enhanced product configurator
│   ├── db.js                 # Database operations
│   ├── header.js             # Desktop header navigation
│   ├── paperStocks.js        # Paper specifications and costs
│   ├── pricingConfig.js      # Centralized pricing rules
│   ├── promoCalculator.js    # Promotional product pricing
│   ├── promoConfig.js        # Promotional product configurations
│   ├── small-format-filters.js # Product filtering system
│   ├── large-format-filters.js # Large format filtering system
│   ├── promo-filters.js      # Promotional product filtering
│   ├── supabase.js           # Supabase client configuration
│   └── sw-register.js        # Service worker registration
```

### Product Pages
```
├── pages/
│   │   # Calculator Pages
│   ├── small-format.html     # Unified small format hub
│   ├── brochures.html        # Brochure calculator
│   ├── postcards.html        # Postcard calculator
│   ├── flyers.html           # Flyer calculator
│   ├── bookmarks.html        # Bookmark calculator
│   ├── name-tags.html        # Name tag calculator
│   ├── booklets.html         # Booklet calculator
│   ├── notebooks.html        # Notebook calculator
│   ├── notepads.html         # Notepad calculator
│   ├── table-tents.html      # Table tent calculator
│   │   # Large Format
│   ├── large-format.html     # Large format product hub
│   ├── posters.html          # Poster calculator
│   │   # Promotional Products
│   ├── promo.html            # Promotional products hub
│   ├── magnets.html          # Magnet calculator
│   ├── stickers.html         # Sticker calculator
│   ├── apparel.html          # Apparel calculator
│   ├── tote-bags.html        # Tote bag calculator
│   │   # Product Information
│   ├── product-notebooks.html # Notebook specifications
│   ├── product-notepads.html  # Notepad specifications
│   ├── templates.html        # Design templates and guidelines
│   │   # System Pages
│   ├── admin.html            # Admin panel
│   ├── cart.html             # Shopping cart interface
│   ├── quotes.html           # Quote history
│   └── signin.html           # User authentication
```

### Database & Configuration
```
├── sql/
│   ├── schema.sql            # Complete Supabase database schema
│   └── fix_quotes_table.sql  # Database fixes
├── inventory/            # Complete inventory management system
├── supabase/             # Supabase configuration
└── Pricing Documents/    # Detailed pricing documentation
```

## Next Session Opportunities (Updated)

### Immediate Improvements
1. **Performance Optimization**: Implement lazy loading for product images
2. **SEO Enhancement**: Add structured data markup for products
3. **Analytics Integration**: Google Analytics 4 with enhanced e-commerce tracking
4. **Advanced Filtering**: Search functionality for small format hub
5. **Mobile Enhancements**: Progressive Web App installation prompts

### Advanced Features  
1. **Quote Management**: Advanced quote templates and PDF generation
2. **Customer Portal**: Enhanced account dashboard with order history
3. **Integration**: Connect with existing SFU Document Solutions systems
4. **A/B Testing**: Framework for pricing and UI optimization
5. **Business Intelligence**: Advanced reporting and analytics dashboard

---

## Development Startup

### Startup Instructions
- Always start up the application using this method.
- can you remember to check the html and css code such as brochures for everytime i ask you to make a new product page. that way you can just replicate the approve/functional page before customizing it for the next product.