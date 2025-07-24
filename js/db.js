// Database Operations for HP Indigo Calculator
// Handles all Supabase database interactions

class DatabaseManager {
  constructor() {
    this.client = null;
    this.initialized = false;
    
    // Data caching
    this.cache = {
      paperStocks: null,
      pricingConfigs: null,
      products: null,
      lastFetch: {
        paperStocks: 0,
        pricingConfigs: 0,
        products: 0
      }
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

  // === CART OPERATIONS ===
  
  // Get or create cart for current user/session
  async getCart() {
    if (!this.isAvailable()) return null;
    
    const userId = window.authManager?.getUser()?.id;
    const sessionId = !userId ? window.authManager?.getSessionId() : null;
    
    let query = this.client.from('carts').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return null;
    }
    
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
    
    const userId = window.authManager?.getUser()?.id;
    const sessionId = !userId ? window.authManager?.getSessionId() : null;
    
    const cartData = {
      user_id: userId || null,
      session_id: sessionId || null,
      items: []
    };
    
    // Use upsert to handle existing carts gracefully
    const { data, error } = await this.client
      .from('carts')
      .upsert(cartData, { 
        onConflict: userId ? 'user_id' : 'session_id',
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

  // Migrate anonymous cart to user cart on login
  async migrateCart(sessionId, userId) {
    if (!this.isAvailable()) return false;
    
    try {
      // Get session cart
      const { data: sessionCart } = await this.client
        .from('carts')
        .select('*')
        .eq('session_id', sessionId)
        .single();
      
      if (!sessionCart || !sessionCart.items || sessionCart.items.length === 0) {
        return true; // Nothing to migrate
      }
      
      // Get or create user cart
      const { data: userCart } = await this.client
        .from('carts')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (userCart) {
        // Merge items
        const mergedItems = [...(userCart.items || []), ...sessionCart.items];
        
        // Update user cart
        await this.client
          .from('carts')
          .update({ items: mergedItems })
          .eq('id', userCart.id);
        
        // Delete session cart
        await this.client
          .from('carts')
          .delete()
          .eq('id', sessionCart.id);
      } else {
        // Convert session cart to user cart
        await this.client
          .from('carts')
          .update({ 
            user_id: userId,
            session_id: null 
          })
          .eq('id', sessionCart.id);
      }
      
      return true;
    } catch (error) {
      console.error('Error migrating cart:', error);
      return false;
    }
  }

  // === QUOTE OPERATIONS ===

  // Create new quote (no authentication required)
  async createQuote(quoteData) {
    if (!this.isAvailable()) return null;
    
    // Use session ID instead of user ID
    const sessionId = window.authManager?.getSessionId() || 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Calculate totals
    const items = quoteData.items || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const taxAmount = subtotal * (quoteData.tax_rate || 0);
    const total = subtotal + taxAmount;
    
    const quote = {
      user_id: null, // No user ID required
      session_id: sessionId, // Use session instead
      customer_name: quoteData.customer_name,
      customer_email: quoteData.customer_email || `session_${sessionId}`, // Fallback email
      customer_phone: quoteData.customer_phone,
      customer_company: quoteData.customer_company,
      notes: quoteData.notes,
      subtotal: subtotal,
      tax_rate: quoteData.tax_rate || 0,
      tax_amount: taxAmount,
      total: total,
      status: 'draft'
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

  // Get all quotes (no authentication or session filtering)
  async getUserQuotes(limit = 50, offset = 0) {
    if (!this.isAvailable()) return [];
    
    // Return all quotes - no filtering by user or session
    const { data, error } = await this.client
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
    
    console.log(`Loaded ${data?.length || 0} quotes from database`);
    return data || [];
  }

  // Get single quote with items (no authentication required)
  async getQuote(quoteId) {
    if (!this.isAvailable()) return null;
    
    // Get quote without user restriction
    const { data: quote, error: quoteError } = await this.client
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
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

  // Get pricing configurations with caching and fallback
  async getPricingConfigs(useCache = true) {
    // Check cache first
    if (useCache && this.isCacheValid('pricingConfigs') && this.cache.pricingConfigs) {
      return this.cache.pricingConfigs;
    }

    // Try database
    if (this.isAvailable()) {
      try {
        const { data, error } = await this.client
          .from('pricing_configs')
          .select('*')
          .eq('is_active', true);
        
        if (!error && data) {
          // Convert array to object keyed by config_key
          const configs = {};
          data.forEach(item => {
            configs[item.config_key] = item.config_value;
          });
          
          // Update cache
          this.cache.pricingConfigs = configs;
          this.cache.lastFetch.pricingConfigs = Date.now();
          
          return configs;
        }
      } catch (error) {
        console.error('Error fetching pricing configs:', error);
      }
    }
    
    // Fallback to static data
    console.log('Falling back to static pricing config');
    if (typeof pricingConfig !== 'undefined') {
      const fallbackConfig = {
        formula: pricingConfig.formula,
        product_constraints: pricingConfig.productConstraints,
        imposition_data: pricingConfig.impositionData,
        finishing_costs: pricingConfig.finishingCosts,
        rush_multipliers: pricingConfig.rushMultipliers
      };
      
      // Cache fallback data too
      this.cache.pricingConfigs = fallbackConfig;
      this.cache.lastFetch.pricingConfigs = Date.now();
      
      return fallbackConfig;
    }
    
    return null;
  }

  // Get paper stocks with caching and fallback
  async getPaperStocks(useCache = true) {
    // Check cache first
    if (useCache && this.isCacheValid('paperStocks') && this.cache.paperStocks) {
      return this.cache.paperStocks;
    }

    // Try database
    if (this.isAvailable()) {
      try {
        const { data, error } = await this.client
          .from('paper_stocks')
          .select('*')
          .eq('is_active', true)
          .order('display_name');
        
        if (!error && data) {
          // Convert array to object keyed by code
          const stocks = {};
          data.forEach(item => {
            stocks[item.code] = {
              brand: item.brand,
              type: item.type,
              finish: item.finish,
              size: item.size,
              weight: item.weight,
              costPerSheet: parseFloat(item.cost_per_sheet),
              displayName: item.display_name
            };
          });
          
          // Update cache
          this.cache.paperStocks = stocks;
          this.cache.lastFetch.paperStocks = Date.now();
          
          return stocks;
        }
      } catch (error) {
        console.error('Error fetching paper stocks:', error);
      }
    }
    
    // Fallback to static data
    console.log('Falling back to static paper stocks');
    if (typeof paperStocks !== 'undefined') {
      // Cache static data too
      this.cache.paperStocks = paperStocks;
      this.cache.lastFetch.paperStocks = Date.now();
      
      return paperStocks;
    }
    
    return null;
  }

  // Get products with caching
  async getProducts(useCache = true) {
    // Check cache first
    if (useCache && this.isCacheValid('products') && this.cache.products) {
      return this.cache.products;
    }

    // Try database
    if (this.isAvailable()) {
      try {
        const { data, error } = await this.client
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (!error && data) {
          // Update cache
          this.cache.products = data;
          this.cache.lastFetch.products = Date.now();
          
          return data;
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    
    // No fallback for products as they're mainly used for admin
    return [];
  }

  // === ADMIN OPERATIONS ===
  
  // Update paper stock
  async updatePaperStock(code, updates) {
    if (!this.isAvailable()) return false;
    
    try {
      const { error } = await this.client
        .from('paper_stocks')
        .update(updates)
        .eq('code', code);
      
      if (error) {
        console.error('Error updating paper stock:', error);
        return false;
      }
      
      // Clear cache to force refresh
      this.clearCache('paperStocks');
      return true;
      
    } catch (error) {
      console.error('Error updating paper stock:', error);
      return false;
    }
  }
  
  // Update pricing configuration
  async updatePricingConfig(configKey, configValue) {
    if (!this.isAvailable()) return false;
    
    try {
      const { error } = await this.client
        .from('pricing_configs')
        .upsert({
          config_key: configKey,
          config_value: configValue,
          updated_at: new Date().toISOString()
        }, { onConflict: 'config_key' });
      
      if (error) {
        console.error('Error updating pricing config:', error);
        return false;
      }
      
      // Clear cache to force refresh
      this.clearCache('pricingConfigs');
      return true;
      
    } catch (error) {
      console.error('Error updating pricing config:', error);
      return false;
    }
  }

  // Get combined pricing data (for calculators)
  async getPricingData() {
    try {
      const [paperStocks, pricingConfigs] = await Promise.all([
        this.getPaperStocks(),
        this.getPricingConfigs()
      ]);
      
      return {
        paperStocks,
        pricingConfigs,
        isFromDatabase: this.isAvailable()
      };
      
    } catch (error) {
      console.error('Error getting pricing data:', error);
      return {
        paperStocks: null,
        pricingConfigs: null,
        isFromDatabase: false
      };
    }
  }
}

// Initialize database manager
const dbManager = new DatabaseManager();
dbManager.init();

// Make globally available
window.dbManager = dbManager;