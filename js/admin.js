// Admin Panel JavaScript
// Handles administrative functions for the HP Indigo Calculator

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
      
      console.log('Admin dependencies check:', deps);
      return deps.authManager && deps.dbManager && deps.dataMigrator && deps.supabase;
    };

    if (!checkDependencies()) {
      console.log('Waiting for admin dependencies to load...');
      
      await new Promise(resolve => {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max
        
        const interval = setInterval(() => {
          attempts++;
          
          if (checkDependencies()) {
            console.log('All admin dependencies loaded successfully');
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

    console.log('Admin panel auth status:', {
      user: this.currentUser?.email,
      isAdmin: this.isAdmin,
      authManagerAvailable: !!window.authManager
    });
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
      
      console.log('Checking admin status for:', this.currentUser.email);
      const isAdmin = adminEmails.includes(this.currentUser.email);
      console.log('Admin status:', isAdmin);
      
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

    // Paper stocks management
    document.getElementById('loadPaperStocksBtn')?.addEventListener('click', () => this.loadPaperStocks());
    document.getElementById('refreshCacheBtn')?.addEventListener('click', () => this.refreshCache());

    // Pricing configuration
    document.getElementById('loadPricingConfigBtn')?.addEventListener('click', () => this.loadPricingConfig());
    document.getElementById('savePricingConfigBtn')?.addEventListener('click', () => this.savePricingConfig());

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
      console.log('Auth state change listener not available, will check periodically');
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

  // Paper Stocks Management
  async loadPaperStocks() {
    const table = document.getElementById('paperStocksTable');
    const tbody = document.getElementById('paperStocksBody');
    
    try {
      const paperStocks = await window.dbManager.getPaperStocks(false);
      
      if (!paperStocks) {
        alert('No paper stocks data available');
        return;
      }

      // Clear existing rows
      tbody.innerHTML = '';

      // Add rows
      Object.entries(paperStocks).forEach(([code, stock]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${code}</td>
          <td>${stock.displayName}</td>
          <td>${stock.type}</td>
          <td>${stock.weight}</td>
          <td>$${stock.costPerSheet.toFixed(5)}</td>
          <td>
            <button onclick="adminPanel.editPaperStock('${code}')" class="edit-btn">Edit</button>
          </td>
        `;
        tbody.appendChild(row);
      });

      table.style.display = 'block';
      
    } catch (error) {
      alert('Error loading paper stocks: ' + error.message);
    }
  }

  async refreshCache() {
    try {
      window.dbManager.clearCache();
      alert('✅ Cache cleared successfully');
    } catch (error) {
      alert('❌ Error clearing cache: ' + error.message);
    }
  }

  editPaperStock(code) {
    // Placeholder for paper stock editing
    alert(`Edit paper stock: ${code}\n(Feature coming soon)`);
  }

  // Pricing Configuration Management
  async loadPricingConfig() {
    const editor = document.getElementById('pricingConfigEditor');
    const textarea = document.getElementById('configTextarea');
    const saveBtn = document.getElementById('savePricingConfigBtn');
    
    try {
      const configs = await window.dbManager.getPricingConfigs(false);
      
      if (!configs) {
        alert('No pricing configuration data available');
        return;
      }

      textarea.value = JSON.stringify(configs, null, 2);
      editor.style.display = 'block';
      saveBtn.style.display = 'inline-block';
      
    } catch (error) {
      alert('Error loading pricing configuration: ' + error.message);
    }
  }

  async savePricingConfig() {
    const textarea = document.getElementById('configTextarea');
    
    try {
      const configData = JSON.parse(textarea.value);
      
      // Validate the structure
      const requiredKeys = ['formula', 'product_constraints', 'imposition_data', 'finishing_costs', 'rush_multipliers'];
      const missingKeys = requiredKeys.filter(key => !configData[key]);
      
      if (missingKeys.length > 0) {
        alert(`❌ Missing required configuration keys: ${missingKeys.join(', ')}`);
        return;
      }

      if (!confirm('Save pricing configuration changes?\n\nThis will affect all future calculations.')) {
        return;
      }

      // Save each configuration
      for (const [key, value] of Object.entries(configData)) {
        await window.dbManager.updatePricingConfig(key, value);
      }

      alert('✅ Pricing configuration saved successfully');
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        alert('❌ Invalid JSON format. Please check your syntax.');
      } else {
        alert('❌ Error saving configuration: ' + error.message);
      }
    }
  }

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

// Make available globally for button onclick handlers
window.adminPanel = adminPanel;