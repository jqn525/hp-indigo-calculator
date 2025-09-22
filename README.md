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

- **Frontend**: Vanilla JavaScript, CSS Grid & Flexbox, Bootstrap 5.3.3
- **Backend**: Supabase (User Authentication, Quotes, Cart Sync, Inventory Requests)
- **Hosting**: Vercel with custom domain (docsol.ca)
- **PWA Features**: Dual Service Workers (v164 main, v1 inventory), Web App Manifests
- **Typography**: SFU custom fonts (November Condensed, Lava)
- **Authentication**: Front-door security with session management
- **Pricing**: Static files only - no database dependencies
- **Architecture**: Streamlined single-page application for staff efficiency

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
- **Main Application**: `v164` in `sw.js`
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
- **Bulk Optimization**: Aggressive discounts with quantity scaling
- **Material-Specific Pricing**: Dynamic pricing based on paper stocks and finishing
- **Large Format**: Square-footage pricing with substrate options

### How to Update Pricing
1. Edit `/js/paperStocks.js` for paper costs
2. Edit `/js/pricingConfig.js` for formulas and constraints
3. Commit changes via git
4. Deploy automatically via Vercel

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
│   │   ├── universalConfigurator.js   # Main configurator logic
│   │   ├── pricingConfig.js   # Product constraints and formulas
│   │   └── paperStocks.js     # Material specifications
│   └── sw.js                  # Service worker v164
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

## 🛡️ Browser Support

- **Chrome/Edge** (Recommended for best PWA experience)
- **Safari** on iOS/macOS
- **Firefox**
- Any modern browser with PWA and Service Worker support

## 📞 Support

For technical issues or feature requests, contact SFU Document Solutions IT support.

## 📄 License

Internal use only - SFU Document Solutions streamlined pricing calculator.