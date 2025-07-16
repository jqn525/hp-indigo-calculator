# HP Indigo Pricing Calculator PWA

A Progressive Web App for calculating pricing for HP Indigo digital press products, designed for internal print shop teams using tablets.

## Features

- ✅ **Progressive Web App** - Installable on tablets and phones
- ✅ **Offline Support** - Works without internet after first visit
- ✅ **Mobile-First Design** - Optimized for tablet use
- ✅ **Brochure Calculator** - Complete pricing for various brochure types
- 🚧 **Postcards** - Coming soon
- 🚧 **Flyers** - Coming soon

## Setup for GitHub Pages

1. Create a new GitHub repository
2. Push this code to the repository
3. Go to Settings → Pages
4. Set source to "Deploy from a branch"
5. Select "main" branch and "/ (root)" folder
6. Save and wait for deployment

Your PWA will be available at: `https://[username].github.io/[repository-name]/`

## Local Development

1. Serve the files using any local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   ```

2. Open http://localhost:8000 in your browser

## Icon Setup

Before deploying, create two PNG icons and place them in the `/icons` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## Brochure Calculator Features

- Multiple size options (Letter, Legal, Tabloid, Custom)
- Various fold types (Tri-fold, Bi-fold, Gate-fold, Z-fold)
- Paper weight selection (80gsm to 250gsm)
- Color mode options (Full color, B&W, mixed)
- Coating/finish options
- Automatic quantity discounts
- Real-time price calculation with breakdown

## Technology Stack

- Vanilla JavaScript (no framework dependencies)
- CSS Grid & Flexbox for responsive layout
- Service Worker for offline functionality
- Web App Manifest for installation

## Browser Support

- Chrome/Edge (Recommended)
- Safari on iOS
- Firefox
- Any modern browser with PWA support