# SFU Document Solutions Dual Application Suite

**Pricing Calculator + Inventory Management** - Two integrated Progressive Web Apps serving SFU Document Solutions with comprehensive digital printing pricing and complete inventory management.

## ✨ Features

- ⚡ **Static-First Pricing** - Lightning-fast calculations with zero database dependencies
- 🔐 **Secure Authentication** - Front-door login system with SFU branding
- ☁️ **Cloud Integration** - Supabase database for user data and quotes only
- 📱 **Progressive Web App** - Installable on tablets and phones (dual PWA support)
- 🔄 **Offline Support** - Works without internet after first visit
- 📋 **Quote Management** - Save, view, and manage customer quotes
- 🛒 **Cart System** - Batch multiple products with full edit functionality
- 📦 **Inventory Management** - Complete inventory system with request workflow
- 🎛️ **Universal Configurator** - Custom dimensions and real-time pricing for any product
- 🎨 **SFU Branding** - Official SFU red color scheme and typography

## 🌐 Live Applications

- **Pricing Calculator**: [https://docsol.ca](https://docsol.ca)
- **Inventory Management**: [https://docsol.ca/inventory/](https://docsol.ca/inventory/)

## 🧮 Available Calculators

### Small Format Products
- ✅ **Brochures** - Tri-fold and bi-fold options, 25-2500 units (e=0.75)
- ✅ **Postcards** - 4 standard sizes, 100-5000 units (e=0.70)
- ✅ **Flyers** - 4 standard sizes, 25-2500 units (e=0.70)
- ✅ **Bookmarks** - 3 sizes on premium cover stock, 100-2500 units (e=0.65)
- ✅ **Name Tags** - 3 sizes with optimized pricing, 50-5000 units (e=0.65)
- ✅ **Booklets** - 8-48 pages, saddle-stitched, 10-1000 units (e=0.75)
- ✅ **Notebooks** - Coil/wire-o/perfect binding, 50/100 pages, 10-500 units (e=0.80)
- ✅ **Notepads** - Tear-away pads, 25/50/75/100 sheets, 25-1000 units (e=0.65)
- ✅ **Table Tents** - Professional marketing displays
- ✅ **Small Format Hub** - Unified product selection and filtering

### Large Format Products
- ✅ **Posters** - Custom dimensions with dynamic constraints, 1-50 units
  - **Roll Media**: Bond Paper ($3/sqft), Paper ($6/sqft), Fabric ($9/sqft), PET Vinyl ($12/sqft), Scrim Vinyl ($10/sqft), Vinyl Adhesive ($12/sqft)
  - **Rigid Substrates**: Corrugated Plastic ($10/sqft), Foam Core ($12/sqft), Cardboard ($10/sqft), PVC Board ($14/sqft), Aluminum Composite ($16/sqft)
  - **Dynamic Constraints**: Material-based width limits (Bond: 54", PET Vinyl: 36", Rigid: 48"×96" fixed)

### Promotional Products
- ✅ **Magnets** - Linear interpolation pricing, 4 sizes, 25-1000 units
- ✅ **Stickers** - Various sizes with quantity-based pricing
- ✅ **Apparel** - T-shirts and hoodies with size/color options
- ✅ **Tote Bags** - Canvas bags with bulk pricing tiers

### Advanced Features
- ✅ **Universal Configurator** - Custom dimensions with real-time pricing calculations and dynamic material constraints
- ✅ **Cart Edit System** - Full item editing with field population and validation
- ✅ **Inventory Management** - Complete inventory system with admin workflow
- ✅ **DOM Caching System** - Performance optimization reducing DOM queries by ~80%
- ✅ **Consolidated Architecture** - Streamlined configurator system (7 files → 1) for easier maintenance

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

### Architecture
- **Static Inventory Data** - Complete structure in `/inventory/js/inventoryStructure.js`
- **Database Usage** - Only for requests and status tracking
- **Authentication** - Shared Supabase authentication with main app

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS Grid & Flexbox, Bootstrap 5.3.3
- **Backend**: Supabase (User Authentication, Quotes, Cart Sync, Inventory Requests)
- **Hosting**: Vercel with custom domain (docsol.ca)
- **PWA Features**: Dual Service Workers (v163 main, v1 inventory), Web App Manifests
- **Typography**: SFU custom fonts (November Condensed, Lava)
- **Authentication**: Front-door security with session management
- **Pricing**: Static files only - no database dependencies
- **Architecture**: Clean static-first system with modular components
- **Performance**: DOM caching system (~80% query reduction), consolidated configurators
- **Modularity**: Organized component structure in `/js/modules/` for maintainability

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
- **Main Application**: `v163` in `sw.js`
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

- **Front-door Security**: Single login protects both applications
- **Session Management**: Supports "remember me" functionality
- **Supabase Integration**: Cloud-based user authentication
- **Demo Mode**: Fallback authentication for development

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

### Automatic Deployment (Vercel)
```bash
# Make changes to either application
git add -A
git commit -m "Description of changes"
git push origin main
# Vercel automatically deploys both applications
```

### Manual Deployment Steps
1. **Push to GitHub**: All changes trigger automatic deployment
2. **Custom Domain**: Configured for docsol.ca with both applications
3. **Environment**: Production-ready with HTTPS and PWA support

## 📊 Pricing Engine (Static-First)

The calculator uses a sophisticated pricing formula with data from static files only:

```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
```

Where:
- **S** = Setup fee (varies: $30 standard, $15 name tags, $0-15 notepads)
- **F_setup** = Finishing setup fee ($15, if applicable)
- **Q** = Quantity
- **e** = Efficiency exponent by product:
  - 0.75: brochures, booklets
  - 0.70: postcards, flyers
  - 0.65: name tags, bookmarks, notepads
  - 0.80: notebooks
- **k** = Base production rate ($1.50)
- **v** = Variable cost per piece (paper + clicks)
- **f** = Finishing cost per piece
- **r** = Rush multiplier (1.0-2.0x)

### Special Pricing Features
- **Universal Configurator**: Custom dimensions with real-time imposition calculations
- **Notepad Optimization**: Aggressive bulk discounts with Q^0.65 scaling
- **Table Tent Materials**: 2.5x height calculation for fold requirements
- **Large Format**: Square-footage pricing ($6-9/sqft)

### How to Update Pricing
1. Edit `/js/paperStocks.js` for paper costs
2. Edit `/js/pricingConfig.js` for formulas and constraints
3. Commit changes via git
4. Deploy automatically via Vercel

No database updates ever needed for pricing changes!

## 🏗️ Architecture Overview

### Dual Application Structure
```
├── /                    # Main Pricing Calculator
│   ├── pages/           # 25+ product calculators
│   ├── js/              # Core pricing engine and components
│   │   ├── modules/     # Modular components (validation, pricing, cart, etc.)
│   │   ├── calculator.js        # Main pricing calculations
│   │   ├── configurator.js      # Consolidated configurator (7→1 files)
│   │   ├── domCache.js          # DOM caching for performance
│   │   └── universalConfigurator.js  # Universal product configurator
│   └── sw.js            # Service worker v163
└── /inventory/          # Inventory Management System
    ├── js/              # Inventory logic and data
    ├── sql/             # Database schema
    └── sw.js            # Service worker v1
```

### Key Components
- **Universal Configurator**: Advanced pricing tool with custom dimensions and dynamic material constraints
- **DOM Caching System**: Performance optimization with cached element access (~80% query reduction)
- **Consolidated Configurator**: Streamlined architecture combining 7 configurator files into 1
- **Modular Architecture**: Organized components in `/js/modules/` for validation, pricing, cart management
- **Cart Edit System**: Full item editing with field population and validation
- **Inventory System**: Static-first with database requests only
- **PWA Features**: Dual service workers with offline support

### Performance Optimizations
- **DOM Caching**: Intelligent element caching reduces redundant DOM queries by ~80%
- **Consolidated Code**: Merged configurator files from 4,947 lines across 7 files to 1,643 lines in 1 file
- **Lazy Loading**: Efficient resource loading for better performance
- **Service Worker**: Cache-first strategy with automatic updates (v163)

## 🛡️ Browser Support

- **Chrome/Edge** (Recommended for best PWA experience)
- **Safari** on iOS/macOS
- **Firefox** 
- Any modern browser with PWA and Service Worker support

## 📞 Support

For technical issues or feature requests, contact SFU Document Solutions IT support.

## 📄 License

Internal use only - SFU Document Solutions dual application suite.