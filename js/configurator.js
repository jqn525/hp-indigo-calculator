// Product Configurator - Enhanced UX with Real-time Pricing
class ProductConfigurator {
    constructor() {
        this.currentConfig = {
            size: '8.5x11',
            foldType: 'bifold',
            paperType: 'LYNO416FSC',
            rushType: 'standard',
            quantity: 100
        };
        
        this.currentPricing = {
            total: 0,
            unitPrice: 0,
            breakdown: {}
        };
        
        this.isCalculating = false;
        this.debounceTimer = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Product Configurator...');
        
        try {
            this.setupEventListeners();
            this.initializeTooltips();
            this.updateVisualPreview();
            this.updateConfigurationSummary();
            
            // Wait a moment for any async dependencies to load
            await this.waitForDependencies();
            
            // Initial calculation
            console.log('📊 Starting initial pricing calculation...');
            await this.calculatePricing();
            
            console.log('✅ Product Configurator initialized successfully');
        } catch (error) {
            console.error('❌ Product Configurator initialization failed:', error);
            this.updatePricingDisplay('error');
        }
    }

    async waitForDependencies() {
        // Wait for critical functions to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (typeof calculateBrochurePrice === 'function' && 
                (typeof window.pricingConfigs !== 'undefined' || typeof window.dbManager !== 'undefined')) {
                console.log('✅ Dependencies ready');
                return;
            }
            
            console.log(`⏳ Waiting for dependencies... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (attempts >= maxAttempts) {
            console.warn('⚠️ Some dependencies may not be ready, proceeding anyway');
        }
    }

    setupEventListeners() {
        // Option card selections
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const option = card.dataset.option;
                const value = card.dataset.value;
                this.selectOption(option, value, card);
            });
        });

        // Quantity controls
        const quantityInput = document.getElementById('quantity');
        const minusBtn = document.querySelector('.quantity-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus');
        
        if (quantityInput) {
            quantityInput.addEventListener('input', (e) => {
                this.updateQuantity(parseInt(e.target.value) || 100);
            });
            
            quantityInput.addEventListener('blur', (e) => {
                this.validateQuantity();
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value) || 100;
                const newValue = Math.max(25, current - 25);
                this.updateQuantity(newValue);
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value) || 100;
                const newValue = Math.min(2500, current + 25);
                this.updateQuantity(newValue);
            });
        }

        // Quantity suggestions
        document.querySelectorAll('.qty-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const qty = parseInt(e.target.dataset.qty);
                this.updateQuantity(qty);
            });
        });

        // Cart and quote buttons
        const addToCartBtn = document.getElementById('addToCartBtn');
        const requestQuoteBtn = document.getElementById('requestQuoteBtn');

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }

        if (requestQuoteBtn) {
            requestQuoteBtn.addEventListener('click', () => {
                this.requestQuote();
            });
        }
    }

    selectOption(option, value, cardElement) {
        // Remove selected class from other cards in the same group
        const optionGroup = document.querySelectorAll(`[data-option="${option}"]`);
        optionGroup.forEach(card => {
            card.classList.remove('selected');
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = false;
        });

        // Add selected class to clicked card
        cardElement.classList.add('selected');
        const radio = cardElement.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;

        // Update configuration
        this.currentConfig[this.getConfigKey(option)] = value;

        // Update visual preview
        this.updateVisualPreview();

        // Update configuration summary
        this.updateConfigurationSummary();

        // Recalculate pricing
        this.debouncedCalculation();
    }

    getConfigKey(option) {
        const mapping = {
            'size': 'size',
            'fold': 'foldType',
            'paper': 'paperType',
            'turnaround': 'rushType'
        };
        return mapping[option] || option;
    }

    updateQuantity(newQuantity) {
        // Validate quantity range
        const quantity = Math.max(25, Math.min(2500, newQuantity));
        
        // Update input field
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.value = quantity;
        }

        // Update configuration
        this.currentConfig.quantity = quantity;

        // Update summary
        this.updateConfigurationSummary();

        // Recalculate pricing
        this.debouncedCalculation();

        // Update quantity suggestions active state
        this.updateQuantitySuggestionState(quantity);
    }

    updateQuantitySuggestionState(quantity) {
        document.querySelectorAll('.qty-suggestion').forEach(btn => {
            const btnQty = parseInt(btn.dataset.qty);
            if (btnQty === quantity) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    validateQuantity() {
        const quantityInput = document.getElementById('quantity');
        const value = parseInt(quantityInput.value);
        
        if (isNaN(value) || value < 25 || value > 2500) {
            const correctedValue = Math.max(25, Math.min(2500, value || 100));
            this.updateQuantity(correctedValue);
        }
    }

    updateVisualPreview() {
        const preview = document.getElementById('brochurePreview');
        if (!preview) return;

        // Update fold lines based on fold type
        const triFoldLines = preview.querySelectorAll('.fold-line.tri-fold');
        const biFoldLines = preview.querySelectorAll('.fold-line.bi-fold');

        if (this.currentConfig.foldType === 'trifold') {
            triFoldLines.forEach(line => line.style.display = 'block');
            biFoldLines.forEach(line => line.style.display = 'none');
        } else {
            triFoldLines.forEach(line => line.style.display = 'none');
            biFoldLines.forEach(line => line.style.display = 'block');
        }

        // Could add more visual updates based on paper type, size, etc.
        // For now, keeping it simple with fold line changes
    }

    updateConfigurationSummary() {
        const summaryMapping = {
            size: {
                '8.5x11': '8.5" × 11"',
                '11x17': '11" × 17"'
            },
            foldType: {
                'trifold': 'Tri-Fold',
                'bifold': 'Bi-Fold'
            },
            paperType: {
                'LYNO416FSC': '80# Text Uncoated',
                'PACDIS42FSC': '80# Text Silk',
                'LYNOC76FSC': '80# Cover Uncoated',
                'PACDISC7613FSC': '80# Cover Silk'
            },
            rushType: {
                'standard': 'Standard (3-5 days)',
                '2-day': '2-Day Rush',
                'next-day': 'Next-Day Rush',
                'same-day': 'Same-Day Rush'
            }
        };

        // Update summary values
        const summarySize = document.getElementById('summarySize');
        const summaryFold = document.getElementById('summaryFold');
        const summaryPaper = document.getElementById('summaryPaper');
        const summaryTurnaround = document.getElementById('summaryTurnaround');
        const summaryQuantity = document.getElementById('summaryQuantity');

        if (summarySize) summarySize.textContent = summaryMapping.size[this.currentConfig.size];
        if (summaryFold) summaryFold.textContent = summaryMapping.foldType[this.currentConfig.foldType];
        if (summaryPaper) summaryPaper.textContent = summaryMapping.paperType[this.currentConfig.paperType];
        if (summaryTurnaround) summaryTurnaround.textContent = summaryMapping.rushType[this.currentConfig.rushType];
        if (summaryQuantity) summaryQuantity.textContent = `${this.currentConfig.quantity} pieces`;
    }

    debouncedCalculation() {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new timer for 300ms delay
        this.debounceTimer = setTimeout(() => {
            this.calculatePricing();
        }, 300);
    }

    async calculatePricing() {
        if (this.isCalculating) return;
        
        this.isCalculating = true;
        this.updatePricingDisplay('calculating');

        try {
            // Use existing calculator function
            const result = await this.callPricingCalculator();
            
            console.log('📊 Pricing calculation result:', result);
            
            if (result && result.totalCost && !result.error) {
                this.currentPricing = {
                    total: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    breakdown: {
                        setupFee: parseFloat(result.printingSetupCost),
                        finishingSetupFee: result.needsFinishing ? parseFloat(result.finishingSetupCost) : 0,
                        productionCost: parseFloat(result.productionCost),
                        materialCost: parseFloat(result.materialCost),
                        finishingCost: parseFloat(result.finishingCost),
                        subtotal: parseFloat(result.subtotal),
                        rushMultiplier: result.rushMultiplier,
                        sheetsRequired: result.sheetsRequired
                    }
                };
                
                this.updatePricingDisplay('success');
                this.enableAddToCart();
            } else {
                console.error('❌ Invalid pricing result:', result);
                this.updatePricingDisplay('error');
            }
        } catch (error) {
            console.error('❌ Pricing calculation error:', error);
            this.updatePricingDisplay('error');
        } finally {
            this.isCalculating = false;
        }
    }

    async callPricingCalculator() {
        // Use the existing brochure calculation function
        if (typeof calculateBrochurePrice === 'function') {
            const config = this.currentConfig;
            
            console.log('🔧 Calling pricing calculator with config:', config);
            
            // Create FormData object as expected by calculateBrochurePrice
            const formData = new FormData();
            formData.append('quantity', config.quantity);
            formData.append('size', config.size);
            formData.append('foldType', config.foldType);
            formData.append('paperType', config.paperType);
            formData.append('rushType', config.rushType);
            
            const result = await calculateBrochurePrice(formData);
            console.log('💰 Raw pricing result:', result);
            
            return result;
        } else {
            console.error('❌ calculateBrochurePrice function not available');
            return null;
        }
    }

    updatePricingDisplay(status) {
        const livePrice = document.getElementById('livePrice');
        const liveUnitPrice = document.getElementById('liveUnitPrice');
        const priceStatus = document.getElementById('priceStatus');

        switch (status) {
            case 'calculating':
                if (priceStatus) {
                    priceStatus.innerHTML = '<span class="status-text loading">Calculating pricing...</span>';
                }
                break;

            case 'success':
                if (livePrice) {
                    livePrice.textContent = `$${this.currentPricing.total.toFixed(2)}`;
                }
                if (liveUnitPrice) {
                    liveUnitPrice.textContent = `$${this.currentPricing.unitPrice.toFixed(2)}`;
                }
                if (priceStatus) {
                    priceStatus.innerHTML = '<span class="status-text success">Price updated</span>';
                }
                this.updateDetailedBreakdown();
                break;

            case 'error':
                if (priceStatus) {
                    priceStatus.innerHTML = '<span class="status-text error">Unable to calculate pricing</span>';
                }
                break;
        }
    }

    updateDetailedBreakdown() {
        if (!this.currentPricing.breakdown) return;

        const breakdown = this.currentPricing.breakdown;
        
        // Update breakdown values
        const setupCost = document.getElementById('setupCost');
        const productionCost = document.getElementById('productionCost');
        const materialCost = document.getElementById('materialCost');
        const finishingCost = document.getElementById('finishingCost');
        const subtotal = document.getElementById('subtotal');
        const rushMultiplier = document.getElementById('rushMultiplier');
        const rushMultiplierItem = document.getElementById('rushMultiplierItem');
        const breakdownTotal = document.getElementById('breakdownTotal');
        const sheetsRequired = document.getElementById('sheetsRequired');

        if (setupCost) setupCost.textContent = `$${(breakdown.setupFee || 0).toFixed(2)}`;
        if (productionCost) productionCost.textContent = `$${(breakdown.productionCost || 0).toFixed(2)}`;
        if (materialCost) materialCost.textContent = `$${(breakdown.materialCost || 0).toFixed(2)}`;
        if (finishingCost) finishingCost.textContent = `$${(breakdown.finishingCost || 0).toFixed(2)}`;
        if (subtotal) subtotal.textContent = `$${(breakdown.subtotal || 0).toFixed(2)}`;
        if (breakdownTotal) breakdownTotal.textContent = `$${this.currentPricing.total.toFixed(2)}`;
        if (sheetsRequired) sheetsRequired.textContent = breakdown.sheetsRequired || 0;

        // Show/hide rush multiplier
        if (breakdown.rushMultiplier && breakdown.rushMultiplier > 1) {
            if (rushMultiplier) rushMultiplier.textContent = `${breakdown.rushMultiplier.toFixed(1)}x`;
            if (rushMultiplierItem) rushMultiplierItem.style.display = 'flex';
        } else {
            if (rushMultiplierItem) rushMultiplierItem.style.display = 'none';
        }
    }

    enableAddToCart() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
    }

    addToCart() {
        if (!this.currentPricing.total) {
            alert('Please wait for pricing calculation to complete.');
            return;
        }

        // Prepare cart item data
        const cartItem = {
            id: Date.now().toString(),
            type: 'brochures',
            title: 'Professional Brochures',
            configuration: {
                size: this.currentConfig.size,
                foldType: this.currentConfig.foldType,
                paperType: this.currentConfig.paperType,
                rushType: this.currentConfig.rushType,
                quantity: this.currentConfig.quantity
            },
            pricing: {
                unitPrice: this.currentPricing.unitPrice,
                totalPrice: this.currentPricing.total,
                quantity: this.currentConfig.quantity
            },
            timestamp: new Date().toISOString()
        };

        // Use existing cart functionality
        if (typeof addToCart === 'function') {
            addToCart(cartItem);
            this.showAddToCartSuccess();
        } else {
            console.error('Cart functionality not available');
        }
    }

    showAddToCartSuccess() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Added to Cart!
            `;
            addToCartBtn.classList.add('success');
            
            setTimeout(() => {
                addToCartBtn.innerHTML = originalText;
                addToCartBtn.classList.remove('success');
            }, 2000);
        }
    }

    requestQuote() {
        // Create quote request data
        const quoteData = {
            product: 'Brochures',
            configuration: this.currentConfig,
            pricing: this.currentPricing,
            timestamp: new Date().toISOString()
        };

        // For now, show a modal or redirect to quote form
        // This could be enhanced to integrate with a quote management system
        alert('Quote request functionality would be implemented here. For now, please use the Add to Cart feature.');
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips for help buttons
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

// Initialize configurator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a configurator page
    if (document.querySelector('.configurator-layout')) {
        window.productConfigurator = new ProductConfigurator();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductConfigurator;
}