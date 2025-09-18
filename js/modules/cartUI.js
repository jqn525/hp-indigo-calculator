/**
 * Cart UI Module
 * Handles cart interface rendering, interactions, and user feedback
 */

class CartUI {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.elements = {};
        this.templates = {};
        this.bindEvents();
    }

    bindEvents() {
        // Bind global cart events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.remove-item-btn, .remove-item-btn *')) {
                const btn = e.target.closest('.remove-item-btn');
                if (btn) {
                    e.preventDefault();
                    this.handleRemoveItem(btn.dataset.itemId);
                }
            }

            if (e.target.matches('.edit-item-btn, .edit-item-btn *')) {
                const btn = e.target.closest('.edit-item-btn');
                if (btn) {
                    e.preventDefault();
                    this.handleEditItem(btn.dataset.itemId);
                }
            }

            if (e.target.matches('.quantity-change, .quantity-change *')) {
                const btn = e.target.closest('.quantity-change');
                if (btn) {
                    e.preventDefault();
                    this.handleQuantityChange(btn.dataset.itemId, btn.dataset.action);
                }
            }
        });

        // Clear cart button
        const clearBtn = document.getElementById('clearCartBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.handleClearCart());
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }

    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-badge, #cartBadge');
        const itemCount = this.cartManager.getItemCount();

        badges.forEach(badge => {
            if (itemCount > 0) {
                badge.textContent = itemCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    renderCartItems() {
        const container = document.getElementById('cartItemsContainer');
        if (!container) return;

        const items = this.cartManager.getItems();

        if (items.length === 0) {
            this.renderEmptyCart(container);
            return;
        }

        const itemsHTML = items.map(item => this.renderCartItem(item)).join('');
        const totalHTML = this.renderCartTotal();

        container.innerHTML = `
            <div class="cart-items">
                ${itemsHTML}
            </div>
            ${totalHTML}
            <div class="cart-actions">
                <button id="clearCartBtn" class="btn btn-outline-secondary">Clear Cart</button>
                <button id="checkoutBtn" class="btn btn-primary">Proceed to Checkout</button>
            </div>
        `;

        // Re-bind events for new elements
        this.bindCartActions();
    }

    renderCartItem(item) {
        const formattedPrice = this.formatPrice(item.pricing.total);
        const formattedUnitPrice = this.formatPrice(item.pricing.unitPrice);
        const configSummary = this.formatConfigurationSummary(item);

        return `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-header">
                    <div class="cart-item-product">
                        <h5>${this.formatProductName(item.productType)}</h5>
                        <div class="cart-item-config">
                            ${configSummary}
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <div class="item-total">${formattedPrice}</div>
                        <div class="item-unit-price">${formattedUnitPrice} each</div>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="btn btn-sm btn-outline-secondary quantity-change"
                                data-item-id="${item.id}" data-action="decrease">−</button>
                        <span class="quantity-display">${item.configuration.quantity || 1}</span>
                        <button class="btn btn-sm btn-outline-secondary quantity-change"
                                data-item-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <div class="item-controls">
                        <button class="btn btn-sm btn-outline-primary edit-item-btn"
                                data-item-id="${item.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger remove-item-btn"
                                data-item-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyCart(container) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7,18C8.1,18 9,18.9 9,20S8.1,22 7,22 5,21.1 5,20 5.9,18 7,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M17,18C18.1,18 19,18.9 19,20S18.1,22 17,22 15,21.1 15,20 15.9,18 17,18Z"/>
                    </svg>
                </div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started</p>
                <a href="../index.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
    }

    renderCartTotal() {
        const total = this.cartManager.getTotal();
        const itemCount = this.cartManager.getItemCount();

        return `
            <div class="cart-total">
                <div class="total-row">
                    <span class="total-label">Items (${itemCount}):</span>
                    <span class="total-value">${this.formatPrice(total)}</span>
                </div>
                <div class="total-row subtotal">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">${this.formatPrice(total)}</span>
                </div>
                <div class="total-note">
                    <small>Final pricing will be confirmed before production</small>
                </div>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0);
    }

    formatProductName(productType) {
        const names = {
            'brochures': 'Brochures',
            'postcards': 'Postcards',
            'flyers': 'Flyers',
            'booklets': 'Booklets',
            'posters': 'Posters',
            'stickers': 'Custom Stickers',
            'magnets': 'Custom Magnets',
            'apparel': 'Custom Apparel',
            'tote-bags': 'Tote Bags',
            'table-tents': 'Table Tents',
            'name-tags': 'Name Tags',
            'bookmarks': 'Bookmarks',
            'notebooks': 'Notebooks',
            'notepads': 'Notepads'
        };

        return names[productType] || productType;
    }

    formatConfigurationSummary(item) {
        const config = item.configuration;
        const summary = [];

        // Common configurations
        if (config.size) {
            summary.push(`Size: ${config.size.replace('x', '" × ')}`);
        }
        if (config.quantity) {
            summary.push(`Quantity: ${config.quantity}`);
        }
        if (config.paperType) {
            summary.push(`Paper: ${this.formatPaperType(config.paperType)}`);
        }
        if (config.foldType && config.foldType !== 'none') {
            summary.push(`Fold: ${config.foldType}`);
        }

        // Product-specific configurations
        switch (item.productType) {
            case 'booklets':
                if (config.pages) summary.push(`Pages: ${config.pages}`);
                if (config.binding) summary.push(`Binding: ${config.binding}`);
                break;
            case 'stickers':
                if (config.stickerType) summary.push(`Type: ${config.stickerType}`);
                break;
            case 'magnets':
                if (config.magnetType) summary.push(`Type: ${config.magnetType}`);
                break;
            case 'apparel':
                if (config.garmentType) summary.push(`Garment: ${config.garmentType}`);
                if (config.decorationType) summary.push(`Decoration: ${config.decorationType}`);
                break;
        }

        if (config.rushType && config.rushType !== 'standard') {
            summary.push(`Rush: ${config.rushType}`);
        }

        return summary.join(' • ');
    }

    formatPaperType(paperType) {
        const paperNames = {
            'LYNO416FSC': '80# Text Uncoated',
            'LYNOC95FSC': '100# Cover Uncoated',
            'PACDIS42FSC': '100# Cover Gloss'
        };

        return paperNames[paperType] || paperType;
    }

    bindCartActions() {
        // This method re-binds events for dynamically created elements
        // Events are already bound globally in bindEvents(), but this can handle specific cases
    }

    // Event handlers
    async handleRemoveItem(itemId) {
        const confirmed = await this.confirmAction('Remove this item from your cart?');
        if (confirmed) {
            this.cartManager.removeItem(itemId);
            this.showNotification('Item removed from cart', 'success');
        }
    }

    handleEditItem(itemId) {
        const item = this.cartManager.getItem(itemId);
        if (!item) return;

        // Store item for editing
        sessionStorage.setItem('editingItem', JSON.stringify(item));

        // Navigate to appropriate configurator page
        const pageMap = {
            'brochures': 'brochures.html',
            'postcards': 'postcards.html',
            'flyers': 'flyers.html',
            'booklets': 'booklets.html',
            'posters': 'posters.html',
            'stickers': 'stickers.html',
            'magnets': 'magnets.html',
            'apparel': 'apparel.html',
            'tote-bags': 'tote-bags.html'
        };

        const page = pageMap[item.productType];
        if (page) {
            window.location.href = `${page}?edit=${itemId}`;
        }
    }

    async handleQuantityChange(itemId, action) {
        const item = this.cartManager.getItem(itemId);
        if (!item) return;

        const currentQuantity = item.configuration.quantity || 1;
        let newQuantity = currentQuantity;

        if (action === 'increase') {
            newQuantity = currentQuantity + 1;
        } else if (action === 'decrease' && currentQuantity > 1) {
            newQuantity = currentQuantity - 1;
        }

        if (newQuantity !== currentQuantity) {
            // Update configuration
            item.configuration.quantity = newQuantity;

            // Recalculate pricing
            try {
                const newPricing = await window.pricingEngine.calculatePrice(item.productType, item.configuration);
                if (!newPricing.error) {
                    item.pricing = newPricing;
                    this.cartManager.updateItem(item);
                    this.showNotification('Quantity updated', 'success');
                } else {
                    this.showNotification('Failed to update pricing', 'error');
                }
            } catch (error) {
                console.error('Failed to recalculate pricing:', error);
                this.showNotification('Failed to update quantity', 'error');
            }
        }
    }

    async handleClearCart() {
        const confirmed = await this.confirmAction('Clear all items from your cart?');
        if (confirmed) {
            this.cartManager.clearCart();
            this.showNotification('Cart cleared', 'success');
        }
    }

    handleCheckout() {
        if (this.cartManager.getItemCount() === 0) {
            this.showNotification('Your cart is empty', 'warning');
            return;
        }

        // Navigate to checkout or quote page
        window.location.href = 'checkout.html';
    }

    // UI utility methods
    async confirmAction(message) {
        // Simple confirmation for now, could be enhanced with custom modal
        return confirm(message);
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showLoading(show = true) {
        const cartContainer = document.getElementById('cartItemsContainer');
        if (!cartContainer) return;

        if (show) {
            cartContainer.classList.add('loading');
        } else {
            cartContainer.classList.remove('loading');
        }
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartUI;
}

// Global access
if (typeof window !== 'undefined') {
    window.CartUI = CartUI;
}