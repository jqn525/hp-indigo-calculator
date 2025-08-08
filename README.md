# SFU Document Solutions Pricing Calculator

A Progressive Web App for calculating pricing for HP Indigo digital press products, designed for SFU Document Solutions staff using tablets and mobile devices.

## ✨ Features

- ⚡ **Static-First Pricing** - Lightning-fast calculations with zero database dependencies
- 🔐 **Secure Authentication** - Front-door login system with SFU branding
- ☁️ **Cloud Integration** - Supabase database for user data and quotes only
- 📱 **Progressive Web App** - Installable on tablets and phones
- 🔄 **Offline Support** - Works without internet after first visit
- 📋 **Quote Management** - Save, view, and manage customer quotes
- 🛒 **Cart System** - Batch multiple products for combined quotes
- 🎨 **SFU Branding** - Official SFU red color scheme and typography

## 🧮 Available Calculators

### Small Format Products
- ✅ **Brochures** - Tri-fold and bi-fold options, 25-2500 units
- ✅ **Postcards** - 4 standard sizes, 100-5000 units  
- ✅ **Flyers** - 4 standard sizes, 25-2500 units
- ✅ **Bookmarks** - 3 sizes on premium cover stock, 100-2500 units
- ✅ **Name Tags** - 3 sizes with optimized pricing, 50-5000 units
- ✅ **Small Format Hub** - Unified product selection and filtering

### Promotional Products
- ✅ **Magnets** - Linear interpolation pricing, 4 sizes, 25-1000 units
- ✅ **Stickers** - Various sizes with quantity-based pricing
- ✅ **Apparel** - T-shirts and hoodies with size/color options
- ✅ **Tote Bags** - Canvas bags with bulk pricing tiers

### Large Format
- 🚧 **Banners & Posters** - Coming soon

## 🚀 Live Application

**Production URL**: [https://docsol.ca](https://docsol.ca)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS Grid & Flexbox, Bootstrap 5
- **Backend**: Supabase (User Authentication, Quotes, Cart Sync)
- **Hosting**: Vercel with custom domain (docsol.ca)
- **PWA Features**: Service Worker (v115), Web App Manifest
- **Typography**: SFU custom fonts (November Condensed, Lava)
- **Authentication**: Front-door security with session management
- **Pricing**: Static files only - no database dependencies
- **Architecture**: Clean static-first system with modular components

## 💻 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jqn525/hp-indigo-calculator.git
   cd hp-indigo-calculator
   ```

2. **Start a local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (recommended for external drives)
   npx serve -p 8000 -s .
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🔧 Configuration

### Environment Variables
The application uses hardcoded Supabase credentials for simplicity. For production deployments, consider using environment variables.

### Service Worker
- Current cache version: `v115`
- Increment version in `sw.js` when deploying CSS/JS changes
- Implements cache-first strategy with network-first for CSS files

## 📱 Mobile Features

- **Responsive Design**: Optimized for tablets and mobile devices
- **Touch-Friendly**: Large buttons and intuitive navigation
- **Offline Mode**: Full functionality without internet connection
- **Installation**: Add to home screen as native app

## 🎨 Brand Guidelines

### SFU Colors
- **Primary Red**: #CC0633 (PMS 199C, RGB: 204, 6, 51)
- **Secondary Red**: #A6192E (PMS 187C, RGB: 166, 25, 46)

### Typography
- **Headers**: November Condensed (Heavy)
- **Body Text**: Lava (Regular)

## 🔐 Authentication System

- **Front-door Security**: Single login protects entire application
- **Session Management**: Supports "remember me" functionality
- **Supabase Integration**: Cloud-based user authentication
- **Demo Mode**: Fallback authentication for development

## 💾 Data Management

### Database Usage (Supabase)
- **User Accounts**: Authentication and profiles
- **Quote System**: Save quotes with customer information
- **Cart Sync**: Cross-device cart synchronization
- **Quote History**: View and manage all saved quotes

### Pricing Data (Static Files)
- **Paper Costs**: `/js/paperStocks.js` - All paper specifications and pricing
- **Product Config**: `/js/pricingConfig.js` - Constraints, formulas, imposition data
- **Version Controlled**: All pricing changes tracked in git
- **Zero Maintenance**: No database updates needed for pricing changes

## 🚀 Deployment

### Vercel Deployment
1. **Push to GitHub**: All changes trigger automatic deployment
2. **Custom Domain**: Configured for docsol.ca
3. **Environment**: Production-ready with HTTPS

### Manual Deployment Steps
```bash
# Make changes
git add -A
git commit -m "Description of changes"
git push origin main
# Vercel automatically deploys
```

## 📊 Pricing Engine (Static-First)

The calculator uses a sophisticated pricing formula with data from static files only:
```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
```

Where:
- S = Setup fee (varies: $30 standard, $15 name tags)
- F_setup = Finishing setup fee ($15, if applicable)
- Q = Quantity
- e = Efficiency exponent (0.75 brochures, 0.70 postcards/flyers, 0.65 name tags/bookmarks)
- k = Base production rate ($1.50)
- v = Variable cost per piece (paper + clicks)
- f = Finishing cost per piece
- r = Rush multiplier (1.0-2.0x)

### How to Update Pricing
1. Edit `/js/paperStocks.js` for paper costs
2. Edit `/js/pricingConfig.js` for formulas and constraints
3. Commit changes via git
4. Deploy automatically via Vercel

No database updates ever needed for pricing changes!

## 🛡️ Browser Support

- **Chrome/Edge** (Recommended for best PWA experience)
- **Safari** on iOS/macOS
- **Firefox** 
- Any modern browser with PWA and Service Worker support

## 📞 Support

For technical issues or feature requests, contact SFU Document Solutions IT support.

## 📄 License

Internal use only - SFU Document Solutions pricing calculator.