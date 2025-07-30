// Product Configurator - Enhanced UX with Real-time Pricing
class ProductConfigurator {
    constructor() {
        // Detect current product type
        this.productType = this.detectProductType();
        
        // Initialize configuration based on product type
        if (this.productType === 'booklets') {
            this.currentConfig = {
                pages: 8,
                coverPaperType: 'LYNOC95FSC',  // Default to 100# Cover Uncoated
                textPaperType: 'LYNO416FSC',   // Default to 80# Text Uncoated
                rushType: 'standard',
                quantity: 100
            };
        } else {
            this.currentConfig = {
                size: '8.5x11',
                foldType: 'bifold',
                paperType: 'LYNOC95FSC', // Default to 100# Cover Uncoated for postcard compatibility
                rushType: 'standard',
                quantity: 100
            };
        }
        
        this.currentPricing = {
            total: 0,
            unitPrice: 0,
            breakdown: {}
        };
        
        this.isCalculating = false;
        this.debounceTimer = null;
        
        this.init();
    }

    detectProductType() {
        // Detect product type based on form ID
        if (document.getElementById('postcardForm')) {
            return 'postcards';
        } else if (document.getElementById('flyerForm')) {
            return 'flyers';
        } else if (document.getElementById('bookmarkForm')) {
            return 'bookmarks';
        } else if (document.getElementById('brochureForm')) {
            return 'brochures';
        } else if (document.getElementById('bookletCalculator')) {
            return 'booklets';
        }
        return 'brochures'; // Default fallback
    }

    async init() {
        console.log('🚀 Initializing Product Configurator...');
        
        try {
            this.setupEventListeners();
            this.initializeTooltips();
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
            const hasProductFunction = this.getProductPricingFunction() !== null;
            const hasPricingData = (typeof window.pricingConfigs !== 'undefined' || typeof window.dbManager !== 'undefined');
            
            if (hasProductFunction && hasPricingData) {
                console.log('✅ Dependencies ready for product type:', this.productType);
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

    getProductPricingFunction() {
        // Return the appropriate pricing function for the current product type
        switch (this.productType) {
            case 'brochures':
                return typeof calculateBrochurePrice === 'function' ? calculateBrochurePrice : null;
            case 'postcards':
                return typeof calculatePostcardPrice === 'function' ? calculatePostcardPrice : null;
            case 'flyers':
                return typeof calculateFlyerPrice === 'function' ? calculateFlyerPrice : null;
            case 'bookmarks':
                return typeof calculateBookmarkPrice === 'function' ? calculateBookmarkPrice : null;
            case 'booklets':
                return typeof calculateBookletPrice === 'function' ? calculateBookletPrice : null;
            default:
                return null;
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
            'turnaround': 'rushType',
            'coverPaper': 'coverPaperType',
            'textPaper': 'textPaperType',
            'pages': 'pages'
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
            coverPaperType: {
                'LYNOC76FSC': '80# Cover Uncoated',
                'PACDISC7613FSC': '80# Cover Silk',
                'LYNOC95FSC': '100# Cover Uncoated',
                'PACDISC9513FSC': '100# Cover Silk'
            },
            textPaperType: {
                'LYNODI312FSC': '60# Text Uncoated',
                'LYNO416FSC': '80# Text Uncoated',
                'PACDIS42FSC': '80# Text Silk',
                'LYNO52FSC': '100# Text Uncoated',
                'PACDIS52FSC': '100# Text Silk'
            },
            rushType: {
                'standard': 'Standard (3-5 days)',
                '2-day': '2-Day Rush',
                'next-day': 'Next-Day Rush',
                'same-day': 'Same-Day Rush'
            }
        };

        if (this.productType === 'booklets') {
            // Handle booklet-specific summary fields
            const summaryPages = document.getElementById('summaryPages');
            const summaryCoverPaper = document.getElementById('summaryCoverPaper');
            const summaryTextPaper = document.getElementById('summaryTextPaper');
            const summaryTurnaround = document.getElementById('summaryTurnaround');
            const summaryQuantity = document.getElementById('summaryQuantity');

            if (summaryPages) summaryPages.textContent = `${this.currentConfig.pages} pages`;
            if (summaryCoverPaper) summaryCoverPaper.textContent = summaryMapping.coverPaperType[this.currentConfig.coverPaperType] || 'Select paper';
            if (summaryTextPaper) summaryTextPaper.textContent = summaryMapping.textPaperType[this.currentConfig.textPaperType] || 'Select paper';
            if (summaryTurnaround) summaryTurnaround.textContent = summaryMapping.rushType[this.currentConfig.rushType];
            if (summaryQuantity) summaryQuantity.textContent = `${this.currentConfig.quantity} pieces`;
        } else {
            // Handle standard product summary fields
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
                
                // Dispatch custom event for booklet detailed breakdown
                if (this.productType === 'booklets') {
                    window.dispatchEvent(new CustomEvent('bookletPricingUpdate', {
                        detail: result
                    }));
                }
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
        const pricingFunction = this.getProductPricingFunction();
        
        if (!pricingFunction) {
            console.error(`❌ Pricing function not available for product type: ${this.productType}`);
            return null;
        }
        
        const config = this.currentConfig;
        console.log('🔧 Calling pricing calculator with config:', config);
        console.log('🏷️ Product type:', this.productType);
        
        // Create FormData object with appropriate parameters for each product type
        const formData = new FormData();
        formData.append('quantity', config.quantity);
        formData.append('rushType', config.rushType);
        
        if (this.productType === 'booklets') {
            // Booklet-specific fields
            formData.append('pages', config.pages);
            formData.append('coverPaperType', config.coverPaperType);
            formData.append('textPaperType', config.textPaperType);
        } else {
            // Standard product fields
            formData.append('size', config.size);
            formData.append('paperType', config.paperType);
            
            // Only add foldType for brochures
            if (this.productType === 'brochures') {
                formData.append('foldType', config.foldType);
            }
        }
        
        const result = await pricingFunction(formData);
        console.log('💰 Raw pricing result:', result);
        
        return result;
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

        // Update red cell breakdown elements
        const redSetupCost = document.getElementById('redSetupCost');
        const redProductionCost = document.getElementById('redProductionCost');
        const redMaterialCost = document.getElementById('redMaterialCost');
        const redFinishingCost = document.getElementById('redFinishingCost');
        const redSubtotal = document.getElementById('redSubtotal');
        const redRushMultiplier = document.getElementById('redRushMultiplier');
        const redRushMultiplierItem = document.getElementById('redRushMultiplierItem');

        if (redSetupCost) redSetupCost.textContent = `$${(breakdown.setupFee || 0).toFixed(2)}`;
        if (redProductionCost) redProductionCost.textContent = `$${(breakdown.productionCost || 0).toFixed(2)}`;
        if (redMaterialCost) redMaterialCost.textContent = `$${(breakdown.materialCost || 0).toFixed(2)}`;
        if (redFinishingCost) redFinishingCost.textContent = `$${(breakdown.finishingCost || 0).toFixed(2)}`;
        if (redSubtotal) redSubtotal.textContent = `$${(breakdown.subtotal || 0).toFixed(2)}`;

        // Show/hide rush multiplier
        if (breakdown.rushMultiplier && breakdown.rushMultiplier > 1) {
            if (rushMultiplier) rushMultiplier.textContent = `${breakdown.rushMultiplier.toFixed(1)}x`;
            if (rushMultiplierItem) rushMultiplierItem.style.display = 'flex';
            if (redRushMultiplier) redRushMultiplier.textContent = `${breakdown.rushMultiplier.toFixed(1)}x`;
            if (redRushMultiplierItem) redRushMultiplierItem.style.display = 'flex';
        } else {
            if (rushMultiplierItem) rushMultiplierItem.style.display = 'none';
            if (redRushMultiplierItem) redRushMultiplierItem.style.display = 'none';
        }
    }

    enableAddToCart() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (addToCartBtn) {
            addToCartBtn.disabled = false;
        }
    }

    addToCart() {
        if (!this.currentPricing) {
            alert('Please calculate pricing first');
            return;
        }

        // Use cartManager directly instead of the global addToCart
        if (window.cartManager) {
            // Create FormData to match what other calculators use
            const formData = new FormData();
            formData.append('quantity', this.currentConfig.quantity);
            formData.append('rushType', this.currentConfig.rushType);
            
            if (this.productType === 'booklets') {
                // Booklet-specific fields
                formData.append('pages', this.currentConfig.pages);
                formData.append('coverPaperType', this.currentConfig.coverPaperType);
                formData.append('textPaperType', this.currentConfig.textPaperType);
            } else {
                // Standard product fields
                formData.append('size', this.currentConfig.size);
                formData.append('paperType', this.currentConfig.paperType);
                
                // Only add foldType for brochures
                if (this.productType === 'brochures') {
                    formData.append('foldType', this.currentConfig.foldType);
                }
            }
            
            // Use the proper pricing structure
            const pricing = {
                unitPrice: this.currentPricing.unitPrice,
                totalCost: this.currentPricing.total, // Note: totalCost, not totalPrice
                totalPrice: this.currentPricing.total, // Include both for compatibility
                sheetsRequired: this.currentPricing.breakdown.sheetsRequired,
                printingSetupCost: this.currentPricing.breakdown.setupFee,
                finishingSetupCost: this.currentPricing.breakdown.finishingSetupFee || 0,
                productionCost: this.currentPricing.breakdown.productionCost,
                materialCost: this.currentPricing.breakdown.materialCost,
                finishingCost: this.currentPricing.breakdown.finishingCost || 0,
                subtotal: this.currentPricing.breakdown.subtotal,
                rushMultiplier: this.currentPricing.breakdown.rushMultiplier
            };
            
            // Use the cartManager method that other calculators use
            window.cartManager.addCurrentConfiguration(this.productType, formData, pricing);
            this.showAddToCartSuccess();
        } else {
            console.error('Cart manager not available');
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
        const productNames = {
            'brochures': 'Brochures',
            'postcards': 'Postcards', 
            'flyers': 'Flyers',
            'bookmarks': 'Bookmarks',
            'booklets': 'Booklets'
        };
        
        const quoteData = {
            product: productNames[this.productType] || 'Product',
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