// Cart Management System with Supabase Integration
class CartManager {
  constructor() {
    this.storageKey = 'sfu-cart';
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
  
  editItem(itemId) {
    // Find the item to edit
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      console.warn('Item not found:', itemId);
      return;
    }
    
    // Store the item data for the product page to retrieve
    sessionStorage.setItem('editingItem', JSON.stringify({
      id: itemId,
      productType: item.productType,
      configuration: item.configuration,
      pricing: item.pricing
    }));
    
    // Redirect to the appropriate product page with edit parameter
    const productPages = {
      'brochures': 'brochures.html',
      'postcards': 'postcards.html',
      'flyers': 'flyers.html',
      'bookmarks': 'bookmarks.html',
      'booklets': 'booklets.html',
      'notebooks': 'notebooks.html',
      'notepads': 'notepads.html',
      'name-tags': 'name-tags.html'
    };
    
    const productPage = productPages[item.productType];
    if (productPage) {
      window.location.href = `${productPage}?edit=${itemId}`;
    } else {
      console.warn('No product page found for:', item.productType);
    }
  }
  
  updateItem(itemId, updatedConfiguration, updatedPricing) {
    // Find the item to update
    const itemIndex = this.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      console.warn('Item not found for update:', itemId);
      return false;
    }
    
    // Update the item while preserving the original ID and timestamp
    this.items[itemIndex] = {
      ...this.items[itemIndex],
      configuration: updatedConfiguration,
      pricing: updatedPricing,
      timestamp: new Date().toISOString() // Update timestamp to show when it was last modified
    };
    
    // Save to storage and update UI
    this.saveToStorage();
    this.updateCartBadge();
    this.renderCartItems();
    
    // Clear the editing session data
    sessionStorage.removeItem('editingItem');
    
    console.log('Item updated successfully:', itemId);
    return true;
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
    
    // Also update order summary
    this.renderOrderSummary();
  }
  
  renderOrderSummary() {
    const summaryContainer = document.getElementById('orderSummaryItems');
    
    if (!summaryContainer) return; // Not on cart page
    
    if (this.items.length === 0) {
      summaryContainer.innerHTML = '<p class="text-muted text-center">No items in cart</p>';
      return;
    }
    
    // Group items by product type for summary
    const groupedItems = {};
    let grandTotal = 0;
    
    this.items.forEach(item => {
      const productType = item.productType || 'product';
      const displayName = this.getProductDisplayName(productType);
      const totalPrice = parseFloat(item.pricing.totalPrice || item.pricing.totalCost || 0);
      
      if (!groupedItems[displayName]) {
        groupedItems[displayName] = 0;
      }
      
      groupedItems[displayName] += totalPrice;
      grandTotal += totalPrice;
    });
    
    // Render summary items
    const summaryHTML = Object.entries(groupedItems).map(([productName, total]) => {
      return `
        <div class="summary-item">
          <span class="summary-product">${productName}</span>
          <span class="summary-price">$${total.toFixed(2)}</span>
        </div>
      `;
    }).join('');
    
    summaryContainer.innerHTML = summaryHTML;
    
    // Update total
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
      totalElement.textContent = `$${grandTotal.toFixed(2)}`;
    }
  }

  renderCartItem(item) {
    const config = item.configuration || {};
    const pricing = item.pricing || {};
    const productType = item.productType || 'product';
    
    // Get display name for product type (uppercase for header)
    const productDisplayName = this.getProductDisplayName(productType).toUpperCase();
    
    // Get price with fallback
    const totalPrice = pricing.totalPrice || pricing.totalCost || 0;
    const unitPrice = pricing.unitPrice || 0;
    
    // Get all configuration details for the collapsible section
    const configDetails = this.getAllConfigurationDetails(config, productType);
    
    // Generate unique ID for collapse functionality
    const collapseId = `config-${item.id}`;

    return `
      <div class="cart-item-config-card" data-item-id="${item.id}">
        <!-- Product Header -->
        <div class="config-header">
          <h3 class="config-title">${productDisplayName}</h3>
          <div class="config-actions">
            <button class="edit-item-btn" onclick="cartManager.editItem('${item.id}')" title="Edit Configuration">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25M20.71,7.04C21.1,6.65 21.1,6.02 20.71,5.63L18.37,3.29C17.98,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M17.81,9.94"/>
              </svg>
            </button>
            <button class="remove-item-btn" onclick="cartManager.removeItem('${item.id}')" title="Remove Item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Red Pricing Box -->
        <div class="pricing-display">
          <div class="pricing-left">
            <span class="pricing-label">Per unit:</span>
            <span class="unit-price">$${parseFloat(unitPrice).toFixed(2)}</span>
          </div>
          <div class="pricing-right">
            <span class="pricing-label">Total Price</span>
            <span class="total-price">$${parseFloat(totalPrice).toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Collapsible Configuration Section -->
        <div class="config-section">
          <button class="config-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}">
            <span>YOUR CONFIGURATION</span>
            <svg class="config-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7,10L12,15L17,10H7Z"/>
            </svg>
          </button>
          
          <div class="collapse show" id="${collapseId}">
            <div class="config-details">
              ${configDetails.map(detail => `
                <div class="config-row">
                  <span class="config-label">${detail.label}:</span>
                  <span class="config-value">${detail.value}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getItemSize(config, productType) {
    if (!config) return 'N/A';
    
    // Handle different size formats based on product type
    if (config.size) {
      return config.size.replace('×', ' × ');
    }
    
    // Handle specific product types with different size configurations
    switch (productType) {
      case 'booklets':
        return config.bookletSize || 'N/A';
      case 'notebooks':
        return config.notebookSize || 'N/A';
      case 'notepads':
        return config.notepadSize || 'N/A';
      default:
        return config.dimensions || config.paperSize || 'N/A';
    }
  }
  
  getTurnaroundTime(config) {
    if (!config) return 'Standard';
    
    const rushType = config.rushType || config.turnaround || 'standard';
    
    switch (rushType.toLowerCase()) {
      case 'rush':
      case 'rush (1-2 days)':
        return '1-2 Business Days';
      case 'standard':
      case 'standard (3-5 days)':
      default:
        return '3-5 Business Days';
    }
  }
  
  getProductDetails(config, productType) {
    const details = [];
    
    if (!config) return details;
    
    // Paper Stock Information
    if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
      details.push({
        label: 'Paper Stock',
        value: window.paperStocks[config.paperType].displayName
      });
    }
    
    // Product-specific details
    switch (productType) {
      case 'brochures':
        if (config.foldType && config.foldType !== 'none') {
          const foldDisplay = config.foldType.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Fold Type', value: foldDisplay });
        }
        break;
        
      case 'booklets':
        if (config.pages) {
          details.push({ label: 'Pages', value: config.pages });
        }
        if (config.coverPaper && window.paperStocks && window.paperStocks[config.coverPaper]) {
          details.push({ 
            label: 'Cover Paper', 
            value: window.paperStocks[config.coverPaper].displayName 
          });
        }
        if (config.interiorPaper && window.paperStocks && window.paperStocks[config.interiorPaper]) {
          details.push({ 
            label: 'Interior Paper', 
            value: window.paperStocks[config.interiorPaper].displayName 
          });
        }
        break;
        
      case 'notebooks':
        if (config.pages) {
          details.push({ label: 'Pages', value: config.pages });
        }
        if (config.bindingType) {
          const bindingDisplay = config.bindingType.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Binding', value: bindingDisplay });
        }
        if (config.coverPaper && window.paperStocks && window.paperStocks[config.coverPaper]) {
          details.push({ 
            label: 'Cover Paper', 
            value: window.paperStocks[config.coverPaper].displayName 
          });
        }
        if (config.interiorPaper && window.paperStocks && window.paperStocks[config.interiorPaper]) {
          details.push({ 
            label: 'Interior Paper', 
            value: window.paperStocks[config.interiorPaper].displayName 
          });
        }
        break;
        
      case 'notepads':
        if (config.sheets) {
          details.push({ label: 'Sheets per Pad', value: config.sheets });
        }
        if (config.contentType) {
          const contentDisplay = config.contentType.charAt(0).toUpperCase() + 
            config.contentType.slice(1);
          details.push({ label: 'Content Type', value: contentDisplay });
        }
        if (config.backingPaper && window.paperStocks && window.paperStocks[config.backingPaper]) {
          details.push({ 
            label: 'Backing Paper', 
            value: window.paperStocks[config.backingPaper].displayName 
          });
        }
        break;
        
      case 'postcards':
      case 'flyers':
        if (config.coating && config.coating !== 'none') {
          const coatingDisplay = config.coating.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Coating', value: coatingDisplay });
        }
        break;
        
      case 'bookmarks':
        // Bookmarks typically just have paper and size
        break;
        
      case 'name-tags':
        if (config.finishing && config.finishing !== 'none') {
          const finishingDisplay = config.finishing.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Finishing', value: finishingDisplay });
        }
        break;
    }
    
    // Rush/Turnaround details
    if (config.rushType && config.rushType !== 'standard') {
      details.push({ 
        label: 'Rush Order', 
        value: 'Yes (' + this.getTurnaroundTime(config) + ')' 
      });
    }
    
    return details;
  }
  
  getAllConfigurationDetails(config, productType) {
    const details = [];
    
    if (!config) return details;
    
    // Get basic information first
    const size = this.getItemSize(config, productType);
    const turnaroundTime = this.getTurnaroundTime(config);
    const quantity = config.quantity || 0;
    
    // Standard details that appear for all products
    if (size !== 'N/A') {
      details.push({ label: 'Size', value: size });
    }
    
    // Product-specific details in logical order
    switch (productType) {
      case 'booklets':
        if (config.pages) {
          details.push({ label: 'Pages', value: config.pages });
        }
        if (config.coverPaper && window.paperStocks && window.paperStocks[config.coverPaper]) {
          details.push({ 
            label: 'Cover Paper', 
            value: window.paperStocks[config.coverPaper].displayName 
          });
        }
        if (config.interiorPaper && window.paperStocks && window.paperStocks[config.interiorPaper]) {
          details.push({ 
            label: 'Text Paper', 
            value: window.paperStocks[config.interiorPaper].displayName 
          });
        }
        break;
        
      case 'notebooks':
        if (config.pages) {
          details.push({ label: 'Pages', value: config.pages });
        }
        if (config.bindingType) {
          const bindingDisplay = config.bindingType.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Binding', value: bindingDisplay });
        }
        if (config.coverPaper && window.paperStocks && window.paperStocks[config.coverPaper]) {
          details.push({ 
            label: 'Cover Paper', 
            value: window.paperStocks[config.coverPaper].displayName 
          });
        }
        if (config.interiorPaper && window.paperStocks && window.paperStocks[config.interiorPaper]) {
          details.push({ 
            label: 'Interior Paper', 
            value: window.paperStocks[config.interiorPaper].displayName 
          });
        }
        break;
        
      case 'notepads':
        if (config.sheets) {
          details.push({ label: 'Sheets per Pad', value: config.sheets });
        }
        if (config.contentType) {
          const contentDisplay = config.contentType.charAt(0).toUpperCase() + 
            config.contentType.slice(1);
          details.push({ label: 'Content Type', value: contentDisplay });
        }
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        if (config.backingPaper && window.paperStocks && window.paperStocks[config.backingPaper]) {
          details.push({ 
            label: 'Backing Paper', 
            value: window.paperStocks[config.backingPaper].displayName 
          });
        }
        break;
        
      case 'brochures':
        if (config.foldType && config.foldType !== 'none') {
          const foldDisplay = config.foldType.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Fold Type', value: foldDisplay });
        }
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        break;
        
      case 'postcards':
      case 'flyers':
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        if (config.coating && config.coating !== 'none') {
          const coatingDisplay = config.coating.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Coating', value: coatingDisplay });
        }
        break;
        
      case 'bookmarks':
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        break;
        
      case 'name-tags':
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        if (config.finishing && config.finishing !== 'none') {
          const finishingDisplay = config.finishing.replace('-', ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          details.push({ label: 'Finishing', value: finishingDisplay });
        }
        break;
        
      default:
        // Generic paper stock for other products
        if (config.paperType && window.paperStocks && window.paperStocks[config.paperType]) {
          details.push({ 
            label: 'Paper Stock', 
            value: window.paperStocks[config.paperType].displayName 
          });
        }
        break;
    }
    
    // Add turnaround and quantity at the end
    details.push({ label: 'Turnaround', value: turnaroundTime });
    details.push({ label: 'Quantity', value: `${quantity} pieces` });
    
    return details;
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
    let quoteText = 'SFU DOCUMENT SOLUTIONS QUOTE\n';
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
    a.download = `sfu-quote-${Date.now()}.txt`;
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