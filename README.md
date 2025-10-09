# SFU Document Solutions Streamlined Pricing Calculator

**Streamlined Staff Pricing Tool** - A focused Progressive Web App designed specifically for SFU Document Solutions staff with direct access to the universal pricing configurator.

## ✨ Features

- ⚡ **Universal Configurator** - Single powerful tool for pricing any print product
- 🔐 **Staff-Focused Login** - Direct access to pricing tools without marketing content
- ☁️ **Cloud Integration** - Supabase database for user data and quotes
- 📱 **Progressive Web App** - Installable on tablets and phones
- 🔄 **Offline Support** - Works without internet after first visit
- 📋 **Quote Management** - Save, view, and manage customer quotes
- 🛒 **Cart System** - Batch multiple products with full edit functionality
- 📦 **Inventory Management** - Complete inventory system at `/inventory/`
- 🎨 **SFU Branding** - Official SFU red color scheme and typography

## 🌐 Live Applications

- **Pricing Calculator**: [https://docsol.ca](https://docsol.ca)
- **Inventory Management**: [https://docsol.ca/inventory/](https://docsol.ca/inventory/)

## 🎛️ Universal Configurator

The streamlined application centers around a single powerful configurator that handles all print products:

### Supported Products
- **Small Format**: Brochures, postcards, flyers, bookmarks, name tags, booklets, notebooks, notepads, table tents
- **Large Format**: Posters with roll media and rigid substrates
- **Promotional**: Magnets, stickers, apparel, tote bags
- **Custom Products**: Any product with custom dimensions and specifications

### Key Features
- **Real-time Pricing** - Instant calculations as you configure
- **Custom Dimensions** - Enter any size within material constraints
- **Material Selection** - Wide range of paper stocks and specialty materials
- **Quantity Optimization** - Bulk pricing with efficiency scaling
- **Imposition Calculations** - Automatic sheet optimization for cost savings

## 📦 Inventory Management System

Complete inventory management application at `/inventory/` featuring:

### Core Features
- **Request System** - Submit inventory requests with quantity and notes
- **Admin Approval** - Approve, reject, or mark requests as fulfilled
- **Search & Browse** - Full-text search and category tree navigation
- **Status Tracking** - Real-time updates (pending → approved/rejected → fulfilled)
- **PWA Support** - Independent service worker for offline functionality

### User Roles
- **Team Members** - Request items, view request history, search inventory
- **Admins** - Full administrative panel with request management

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), CSS Grid & Flexbox, Bootstrap 5.3.3
- **Backend**: Supabase (User Authentication, Quotes, Cart Sync, Inventory Requests)
- **Hosting**: Netlify with custom domain (docsol.ca)
- **PWA Features**: Dual Service Workers (v183 main, v1 inventory), Web App Manifests
- **Typography**: SFU custom fonts (November Condensed, Lava)
- **Authentication**: Front-door security with session management
- **Pricing**: Static files only - no database dependencies
- **Architecture**: Modular single-page application with separation of concerns

## 💻 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jqn525/hp-indigo-calculator.git
   cd hp-indigo-calculator
   ```

2. **Start a local server**
   ```bash
   # Using Node.js (recommended for external drives)
   npx serve -p 8000 -s .

   # Using Python
   python -m http.server 8000
   ```

3. **Access applications**
   ```
   Pricing Calculator:    http://localhost:8000
   Inventory Management:  http://localhost:8000/inventory/
   ```

## 🔧 Configuration

### Service Worker Versions
- **Main Application**: `v183` in `sw.js`
- **Inventory Application**: `v1` in `/inventory/sw.js`
- Increment versions when deploying CSS/JS changes to force cache updates

### Environment Variables
The application uses hardcoded Supabase credentials for simplicity. For production deployments, consider using environment variables.

## 📱 Mobile Features

- **Responsive Design**: Optimized for tablets and mobile devices
- **Touch-Friendly**: Large buttons and intuitive navigation
- **Dual PWA Support**: Install both applications independently
- **Offline Mode**: Full functionality without internet connection
- **Installation**: Add to home screen as native apps

## 🎨 Brand Guidelines

### SFU Colors
- **Primary Red**: #CC0633 (PMS 199C, RGB: 204, 6, 51)
- **Secondary Red**: #A6192E (PMS 187C, RGB: 166, 25, 46)

### Typography
- **Headers**: November Condensed (Heavy)
- **Body Text**: Lava (Regular)

## 🔐 Authentication System

- **Direct Access**: Login redirects immediately to universal configurator
- **Session Management**: Supports "remember me" functionality
- **Supabase Integration**: Cloud-based user authentication
- **Staff-Focused**: No marketing content or unnecessary navigation

## 💾 Data Management

### Database Usage (Supabase)
- **User Accounts**: Authentication and profiles
- **Quote System**: Save quotes with customer information
- **Cart Sync**: Cross-device cart synchronization with full edit support
- **Quote History**: View and manage all saved quotes
- **Inventory Requests**: Request tracking and admin workflow

### Pricing Data (Static Files)
- **Paper Costs**: `/js/paperStocks.js` - All paper specifications and pricing
- **Product Config**: `/js/pricingConfig.js` - Constraints, formulas, imposition data
- **Version Controlled**: All pricing changes tracked in git
- **Zero Maintenance**: No database updates needed for pricing changes

## 🚀 Deployment

### Automatic Deployment (Netlify)
```bash
# Make changes to either application
git add -A
git commit -m "Description of changes"
git push origin main
# Netlify automatically deploys both applications
```

### Manual Deployment Steps
1. **Push to GitHub**: All changes trigger automatic deployment
2. **Custom Domain**: Configured for docsol.ca with both applications
3. **Environment**: Production-ready with HTTPS and PWA support

## 📊 Pricing Engine (Static-First)

The calculator uses a sophisticated sheet-based pricing formula with data from static files only:

```
C(Q) = (S + F_setup + S_total^e × k + Q × v + Q × f) × r
```

### Formula Components
- **S** = Setup fee (varies: $30 standard, $15 name tags, $0-15 notepads)
- **F_setup** = Finishing setup fee ($15, if applicable)
- **S_total** = Total sheets through press (accounts for actual production time)
- **e** = Efficiency exponent: **0.80** (standardized across all products)
- **k** = Base production rate: **$1.50 per sheet**
- **Q** = Quantity ordered
- **v** = Variable cost per piece (paper + clicks with markup)
- **f** = Finishing cost per piece
- **r** = Rush multiplier (1.0-2.0x)

### Sheet-Based Production (S_total)
The formula uses **sheet-based production costs** instead of quantity-based to accurately reflect press time:
- **Simple Products**: `S_total = ceil(Q / imposition)` (e.g., 100 postcards at 8-up = 13 sheets)
- **Booklets**: `S_total = Q × (cover_sheets + text_sheets_per_booklet)`
- **Perfect Bound Books**: `S_total = Q × (interior_sheets + cover_sheets_per_book)`
- **Notebooks**: `S_total = Q × (cover_sheets + text_sheets_per_notebook)`
- **Notepads**: `S_total = press_sheets_needed` (based on pad assembly)

**Why Sheet-Based?** This approach accurately scales costs with actual press time rather than finished quantity, providing logical consistency with the k=$1.50 per-sheet derivation.

### Material Cost Markup Strategy
Variable costs include a markup to account for taxes, shipping, and service charges:
- **Multi-sheet products** (booklets, notebooks, notepads, perfect bound): **1.25x markup**
  - Prevents cost snowballing on high-page-count products
- **Simple/flat products** (postcards, flyers, name tags, brochures): **1.5x markup**
  - Higher margin justified by multi-up printing efficiency

**Formula**: `v = (paper_cost + click_cost) × markup_multiplier`

### Special Pricing Features
- **Universal Configurator**: Custom dimensions with real-time imposition calculations
- **Bulk Optimization**: Volume discounts with e=0.80 efficiency scaling
- **Material-Specific Pricing**: Dynamic pricing based on paper stocks and finishing
- **Large Format**: Square-footage pricing with substrate options
- **Sheet Optimization**: Automatic calculation of optimal sheet usage

### How to Update Pricing
1. Edit `/js/paperStocks.js` for paper costs
2. Edit `/js/pricingConfig.js` for formulas and constraints
3. Commit changes via git
4. Deploy automatically via Netlify

No database updates ever needed for pricing changes!

## 🏗️ Architecture Overview

### Streamlined Application Structure
```
├── /                           # Streamlined Pricing Calculator
│   ├── index.html             # Auto-redirects to universal configurator
│   ├── pages/
│   │   ├── universal-configurator.html  # Main pricing interface
│   │   ├── cart.html          # Cart management
│   │   ├── quotes.html        # Quote history
│   │   ├── signin.html        # Authentication
│   │   └── admin.html         # Admin functions
│   ├── js/                    # Core pricing engine
│   │   ├── calculator.js      # Pricing calculations
│   │   ├── universalConfigurator.js   # Main configurator orchestrator (354 lines)
│   │   ├── universalConfigurator/     # Modular architecture (17 files)
│   │   │   ├── ConfigurationManager.js  # State management
│   │   │   ├── UIManager.js             # DOM operations
│   │   │   ├── PricingManager.js        # Pricing coordination
│   │   │   ├── products/                # Product-specific handlers
│   │   │   │   ├── ProductHandler.js
│   │   │   │   ├── FlatPrintHandler.js
│   │   │   │   ├── FoldedPrintHandler.js
│   │   │   │   ├── BookletHandler.js
│   │   │   │   ├── PosterHandler.js
│   │   │   │   ├── StickerHandler.js
│   │   │   │   ├── PerfectBoundHandler.js
│   │   │   │   ├── NotebookHandler.js
│   │   │   │   ├── NotepadHandler.js
│   │   │   │   └── ProductHandlerFactory.js
│   │   │   └── utils/                   # Helper utilities
│   │   │       ├── FormDataBuilder.js
│   │   │       ├── ValidationHelper.js
│   │   │       └── EventBindingHelper.js
│   │   ├── pricingConfig.js   # Product constraints and formulas
│   │   └── paperStocks.js     # Material specifications
│   └── sw.js                  # Service worker v183
└── /inventory/                # Inventory Management System
    ├── js/                    # Inventory logic and data
    ├── sql/                   # Database schema
    └── sw.js                  # Service worker v1
```

### Key Features
- **Single Entry Point**: Direct access to universal configurator after login
- **No Marketing Content**: Staff-focused interface without promotional material
- **Simplified Navigation**: Essential functions only (Calculator, Cart, Quotes, Admin)
- **Efficient Workflow**: Minimal clicks to access pricing functionality
- **Modular Architecture**: Separation of concerns with ES6 modules for maintainability
- **Type-Safe Calculations**: Proper number handling in pricing display and calculations

## 🛡️ Browser Support

- **Chrome/Edge** (Recommended for best PWA experience)
- **Safari** on iOS/macOS
- **Firefox**
- Any modern browser with PWA and Service Worker support

## 📋 Recent Updates

### Sheet-Based Production Formula (2025-01-08)
- **Implemented** sheet-based production costs: production term now uses `S_total^e × k` instead of `Q^e × k`
- **Standardized** efficiency exponent to e=0.80 for all products (removed custom per-product exponents)
- **Unified** production rate to k=$1.50 for all products (aligned with per-sheet cost derivation)
- **S_total Calculation**: Accounts for actual sheets through press based on product complexity
- **Benefits**: Logically consistent with k=$1.50 per-sheet derivation, accurate scaling with actual press time

### Material Cost Markup Standardization (2025-10-09)
- **Implemented** differentiated markup strategy based on product complexity
- **Multi-sheet products**: 1.25x markup (booklets, notebooks, notepads, perfect bound books)
- **Simple/flat products**: 1.5x markup (postcards, name tags, flyers, bookmarks, brochures, table tents)
- **Rationale**: Prevents cost snowballing on high-page-count products while maintaining healthy margins
- **Impact**: Balanced pricing that accounts for taxes, shipping, and service charges

### Calculator Streamlining (2025-10-09)
- **Removed** 6 legacy calculator functions (776 lines, 40% code reduction)
- **Deleted Functions**: calculateBrochurePrice, calculatePostcardPrice, calculateTableTentPrice, calculateNameTagPrice, calculateFlyerPrice, calculateBookmarkPrice
- **Replacement**: All functionality now handled by Universal Configurator handlers
- **File Size**: calculator.js reduced from 1,952 to 1,176 lines
- **Benefits**: Cleaner codebase, reduced bundle size, easier maintenance

### New Product Handlers (2025-10-09)
- **Created** PerfectBoundHandler.js (4-500 pages with flexible page counts)
- **Created** NotebookHandler.js (plastic coil, wire-o, perfect binding options)
- **Created** NotepadHandler.js (glue-bound tear-away pads with backing cardboard)
- **Features**: Full multi-paper support, proper material cost calculations, comprehensive configuration options

### Modular Architecture Refactoring (2025-10-08)
- **Refactored** universalConfigurator.js from 2,262 lines to 354 lines (84% reduction)
- **Created** modular structure with separation of concerns
- **Maintained** backwards compatibility with existing calculator functions
- **Updated** to ES6 module system (type="module")

### Critical Bug Fix: Printing Sides Logic (2025-10-08)
- **Fixed** fundamental error where double-sided printing was incorrectly calculated as cheaper than single-sided
- **Correct Logic**: For flat products, imposition doesn't change with printing sides - only click charges change
- **Functions Fixed**: 8 calculator functions corrected
- **Preserved** correct logic for folded products where sidesMultiplier affects pages per sheet

## 📞 Support

For technical issues or feature requests, contact SFU Document Solutions IT support.

## 📄 License

Internal use only - SFU Document Solutions streamlined pricing calculator.