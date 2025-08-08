// Cart Management System with Supabase Integration
class CartManager {
  constructor() {
    this.storageKey = 'hp-indigo-cart';
    this.items = [];
    this.useCloud = false;
    this.initialized = false;
    
    // Check for corrupted data and clear if found
    this.validateAndCleanLocalStorage();
    
    this.init();
  }

  validateAndCleanLocalStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        
        // Check if data is an array and if any item has missing critical properties
        if (!Array.isArray(items)) {
          console.warn('Cart data is not an array, clearing corrupted data');
          localStorage.removeItem(this.storageKey);
          return;
        }
        
        const hasCorruptedData = items.some(item => 
          !item || 
          !item.productType || 
          !item.configuration || 
          !item.pricing
        );
        
        if (hasCorruptedData) {
          console.warn('Clearing corrupted cart data - found items with missing required properties');
          localStorage.removeItem(this.storageKey);
        }
      } catch (e) {
        console.warn('Failed to parse cart data, clearing corrupted data:', e);
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  async init() {
    // Load from localStorage first
    this.items = this.loadFromStorage();
    
    // Try to sync with cloud if available
    if (window.dbManager) {
      await window.dbManager.init();
      this.useCloud = window.dbManager.isAvailable();
      
      if (this.useCloud) {
        await this.syncWithCloud();
      }
    }
    
    this.initialized = true;
    this.updateCartBadge();
    this.renderCartItems();
    this.bindEvents();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load cart from storage:', error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      
      // Also save to cloud if available
      if (this.useCloud && window.dbManager) {
        this.saveToCloud();
      }
    } catch (error) {
      console.warn('Failed to save cart to storage:', error);
    }
  }

  // Sync with cloud storage
  async syncWithCloud() {
    if (!window.dbManager || !window.dbManager.isAvailable()) return;
    
    try {
      const cloudCart = await window.dbManager.getCart();
      if (cloudCart && cloudCart.items && cloudCart.items.length > 0) {
        // Merge cloud items with local items
        const localItemIds = new Set(this.items.map(item => item.id));
        const newItems = cloudCart.items.filter(item => !localItemIds.has(item.id));
        
        if (newItems.length > 0) {
          this.items = [...this.items, ...newItems];
          this.saveToStorage(); // Save merged cart locally
        }
      }
      
      // Save current state to cloud
      await this.saveToCloud();
    } catch (error) {
      console.warn('Failed to sync cart with cloud:', error);
    }
  }

  // Save cart to cloud
  async saveToCloud() {
    if (!window.dbManager || !window.dbManager.isAvailable()) return;
    
    try {
      await window.dbManager.updateCartItems(this.items);
    } catch (error) {
      console.warn('Failed to save cart to cloud:', error);
    }
  }

  // Migrate local cart to cloud (called on login)
  async migrateLocalCartToCloud() {
    if (!window.authManager || !window.authManager.isAuthenticated()) return;
    if (!window.dbManager || !window.dbManager.isAvailable()) return;
    
    try {
      const sessionId = window.authManager.getSessionId();
      const userId = window.authManager.getUser().id;
      
      // Migrate cart ownership in database
      await window.dbManager.migrateCart(sessionId, userId);
      
      // Re-sync with cloud
      await this.syncWithCloud();
    } catch (error) {
      console.warn('Failed to migrate cart to user account:', error);
    }
  }

  addItem(product) {
    
    // Generate unique ID for the cart item
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const cartItem = {
      id: id,
      productType: product.productType,
      timestamp: new Date().toISOString(),
      configuration: { ...product.configuration },
      pricing: { ...product.pricing }
    };

    this.items.push(cartItem);
    this.saveToStorage();
    this.updateCartBadge();
    
    // Show success message if we're not on the cart page
    if (!window.location.pathname.includes('cart.html')) {
      this.showSuccessMessage();
    }
    
    return id;
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveToStorage();
    this.updateCartBadge();
    this.renderCartItems();
  }

  clearCart() {
    this.items = [];
    this.saveToStorage();
    this.updateCartBadge();
    this.renderCartItems();
  }

  getItems() {
    return [...this.items];
  }

  // Load multiple items from a quote into the cart
  async loadQuoteItems(quoteItems) {
    if (!Array.isArray(quoteItems) || quoteItems.length === 0) {
      throw new Error('No items provided to load');
    }

    try {
      // Add each item to the cart
      for (const item of quoteItems) {
        // Validate item structure
        if (!item.productType || !item.configuration || !item.pricing) {
          console.warn('Skipping invalid item:', item);
          continue;
        }

        // Ensure the item has a unique ID
        const cartItem = {
          id: item.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
          productType: item.productType,
          timestamp: item.timestamp || new Date().toISOString(),
          configuration: { ...item.configuration },
          pricing: { ...item.pricing }
        };

        this.items.push(cartItem);
      }

      // Save to storage and update UI
      this.saveToStorage();
      this.updateCartBadge();
      this.renderCartItems();

      return true;

    } catch (error) {
      console.error('Error loading quote items into cart:', error);
      throw error;
    }
  }

  getItemCount() {
    return this.items.length;
  }

  getTotalCost() {
    return this.items.reduce((total, item) => {
      return total + parseFloat(item.pricing.totalPrice || item.pricing.totalCost || 0);
    }, 0);
  }

  updateCartBadge() {
    const badges = document.querySelectorAll('#cartBadge');
    const count = this.getItemCount();
    
    badges.forEach(badge => {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    });

    // Update cart page header if we're on the cart page
    const cartItemCount = document.getElementById('cartItemCount');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItemCount) {
      cartItemCount.textContent = count;
    }
    
    if (cartTotal) {
      cartTotal.textContent = `$${this.getTotalCost().toFixed(2)}`;
    }
  }

  renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');
    
    if (!cartItemsContainer) return; // Not on cart page
    
    if (this.items.length === 0) {
      cartItemsContainer.style.display = 'none';
      emptyCartDiv.style.display = 'block';
      return;
    }
    
    cartItemsContainer.style.display = 'block';
    emptyCartDiv.style.display = 'none';
    
    cartItemsContainer.innerHTML = this.items.map(item => this.renderCartItem(item)).join('');
  }

  renderCartItem(item) {
    const config = item.configuration || {};
    const pricing = item.pricing || {};
    const productType = item.productType || 'product';
    
    // Get display name for product type
    const productDisplayName = this.getProductDisplayName(productType);
    
    // Generate summary text
    const summary = this.generateItemSummary(config, productType);
    
    // Format timestamp
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleString();
    
    // Get price with fallback
    const totalPrice = pricing.totalPrice || pricing.totalCost || 0;
    const unitPrice = pricing.unitPrice || 0;
    
    // Check if this item was loaded from a quote
    const isFromQuote = pricing.originalQuoteNumber;
    const quoteIndicator = isFromQuote ? 
      `<div class="quote-source-badge">
        <span class="badge bg-info">From Quote ${pricing.originalQuoteNumber}</span>
      </div>` : '';

    return `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-header">
          <div class="cart-item-info">
            <h3>${productDisplayName}</h3>
            <div class="cart-item-summary">${summary}</div>
            <div class="cart-item-price">Total: $${parseFloat(totalPrice).toFixed(2)}</div>
            ${quoteIndicator}
          </div>
          <button class="remove-item-btn" onclick="cartManager.removeItem('${item.id}')">
            Remove
          </button>
        </div>
        
        <div class="cart-item-details">
          ${this.renderItemDetails(config, pricing, productType)}
        </div>
      </div>
    `;
  }

  generateItemSummary(config, productType) {
    const parts = [];
    
    // Add quantity with fallback
    if (config && config.quantity) {
      parts.push(`${config.quantity} units`);
    }
    
    // Handle booklet-specific fields
    if (productType === 'booklets') {
      // Add page count
      if (config.pages) {
        parts.push(`${config.pages} pages`);
      }
      
      // Add cover paper type
      if (config.coverPaperType && window.paperStocks && window.paperStocks[config.coverPaperType]) {
        parts.push(`Cover: ${window.paperStocks[config.coverPaperType].displayName}`);
      }
      
      // Add text paper type
      if (config.textPaperType && window.paperStocks && window.paperStocks[config.textPaperType]) {
        parts.push(`Text: ${window.paperStocks[config.textPaperType].displayName}`);
      }
    } else {
      // Standard products
      // Add size
      if (config && config.size) {
        parts.push(config.size);
      }
      
      // Add paper type (display name if available)
      if (config && config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
        parts.push(window.paperStocks[config.paperType].displayName);
      }
      
      // Add fold type for brochures
      if (config && config.foldType && config.foldType !== 'none') {
        const foldDisplay = config.foldType.charAt(0).toUpperCase() + config.foldType.slice(1);
        parts.push(foldDisplay);
      }
    }
    
    // Add rush if not standard
    if (config && config.rushType && config.rushType !== 'standard') {
      const rushDisplay = config.rushType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      parts.push(rushDisplay);
    }
    
    return parts.join(' • ');
  }

  renderItemDetails(config, pricing, productType) {
    const details = [];
    
    // Basic configuration details
    if (config && config.quantity) {
      details.push({ label: 'Quantity', value: config.quantity });
    }
    
    if (config && config.size) {
      details.push({ label: 'Size', value: config.size });
    }
    
    if (config && config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
      details.push({ label: 'Paper', value: window.paperStocks[config.paperType].displayName });
    }
    
    if (config && config.foldType && config.foldType !== 'none') {
      const foldDisplay = config.foldType.charAt(0).toUpperCase() + config.foldType.slice(1);
      details.push({ label: 'Fold Type', value: foldDisplay });
    }
    
    if (config && config.rushType && config.rushType !== 'standard') {
      const rushDisplay = config.rushType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      details.push({ label: 'Turnaround', value: rushDisplay });
    }
    
    // Pricing details with fallbacks
    const unitPrice = pricing.unitPrice || 0;
    const totalPrice = pricing.totalPrice || pricing.totalCost || 0;
    
    if (unitPrice > 0) {
      details.push({ label: 'Unit Price', value: `$${parseFloat(unitPrice).toFixed(2)}` });
    }
    
    details.push({ label: 'Total', value: `$${parseFloat(totalPrice).toFixed(2)}` });
    
    if (pricing && pricing.sheetsRequired) {
      details.push({ label: 'Sheets Required', value: pricing.sheetsRequired });
    }
    
    return details.map(detail => `
      <div class="detail-item">
        <div class="detail-label">${detail.label}</div>
        <div class="detail-value">${detail.value}</div>
      </div>
    `).join('');
  }

  getProductDisplayName(productType) {
    const names = {
      'brochures': 'Brochure',
      'postcards': 'Postcard',
      'name-tags': 'Name Tag',
      'flyers': 'Flyer',
      'bookmarks': 'Bookmark',
      'booklets': 'Booklet',
      'large-format': 'Large Format Print',
      'magnets': 'Custom Magnets',
      'stickers': 'Custom Stickers',
      'apparel': 'Custom Apparel',
      'tote-bags': 'Canvas Tote Bags'
    };
    return names[productType] || productType || 'Product';
  }

  bindEvents() {
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all items from your cart?')) {
          this.clearCart();
        }
      });
    }

    // Export quote button
    const exportQuoteBtn = document.getElementById('exportQuoteBtn');
    if (exportQuoteBtn) {
      exportQuoteBtn.addEventListener('click', () => {
        this.exportQuote();
      });
    }
  }

  showSuccessMessage() {
    // Create and show success message
    const message = document.createElement('div');
    message.className = 'success-message show';
    message.textContent = 'Item added to cart successfully!';
    
    // Find a good place to insert the message
    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) {
      resultsContainer.insertBefore(message, resultsContainer.firstChild);
    } else {
      document.querySelector('main').appendChild(message);
    }
    
    // Remove message after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  exportQuote() {
    if (this.items.length === 0) {
      alert('Your cart is empty. Add some items first.');
      return;
    }

    // Generate quote text
    let quoteText = 'HP INDIGO PRICING QUOTE\n';
    quoteText += '========================\n\n';
    quoteText += `Generated: ${new Date().toLocaleString()}\n`;
    quoteText += `Total Items: ${this.items.length}\n\n`;

    this.items.forEach((item, index) => {
      const totalPrice = item.pricing.totalPrice || item.pricing.totalCost || 0;
      const unitPrice = item.pricing.unitPrice || 0;
      
      quoteText += `${index + 1}. ${this.getProductDisplayName(item.productType)}\n`;
      quoteText += `   ${this.generateItemSummary(item.configuration, item.productType)}\n`;
      quoteText += `   Total: $${parseFloat(totalPrice).toFixed(2)}\n`;
      quoteText += `   Unit Price: $${parseFloat(unitPrice).toFixed(2)}\n\n`;
    });

    quoteText += `TOTAL QUOTE VALUE: $${this.getTotalCost().toFixed(2)}\n`;
    quoteText += '\n---\n';
    quoteText += 'This quote is for estimation purposes only.\n';
    quoteText += 'Final pricing may vary based on file specifications and production requirements.';

    // Create and download the text file
    const blob = new Blob([quoteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `hp-indigo-quote-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Method to add current form configuration to cart
  addCurrentConfiguration(productType, formData, pricing) {
    const configuration = {};
    
    // Extract configuration from form data
    for (let [key, value] of formData.entries()) {
      configuration[key] = value;
    }

    const product = {
      productType: productType,
      configuration: configuration,
      pricing: pricing
    };

    return this.addItem(product);
  }
}

// Initialize cart manager
const cartManager = new CartManager();

// Make it globally available
window.cartManager = cartManager;

// Global addToCart function for compatibility with promo calculator
window.addToCart = function(item) {
  // Convert promo calculator format to cart format
  const cartProduct = {
    productType: item.productType,
    configuration: {
      quantity: item.quantity,
      description: item.description,
      ...item.details
    },
    pricing: {
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }
  };
  
  cartManager.addItem(cartProduct);
};