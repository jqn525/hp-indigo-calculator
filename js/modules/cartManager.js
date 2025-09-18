/**
 * Cart Manager (Modular)
 * Coordinates cart storage, cloud sync, and UI components
 */

class CartManagerModular {
    constructor() {
        this.items = [];
        this.initialized = false;

        // Initialize modules
        this.storage = new CartStorage();
        this.cloudSync = new CartCloudSync();
        this.ui = null; // Will be initialized after DOM is ready

        // Event listeners
        this.eventListeners = new Map();

        this.init();
    }

    async init() {
        try {
            // Clean and validate storage
            this.storage.validateAndCleanStorage();

            // Load items from storage
            this.items = this.storage.load();

            // Initialize cloud sync
            const cloudAvailable = await this.cloudSync.initialize();

            // Sync with cloud if available
            if (cloudAvailable) {
                await this.syncWithCloud();
            }

            // Initialize UI when DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeUI());
            } else {
                this.initializeUI();
            }

            // Set up event listeners
            this.setupEventListeners();

            this.initialized = true;

            console.log(`Cart initialized with ${this.items.length} items`);

        } catch (error) {
            console.error('Cart initialization failed:', error);
            this.initialized = true; // Set to true anyway to allow basic functionality
        }
    }

    initializeUI() {
        this.ui = new CartUI(this);
        this.ui.updateCartBadge();
        this.ui.renderCartItems();
    }

    setupEventListeners() {
        // Auto-sync events
        window.addEventListener('cart:auto-sync-needed', () => {
            this.syncWithCloud();
        });

        window.addEventListener('cart:sync-on-reconnect', () => {
            this.syncWithCloud();
        });

        // Network status changes
        window.addEventListener('online', () => {
            this.cloudSync.handleNetworkChange();
        });

        // Before page unload, save to storage
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });

        // Visibility change - sync when tab becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.cloudSync.shouldSync()) {
                this.syncWithCloud();
            }
        });
    }

    // Core cart operations
    addItem(item) {
        if (!this.validateItem(item)) {
            console.error('Invalid item data:', item);
            return false;
        }

        // Generate ID if not provided
        if (!item.id) {
            item.id = this.generateItemId();
        }

        // Add timestamp
        item.timestamp = new Date().toISOString();

        // Check for duplicate
        const existingIndex = this.items.findIndex(existing => existing.id === item.id);
        if (existingIndex >= 0) {
            console.warn('Item with this ID already exists, updating instead');
            return this.updateItem(item);
        }

        this.items.push(item);
        this.saveToStorage();

        // Sync to cloud
        if (this.cloudSync.isAvailable) {
            this.cloudSync.addItemToCloud(item);
        }

        // Update UI
        if (this.ui) {
            this.ui.updateCartBadge();
            this.ui.renderCartItems();
        }

        this.dispatchEvent('itemAdded', { item });
        return true;
    }

    updateItem(updatedItem) {
        const index = this.items.findIndex(item => item.id === updatedItem.id);
        if (index === -1) {
            console.warn('Item not found for update:', updatedItem.id);
            return false;
        }

        // Update timestamp
        updatedItem.timestamp = new Date().toISOString();

        this.items[index] = updatedItem;
        this.saveToStorage();

        // Sync to cloud
        if (this.cloudSync.isAvailable) {
            this.cloudSync.updateItemInCloud(updatedItem);
        }

        // Update UI
        if (this.ui) {
            this.ui.updateCartBadge();
            this.ui.renderCartItems();
        }

        this.dispatchEvent('itemUpdated', { item: updatedItem });
        return true;
    }

    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index === -1) {
            console.warn('Item not found for removal:', itemId);
            return false;
        }

        const removedItem = this.items.splice(index, 1)[0];
        this.saveToStorage();

        // Sync to cloud
        if (this.cloudSync.isAvailable) {
            this.cloudSync.removeItemFromCloud(itemId);
        }

        // Update UI
        if (this.ui) {
            this.ui.updateCartBadge();
            this.ui.renderCartItems();
        }

        this.dispatchEvent('itemRemoved', { item: removedItem });
        return true;
    }

    clearCart() {
        const itemCount = this.items.length;
        this.items = [];
        this.saveToStorage();

        // Sync to cloud
        if (this.cloudSync.isAvailable) {
            this.cloudSync.clearCloudCart();
        }

        // Update UI
        if (this.ui) {
            this.ui.updateCartBadge();
            this.ui.renderCartItems();
        }

        this.dispatchEvent('cartCleared', { itemCount });
        return true;
    }

    // Getters
    getItems() {
        return [...this.items]; // Return a copy
    }

    getItem(itemId) {
        return this.items.find(item => item.id === itemId);
    }

    getItemCount() {
        return this.items.length;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.pricing?.total || 0), 0);
    }

    getItemsByProduct(productType) {
        return this.items.filter(item => item.productType === productType);
    }

    // Storage operations
    saveToStorage() {
        return this.storage.save(this.items);
    }

    // Cloud sync operations
    async syncWithCloud() {
        if (!this.cloudSync.isAvailable) {
            return { success: false, message: 'Cloud sync not available' };
        }

        try {
            if (this.ui) {
                this.ui.showLoading(true);
            }

            const result = await this.cloudSync.syncCartItems(this.items);

            if (result.success) {
                this.items = result.items;
                this.saveToStorage();

                if (this.ui) {
                    this.ui.updateCartBadge();
                    this.ui.renderCartItems();
                }

                this.dispatchEvent('syncCompleted', result);
            } else {
                this.dispatchEvent('syncFailed', result);
            }

            return result;

        } catch (error) {
            console.error('Sync error:', error);
            const result = { success: false, message: error.message };
            this.dispatchEvent('syncFailed', result);
            return result;

        } finally {
            if (this.ui) {
                this.ui.showLoading(false);
            }
        }
    }

    getSyncStatus() {
        return this.cloudSync.getSyncStatus();
    }

    // Validation
    validateItem(item) {
        return this.storage.validateItem(item);
    }

    // Utilities
    generateItemId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // Event system
    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }

    removeEventListener(eventType, callback) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    dispatchEvent(eventType, data = {}) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in cart event listener for ${eventType}:`, error);
                }
            });
        }

        // Also dispatch as DOM event for global listening
        window.dispatchEvent(new CustomEvent(`cart:${eventType}`, { detail: data }));
    }

    // Migration and maintenance
    migrateFromOldCart() {
        // Migrate from old cart system if data exists
        const oldData = localStorage.getItem('sfu-cart-old');
        if (oldData) {
            try {
                const oldItems = JSON.parse(oldData);
                const migratedItems = this.storage.migrateOldFormat(oldItems);

                migratedItems.forEach(item => this.addItem(item));

                // Remove old data
                localStorage.removeItem('sfu-cart-old');

                console.log(`Migrated ${migratedItems.length} items from old cart format`);
            } catch (error) {
                console.warn('Failed to migrate old cart data:', error);
            }
        }
    }

    // Admin/debug utilities
    exportCart() {
        return {
            items: this.items,
            total: this.getTotal(),
            itemCount: this.getItemCount(),
            exportDate: new Date().toISOString()
        };
    }

    importCart(cartData) {
        if (!cartData || !Array.isArray(cartData.items)) {
            throw new Error('Invalid cart data format');
        }

        this.clearCart();
        cartData.items.forEach(item => this.addItem(item));

        return this.getItemCount();
    }

    getStorageInfo() {
        return {
            storageSize: this.storage.getStorageSize(),
            itemCount: this.getItemCount(),
            syncStatus: this.getSyncStatus()
        };
    }
}

// Global instance and compatibility
if (typeof window !== 'undefined') {
    // Initialize global cart manager
    window.cartManager = new CartManagerModular();

    // Backward compatibility
    window.cart = window.cartManager;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManagerModular;
}