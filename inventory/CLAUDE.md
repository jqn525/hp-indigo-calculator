# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the inventory management system in this repository.

## Project Overview

**SFU Document Solutions Inventory Management System** - A Progressive Web App (PWA) for managing paper, supplies, and materials inventory. Built as a standalone application within the SFU Document Solutions ecosystem, designed for team members to request inventory items and administrators to manage those requests.

**Live URL**: https://docsol.ca/inventory/

## Architecture

### Static-First Design
- **Inventory Data**: Complete inventory structure stored in `/js/inventoryStructure.js`
- **Database Usage**: Only for requests and status tracking, not inventory items
- **Authentication**: Shared Supabase authentication with main pricing calculator
- **PWA Features**: Independent service worker and manifest for mobile installation

### Core Technologies
- **Vanilla JavaScript** - No build process or framework dependencies
- **Bootstrap 5.3.3** - UI framework with integrity verification
- **Service Worker** (`sw.js`) - Offline caching with emoji-free console logging
- **PWA Manifest** (`manifest.json`) - App installation configuration
- **Supabase** - Authentication and request tracking only

## Key Features

### User Capabilities
- **Request Items**: Submit inventory requests with quantity and notes
- **Search & Browse**: Full-text search and collapsible tree navigation
- **Request History**: View status of submitted requests
- **Professional UI**: Emoji-free design with text-based icons (REQ, FIND, RCV, LIST, INV)

### Admin Capabilities
- **Approve/Reject**: Process pending inventory requests
- **Fulfill Orders**: Mark approved requests as delivered
- **Admin Panel**: Complete management interface with statistics
- **Print Delivery Slips**: Generate printable delivery documentation

### User Roles
- **Team Members**: Can request items, view their own requests, search inventory
- **Admins**: Full access to approve/reject requests, admin panel, delivery management

## Development Commands

### Local Development
```bash
# From main project root
npx serve -p 8000 -s .

# Access inventory at: http://localhost:8000/inventory/
```

### Testing Authentication
- Uses shared Supabase authentication with main application
- Admin access controlled via `is_admin` flag in user profiles

## File Structure

```
/inventory/
├── index.html                 # Main dashboard with 2x2 action grid
├── request.html              # Request items with tree navigation
├── search.html               # Search and browse inventory
├── pending.html              # User's request history
├── receive.html              # Mark approved requests as fulfilled
├── admin.html                # Admin panel for request management
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker (emoji-free v2)
├── css/
│   └── styles.css            # SFU branding matching main app
├── js/
│   ├── app.js                # Core application logic
│   ├── inventoryStructure.js # Static inventory data (EDIT THIS)
│   ├── auth.js               # Shared authentication
│   ├── auth-guard.js         # Page-level auth protection
│   └── supabase.js           # Database configuration
├── icons/
│   ├── favicon.svg           # Emoji-free favicon (INV text)
│   ├── icon-192.svg          # PWA icon (INV text)
│   └── icon-512.svg          # Large PWA icon
└── sql/
    └── create-tables.sql     # Database schema
```

## Database Schema

### inventory_requests Table
```sql
CREATE TABLE inventory_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  items JSONB NOT NULL,           -- Array of requested items
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notes TEXT,                     -- User's request notes
  admin_notes TEXT,               -- Admin's processing notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);
```

### Item Structure in JSONB
```json
{
  "id": "COPY_8511_20_WHT",
  "name": "White 20lb Copy Paper",
  "sku": "COPY-8511-20-WHT",
  "quantity": 5,
  "unit": "ream",
  "location": "Paper Storage A",
  "category": "Paper Products > 8.5x11 Paper > Copy Paper",
  "notes": "For monthly reports"
}
```

## Working with Inventory Data

### Adding New Inventory Items
Edit `/js/inventoryStructure.js`:

1. **Follow Existing Structure**:
```javascript
export const inventoryStructure = {
  "Category Name": {
    icon: "TEXT_ICON",  // No emojis! Use text like "PAPER", "INK", "TONER"
    subcategories: {
      "Subcategory": {
        items: [
          {
            id: "UNIQUE_ID",
            name: "Item Name",
            sku: "SKU-CODE",
            unit: "unit_type",
            location: "Storage Location"
          }
        ]
      }
    }
  }
};
```

2. **Required Fields**:
   - `id`: Unique identifier (use underscores)
   - `name`: Display name for users
   - `sku`: Stock keeping unit code
   - `unit`: Unit of measurement (ream, box, cartridge, etc.)
   - `location`: Physical storage location

3. **Icon Guidelines**:
   - Use only text-based icons
   - Examples: "PAPER", "INK", "TONER", "BIND", "SHIP"
   - Never use emojis

### Search Functionality
- Searches across: name, SKU, category, location
- Case-insensitive
- Minimum 2 characters required
- Implemented in `searchInventoryItems()` function

## UI Guidelines

### Design Principles
- **No Emojis**: Use text-based icons throughout (REQ, FIND, RCV, LIST, INV)
- **SFU Branding**: Consistent red color scheme (#CC0633, #A6192E)
- **Professional Appearance**: Clean, business-appropriate interface
- **Mobile-First**: Responsive design optimized for tablets and phones

### Action Grid Icons
- **REQ**: Request Inventory
- **FIND**: Search Inventory  
- **RCV**: Receive Inventory
- **LIST**: Pending Requests
- **INV**: General inventory icon

### Bootstrap Integration
- Uses Bootstrap 5.3.3 with integrity verification
- Matches main application styling
- Custom CSS overrides in `/css/styles.css`

## Common Development Tasks

### 1. Adding New Inventory Category
1. Edit `/js/inventoryStructure.js`
2. Add new category with text-based icon
3. Include subcategories and items as needed
4. Test search functionality

### 2. Modifying Request Workflow
1. Update `/js/app.js` for core logic
2. Modify HTML templates for UI changes
3. Update database schema if needed in `/sql/create-tables.sql`

### 3. Adding Admin Features
1. Check user role in `auth-guard.js`
2. Add admin-only elements with `is_admin` checks
3. Implement in `admin.html` and `/js/app.js`

### 4. Updating Service Worker
1. Edit `/sw.js` (keep console logs emoji-free)
2. Increment `CACHE_NAME` version (currently v2)
3. Add new files to `urlsToCache` array

## Authentication Integration

### Shared with Main App
- Uses same Supabase configuration
- Authentication flows redirect through main app
- User profiles shared between applications

### Admin Access
- Controlled via `is_admin` boolean in user profiles
- Admin-only pages protected by auth guards
- Admin panel accessible only to admin users

## Deployment

### Cache Busting
When deploying changes:
1. Increment `CACHE_NAME` in `/sw.js`
2. Current version: `sfu-inventory-v2`
3. Update version for any CSS/JS changes

### Vercel Integration
- Deploys automatically with main application
- Available at `/inventory/` path
- Uses same domain and SSL certificate

## Best Practices

### Code Style
- Keep console logs professional and emoji-free
- Use descriptive variable names
- Follow existing patterns in the codebase
- Comment complex inventory data structures

### Testing
- Test all user roles (team member vs admin)
- Verify search functionality with new items
- Check mobile responsiveness
- Test offline functionality with service worker

### Performance
- Keep inventory data structure efficient
- Use static files for inventory (no database queries)
- Minimize service worker cache size
- Optimize Bootstrap loading

## Integration Points

### With Main Application
- Shared authentication system
- Consistent branding and fonts
- Same deployment pipeline
- Unified domain structure

### Database Separation
- Only requests stored in database
- Inventory items remain static
- Clean separation of concerns
- Minimal database maintenance

## Future Enhancements

### Potential Features
- Barcode scanning for inventory
- Automated reorder alerts
- Integration with supplier systems
- Advanced reporting and analytics
- Mobile app installation prompts

### Architecture Considerations
- Keep inventory data static for performance
- Consider IndexedDB for offline request storage
- Maintain compatibility with main app authentication
- Plan for potential API integrations