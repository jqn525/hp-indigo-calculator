# SFU Document Solutions Pricing Calculator

A Progressive Web App for calculating pricing for HP Indigo digital press products, designed for SFU Document Solutions staff using tablets and mobile devices.

## ✨ Features

- 🔐 **Secure Authentication** - Front-door login system with SFU branding
- ☁️ **Cloud Integration** - Supabase database for quotes and user management
- 📱 **Progressive Web App** - Installable on tablets and phones
- 🔄 **Offline Support** - Works without internet after first visit
- 📋 **Quote Management** - Save, view, and manage customer quotes
- 🛒 **Cart System** - Batch multiple products for combined quotes
- 🎨 **SFU Branding** - Official SFU red color scheme and typography

## 🧮 Available Calculators

- ✅ **Brochures** - Tri-fold and bi-fold options, 25-2500 units
- ✅ **Postcards** - 4 standard sizes, 100-5000 units  
- ✅ **Flyers** - 4 standard sizes, 25-2500 units
- ✅ **Bookmarks** - 3 sizes on premium cover stock, 100-2500 units
- ✅ **Promotional Products** - Magnets, stickers, apparel, tote bags
- 🚧 **Large Format** - Coming soon

## 🚀 Live Application

**Production URL**: [https://docsol.ca](https://docsol.ca)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, CSS Grid & Flexbox, Bootstrap 5
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Hosting**: Vercel with custom domain
- **PWA Features**: Service Worker, Web App Manifest
- **Typography**: SFU custom fonts (November Condensed, Lava)
- **Authentication**: Front-door security with session management

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
   
   # Using Node.js
   npx serve -p 8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🔧 Configuration

### Environment Variables
The application uses hardcoded Supabase credentials for simplicity. For production deployments, consider using environment variables.

### Service Worker
- Current cache version: `v52`
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

### Quote System
- **Save Quotes**: Customer information with detailed line items
- **Quote History**: View and manage all saved quotes
- **Export Functionality**: Generate formatted quote files
- **Reopen Carts**: Load saved quotes back into cart for modifications

### Cart Features
- **Multi-Product**: Add multiple configurations to single quote
- **Real-time Pricing**: Live price updates as options change
- **Persistent Storage**: Cart survives browser sessions

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

## 📊 Pricing Engine

The calculator uses a sophisticated pricing formula:
```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
```

Where:
- S = Setup fee ($30)
- F_setup = Finishing setup fee ($15, if applicable)
- Q = Quantity
- e = Efficiency exponent (varies by product)
- k = Base production rate ($1.50)
- v = Variable cost per piece (paper + clicks)
- f = Finishing cost per piece
- r = Rush multiplier (1.0-2.0x)

## 🛡️ Browser Support

- **Chrome/Edge** (Recommended for best PWA experience)
- **Safari** on iOS/macOS
- **Firefox** 
- Any modern browser with PWA and Service Worker support

## 📞 Support

For technical issues or feature requests, contact SFU Document Solutions IT support.

## 📄 License

Internal use only - SFU Document Solutions pricing calculator.