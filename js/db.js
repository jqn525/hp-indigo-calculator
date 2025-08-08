// Database Operations for HP Indigo Calculator
// Handles all Supabase database interactions

class DatabaseManager {
  constructor() {
    this.client = null;
    this.initialized = false;
    
    // Data caching (only for user data - pricing data comes from static files)
    this.cache = {
      lastFetch: {}
    };
    
    // Cache duration in milliseconds (5 minutes)
    this.cacheDuration = 5 * 60 * 1000;
  }

  async init() {
    // Wait for Supabase to be ready
    if (!window.supabaseClient) {
      await new Promise(resolve => {
        if (window.isSupabaseConfigured && !window.isSupabaseConfigured()) {
          resolve();
        } else {
          window.addEventListener('supabaseReady', resolve);
        }
      });
    }
    
    this.client = window.supabaseClient;
    this.initialized = !!this.client;
  }

  // Check if database is available
  isAvailable() {
    return this.initialized && this.client !== null;
  }

  // Get current authenticated user ID
  getCurrentUserId() {
    // Use the global auth guard to get user ID
    if (window.currentUser && window.currentUser.id) {
      return window.currentUser.id;
    }
    
    // Fallback: try to get from auth guard
    const user = window.authGuard?.getCurrentUser();
    return user ? user.id : null;
  }

  // === CART OPERATIONS ===
  
  // Get or create cart for current authenticated user
  async getCart() {
    if (!this.isAvailable()) return null;
    
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    let query = this.client.from('carts').select('*').eq('user_id', userId);
    
    const { data, error } = await query.single();
    
    if (error && error.code === 'PGRST116') {
      // Cart doesn't exist, create one
      return this.createCart();
    }
    
    if (error) {
      console.error('Error fetching cart:', error);
      // Try to create cart as fallback
      return this.createCart();
    }
    
    return data;
  }

  // Create or get existing cart
  async createCart() {
    if (!this.isAvailable()) return null;
    
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const cartData = {
      user_id: userId,
      items: []
    };
    
    // Use upsert to handle existing carts gracefully
    const { data, error } = await this.client
      .from('carts')
      .upsert(cartData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating/updating cart:', error);
      return null;
    }
    
    return data;
  }

  // Update cart items
  async updateCartItems(items) {
    if (!this.isAvailable()) return false;
    
    const cart = await this.getCart();
    if (!cart) return false;
    
    const { error } = await this.client
      .from('carts')
      .update({ items: items })
      .eq('id', cart.id);
    
    if (error) {
      console.error('Error updating cart:', error);
      return false;
    }
    
    return true;
  }

  // Cart migration is no longer needed with front-door authentication
  // Users will always be authenticated before accessing cart functionality

  // === QUOTE OPERATIONS ===

  // Create new quote (requires authentication)
  async createQuote(quoteData) {
    if (!this.isAvailable()) return null;
    
    // Get authenticated user ID
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Calculate totals
    const items = quoteData.items || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const taxAmount = subtotal * (quoteData.tax_rate || 0);
    const total = subtotal + taxAmount;
    
    // Set expiration date to 30 days from now
    const now = new Date();
    const validUntil = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days in milliseconds
    
    const quote = {
      user_id: userId,
      customer_name: quoteData.customer_name,
      customer_email: quoteData.customer_email,
      customer_phone: quoteData.customer_phone,
      department: quoteData.department, // SFU Department/Faculty
      assigned_by: quoteData.assigned_by, // Staff member
      notes: quoteData.notes,
      subtotal: subtotal,
      tax_rate: quoteData.tax_rate || 0,
      tax_amount: taxAmount,
      total: total,
      status: 'draft',
      valid_until: validUntil.toISOString()
    };
    
    // Insert quote
    const { data: quoteResult, error: quoteError } = await this.client
      .from('quotes')
      .insert(quote)
      .select()
      .single();
    
    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      throw quoteError;
    }
    
    // Insert quote items
    if (items.length > 0) {
      const quoteItems = items.map((item, index) => ({
        quote_id: quoteResult.id,
        product_type: item.product_type,
        configuration: item.configuration,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.notes,
        sort_order: index
      }));
      
      const { error: itemsError } = await this.client
        .from('quote_items')
        .insert(quoteItems);
      
      if (itemsError) {
        console.error('Error creating quote items:', itemsError);
        // Rollback quote creation
        await this.client.from('quotes').delete().eq('id', quoteResult.id);
        throw itemsError;
      }
    }
    
    return quoteResult;
  }

  // Get all quotes for authenticated user
  async getUserQuotes(limit = 50, offset = 0) {
    if (!this.isAvailable()) return [];
    
    // Get authenticated user ID
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Return quotes for this user only
    const { data, error } = await this.client
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
    
    console.log(`Loaded ${data?.length || 0} quotes from database`);
    return data || [];
  }

  // Delete quote and its items
  async deleteQuote(quoteId) {
    if (!this.isAvailable()) return false;
    
    try {
      // Delete quote items first (due to foreign key constraint)
      const { error: itemsError } = await this.client
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);
      
      if (itemsError) {
        console.error('Error deleting quote items:', itemsError);
        throw itemsError;
      }
      
      // Delete the quote
      const { error: quoteError } = await this.client
        .from('quotes')
        .delete()
        .eq('id', quoteId);
      
      if (quoteError) {
        console.error('Error deleting quote:', quoteError);
        throw quoteError;
      }
      
      console.log(`Quote ${quoteId} deleted successfully`);
      return true;
      
    } catch (error) {
      console.error('Failed to delete quote:', error);
      return false;
    }
  }

  // Get single quote with items (user verification)
  async getQuote(quoteId) {
    if (!this.isAvailable()) return null;
    
    // Get authenticated user ID
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Get quote with user verification
    const { data: quote, error: quoteError } = await this.client
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', userId)
      .single();
    
    if (quoteError) {
      console.error('Error fetching quote:', quoteError);
      return null;
    }
    
    // Get quote items
    const { data: items, error: itemsError } = await this.client
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)
      .order('sort_order');
    
    if (itemsError) {
      console.error('Error fetching quote items:', itemsError);
    }
    
    return {
      ...quote,
      items: items || []
    };
  }

  // === CACHING UTILITIES ===

  // Check if cached data is still valid
  isCacheValid(dataType) {
    const lastFetch = this.cache.lastFetch[dataType];
    return lastFetch && (Date.now() - lastFetch) < this.cacheDuration;
  }

  // Clear specific cache
  clearCache(dataType) {
    if (dataType) {
      this.cache[dataType] = null;
      this.cache.lastFetch[dataType] = 0;
    } else {
      // Clear all cache
      this.cache.paperStocks = null;
      this.cache.pricingConfigs = null;
      this.cache.products = null;
      this.cache.lastFetch = {
        paperStocks: 0,
        pricingConfigs: 0,
        products: 0
      };
    }
  }

  // === PRICING DATA OPERATIONS ===
  // Note: Pricing data now comes from static files only
  // Database tables for pricing have been removed for cleaner architecture

  // === QUOTE RECALCULATION ===

  // Recalculate a quote with current pricing
  async recalculateQuote(quoteId) {
    if (!this.isAvailable()) return null;
    
    try {
      // Get the original quote with all items
      const quote = await this.getQuote(quoteId);
      if (!quote || !quote.items || quote.items.length === 0) {
        throw new Error('Quote not found or has no items');
      }
      
      console.log('Recalculating quote:', quote.quote_number);
      
      // Ensure calculator functions are available
      if (!window.calculateBrochurePrice && !window.calculatePromoPrice) {
        throw new Error('Calculator functions not loaded. Please refresh the page.');
      }
      
      const recalculatedItems = [];
      let hasChanges = false;
      
      // Recalculate each item with current pricing
      for (const item of quote.items) {
        try {
          const originalPrice = parseFloat(item.total_price);
          const currentPricing = await this.recalculateItem(item);
          
          if (currentPricing) {
            const newPrice = parseFloat(currentPricing.totalPrice || currentPricing.totalCost || 0);
            
            recalculatedItems.push({
              ...item,
              current_unit_price: currentPricing.unitPrice,
              current_total_price: newPrice,
              price_changed: Math.abs(newPrice - originalPrice) > 0.01, // Account for floating point precision
              price_difference: newPrice - originalPrice,
              price_change_percent: originalPrice > 0 ? ((newPrice - originalPrice) / originalPrice) * 100 : 0
            });
            
            if (Math.abs(newPrice - originalPrice) > 0.01) {
              hasChanges = true;
            }
          } else {
            // Keep original pricing if recalculation fails
            recalculatedItems.push({
              ...item,
              current_unit_price: item.unit_price,
              current_total_price: item.total_price,
              price_changed: false,
              price_difference: 0,
              price_change_percent: 0,
              recalculation_error: 'Unable to recalculate - configuration may no longer be valid'
            });
          }
        } catch (error) {
          console.error('Error recalculating item:', error);
          // Keep original pricing if recalculation fails
          recalculatedItems.push({
            ...item,
            current_unit_price: item.unit_price,
            current_total_price: item.total_price,
            price_changed: false,
            price_difference: 0,
            price_change_percent: 0,
            recalculation_error: error.message
          });
        }
      }
      
      // Calculate new totals
      const currentSubtotal = recalculatedItems.reduce((sum, item) => sum + parseFloat(item.current_total_price), 0);
      const currentTaxAmount = currentSubtotal * (quote.tax_rate || 0);
      const currentTotal = currentSubtotal + currentTaxAmount;
      
      return {
        ...quote,
        items: recalculatedItems,
        original_subtotal: quote.subtotal,
        original_total: quote.total,
        current_subtotal: currentSubtotal,
        current_tax_amount: currentTaxAmount,
        current_total: currentTotal,
        has_price_changes: hasChanges,
        total_price_difference: currentTotal - parseFloat(quote.total),
        total_change_percent: parseFloat(quote.total) > 0 ? ((currentTotal - parseFloat(quote.total)) / parseFloat(quote.total)) * 100 : 0,
        recalculation_date: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error recalculating quote:', error);
      throw error;
    }
  }

  // Recalculate a single quote item
  async recalculateItem(item) {
    try {
      const config = item.configuration;
      if (!config) return null;
      
      // Create FormData object from stored configuration
      const formData = new FormData();
      
      // Standard fields that most calculators expect
      if (config.quantity) formData.append('quantity', config.quantity);
      if (config.size) formData.append('size', config.size);
      if (config.paperType) formData.append('paperType', config.paperType);
      if (config.foldType) formData.append('foldType', config.foldType || 'none');
      if (config.rushType) formData.append('rushType', config.rushType || 'standard');
      
      // Promotional product fields
      if (config.decorationType) formData.append('decorationType', config.decorationType);
      if (config.sizeBreakdown) formData.append('sizeBreakdown', JSON.stringify(config.sizeBreakdown));
      
      // Call appropriate calculator based on product type
      const productType = item.product_type.toLowerCase();
      
      if (productType.includes('brochure')) {
        return await window.calculateBrochurePrice(formData);
      } else if (productType.includes('postcard')) {
        return await window.calculatePostcardPrice(formData);
      } else if (productType.includes('flyer')) {
        return await window.calculateFlyerPrice(formData);
      } else if (productType.includes('bookmark')) {
        return await window.calculateBookmarkPrice(formData);
      } else if (productType.includes('magnet')) {
        return await window.calculateMagnetPrice(formData);
      } else if (productType.includes('sticker')) {
        return await window.calculateStickerPrice(formData);
      } else if (productType.includes('apparel') || productType.includes('shirt') || productType.includes('hoodie')) {
        return await window.calculateApparelPrice(formData);
      } else if (productType.includes('tote') || productType.includes('bag')) {
        return await window.calculateToteBagPrice(formData);
      } else {
        // Try generic promo calculator
        return await window.calculatePromoPrice(productType, formData);
      }
      
    } catch (error) {
      console.error('Error recalculating item:', item.product_type, error);
      return null;
    }
  }
}

// Initialize database manager
const dbManager = new DatabaseManager();
dbManager.init();

// Make globally available
window.dbManager = dbManager;