// Admin Panel JavaScript
// Handles administrative functions for SFU Document Solutions

class AdminPanel {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.isAdmin = false;
  }

  async init() {
    // Wait for dependencies
    await this.waitForDependencies();
    
    // Set up authentication
    await this.setupAuth();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI based on auth state
    this.updateUI();
    
    this.initialized = true;
  }

  async waitForDependencies() {
    // Wait for all required services
    const checkDependencies = () => {
      const deps = {
        authManager: !!window.authManager,
        dbManager: !!window.dbManager,
        dataMigrator: !!window.dataMigrator,
        supabase: window.isSupabaseConfigured ? window.isSupabaseConfigured() : true
      };
      
      return deps.authManager && deps.dbManager && deps.dataMigrator && deps.supabase;
    };

    if (!checkDependencies()) {
      
      await new Promise(resolve => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max
        
        const interval = setInterval(() => {
          attempts++;
          
          if (checkDependencies()) {
            clearInterval(interval);
            resolve();
          } else if (attempts >= maxAttempts) {
            console.warn('Timeout waiting for dependencies, proceeding anyway');
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    }
  }

  async setupAuth() {
    if (window.authManager) {
      // Wait for auth manager to initialize
      await window.authManager.init();
      this.currentUser = window.authManager.getUser();
      this.isAdmin = await this.checkAdminStatus();
    }

  }

  async checkAdminStatus() {
    // Check if current user has admin role
    if (!this.currentUser) {
      return false;
    }

    try {
      // In a real app, you'd check the user's role in the database
      // For now, we'll use email-based check with development bypass
      const adminEmails = [
        'admin@example.com',
        // Any signed-in user can access admin during development
        this.currentUser.email  // Allow current user as admin
      ];
      
      const isAdmin = adminEmails.includes(this.currentUser.email);
      
      return isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      // Default to true for development if there's an error
      return true;
    }
  }

  setupEventListeners() {
    // Migration buttons
    document.getElementById('runMigrationBtn')?.addEventListener('click', () => this.runMigration());
    document.getElementById('checkDataBtn')?.addEventListener('click', () => this.checkData());
    document.getElementById('resetDbBtn')?.addEventListener('click', () => this.resetDatabase());

    // Removed pricing management - now handled via static files

    // Auth state changes - check if function exists first
    if (window.authManager && typeof window.authManager.onAuthStateChange === 'function') {
      window.authManager.onAuthStateChange((user) => {
        this.currentUser = user;
        this.checkAdminStatus().then(isAdmin => {
          this.isAdmin = isAdmin;
          this.updateUI();
        });
      });
    } else {
      // Fallback: check auth state periodically
      setInterval(() => {
        const currentUser = window.authManager?.getUser();
        if (currentUser !== this.currentUser) {
          this.currentUser = currentUser;
          this.checkAdminStatus().then(isAdmin => {
            this.isAdmin = isAdmin;
            this.updateUI();
          });
        }
      }, 1000);
    }
  }

  updateUI() {
    const loadingState = document.getElementById('loadingState');
    const accessWarning = document.getElementById('accessWarning');
    const adminContent = document.getElementById('adminContent');

    if (!this.initialized) {
      loadingState.style.display = 'block';
      accessWarning.style.display = 'none';
      adminContent.style.display = 'none';
      return;
    }

    loadingState.style.display = 'none';

    if (!this.currentUser || !this.isAdmin) {
      accessWarning.style.display = 'block';
      adminContent.style.display = 'none';
    } else {
      accessWarning.style.display = 'none';
      adminContent.style.display = 'block';
      this.updateSystemInfo();
    }
  }

  // Migration Functions
  async runMigration() {
    const btn = document.getElementById('runMigrationBtn');
    const results = document.getElementById('migrationResults');
    const output = document.getElementById('migrationOutput');

    btn.disabled = true;
    btn.textContent = 'Running Migration...';
    
    results.style.display = 'block';
    output.textContent = 'Starting migration...\n';

    try {
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        output.textContent += args.join(' ') + '\n';
        originalLog.apply(console, args);
      };
      
      console.error = (...args) => {
        output.textContent += 'ERROR: ' + args.join(' ') + '\n';
        originalError.apply(console, args);
      };

      await window.dataMigrator.runMigration();
      
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      
      output.textContent += '\n✅ Migration completed successfully!';
      
    } catch (error) {
      output.textContent += '\n❌ Migration failed: ' + error.message;
      console.error('Migration failed:', error);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Run Migration';
    }
  }

  async checkData() {
    const output = document.getElementById('migrationOutput');
    const results = document.getElementById('migrationResults');
    
    results.style.display = 'block';
    output.textContent = 'Checking database data...\n';

    try {
      if (!window.dbManager?.isAvailable()) {
        output.textContent += '❌ Database not available\n';
        return;
      }

      const [paperStocks, pricingConfigs] = await Promise.all([
        window.dbManager.getPaperStocks(false), // force fresh data
        window.dbManager.getPricingConfigs(false)
      ]);

      output.textContent += `📄 Paper Stocks: ${paperStocks ? Object.keys(paperStocks).length : 0} items\n`;
      output.textContent += `⚙️ Pricing Configs: ${pricingConfigs ? Object.keys(pricingConfigs).length : 0} items\n`;
      
      if (paperStocks) {
        output.textContent += '\nPaper Stock Codes:\n';
        Object.keys(paperStocks).forEach(code => {
          output.textContent += `  - ${code}: ${paperStocks[code].displayName}\n`;
        });
      }

      if (pricingConfigs) {
        output.textContent += '\nPricing Config Keys:\n';
        Object.keys(pricingConfigs).forEach(key => {
          output.textContent += `  - ${key}\n`;
        });
      }

      output.textContent += '\n✅ Data check completed';
      
    } catch (error) {
      output.textContent += '\n❌ Error checking data: ' + error.message;
    }
  }

  async resetDatabase() {
    if (!confirm('⚠️ WARNING: This will delete ALL data in the database!\n\nThis includes:\n- All paper stocks\n- All pricing configurations\n- All quotes and cart data\n\nAre you absolutely sure?')) {
      return;
    }

    const btn = document.getElementById('resetDbBtn');
    btn.disabled = true;
    btn.textContent = 'Resetting...';

    try {
      await window.dataMigrator.resetDatabase();
      alert('✅ Database reset completed');
    } catch (error) {
      alert('❌ Database reset failed: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Reset Database';
    }
  }

  // Pricing management removed - now handled via static files only

  // System Information
  async updateSystemInfo() {
    const dbStatus = document.getElementById('dbStatus');
    const cacheStatus = document.getElementById('cacheStatus');
    
    if (dbStatus) {
      dbStatus.textContent = window.dbManager?.isAvailable() ? '✅ Connected' : '❌ Offline';
    }
    
    if (cacheStatus) {
      const hasCachedData = window.dbManager?.cache?.paperStocks || window.dbManager?.cache?.pricingConfigs;
      cacheStatus.textContent = hasCachedData ? '✅ Active' : '❌ Empty';
    }
  }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  adminPanel.init().catch(error => {
    console.error('Failed to initialize admin panel:', error);
  });
});

// Static File Generator Functions
class StaticFileGenerator {
  // Generate paperStocks.js content from database data
  static generatePaperStocksFile(paperStocksData) {
    let content = `const paperStocks = {\n`;
    
    // Sort by code for consistent output
    const sortedStocks = Object.keys(paperStocksData).sort();
    
    for (let i = 0; i < sortedStocks.length; i++) {
      const code = sortedStocks[i];
      const stock = paperStocksData[code];
      
      content += `  "${code}": {\n`;
      content += `    "brand": "${stock.brand}",\n`;
      content += `    "type": "${stock.type}",\n`;
      content += `    "finish": "${stock.finish}",\n`;
      content += `    "size": "${stock.size}",\n`;
      content += `    "weight": "${stock.weight}",\n`;
      content += `    "costPerSheet": ${stock.costPerSheet},\n`;
      content += `    "displayName": "${stock.displayName}"\n`;
      content += `  }${i < sortedStocks.length - 1 ? ',' : ''}\n`;
    }
    
    content += `};\n\n`;
    content += `// Export for use in other modules\n`;
    content += `if (typeof module !== 'undefined' && module.exports) {\n`;
    content += `  module.exports = paperStocks;\n`;
    content += `}`;
    
    return content;
  }

  // Generate pricingConfig.js content from database data
  static generatePricingConfigFile(pricingConfigData) {
    let content = `// Pricing Configuration for SFU Document Solutions\n`;
    content += `// All pricing rules, constraints, and multipliers\n\n`;
    content += `const pricingConfig = {\n`;
    
    // Formula section
    content += `  // Fixed formula values\n`;
    content += `  formula: {\n`;
    const formula = pricingConfigData.formula;
    Object.keys(formula).forEach(key => {
      const value = formula[key];
      const comment = this.getFormulaComment(key);
      content += `    ${key}: ${value},${comment ? ` // ${comment}` : ''}\n`;
    });
    content += `  },\n\n`;
    
    // Product constraints
    content += `  // Product-specific constraints\n`;
    content += `  productConstraints: {\n`;
    const constraints = pricingConfigData.product_constraints;
    Object.keys(constraints).forEach((product, index, array) => {
      content += `    ${product}: {\n`;
      content += `      minQuantity: ${constraints[product].minQuantity},\n`;
      content += `      maxQuantity: ${constraints[product].maxQuantity}\n`;
      content += `    }${index < array.length - 1 ? ',' : ''}\n`;
    });
    content += `  },\n\n`;
    
    // Imposition data
    content += `  // Imposition data - how many pieces per 13x19 sheet\n`;
    content += `  impositionData: {\n`;
    const impositionData = pricingConfigData.imposition_data;
    Object.keys(impositionData).forEach((product, index, array) => {
      content += `    ${product}: {\n`;
      Object.keys(impositionData[product]).forEach((size, sizeIndex, sizeArray) => {
        content += `      '${size}': ${impositionData[product][size]}${sizeIndex < sizeArray.length - 1 ? ',' : ''}\n`;
      });
      content += `    }${index < array.length - 1 ? ',' : ''}\n`;
    });
    content += `  },\n\n`;
    
    // Finishing costs and rush multipliers (add other sections as needed)
    if (pricingConfigData.finishing_costs) {
      content += `  // Finishing costs per unit\n`;
      content += `  finishingCosts: ${JSON.stringify(pricingConfigData.finishing_costs, null, 4).replace(/^/gm, '  ')},\n\n`;
    }
    
    if (pricingConfigData.rush_multipliers) {
      content += `  // Rush job multipliers\n`;
      content += `  rushMultipliers: ${JSON.stringify(pricingConfigData.rush_multipliers, null, 4).replace(/^/gm, '  ')}\n`;
    }
    
    content += `};\n\n`;
    content += `// Export for use in other modules\n`;
    content += `if (typeof module !== 'undefined' && module.exports) {\n`;
    content += `  module.exports = pricingConfig;\n`;
    content += `}`;
    
    return content;
  }

  // Helper function to get formula comments
  static getFormulaComment(key) {
    const comments = {
      'setupFee': '$30.00 (prepress and printing setup)',
      'finishingSetupFee': '$15.00 (finishing setup when required)',
      'baseProductionRate': '$1.50',
      'efficiencyExponent': '0.75',
      'clicksCost': 'Double-sided printing cost'
    };
    return comments[key] || '';
  }

  // Download file to user's computer
  static downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Add export functionality to admin panel
const staticExporter = {
  async exportStaticFiles() {
    try {
      document.getElementById('exportStatus').innerHTML = '<div class="alert alert-info">🔄 Exporting static files...</div>';
      
      // Use current static files as source (database tables removed)
      if (typeof paperStocks === 'undefined' || typeof pricingConfig === 'undefined') {
        throw new Error('Static pricing files not loaded');
      }
      
      // Generate static files from current static data
      const paperStocksContent = StaticFileGenerator.generatePaperStocksFile(paperStocks);
      const pricingConfigData = {
        formula: pricingConfig.formula,
        product_constraints: pricingConfig.productConstraints,
        imposition_data: pricingConfig.impositionData,
        finishing_costs: pricingConfig.finishingCosts,
        rush_multipliers: pricingConfig.rushMultipliers
      };
      const pricingConfigContent = StaticFileGenerator.generatePricingConfigFile(pricingConfigData);
      
      // Download files
      StaticFileGenerator.downloadFile('paperStocks.js', paperStocksContent);
      StaticFileGenerator.downloadFile('pricingConfig.js', pricingConfigContent);
      
      document.getElementById('exportStatus').innerHTML = `
        <div class="alert alert-success">
          ✅ Static files exported successfully!<br>
          <small>Files downloaded: paperStocks.js, pricingConfig.js<br>
          Replace the files in /js/ directory and deploy to update production pricing.</small>
        </div>
      `;
      
    } catch (error) {
      console.error('Export failed:', error);
      document.getElementById('exportStatus').innerHTML = `
        <div class="alert alert-danger">❌ Export failed: ${error.message}</div>
      `;
    }
  }
};

// Make available globally for button onclick handlers
window.adminPanel = adminPanel;
window.staticExporter = staticExporter;