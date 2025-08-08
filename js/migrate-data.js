// Database Migration Script (DEPRECATED)
// NOTE: Pricing tables (paper_stocks, pricing_configs, products) have been removed
// This file is kept for reference but pricing migration is no longer needed
// All pricing data now comes from static files only

class DataMigrator {
  constructor() {
    this.client = null;
    this.migrationStatus = {
      paperStocks: false,
      pricingConfigs: false,
      promoConfigs: false,
      products: false
    };
  }

  async init() {
    // Wait for Supabase to be ready
    if (!window.supabaseClient) {
      await new Promise(resolve => {
        if (window.isSupabaseConfigured && !window.isSupabaseConfigured()) {
          console.error('Supabase not configured - cannot run migration');
          return;
        }
        window.addEventListener('supabaseReady', resolve);
      });
    }
    
    this.client = window.supabaseClient;
    if (!this.client) {
      throw new Error('Supabase client not available');
    }
  }

  // Migrate paper stocks to database
  async migratePaperStocks() {
    
    try {
      // Convert paperStocks object to array format for database
      const stocksArray = Object.entries(paperStocks).map(([code, stock]) => ({
        code: code,
        brand: stock.brand,
        type: stock.type,
        finish: stock.finish,
        size: stock.size,
        weight: stock.weight,
        cost_per_sheet: stock.costPerSheet,
        display_name: stock.displayName,
        is_active: true
      }));

      // Check if data already exists
      const { data: existing } = await this.client
        .from('paper_stocks')
        .select('code')
        .limit(1);

      if (existing && existing.length > 0) {
        
        // Update existing records
        for (const stock of stocksArray) {
          const { error } = await this.client
            .from('paper_stocks')
            .upsert(stock, { onConflict: 'code' });
          
          if (error) {
            console.error(`Error updating paper stock ${stock.code}:`, error);
          }
        }
      } else {
        
        // Insert new records
        const { error } = await this.client
          .from('paper_stocks')
          .insert(stocksArray);

        if (error) {
          console.error('Error inserting paper stocks:', error);
          throw error;
        }
      }

      this.migrationStatus.paperStocks = true;
      
    } catch (error) {
      console.error('❌ Paper stocks migration failed:', error);
      throw error;
    }
  }

  // Migrate pricing configurations to database
  async migratePricingConfigs() {
    
    try {
      const configs = [
        {
          config_key: 'formula',
          config_value: pricingConfig.formula,
          description: 'Core pricing formula values (setup fees, rates, exponents)',
          is_active: true
        },
        {
          config_key: 'product_constraints',
          config_value: pricingConfig.productConstraints,
          description: 'Min/max quantity constraints for each product type',
          is_active: true
        },
        {
          config_key: 'imposition_data',
          config_value: pricingConfig.impositionData,
          description: 'Number of pieces per 13x19 sheet for each product/size',
          is_active: true
        },
        {
          config_key: 'finishing_costs',
          config_value: pricingConfig.finishingCosts,
          description: 'Per-unit costs for finishing operations (folding, cutting, etc.)',
          is_active: true
        },
        {
          config_key: 'rush_multipliers',
          config_value: pricingConfig.rushMultipliers,
          description: 'Rush order pricing multipliers and descriptions',
          is_active: true
        }
      ];

      // Upsert configurations
      for (const config of configs) {
        const { error } = await this.client
          .from('pricing_configs')
          .upsert(config, { onConflict: 'config_key' });
        
        if (error) {
          console.error(`Error upserting config ${config.config_key}:`, error);
        }
      }

      this.migrationStatus.pricingConfigs = true;
      
    } catch (error) {
      console.error('❌ Pricing configs migration failed:', error);
      throw error;
    }
  }

  // Migrate promotional product configurations to database
  async migratePromoConfigs() {
    
    try {
      const promoConfigs = [
        {
          config_key: 'promo_pricing',
          config_value: promoConfig.pricing,
          description: 'Base promotional product pricing structure (markups, setup fees, rush multipliers)',
          is_active: true
        },
        {
          config_key: 'promo_products',
          config_value: promoConfig.products,
          description: 'Promotional product specifications and pricing data',
          is_active: true
        }
      ];

      // Upsert promotional configurations
      for (const config of promoConfigs) {
        const { error } = await this.client
          .from('pricing_configs')
          .upsert(config, { onConflict: 'config_key' });
        
        if (error) {
          console.error(`Error upserting promo config ${config.config_key}:`, error);
        }
      }

      this.migrationStatus.promoConfigs = true;
      
    } catch (error) {
      console.error('❌ Promo configs migration failed:', error);
      throw error;
    }
  }

  // Ensure products table has all current products
  async verifyProducts() {
    
    try {
      const { data: existingProducts } = await this.client
        .from('products')
        .select('slug');

      const existingSlugs = new Set((existingProducts || []).map(p => p.slug));
      
      const requiredProducts = [
        {
          name: 'Brochures',
          slug: 'brochures',
          description: 'Tri-fold, bi-fold, and multi-page brochures',
          min_quantity: 25,
          max_quantity: 2500,
          efficiency_exponent: 0.75,
          imposition_data: { '8.5x11': 2, '8.5x14': 1, '11x17': 1 },
          is_active: true
        },
        {
          name: 'Postcards',
          slug: 'postcards',
          description: 'Standard and custom postcard sizes',
          min_quantity: 100,
          max_quantity: 5000,
          efficiency_exponent: 0.70,
          imposition_data: { '4x6': 8, '5x7': 4, '5.5x8.5': 4, '6x9': 2 },
          is_active: true
        },
        {
          name: 'Name Tags',
          slug: 'name-tags',
          description: 'Professional name tags for events and identification',
          min_quantity: 100,
          max_quantity: 5000,
          efficiency_exponent: 0.70,
          imposition_data: { '4x6': 8, '5x7': 4, '5.5x8.5': 4, '6x9': 2 },
          is_active: true
        },
        {
          name: 'Flyers',
          slug: 'flyers',
          description: 'Single and double-sided flyers',
          min_quantity: 25,
          max_quantity: 2500,
          efficiency_exponent: 0.70,
          imposition_data: { '5.5x8.5': 4, '8.5x11': 2, '8.5x14': 1, '11x17': 1 },
          is_active: true
        },
        {
          name: 'Bookmarks',
          slug: 'bookmarks',
          description: 'Professional bookmarks on premium cover stock',
          min_quantity: 100,
          max_quantity: 2500,
          efficiency_exponent: 0.65,
          imposition_data: { '2x6': 10, '2x7': 10, '2x8': 10 },
          is_active: true
        },
        {
          name: 'Booklets',
          slug: 'booklets',
          description: 'Saddle-stitched booklets from 8 to 48 pages',
          min_quantity: 10,
          max_quantity: 500,
          efficiency_exponent: 0.75,
          imposition_data: { '8.5x11': 4 },
          is_active: true
        }
      ];

      // Insert missing products
      const missingProducts = requiredProducts.filter(p => !existingSlugs.has(p.slug));
      
      if (missingProducts.length > 0) {
        const { error } = await this.client
          .from('products')
          .insert(missingProducts);

        if (error) {
          console.error('Error inserting missing products:', error);
          throw error;
        }
        
      } else {
      }

      this.migrationStatus.products = true;
      
    } catch (error) {
      console.error('❌ Products verification failed:', error);
      throw error;
    }
  }

  // Run complete migration
  async runMigration() {
    
    try {
      await this.init();
      
      // Check if user has admin permissions
      const user = window.authManager?.getUser();
      if (!user) {
        throw new Error('Must be logged in to run migration');
      }
      
      // Run all migrations
      await this.migratePaperStocks();
      await this.migratePricingConfigs(); 
      await this.migratePromoConfigs();
      await this.verifyProducts();
      
      
      return this.migrationStatus;
      
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  }

  // Reset migration (for testing)
  async resetDatabase() {
    
    if (!confirm('Are you sure you want to reset the database? This will delete ALL data!')) {
      return;
    }
    
    try {
      await this.init();
      
      // Delete all data from tables
      await this.client.from('quote_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.client.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.client.from('carts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.client.from('paper_stocks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.client.from('pricing_configs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }
}

// Make migrator globally available for console use
window.dataMigrator = new DataMigrator();

// Auto-run migration on page load if URL parameter is present
if (window.location.search.includes('migrate=true')) {
  window.addEventListener('load', async () => {
    try {
      await window.dataMigrator.runMigration();
    } catch (error) {
      console.error('Auto-migration failed:', error);
    }
  });
}

// Console helper functions
window.runMigration = () => window.dataMigrator.runMigration();
window.resetDatabase = () => window.dataMigrator.resetDatabase();