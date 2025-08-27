// Product Configurator - Enhanced UX with Real-time Pricing
class ProductConfigurator {
    constructor() {
        // Check for edit mode first
        this.editMode = this.checkEditMode();
        
        // Detect current product type
        this.productType = this.detectProductType();
        
        // Initialize configuration based on product type
        if (this.productType === 'booklets') {
            this.currentConfig = {
                size: '8.5x11',                // Default to standard letter size
                pages: 8,
                coverPaperType: 'LYNOC95FSC',  // Default to 100# Cover Uncoated
                textPaperType: 'LYNO416FSC',   // Default to 80# Text Uncoated
                rushType: 'standard',
                quantity: 100
            };
        } else if (this.productType === 'magnets') {
            this.currentConfig = {
                size: '3x3',
                magnetType: 'super-matte',
                rushType: 'standard',
                quantity: 25
            };
        } else if (this.productType === 'stickers') {
            this.currentConfig = {
                size: '3x3',
                stickerType: 'kiss-cut-matte',
                rushType: 'standard',
                quantity: 25
            };
        } else if (this.productType === 'apparel') {
            this.currentConfig = {
                garmentType: 'gildan-6400',
                decorationType: 'dtf',
                rushType: 'standard',
                totalQuantity: 0,
                sizeBreakdown: {}
            };
        } else if (this.productType === 'tote-bags') {
            this.currentConfig = {
                size: '10x10',
                bagType: 'canvas-tote',
                decorationType: 'dtf',
                rushType: 'standard',
                quantity: 15
            };
        } else if (this.productType === 'posters') {
            this.currentConfig = {
                size: '18x24',
                material: 'RMPS002', // Default to paper
                rushType: 'standard',
                quantity: 1
            };
        } else if (this.productType === 'table-tents') {
            this.currentConfig = {
                size: '4x6',
                paperType: 'LYNOC95FSC', // Default to 100# Cover Uncoated
                rushType: 'standard',
                quantity: 25
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
        } else if (document.getElementById('nameTagForm')) {
            return 'name-tags';
        } else if (document.getElementById('flyerForm')) {
            return 'flyers';
        } else if (document.getElementById('bookmarkForm')) {
            return 'bookmarks';
        } else if (document.getElementById('brochureForm')) {
            return 'brochures';
        } else if (document.getElementById('bookletCalculator')) {
            return 'booklets';
        } else if (document.getElementById('magnetForm')) {
            return 'magnets';
        } else if (document.getElementById('stickerForm')) {
            return 'stickers';
        } else if (document.getElementById('apparelForm')) {
            return 'apparel';
        } else if (document.getElementById('toteBagForm')) {
            return 'tote-bags';
        } else if (document.getElementById('tableTentForm')) {
            return 'table-tents';
        } else if (document.getElementById('posterForm')) {
            return 'posters';
        }
        return 'brochures'; // Default fallback
    }
    
    checkEditMode() {
        // Check URL for edit parameter
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            // Retrieve the item data from sessionStorage
            const editingItemData = sessionStorage.getItem('editingItem');
            if (editingItemData) {
                try {
                    const itemData = JSON.parse(editingItemData);
                    if (itemData.id === editId) {
                        console.log('Edit mode detected for item:', editId);
                        return itemData;
                    }
                } catch (error) {
                    console.warn('Failed to parse editing item data:', error);
                }
            }
        }
        return null;
    }
    
    populateFieldsFromConfig() {
        if (!this.editMode || !this.editMode.configuration) return;
        
        const config = this.editMode.configuration;
        console.log('Populating fields with configuration:', config);
        
        // Populate common fields across all product types
        if (config.quantity) {
            const quantityInput = document.getElementById('quantity');
            if (quantityInput) {
                quantityInput.value = config.quantity;
            }
        }
        
        if (config.rushType) {
            const rushSelect = document.querySelector('select[name="rush"], #rushType');
            if (rushSelect) {
                rushSelect.value = config.rushType;
            }
        }
        
        // Product-specific field population
        switch (this.productType) {
            case 'brochures':
                this.populateBrochureFields(config);
                break;
            case 'postcards':
                this.populatePostcardFields(config);
                break;
            case 'flyers':
                this.populateFlyerFields(config);
                break;
            case 'bookmarks':
                this.populateBookmarkFields(config);
                break;
            case 'booklets':
                this.populateBookletFields(config);
                break;
            case 'notebooks':
                this.populateNotebookFields(config);
                break;
            case 'notepads':
                this.populateNotepadFields(config);
                break;
            case 'name-tags':
                this.populateNameTagFields(config);
                break;
            // Add other product types as needed
        }
        
        // Trigger calculation update after populating fields
        setTimeout(() => {
            this.updateConfigurationSummary();
            if (typeof window.calculatePricing === 'function') {
                window.calculatePricing();
            }
        }, 100);
    }
    
    setupEditMode() {
        // Update page title
        const titleElement = document.querySelector('h1, .preview-header h1');
        if (titleElement && this.editMode) {
            const productName = this.getProductDisplayName();
            titleElement.textContent = `Edit ${productName}`;
        }
        
        // Update button text and behavior
        const addButton = document.querySelector('#addToCartBtn, .add-to-cart-btn, button[onclick*="addToCart"]');
        if (addButton) {
            // Clone and replace button to remove all existing event listeners
            const newButton = addButton.cloneNode(true);
            newButton.textContent = 'Update Cart Item';
            newButton.classList.add('btn-warning');
            newButton.classList.remove('btn-primary');
            
            // Remove any existing onclick handlers and set the new one
            newButton.onclick = null;
            newButton.onclick = () => this.updateCartItem();
            
            // Replace the button in the DOM
            addButton.parentNode.replaceChild(newButton, addButton);
        }
    }
    
    async updateCartItem() {
        try {
            // Ensure pricing is calculated first
            await this.calculatePricing();
            
            // Get current configuration and pricing
            const currentConfig = this.currentConfig;
            
            // Get pricing from the calculated results
            let currentPricing = {};
            if (this.currentPricing && this.currentPricing.total > 0) {
                // Use the pricing from the configurator's calculated results
                currentPricing = {
                    unitPrice: this.currentPricing.unitPrice,
                    totalPrice: this.currentPricing.total,
                    totalCost: this.currentPricing.total, // Include both for compatibility
                    sheetsRequired: this.currentPricing.breakdown?.sheetsRequired || 0,
                    printingSetupCost: this.currentPricing.breakdown?.setupFee || this.currentPricing.breakdown?.printingSetupCost || 0,
                    finishingSetupCost: this.currentPricing.breakdown?.finishingSetupFee || 0,
                    productionCost: this.currentPricing.breakdown?.productionCost || 0,
                    materialCost: this.currentPricing.breakdown?.materialCost || 0,
                    finishingCost: this.currentPricing.breakdown?.finishingCost || 0,
                    subtotal: this.currentPricing.breakdown?.subtotal || 0,
                    rushMultiplier: this.currentPricing.breakdown?.rushMultiplier || 1.0
                };
            } else {
                // Fallback to getting pricing from display elements
                currentPricing = this.getCurrentPricing();
            }
            
            console.log('Update pricing data:', currentPricing);
            
            // Update the cart item
            if (window.cartManager && this.editMode) {
                const success = window.cartManager.updateItem(
                    this.editMode.id,
                    currentConfig,
                    currentPricing
                );
                
                if (success) {
                    // Show success message
                    alert('Item updated successfully!');
                    // Redirect back to cart
                    window.location.href = 'cart.html';
                } else {
                    alert('Failed to update item. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error updating cart item:', error);
            alert('Failed to update item. Please try again.');
        }
    }
    
    getCurrentPricing() {
        // Extract pricing from the page elements
        const pricing = {};
        
        const unitPriceElement = document.querySelector('.unit-price, #unitPrice');
        if (unitPriceElement) {
            pricing.unitPrice = parseFloat(unitPriceElement.textContent.replace('$', '')) || 0;
        }
        
        const totalPriceElement = document.querySelector('.total-price, #totalPrice');
        if (totalPriceElement) {
            pricing.totalPrice = parseFloat(totalPriceElement.textContent.replace('$', '')) || 0;
        }
        
        // Add any other pricing fields that might be relevant
        return pricing;
    }
    
    getProductDisplayName() {
        const displayNames = {
            'brochures': 'Brochure',
            'postcards': 'Postcard',
            'flyers': 'Flyer',
            'bookmarks': 'Bookmark',
            'booklets': 'Booklet',
            'notebooks': 'Notebook',
            'notepads': 'Notepad',
            'name-tags': 'Name Tag',
            'table-tents': 'Table Tent'
        };
        return displayNames[this.productType] || 'Product';
    }

    getProductConstraints() {
        // Get product-specific quantity constraints from pricingConfig
        if (window.pricingConfig && window.pricingConfig.productConstraints) {
            const constraints = window.pricingConfig.productConstraints[this.productType];
            if (constraints) {
                return {
                    minQuantity: constraints.minQuantity,
                    maxQuantity: constraints.maxQuantity
                };
            }
        }
        
        // Fallback to product-specific defaults
        const fallbacks = {
            'brochures': { minQuantity: 25, maxQuantity: 2500 },
            'postcards': { minQuantity: 100, maxQuantity: 5000 },
            'flyers': { minQuantity: 25, maxQuantity: 2500 },
            'bookmarks': { minQuantity: 100, maxQuantity: 2500 },
            'booklets': { minQuantity: 10, maxQuantity: 1000 },
            'notebooks': { minQuantity: 10, maxQuantity: 500 },
            'notepads': { minQuantity: 25, maxQuantity: 1000 },
            'name-tags': { minQuantity: 50, maxQuantity: 5000 },
            'table-tents': { minQuantity: 10, maxQuantity: 100 }
        };
        
        return fallbacks[this.productType] || { minQuantity: 25, maxQuantity: 2500 };
    }

    async init() {
        
        try {
            this.setupEventListeners();
            this.initializeTooltips();
            this.updateConfigurationSummary();
            
            // Wait a moment for any async dependencies to load
            await this.waitForDependencies();
            
            // Initialize edit mode if we're editing an item
            if (this.editMode) {
                this.populateFieldsFromConfig();
                this.setupEditMode();
            }
            
            // Initial calculation
            await this.calculatePricing();
            
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
                return;
            }
            
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
            case 'name-tags':
                return typeof calculateNameTagPrice === 'function' ? calculateNameTagPrice : null;
            case 'flyers':
                return typeof calculateFlyerPrice === 'function' ? calculateFlyerPrice : null;
            case 'bookmarks':
                return typeof calculateBookmarkPrice === 'function' ? calculateBookmarkPrice : null;
            case 'booklets':
                return typeof calculateBookletPrice === 'function' ? calculateBookletPrice : null;
            case 'magnets':
                return typeof calculateMagnetPrice === 'function' ? calculateMagnetPrice : null;
            case 'stickers':
                return typeof calculateStickerPrice === 'function' ? calculateStickerPrice : null;
            case 'apparel':
                return typeof calculateApparelPrice === 'function' ? calculateApparelPrice : null;
            case 'tote-bags':
                return typeof calculateToteBagPrice === 'function' ? calculateToteBagPrice : null;
            case 'table-tents':
                return typeof calculateTableTentPrice === 'function' ? calculateTableTentPrice : null;
            case 'posters':
                return typeof calculatePosterPrice === 'function' ? calculatePosterPrice : null;
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
                const constraints = this.getProductConstraints();
                const step = this.productType === 'table-tents' ? 5 : 25;
                const newValue = Math.max(constraints.minQuantity, current - step);
                this.updateQuantity(newValue);
            });
        }

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                const current = parseInt(quantityInput.value) || 100;
                const constraints = this.getProductConstraints();
                const step = this.productType === 'table-tents' ? 5 : 25;
                const newValue = Math.min(constraints.maxQuantity, current + step);
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

        // Only add the addToCart listener if we're NOT in edit mode
        if (addToCartBtn && !this.editMode) {
            addToCartBtn.addEventListener('click', () => {
                this.addToCart();
            });
        }

        if (requestQuoteBtn) {
            requestQuoteBtn.addEventListener('click', () => {
                this.requestQuote();
            });
        }

        // Apparel size input listeners
        if (this.productType === 'apparel') {
            const sizeInputs = document.querySelectorAll('.size-quantity');
            sizeInputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.updateApparelSizeBreakdown();
                    this.updateConfigurationSummary();
                    this.debouncedCalculation();
                });
            });
        }

        // Poster custom size listeners
        if (this.productType === 'posters') {
            const customWidthInput = document.getElementById('customWidth');
            const customHeightInput = document.getElementById('customHeight');
            
            if (customWidthInput && customHeightInput) {
                customWidthInput.addEventListener('input', () => {
                    this.updateCustomSizeDisplay();
                    this.validateCustomSize();
                    this.debouncedCalculation();
                });
                
                customHeightInput.addEventListener('input', () => {
                    this.updateCustomSizeDisplay();
                    this.validateCustomSize();
                    this.debouncedCalculation();
                });
            }
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

        // Handle poster-specific logic
        if (this.productType === 'posters') {
            if (option === 'size') {
                this.handlePosterSizeSelection(value);
            } else if (option === 'material') {
                this.updateMaterialConstraints(value);
            }
        }

        // For apparel products, also handle size breakdown updates
        if (this.productType === 'apparel') {
            this.updateApparelSizeBreakdown();
        }

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
            'type': 'magnetType',
            'turnaround': 'rushType',
            'coverPaper': 'coverPaperType',
            'textPaper': 'textPaperType',
            'pages': 'pages',
            'stickerType': 'stickerType',
            'garment': 'garmentType',
            'decoration': 'decorationType',
            'bagType': 'bagType'
        };
        return mapping[option] || option;
    }

    updateQuantity(newQuantity) {
        // Validate quantity range using product constraints
        const constraints = this.getProductConstraints();
        const quantity = Math.max(constraints.minQuantity, Math.min(constraints.maxQuantity, newQuantity));
        
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
        const constraints = this.getProductConstraints();
        
        if (isNaN(value) || value < constraints.minQuantity || value > constraints.maxQuantity) {
            const correctedValue = Math.max(constraints.minQuantity, Math.min(constraints.maxQuantity, value || constraints.minQuantity));
            this.updateQuantity(correctedValue);
        }
    }

    updateApparelSizeBreakdown() {
        // Only for apparel products
        if (this.productType !== 'apparel') return;
        
        const sizeInputs = document.querySelectorAll('.size-quantity');
        if (sizeInputs.length === 0) return;
        
        let totalQuantity = 0;
        const sizeBreakdown = {};
        
        sizeInputs.forEach(input => {
            const qty = parseInt(input.value) || 0;
            if (qty > 0) {
                const sizeName = input.name.replace('size', '');
                sizeBreakdown[sizeName] = qty;
                totalQuantity += qty;
            }
        });
        
        // Update configuration
        this.currentConfig.totalQuantity = totalQuantity;
        this.currentConfig.sizeBreakdown = sizeBreakdown;
        
        // Update display elements if they exist
        const totalQuantityDisplay = document.getElementById('totalQuantity');
        if (totalQuantityDisplay) {
            totalQuantityDisplay.textContent = totalQuantity;
        }
        
        // Update size breakdown summary display
        const sizeBreakdownSummary = document.getElementById('sizeBreakdownSummary');
        const sizeBreakdownDisplay = document.getElementById('sizeBreakdownDisplay');
        
        if (sizeBreakdownSummary && sizeBreakdownDisplay) {
            if (Object.keys(sizeBreakdown).length > 0) {
                sizeBreakdownSummary.style.display = 'block';
                const breakdownItems = Object.entries(sizeBreakdown).map(([size, qty]) => {
                    const isPremium = ['2XL', '3XL', '4XL', '5XL'].includes(size);
                    return `<span class="size-breakdown-item">${size}: ${qty}${isPremium ? ' (Premium)' : ''}</span>`;
                }).join(', ');
                sizeBreakdownDisplay.innerHTML = breakdownItems;
            } else {
                sizeBreakdownSummary.style.display = 'none';
            }
        }
    }


    updateConfigurationSummary() {
        const summaryMapping = {
            size: {
                '8.5x11': '8.5" × 11"',
                '11x17': '11" × 17"',
                '2x2': '2" × 2"',
                '3x3': '3" × 3"',
                '4x4': '4" × 4"',
                '5x5': '5" × 5"',
                // Poster sizes
                '18x24': '18" × 24"',
                '22x28': '22" × 28"',
                '24x36': '24" × 36"',
                '36x48': '36" × 48"',
                'custom': 'Custom Size'
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
                'SELF_COVER': 'Self Cover',
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
            magnetType: {
                'super-matte': 'Super Matte'
            },
            stickerType: {
                'kiss-cut-matte': 'Kiss Cut Matte',
                'kiss-cut-gloss': 'Kiss Cut Gloss'
            },
            garmentType: {
                'gildan-6400': 'T-shirts',
                'atc-f2700': 'Quarter Zip',
                'gildan-sf000': 'Crewneck',
                'gildan-sf500': 'Hoodie'
            },
            decorationType: {
                'dtf': 'DTF Printing',
                'screen-print': 'Screen Print'
            },
            bagType: {
                'canvas-tote': 'Canvas Tote'
            },
            material: {
                'RMPS002': 'Paper - 9mil Matte',
                'QMPFL501503': 'Fabric - 8mil Matte Coated'
            },
            rushType: {
                'standard': 'Standard (7-10 days)',
                '2-day': '2-Day Rush',
                'next-day': 'Next-Day Rush',
                'same-day': 'Same-Day Rush',
                'rush': 'Rush (3-5 days)'
            }
        };

        if (this.productType === 'booklets') {
            // Handle booklet-specific summary fields
            const summarySize = document.getElementById('summarySize');
            const summaryPages = document.getElementById('summaryPages');
            const summaryCoverPaper = document.getElementById('summaryCoverPaper');
            const summaryTextPaper = document.getElementById('summaryTextPaper');
            const summaryTurnaround = document.getElementById('summaryTurnaround');
            const summaryQuantity = document.getElementById('summaryQuantity');

            if (summarySize) summarySize.textContent = this.currentConfig.size;
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

            if (summarySize) {
                if (this.productType === 'apparel') {
                    summarySize.textContent = summaryMapping.garmentType[this.currentConfig.garmentType];
                } else if (this.productType === 'posters' && this.currentConfig.size === 'custom') {
                    // Show custom dimensions for posters
                    const width = this.currentConfig.customWidth || 0;
                    const height = this.currentConfig.customHeight || 0;
                    summarySize.textContent = `${width}" × ${height}"`;
                } else {
                    summarySize.textContent = summaryMapping.size[this.currentConfig.size];
                }
            }
            if (summaryFold) summaryFold.textContent = summaryMapping.foldType[this.currentConfig.foldType];
            
            // Handle poster material field separately
            if (this.productType === 'posters') {
                const summaryMaterial = document.getElementById('summaryMaterial');
                if (summaryMaterial) {
                    summaryMaterial.textContent = summaryMapping.material[this.currentConfig.material];
                }
            }
            
            // Handle paper/type/decoration depending on product
            if (summaryPaper) {
                if (this.productType === 'magnets') {
                    summaryPaper.textContent = summaryMapping.magnetType[this.currentConfig.magnetType];
                } else if (this.productType === 'stickers') {
                    summaryPaper.textContent = summaryMapping.stickerType[this.currentConfig.stickerType];
                } else if (this.productType === 'apparel') {
                    summaryPaper.textContent = summaryMapping.decorationType[this.currentConfig.decorationType];
                } else if (this.productType === 'tote-bags') {
                    summaryPaper.textContent = summaryMapping.bagType[this.currentConfig.bagType];
                } else {
                    summaryPaper.textContent = summaryMapping.paperType[this.currentConfig.paperType];
                }
            }
            
            if (summaryTurnaround) summaryTurnaround.textContent = summaryMapping.rushType[this.currentConfig.rushType];
            if (summaryQuantity) {
                if (this.productType === 'apparel') {
                    summaryQuantity.textContent = `${this.currentConfig.totalQuantity} pieces`;
                } else if (this.productType === 'posters') {
                    const qty = this.currentConfig.quantity;
                    summaryQuantity.textContent = `${qty} poster${qty === 1 ? '' : 's'}`;
                } else {
                    summaryQuantity.textContent = `${this.currentConfig.quantity} pieces`;
                }
            }
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
            
            
            if (result && result.totalCost && !result.error) {
                this.currentPricing = {
                    total: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    breakdown: {}
                };
                
                // Handle different pricing structures for promotional vs standard products
                if (['magnets', 'stickers', 'apparel', 'tote-bags'].includes(this.productType)) {
                    // Promotional product breakdown
                    this.currentPricing.breakdown = {
                        supplierCost: parseFloat(result.supplierCost || 0),
                        priceAfterMarkup: parseFloat(result.priceAfterMarkup || result.totalCost),
                        setupFee: parseFloat(result.setupFee || 0),
                        subtotal: parseFloat(result.subtotal || result.priceAfterMarkup || result.totalCost),
                        rushMultiplier: result.rushMultiplier || 1.0,
                        // Store composite cost components for apparel and tote bags
                        garmentSubtotal: parseFloat(result.garmentSubtotal || 0),
                        printingSubtotal: parseFloat(result.printingSubtotal || 0),
                        bagCost: parseFloat(result.bagCost || 0),
                        printingCost: parseFloat(result.printingCost || 0),
                        // Map promotional properties to standard names for compatibility
                        printingSetupCost: parseFloat(result.setupFee || 0),
                        materialCost: parseFloat(result.supplierCost || result.bagCost || 0),
                        productionCost: parseFloat(result.printingCost || 0)
                    };
                } else {
                    // Standard product breakdown  
                    this.currentPricing.breakdown = {
                        setupFee: parseFloat(result.printingSetupCost || 0),
                        finishingSetupFee: result.needsFinishing ? parseFloat(result.finishingSetupCost) : 0,
                        productionCost: parseFloat(result.productionCost || 0),
                        materialCost: parseFloat(result.materialCost || 0),
                        finishingCost: parseFloat(result.finishingCost || 0),
                        subtotal: parseFloat(result.subtotal || 0),
                        rushMultiplier: result.rushMultiplier || 1.0,
                        sheetsRequired: result.sheetsRequired || 0
                    };
                }
                
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
        
        // Create FormData object with appropriate parameters for each product type
        const formData = new FormData();
        formData.append('quantity', config.quantity);
        formData.append('rushType', config.rushType);
        
        if (this.productType === 'booklets') {
            // Booklet-specific fields
            formData.append('size', config.size);
            formData.append('pages', config.pages);
            formData.append('coverPaperType', config.coverPaperType);
            formData.append('textPaperType', config.textPaperType);
        } else if (this.productType === 'magnets') {
            // Magnet-specific fields
            formData.append('size', config.size);
            formData.append('magnetType', config.magnetType);
        } else if (this.productType === 'stickers') {
            // Sticker-specific fields
            formData.append('size', config.size);
            formData.append('stickerType', config.stickerType);
        } else if (this.productType === 'apparel') {
            // Apparel-specific fields
            formData.append('garmentType', config.garmentType);
            formData.append('decorationType', config.decorationType);
            formData.append('totalQuantity', config.totalQuantity);
            // Size breakdown handled separately
            Object.entries(config.sizeBreakdown).forEach(([size, qty]) => {
                if (qty > 0) {
                    formData.append(`size${size}`, qty);
                }
            });
        } else if (this.productType === 'tote-bags') {
            // Tote bag-specific fields
            formData.append('size', config.size);
            formData.append('bagType', config.bagType);
            formData.append('decorationType', config.decorationType);
        } else if (this.productType === 'posters') {
            // Poster-specific fields
            formData.append('size', config.size);
            formData.append('material', config.material);
            
            // Add custom dimensions if custom size is selected
            if (config.size === 'custom') {
                formData.append('customWidth', config.customWidth || 0);
                formData.append('customHeight', config.customHeight || 0);
            }
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
        if (this.productType === 'magnets' || this.productType === 'stickers') {
            // Single supplier cost breakdown for magnets and stickers
            const redSupplierCost = document.getElementById('redSupplierCost');
            const redMarkupCost = document.getElementById('redMarkupCost');
            const redSubtotal = document.getElementById('redSubtotal');

            if (redSupplierCost) redSupplierCost.textContent = `$${(breakdown.supplierCost || 0).toFixed(2)}`;
            if (redMarkupCost) redMarkupCost.textContent = `$${((breakdown.priceAfterMarkup || 0) - (breakdown.supplierCost || 0)).toFixed(2)}`;
            if (redSubtotal) redSubtotal.textContent = `$${(breakdown.priceAfterMarkup || 0).toFixed(2)}`;
        } else if (this.productType === 'apparel') {
            // Two-line breakdown for apparel: garment + printing
            const redStockCost = document.getElementById('redStockCost');
            const redPrintingCost = document.getElementById('redPrintingCost');
            const redSubtotal = document.getElementById('redSubtotal');

            if (redStockCost) redStockCost.textContent = `$${(breakdown.garmentSubtotal || 0).toFixed(2)}`;
            if (redPrintingCost) redPrintingCost.textContent = `$${(breakdown.printingSubtotal || 0).toFixed(2)}`;
            if (redSubtotal) redSubtotal.textContent = `$${(breakdown.subtotal || 0).toFixed(2)}`;
        } else if (this.productType === 'tote-bags') {
            // Two-line breakdown for tote bags: bag + printing
            const redStockCost = document.getElementById('redStockCost');
            const redPrintingCost = document.getElementById('redPrintingCost');
            const redSubtotal = document.getElementById('redSubtotal');

            if (redStockCost) redStockCost.textContent = `$${(breakdown.bagCost || 0).toFixed(2)}`;
            if (redPrintingCost) redPrintingCost.textContent = `$${(breakdown.printingCost || 0).toFixed(2)}`;
            if (redSubtotal) redSubtotal.textContent = `$${(breakdown.subtotal || 0).toFixed(2)}`;
        } else {
            // Standard product red cell breakdown
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
        }

        // Show/hide rush multiplier
        const redRushMultiplier = document.getElementById('redRushMultiplier');
        const redRushMultiplierItem = document.getElementById('redRushMultiplierItem');
        
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
                formData.append('size', this.currentConfig.size);
                formData.append('pages', this.currentConfig.pages);
                formData.append('coverPaperType', this.currentConfig.coverPaperType);
                formData.append('textPaperType', this.currentConfig.textPaperType);
            } else if (this.productType === 'magnets') {
                // Magnet-specific fields
                formData.append('size', this.currentConfig.size);
                formData.append('magnetType', this.currentConfig.magnetType);
            } else if (this.productType === 'stickers') {
                // Sticker-specific fields
                formData.append('size', this.currentConfig.size);
                formData.append('stickerType', this.currentConfig.stickerType);
            } else if (this.productType === 'apparel') {
                // Apparel-specific fields
                formData.append('garmentType', this.currentConfig.garmentType);
                formData.append('decorationType', this.currentConfig.decorationType);
                formData.append('totalQuantity', this.currentConfig.totalQuantity);
                // Size breakdown handled separately
                Object.entries(this.currentConfig.sizeBreakdown).forEach(([size, qty]) => {
                    if (qty > 0) {
                        formData.append(`size${size}`, qty);
                    }
                });
            } else if (this.productType === 'tote-bags') {
                // Tote bag-specific fields
                formData.append('size', this.currentConfig.size);
                formData.append('bagType', this.currentConfig.bagType);
                formData.append('decorationType', this.currentConfig.decorationType);
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
                sheetsRequired: this.currentPricing.breakdown.sheetsRequired || 0,
                printingSetupCost: this.currentPricing.breakdown.setupFee || this.currentPricing.breakdown.printingSetupCost || 0,
                finishingSetupCost: this.currentPricing.breakdown.finishingSetupFee || 0,
                productionCost: this.currentPricing.breakdown.productionCost || 0,
                materialCost: this.currentPricing.breakdown.materialCost || 0,
                finishingCost: this.currentPricing.breakdown.finishingCost || 0,
                subtotal: this.currentPricing.breakdown.subtotal || 0,
                rushMultiplier: this.currentPricing.breakdown.rushMultiplier || 1.0
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
            'name-tags': 'Name Tags',
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

    // Poster-specific methods
    handlePosterSizeSelection(sizeValue) {
        const customSizeInputs = document.getElementById('customSizeInputs');
        
        if (sizeValue === 'custom') {
            // Show custom size inputs
            if (customSizeInputs) {
                customSizeInputs.style.display = 'block';
                // Initialize with default values if empty
                const widthInput = document.getElementById('customWidth');
                const heightInput = document.getElementById('customHeight');
                if (widthInput && !widthInput.value) widthInput.value = '24';
                if (heightInput && !heightInput.value) heightInput.value = '18';
                this.updateCustomSizeDisplay();
                this.validateCustomSize();
            }
        } else {
            // Hide custom size inputs
            if (customSizeInputs) {
                customSizeInputs.style.display = 'none';
            }
        }
    }

    updateMaterialConstraints(materialValue) {
        const widthInput = document.getElementById('customWidth');
        const widthConstraint = document.getElementById('widthConstraint');
        
        if (widthInput && widthConstraint) {
            let maxWidth;
            let materialName;
            
            if (materialValue === 'RMPS002') {
                maxWidth = 52;
                materialName = 'paper';
            } else if (materialValue === 'QMPFL501503') {
                maxWidth = 48;
                materialName = 'fabric';
            } else {
                maxWidth = 52; // default
                materialName = 'material';
            }
            
            // Update input max attribute
            widthInput.max = maxWidth;
            
            // Update constraint text
            widthConstraint.textContent = `Max: ${maxWidth}" (${materialName})`;
            
            // Validate current width against new constraint
            const currentWidth = parseFloat(widthInput.value);
            if (currentWidth > maxWidth) {
                widthInput.value = maxWidth;
                this.updateCustomSizeDisplay();
                this.showValidationMessage(`Width adjusted to ${maxWidth}" maximum for ${materialName}`, 'warning');
            }
            
            this.validateCustomSize();
        }
    }

    updateCustomSizeDisplay() {
        const widthInput = document.getElementById('customWidth');
        const heightInput = document.getElementById('customHeight');
        const sizeDisplay = document.getElementById('customSizeDisplay');
        const sqftDisplay = document.getElementById('customSqftDisplay');
        
        if (widthInput && heightInput && sizeDisplay && sqftDisplay) {
            const width = parseFloat(widthInput.value) || 0;
            const height = parseFloat(heightInput.value) || 0;
            
            // Update size display
            sizeDisplay.textContent = `${width}"W × ${height}"H`;
            
            // Calculate and display square footage
            const sqft = (width * height) / 144; // Convert square inches to square feet
            sqftDisplay.textContent = `${sqft.toFixed(1)} sq ft`;
            
            // Update current config for pricing calculation
            if (this.currentConfig.size === 'custom') {
                this.currentConfig.customWidth = width;
                this.currentConfig.customHeight = height;
                this.currentConfig.customSqft = sqft;
            }
        }
    }

    validateCustomSize() {
        const widthInput = document.getElementById('customWidth');
        const heightInput = document.getElementById('customHeight');
        
        if (!widthInput || !heightInput) return;
        
        const width = parseFloat(widthInput.value);
        const height = parseFloat(heightInput.value);
        const material = this.currentConfig.material || 'RMPS002';
        
        let errors = [];
        
        // Width validation based on material
        const maxWidth = material === 'QMPFL501503' ? 48 : 52;
        if (width < 6) {
            errors.push('Width must be at least 6 inches');
        } else if (width > maxWidth) {
            errors.push(`Width cannot exceed ${maxWidth} inches for this material`);
        }
        
        // Height validation
        if (height < 6) {
            errors.push('Height must be at least 6 inches');
        } else if (height > 120) {
            errors.push('Height cannot exceed 120 inches');
        }
        
        // Area validation (optional, for practical limits)
        const sqft = (width * height) / 144;
        if (sqft > 50) {
            errors.push('Total area cannot exceed 50 square feet');
        }
        
        if (errors.length > 0) {
            this.showValidationMessage(errors.join('. '), 'error');
            return false;
        } else {
            this.hideValidationMessage();
            return true;
        }
    }

    showValidationMessage(message, type = 'error') {
        const validationDiv = document.getElementById('customSizeValidation');
        if (validationDiv) {
            validationDiv.textContent = message;
            validationDiv.className = `validation-message ${type}`;
            validationDiv.style.display = 'block';
        }
    }

    hideValidationMessage() {
        const validationDiv = document.getElementById('customSizeValidation');
        if (validationDiv) {
            validationDiv.style.display = 'none';
        }
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips for help buttons
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Product-specific field population methods
    populateBrochureFields(config) {
        if (config.size) {
            const sizeCards = document.querySelectorAll('.size-card[data-size]');
            sizeCards.forEach(card => {
                if (card.dataset.size === config.size) {
                    card.click();
                }
            });
        }
        
        if (config.foldType) {
            const foldCards = document.querySelectorAll('.fold-card[data-fold]');
            foldCards.forEach(card => {
                if (card.dataset.fold === config.foldType) {
                    card.click();
                }
            });
        }
        
        if (config.paperType) {
            const paperCards = document.querySelectorAll('.paper-card[data-paper]');
            paperCards.forEach(card => {
                if (card.dataset.paper === config.paperType) {
                    card.click();
                }
            });
        }
    }
    
    populatePostcardFields(config) {
        if (config.size) {
            const sizeCards = document.querySelectorAll('.size-card[data-size]');
            sizeCards.forEach(card => {
                if (card.dataset.size === config.size) {
                    card.click();
                }
            });
        }
        
        if (config.paperType) {
            const paperCards = document.querySelectorAll('.paper-card[data-paper]');
            paperCards.forEach(card => {
                if (card.dataset.paper === config.paperType) {
                    card.click();
                }
            });
        }
    }
    
    populateFlyerFields(config) {
        // Similar to postcards
        this.populatePostcardFields(config);
    }
    
    populateBookmarkFields(config) {
        // Similar to postcards
        this.populatePostcardFields(config);
    }
    
    populateBookletFields(config) {
        // Handle size selection
        if (config.size) {
            const sizeCards = document.querySelectorAll('[data-option="size"]');
            sizeCards.forEach(card => {
                if (card.dataset.value === config.size) {
                    card.click();
                }
            });
        }
        
        if (config.pages) {
            const pagesInput = document.getElementById('pages');
            if (pagesInput) {
                pagesInput.value = config.pages;
            }
        }
        
        if (config.coverPaper) {
            const coverPaperCards = document.querySelectorAll('.cover-paper-card[data-paper]');
            coverPaperCards.forEach(card => {
                if (card.dataset.paper === config.coverPaper) {
                    card.click();
                }
            });
        }
        
        if (config.interiorPaper) {
            const interiorPaperCards = document.querySelectorAll('.interior-paper-card[data-paper]');
            interiorPaperCards.forEach(card => {
                if (card.dataset.paper === config.interiorPaper) {
                    card.click();
                }
            });
        }
    }
    
    populateNotebookFields(config) {
        if (config.pages) {
            const pagesCards = document.querySelectorAll('.pages-card[data-pages]');
            pagesCards.forEach(card => {
                if (card.dataset.pages === config.pages.toString()) {
                    card.click();
                }
            });
        }
        
        if (config.bindingType) {
            const bindingCards = document.querySelectorAll('.binding-card[data-binding]');
            bindingCards.forEach(card => {
                if (card.dataset.binding === config.bindingType) {
                    card.click();
                }
            });
        }
        
        if (config.coverPaper) {
            const coverPaperCards = document.querySelectorAll('.cover-paper-card[data-paper]');
            coverPaperCards.forEach(card => {
                if (card.dataset.paper === config.coverPaper) {
                    card.click();
                }
            });
        }
        
        if (config.interiorPaper) {
            const interiorPaperCards = document.querySelectorAll('.interior-paper-card[data-paper]');
            interiorPaperCards.forEach(card => {
                if (card.dataset.paper === config.interiorPaper) {
                    card.click();
                }
            });
        }
    }
    
    populateNotepadFields(config) {
        if (config.sheets) {
            const sheetsCards = document.querySelectorAll('.sheets-card[data-sheets]');
            sheetsCards.forEach(card => {
                if (card.dataset.sheets === config.sheets.toString()) {
                    card.click();
                }
            });
        }
        
        if (config.contentType) {
            const contentCards = document.querySelectorAll('.content-card[data-content]');
            contentCards.forEach(card => {
                if (card.dataset.content === config.contentType) {
                    card.click();
                }
            });
        }
        
        if (config.paperType) {
            const paperCards = document.querySelectorAll('.paper-card[data-paper]');
            paperCards.forEach(card => {
                if (card.dataset.paper === config.paperType) {
                    card.click();
                }
            });
        }
        
        if (config.backingPaper) {
            const backingCards = document.querySelectorAll('.backing-card[data-backing]');
            backingCards.forEach(card => {
                if (card.dataset.backing === config.backingPaper) {
                    card.click();
                }
            });
        }
    }
    
    populateNameTagFields(config) {
        if (config.size) {
            const sizeCards = document.querySelectorAll('.size-card[data-size]');
            sizeCards.forEach(card => {
                if (card.dataset.size === config.size) {
                    card.click();
                }
            });
        }
        
        if (config.paperType) {
            const paperCards = document.querySelectorAll('.paper-card[data-paper]');
            paperCards.forEach(card => {
                if (card.dataset.paper === config.paperType) {
                    card.click();
                }
            });
        }
        
        if (config.finishing) {
            const finishingCards = document.querySelectorAll('.finishing-card[data-finishing]');
            finishingCards.forEach(card => {
                if (card.dataset.finishing === config.finishing) {
                    card.click();
                }
            });
        }
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