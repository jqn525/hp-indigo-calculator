# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SFU Document Solutions Pricing Calculator** - A Progressive Web App (PWA) for calculating pricing for HP Indigo digital press products. Built as a vanilla JavaScript application with no framework dependencies, designed for SFU Document Solutions staff using tablets and mobile devices.

**Live URL**: https://docsol.ca

### ⭐ **Latest Updates (2025-07-24)**
- **SFU BRANDING COMPLETE**: Full rebrand to SFU Document Solutions with official colors
- **LOGIN SYSTEM**: Front-door authentication with SFU red gradient login page
- **SELECTION CARDS**: Refined UI with light gray selected state and red accent badges
- **CLOUD INTEGRATION**: Supabase database with quote management and user authentication

### Previous Updates (2025-01-16)
- **NEW PRODUCT**: Bookmarks calculator (2x6, 2x7, 2x8) with 130# Cover Uncoated/Silk options
- **CART SYSTEM**: Complete cart functionality with localStorage, quote batching, and export  
- **MOBILE UX**: Apple Music-style navigation optimization for iPhone 14 Pro Max
- **BUTTON LAYOUT**: Professional 3-column button grid matching selection card design

### Current Products Available:

#### Small Format Products:
- **Brochures** (tri-fold, bi-fold) - 25-2500 units, e=0.75
- **Postcards** (4x6, 5x7, 5.5x8.5, 6x9) - 100-5000 units, e=0.70
- **Flyers** (5.5x8.5, 8.5x11, 8.5x14, 11x17) - 25-2500 units, e=0.70
- **Bookmarks** (2x6, 2x7, 2x8) - 100-2500 units, e=0.65

#### Promotional Products:
- **Magnets** (2x2, 3x3, 4x4, 5x5) - 25-1000 units, linear interpolation pricing
- **Stickers** (various sizes) - Quantity-based pricing
- **Apparel** (t-shirts, hoodies) - Size and color options
- **Tote Bags** (standard canvas) - Bulk pricing tiers

#### Coming Soon:
- **Large Format** (banners, posters) - Placeholder page

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
# Push to GitHub (triggers Vercel deployment)
git add -A
git commit -m "Your commit message"
git push origin main
```

**Live Site**: https://docsol.ca (Vercel hosting with custom domain)
**Staging**: Vercel preview deployments for pull requests

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
- **Color Scheme**: SFU Light Red (#CC0633), SFU Dark Red (#A6192E), consistent SFU branding

### Cache Busting
To force users to get updated files:
1. Change `CACHE_NAME` in `sw.js` (current version: `indigo-calc-v52`)
2. This triggers service worker update cycle and clears old cache
3. Always increment version when deploying CSS/JS changes

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

## Recent Session Summary (2025-07-23) - DATABASE MIGRATION COMPLETE! 🗄️

### MAJOR ACHIEVEMENT: Complete Database Migration System

Successfully migrated from static pricing data to dynamic database-driven pricing with full fallback support:

#### What's New:
- ✅ **Database Migration Script**: `js/migrate-data.js` populates Supabase with static data
- ✅ **Enhanced Database Manager**: `js/db.js` with caching and fallback support  
- ✅ **Updated Calculators**: All pricing functions now use database data
- ✅ **Admin Interface**: Complete admin panel at `/pages/admin.html`
- ✅ **Vercel Deployment**: Production-ready `vercel.json` configuration
- ✅ **Environment Variables**: Secure Supabase config for production

#### Database Migration Features:
1. **Automatic Data Migration**: 
   - Paper stocks → `paper_stocks` table
   - Pricing configs → `pricing_configs` table
   - Promo configs → `pricing_configs` table
   - Products → `products` table

2. **Smart Caching System**:
   - 5-minute cache duration for performance
   - Automatic fallback to static data if database unavailable
   - Manual cache refresh in admin panel

3. **Admin Panel** (`/pages/admin.html`):
   - Database migration controls
   - Paper stocks management interface
   - Pricing configuration editor
   - System status monitoring
   - Admin-only access control

4. **Vercel Deployment Ready**:
   - Environment variable support for Supabase
   - Static site optimization
   - Proper routing for SPA
   - Service worker compatibility

#### Updated Files:
- `js/calculator.js` - Async database integration ✅
- `js/promoCalculator.js` - Database pricing data ✅  
- `js/db.js` - Enhanced with caching ✅
- `js/migrate-data.js` - Migration automation ✅
- `js/admin.js` - Admin functionality ✅
- `js/supabase.js` - Environment variable support ✅
- `pages/admin.html` - Admin interface ✅
- `vercel.json` - Deployment configuration ✅
- `sw.js` - Updated to v35 with new files ✅

#### Benefits Achieved:
- **Easy Price Updates**: No code deployments needed for pricing changes
- **Better Performance**: Smart caching reduces database calls
- **Offline Support**: Automatic fallback to static data
- **Admin Control**: Web-based pricing management
- **Production Ready**: Vercel hosting with secure environment variables
- **Future-Proof**: Foundation for advanced features (A/B testing, analytics, etc.)

#### Migration Commands:
```bash
# Run migration (in browser console or admin panel)
await window.dataMigrator.runMigration()

# Check migrated data
await window.dataMigrator.checkData()

# Reset database (caution!)
await window.dataMigrator.resetDatabase()
```

#### Vercel Deployment:
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
4. Deploy automatically

---

## Previous Session Summary (2025-07-23)

### SUPABASE INTEGRATION COMPLETE! 🎉

Successfully integrated Supabase for cloud storage and user management:

#### What's Working:
- ✅ **User Authentication**: Sign in/sign up fully functional
- ✅ **Cloud Cart Storage**: Carts sync across devices automatically
- ✅ **Save Quotes**: Green "Save Quote" button in cart (always visible)
- ✅ **Quote History**: "My Quotes" page shows all saved quotes
- ✅ **Database Schema**: All tables created and configured
- ✅ **Offline Support**: App works without Supabase configured

#### Supabase Credentials (Already Configured):
- Project URL: `https://kmbwfonentsqnjraukid.supabase.co`
- Anon Key: Already set in `js/supabase.js`
- Email confirmation: Disabled for easy testing

#### Files Added/Modified:
- `js/supabase.js` - Supabase client configuration ✅
- `js/auth.js` - Authentication system ✅
- `js/db.js` - Database operations ✅
- `pages/signin.html` - Sign in/up page ✅
- `pages/quotes.html` - Quote history page ✅
- `sql/schema.sql` - Complete database schema ✅
- Updated cart.js for cloud sync ✅
- Service worker updated to v34 ✅

#### Current Features:
1. **Authentication Flow**:
   - Click "Sign In" (top right)
   - Create account or sign in
   - User menu shows email and "My Quotes"

2. **Cart with Cloud Sync**:
   - Add items to cart
   - Cart persists across sessions
   - Syncs when you log in on new device

3. **Quote Management**:
   - Green "Save Quote" button in cart
   - Prompts for customer details
   - Saves to Supabase database
   - View all quotes in "My Quotes"

---

## Next Session Plans:

### Session 2: Database Migration
1. Move paper stocks to Supabase
2. Move pricing configs to database
3. Create admin interface for price updates
4. Add caching for performance

### Session 3: Advanced Features
1. Quote sharing via unique URLs
2. Email notifications
3. Customer management
4. Analytics dashboard

### Session 4: Polish
1. Better error handling
2. Loading states
3. Offline queue for syncing
4. Performance optimization

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

---

## Recent Session Summary (2025-07-24)

### 🎨 **SFU BRANDING & UI REFINEMENTS COMPLETE**

This session focused on implementing the complete SFU Document Solutions brand identity and refining the user interface based on user feedback.

#### Major Accomplishments:

#### 1. **SFU Brand Colors Implementation**
- **Login Page Gradient**: Updated from blue/teal to official SFU red colors
  - Primary: SFU Light Red (#CC0633, PMS 199C)
  - Secondary: SFU Dark Red (#A6192E, PMS 187C)
- **Brand Documentation**: Added comprehensive color guide in CSS file header
- **Global Color System**: Updated all Bootstrap variables and custom CSS properties

#### 2. **Selection Card UI Refinement**
- **Default State**: White background with dark text (clean, readable)
- **Selected State**: Light gray background (#c7c8ca) with white text
- **Selected Border**: SFU Dark Red (#A6192E) for clear visual feedback
- **Recommended Badges**: SFU Light Red (#CC0633) with white text
- **Perfect Contrast**: All text remains highly readable in both states

#### 3. **Technical Updates**
- **Service Worker**: Updated cache versions through v52 for immediate deployment
- **CSS Organization**: Well-documented brand colors for future consistency
- **Deployment Pipeline**: All changes pushed to live site (docsol.ca)

#### Files Modified:
- `css/styles.css` - Complete brand color overhaul + selection card refinements
- `sw.js` - Cache version increments (v49 → v52)
- `CLAUDE.md` - Updated documentation

#### Current Status:
- ✅ **Login System**: Professional SFU-branded authentication
- ✅ **Brand Identity**: Complete SFU red color scheme implemented
- ✅ **UI Polish**: Refined selection cards with perfect contrast
- ✅ **Live Deployment**: All changes active on docsol.ca
- ✅ **Documentation**: Brand colors documented for future sessions

#### What Works Perfectly:
1. **Login Page**: Beautiful SFU red gradient with professional card design
2. **Selection Cards**: Clean white cards that turn light gray when selected
3. **Color Consistency**: SFU red used throughout for buttons, badges, accents
4. **Text Readability**: Perfect contrast in both selected/unselected states
5. **Brand Compliance**: Official SFU colors properly implemented

---

## Next Session Opportunities:

### 🚀 **Potential Enhancements**
1. **Extended SFU Branding**: Apply SFU colors to other UI elements (if needed)
2. **Mobile Optimization**: Further mobile-specific UI improvements
3. **New Product Types**: Add business cards, door hangers, etc.
4. **Advanced Features**: Quote templates, bulk pricing, customer management
5. **Analytics**: Usage tracking and reporting features

### 🔧 **Technical Improvements**
1. **Performance**: Optimize loading times and caching strategies
2. **Accessibility**: WCAG compliance improvements
3. **Error Handling**: Enhanced user feedback and error states
4. **Offline Mode**: Improved PWA functionality

### 📊 **Business Features**
1. **Admin Dashboard**: Price management and reporting tools
2. **Customer Portal**: Self-service quote history and reordering
3. **Integration**: Connect with existing SFU systems
4. **Reporting**: Usage analytics and financial reports

---

## Development Startup

### Startup Instructions
- Always start up the application using this method.