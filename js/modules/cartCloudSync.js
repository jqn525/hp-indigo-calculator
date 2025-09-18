/**
 * Cart Cloud Sync Module
 * Handles synchronization between local cart and cloud storage (Supabase)
 */

class CartCloudSync {
    constructor() {
        this.dbManager = null;
        this.isAvailable = false;
        this.syncInProgress = false;
        this.lastSyncTime = null;
        this.syncInterval = 5 * 60 * 1000; // 5 minutes
    }

    async initialize() {
        if (window.dbManager) {
            await window.dbManager.init();
            this.dbManager = window.dbManager;
            this.isAvailable = this.dbManager.isAvailable();
            this.lastSyncTime = this.getLastSyncTime();
        }
        return this.isAvailable;
    }

    async syncCartItems(localItems) {
        if (!this.isAvailable || this.syncInProgress) {
            return { success: false, message: 'Sync not available or in progress' };
        }

        this.syncInProgress = true;

        try {
            // Get current user
            const user = await this.dbManager.getCurrentUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            // Fetch cloud cart items
            const cloudItems = await this.fetchCloudItems(user.id);

            // Merge local and cloud items
            const mergedItems = this.mergeItems(localItems, cloudItems);

            // Save merged items to cloud
            await this.saveToCloud(user.id, mergedItems);

            // Update last sync time
            this.updateLastSyncTime();

            console.log(`Cart synced successfully. ${mergedItems.length} items in cart.`);

            return {
                success: true,
                items: mergedItems,
                message: 'Cart synchronized successfully'
            };

        } catch (error) {
            console.error('Cart sync failed:', error);
            return {
                success: false,
                message: error.message
            };
        } finally {
            this.syncInProgress = false;
        }
    }

    async fetchCloudItems(userId) {
        try {
            const result = await this.dbManager.getCartItems(userId);
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data || [];
        } catch (error) {
            console.warn('Failed to fetch cloud cart items:', error);
            return [];
        }
    }

    async saveToCloud(userId, items) {
        if (!this.isAvailable) {
            throw new Error('Cloud storage not available');
        }

        try {
            // Clear existing cart items for this user
            await this.dbManager.clearCart(userId);

            // Insert new items
            if (items.length > 0) {
                const result = await this.dbManager.saveCartItems(userId, items);
                if (result.error) {
                    throw new Error(result.error);
                }
            }

            return true;
        } catch (error) {
            console.error('Failed to save cart to cloud:', error);
            throw error;
        }
    }

    mergeItems(localItems, cloudItems) {
        const merged = new Map();

        // Add local items first
        localItems.forEach(item => {
            merged.set(item.id, {
                ...item,
                source: 'local'
            });
        });

        // Add or update with cloud items
        cloudItems.forEach(cloudItem => {
            const localItem = merged.get(cloudItem.id);

            if (!localItem) {
                // Cloud item not in local, add it
                merged.set(cloudItem.id, {
                    ...cloudItem,
                    source: 'cloud'
                });
            } else {
                // Item exists in both, use the most recent
                const cloudTime = new Date(cloudItem.timestamp || cloudItem.updated_at);
                const localTime = new Date(localItem.timestamp);

                if (cloudTime > localTime) {
                    merged.set(cloudItem.id, {
                        ...cloudItem,
                        source: 'cloud'
                    });
                }
                // If local is newer or same, keep local (already in map)
            }
        });

        // Convert back to array and clean up source field
        return Array.from(merged.values()).map(item => {
            const { source, ...cleanItem } = item;
            return cleanItem;
        });
    }

    async addItemToCloud(item) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const user = await this.dbManager.getCurrentUser();
            if (!user) {
                return false;
            }

            const result = await this.dbManager.addCartItem(user.id, item);
            return !result.error;
        } catch (error) {
            console.warn('Failed to add item to cloud:', error);
            return false;
        }
    }

    async updateItemInCloud(item) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const user = await this.dbManager.getCurrentUser();
            if (!user) {
                return false;
            }

            const result = await this.dbManager.updateCartItem(user.id, item);
            return !result.error;
        } catch (error) {
            console.warn('Failed to update item in cloud:', error);
            return false;
        }
    }

    async removeItemFromCloud(itemId) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const user = await this.dbManager.getCurrentUser();
            if (!user) {
                return false;
            }

            const result = await this.dbManager.removeCartItem(user.id, itemId);
            return !result.error;
        } catch (error) {
            console.warn('Failed to remove item from cloud:', error);
            return false;
        }
    }

    async clearCloudCart() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const user = await this.dbManager.getCurrentUser();
            if (!user) {
                return false;
            }

            const result = await this.dbManager.clearCart(user.id);
            return !result.error;
        } catch (error) {
            console.warn('Failed to clear cloud cart:', error);
            return false;
        }
    }

    // Sync timing utilities
    getLastSyncTime() {
        const stored = localStorage.getItem('cart-last-sync');
        return stored ? new Date(stored) : null;
    }

    updateLastSyncTime() {
        this.lastSyncTime = new Date();
        localStorage.setItem('cart-last-sync', this.lastSyncTime.toISOString());
    }

    shouldSync() {
        if (!this.lastSyncTime) {
            return true;
        }

        const timeSinceLastSync = Date.now() - this.lastSyncTime.getTime();
        return timeSinceLastSync > this.syncInterval;
    }

    // Conflict resolution
    resolveConflict(localItem, cloudItem) {
        // Simple timestamp-based resolution
        // In the future, could implement more sophisticated conflict resolution
        const localTime = new Date(localItem.timestamp);
        const cloudTime = new Date(cloudItem.timestamp || cloudItem.updated_at);

        return cloudTime > localTime ? cloudItem : localItem;
    }

    // Status and utilities
    getSyncStatus() {
        return {
            isAvailable: this.isAvailable,
            inProgress: this.syncInProgress,
            lastSyncTime: this.lastSyncTime,
            shouldSync: this.shouldSync()
        };
    }

    enableAutoSync(interval = this.syncInterval) {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
        }

        this.syncInterval = interval;
        this.autoSyncTimer = setInterval(() => {
            if (this.shouldSync() && !this.syncInProgress) {
                // This would need to be triggered by the CartManager
                window.dispatchEvent(new CustomEvent('cart:auto-sync-needed'));
            }
        }, 60000); // Check every minute
    }

    disableAutoSync() {
        if (this.autoSyncTimer) {
            clearInterval(this.autoSyncTimer);
            this.autoSyncTimer = null;
        }
    }

    // Network status handling
    handleNetworkChange() {
        if (navigator.onLine && this.shouldSync()) {
            // Trigger sync when coming back online
            window.dispatchEvent(new CustomEvent('cart:sync-on-reconnect'));
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartCloudSync;
}

// Global access
if (typeof window !== 'undefined') {
    window.CartCloudSync = CartCloudSync;
}