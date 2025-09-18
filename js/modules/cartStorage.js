/**
 * Cart Storage Module
 * Handles local storage operations and data persistence for cart items
 */

class CartStorage {
    constructor(storageKey = 'sfu-cart') {
        this.storageKey = storageKey;
    }

    validateAndCleanStorage() {
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

    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            const items = stored ? JSON.parse(stored) : [];

            // Validate loaded items
            return items.filter(item => this.validateItem(item));
        } catch (error) {
            console.warn('Failed to load cart from storage:', error);
            return [];
        }
    }

    save(items) {
        try {
            // Filter out invalid items before saving
            const validItems = items.filter(item => this.validateItem(item));
            localStorage.setItem(this.storageKey, JSON.stringify(validItems));
            return true;
        } catch (error) {
            console.error('Failed to save cart to storage:', error);
            return false;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear cart storage:', error);
            return false;
        }
    }

    validateItem(item) {
        if (!item || typeof item !== 'object') {
            return false;
        }

        // Required fields
        const requiredFields = ['id', 'productType', 'configuration', 'pricing'];
        for (const field of requiredFields) {
            if (!(field in item)) {
                console.warn(`Cart item missing required field: ${field}`);
                return false;
            }
        }

        // Validate configuration object
        if (!item.configuration || typeof item.configuration !== 'object') {
            console.warn('Cart item has invalid configuration');
            return false;
        }

        // Validate pricing object
        if (!item.pricing || typeof item.pricing !== 'object' ||
            typeof item.pricing.total !== 'number' || item.pricing.total <= 0) {
            console.warn('Cart item has invalid pricing');
            return false;
        }

        return true;
    }

    getStorageSize() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? new Blob([stored]).size : 0;
        } catch (error) {
            return 0;
        }
    }

    getItemCount() {
        const items = this.load();
        return items.length;
    }

    // Migration utilities
    migrateOldFormat(oldData) {
        if (!Array.isArray(oldData)) {
            return [];
        }

        return oldData.map(item => {
            // Convert old format to new format if needed
            const migrated = {
                id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                productType: item.productType || item.type || 'unknown',
                configuration: item.configuration || item.config || {},
                pricing: item.pricing || { total: 0, unitPrice: 0 },
                timestamp: item.timestamp || new Date().toISOString(),
                quantity: item.quantity || item.configuration?.quantity || 1
            };

            // Ensure pricing has required fields
            if (!migrated.pricing.total) {
                migrated.pricing.total = 0;
            }
            if (!migrated.pricing.unitPrice) {
                migrated.pricing.unitPrice = migrated.pricing.total / (migrated.quantity || 1);
            }

            return migrated;
        }).filter(item => this.validateItem(item));
    }

    backup() {
        const items = this.load();
        const backup = {
            items,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const backupKey = `${this.storageKey}-backup-${Date.now()}`;
        try {
            localStorage.setItem(backupKey, JSON.stringify(backup));
            return backupKey;
        } catch (error) {
            console.error('Failed to create cart backup:', error);
            return null;
        }
    }

    restore(backupKey) {
        try {
            const backup = localStorage.getItem(backupKey);
            if (!backup) {
                throw new Error('Backup not found');
            }

            const backupData = JSON.parse(backup);
            if (!backupData.items || !Array.isArray(backupData.items)) {
                throw new Error('Invalid backup format');
            }

            this.save(backupData.items);
            return true;
        } catch (error) {
            console.error('Failed to restore cart backup:', error);
            return false;
        }
    }

    // Storage quota management
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    getStorageQuota() {
        if (!navigator.storage || !navigator.storage.estimate) {
            return null;
        }

        return navigator.storage.estimate().then(estimate => ({
            used: estimate.usage,
            available: estimate.quota,
            percentage: estimate.quota ? (estimate.usage / estimate.quota * 100) : 0
        }));
    }

    cleanupOldBackups() {
        const keysToRemove = [];
        const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.storageKey}-backup-`)) {
                const timestamp = parseInt(key.split('-').pop());
                if (timestamp < cutoffTime) {
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn(`Failed to remove old backup: ${key}`, error);
            }
        });

        return keysToRemove.length;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartStorage;
}

// Global access
if (typeof window !== 'undefined') {
    window.CartStorage = CartStorage;
}