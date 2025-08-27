/**
 * Universal Configurator - Dynamic form management for all products
 * Handles product type switching, imposition calculations, and pricing
 */

class UniversalConfigurator {
    constructor() {
        this.impositionCalc = new ImpositionCalculator();
        this.currentConfig = {
            productType: '',
            customWidth: 0,
            customHeight: 0,
            textPaper: '',
            coverPaper: '',
            specialtyStock: '',
            quantity: 0,
            rushType: 'standard'
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

    init() {
        this.populatePaperOptions();
        this.bindEvents();
        this.updateCartBadge();
    }

    populatePaperOptions() {
        const textSelect = document.getElementById('textPaper');
        const coverSelect = document.getElementById('coverPaper');
        const specialtySelect = document.getElementById('specialtyStock');
        
        // Add null checks
        if (!textSelect || !coverSelect || !specialtySelect) {
            console.error('Paper select elements not found');
            return;
        }
        
        // Check if paperStocks exists
        if (typeof paperStocks === 'undefined') {
            console.error('paperStocks not loaded');
            setTimeout(() => {
                this.populatePaperOptions(); // Retry after a delay
            }, 500);
            return;
        }
        
        // Clear existing options
        textSelect.innerHTML = '<option value="">Select text paper...</option>';
        coverSelect.innerHTML = '<option value="">Select cover paper...</option>';
        specialtySelect.innerHTML = '<option value="">No specialty stock...</option>';
        
        try {
            // Populate from paperStocks.js
            Object.entries(paperStocks).forEach(([code, paper]) => {
                if (!paper || typeof paper.costPerSheet === 'undefined') {
                    console.warn(`Invalid paper data for ${code}:`, paper);
                    return;
                }
                
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${paper.displayName} - $${paper.costPerSheet.toFixed(3)}/sheet`;
                
                if (paper.type === 'text_stock') {
                    textSelect.appendChild(option);
                } else if (paper.type === 'cover_stock') {
                    coverSelect.appendChild(option);
                } else if (paper.type === 'adhesive_stock') {
                    specialtySelect.appendChild(option);
                }
            });
            console.log('Paper options populated successfully');
        } catch (error) {
            console.error('Error populating paper options:', error);
        }
    }

    bindEvents() {
        // Product type selection
        document.getElementById('productType').addEventListener('change', (e) => {
            this.handleProductTypeChange(e.target.value);
        });

        // Dimension inputs
        document.getElementById('customWidth').addEventListener('input', (e) => {
            this.handleDimensionChange();
        });
        
        document.getElementById('customHeight').addEventListener('input', (e) => {
            this.handleDimensionChange();
        });

        // Paper selections
        document.getElementById('textPaper').addEventListener('change', (e) => {
            this.currentConfig.textPaper = e.target.value;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });
        
        document.getElementById('coverPaper').addEventListener('change', (e) => {
            this.currentConfig.coverPaper = e.target.value;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });
        
        document.getElementById('specialtyStock').addEventListener('change', (e) => {
            this.currentConfig.specialtyStock = e.target.value;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });

        // Quantity input
        document.getElementById('quantity').addEventListener('input', (e) => {
            this.currentConfig.quantity = parseInt(e.target.value) || 0;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });

        // Turnaround options
        document.querySelectorAll('input[name="rushType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentConfig.rushType = e.target.value;
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        });

        // Option cards (turnaround)
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const option = card.dataset.option;
                const value = card.dataset.value;
                
                if (option === 'turnaround') {
                    // Remove selected class from siblings
                    card.parentNode.querySelectorAll('.option-card').forEach(c => 
                        c.classList.remove('selected'));
                    
                    // Add selected class to clicked card
                    card.classList.add('selected');
                    
                    // Update radio button
                    const radio = card.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        this.currentConfig.rushType = value;
                        this.updateConfiguration();
                        this.debouncedPriceCalculation();
                    }
                }
            });
        });

        // Add to cart button
        document.getElementById('addToCartBtn').addEventListener('click', () => {
            this.addToCart();
        });
    }

    handleProductTypeChange(productType) {
        console.log('Product type changed to:', productType);
        this.currentConfig.productType = productType;
        
        // Show/hide relevant sections
        const sections = ['dimensionsSection', 'paperSection', 'quantitySection', 'turnaroundSection'];
        const specificOptionsSection = document.getElementById('specificOptionsSection');
        
        if (!productType) {
            console.log('No product type selected, hiding all sections');
            // Hide all sections if no product selected
            sections.forEach(sectionId => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.style.display = 'none';
                } else {
                    console.warn(`Section element not found: ${sectionId}`);
                }
            });
            if (specificOptionsSection) {
                specificOptionsSection.style.display = 'none';
            }
            this.hideImpositionInfo();
            return;
        }
        
        console.log('Showing sections for product type:', productType);
        
        // Show common sections for most products
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.style.display = 'block';
                console.log(`Showing section: ${sectionId}`);
            } else {
                console.error(`Section element not found: ${sectionId}`);
            }
        });
        
        // Handle product-specific requirements
        this.setupProductSpecificOptions(productType);
        
        // Update current product display
        document.getElementById('currentProduct').textContent = this.getProductDisplayName(productType);
        
        // Clear current configuration except product type
        this.resetConfiguration();
        
        // Update configuration display
        this.updateConfiguration();
    }

    setupProductSpecificOptions(productType) {
        const specificSection = document.getElementById('specificOptionsSection');
        const optionsContent = document.getElementById('specificOptionsContent');
        const optionsTitle = document.getElementById('specificOptionsTitle');
        
        // Clear previous options
        optionsContent.innerHTML = '';
        
        switch (productType) {
            case 'brochures':
                optionsTitle.textContent = 'Folding Options';
                optionsContent.innerHTML = this.createFoldingOptions();
                specificSection.style.display = 'block';
                break;
                
            case 'booklets':
                optionsTitle.textContent = 'Booklet Options';
                optionsContent.innerHTML = this.createBookletOptions();
                specificSection.style.display = 'block';
                break;
                
            case 'notebooks':
                optionsTitle.textContent = 'Binding Options';
                optionsContent.innerHTML = this.createBindingOptions();
                specificSection.style.display = 'block';
                break;
                
            case 'notepads':
                optionsTitle.textContent = 'Pad Options';
                optionsContent.innerHTML = this.createNotepadOptions();
                specificSection.style.display = 'block';
                break;
                
            case 'posters':
                optionsTitle.textContent = 'Material Options';
                optionsContent.innerHTML = this.createPosterMaterialOptions();
                specificSection.style.display = 'block';
                // Hide standard paper section for posters
                document.getElementById('paperSection').style.display = 'none';
                break;
                
            case 'magnets':
            case 'stickers':
            case 'apparel':
            case 'tote-bags':
                // Promotional products - redirect to existing pages or show notice
                specificSection.style.display = 'block';
                optionsTitle.textContent = 'Notice';
                optionsContent.innerHTML = `
                    <div class="alert alert-info">
                        <strong>Promotional Products:</strong> ${this.getProductDisplayName(productType)} have unique configurations. 
                        Please use the dedicated <a href="${productType}.html" class="alert-link">${this.getProductDisplayName(productType)} page</a> for detailed options.
                    </div>
                `;
                // Hide standard sections for promo products
                document.getElementById('dimensionsSection').style.display = 'none';
                document.getElementById('paperSection').style.display = 'none';
                break;
                
            default:
                specificSection.style.display = 'none';
        }
    }

    createFoldingOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Folding Type</label>
                <select class="form-select" id="foldType" name="foldType">
                    <option value="none">No Folding</option>
                    <option value="bifold">Bi-Fold (2 panels)</option>
                    <option value="trifold">Tri-Fold (3 panels)</option>
                </select>
            </div>
        `;
    }

    createBookletOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Number of Pages</label>
                <select class="form-select" id="pages" name="pages">
                    ${Array.from({length: 11}, (_, i) => {
                        const pages = (i + 2) * 4; // 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48
                        return `<option value="${pages}">${pages} pages</option>`;
                    }).join('')}
                </select>
                <small class="form-text text-muted">Pages must be in multiples of 4</small>
            </div>
            <div class="form-group mt-3">
                <label class="form-label">Paper Selection</label>
                <div class="alert alert-info">
                    <small>Select both cover and text paper above. Cover paper will be used for covers, text paper for interior pages.</small>
                </div>
            </div>
        `;
    }

    createBindingOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Binding Type</label>
                <select class="form-select" id="bindingType" name="bindingType">
                    <option value="coil">Plastic Coil Binding</option>
                    <option value="wire-o">Wire-O Binding</option>
                    <option value="perfect">Perfect Binding</option>
                </select>
            </div>
            <div class="form-group mt-3">
                <label class="form-label">Number of Pages</label>
                <select class="form-select" id="notebookPages" name="notebookPages">
                    <option value="50">50 pages</option>
                    <option value="100">100 pages</option>
                </select>
            </div>
        `;
    }

    createNotepadOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Sheets per Pad</label>
                <select class="form-select" id="sheetsPerPad" name="sheetsPerPad">
                    <option value="25">25 sheets</option>
                    <option value="50">50 sheets</option>
                    <option value="75">75 sheets</option>
                    <option value="100">100 sheets</option>
                </select>
            </div>
            <div class="form-group mt-3">
                <label class="form-label">Content Type</label>
                <select class="form-select" id="contentType" name="contentType">
                    <option value="blank">Blank (No setup fee)</option>
                    <option value="lined">Lined ($15 setup)</option>
                    <option value="custom">Custom Design ($30 setup)</option>
                </select>
            </div>
        `;
    }

    createPosterMaterialOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Material Type</label>
                <select class="form-select" id="posterMaterial" name="posterMaterial">
                    <option value="RMPS002">Rite-Media Paper - $6.00/sqft</option>
                    <option value="RMFAB001">Fabric Material - $9.00/sqft</option>
                </select>
            </div>
            <div class="alert alert-info mt-3">
                <small><strong>Note:</strong> Posters are priced per square foot, not by imposition. Price = Width × Height × Material Cost</small>
            </div>
        `;
    }

    handleDimensionChange() {
        const width = parseFloat(document.getElementById('customWidth').value) || 0;
        const height = parseFloat(document.getElementById('customHeight').value) || 0;
        
        this.currentConfig.customWidth = width;
        this.currentConfig.customHeight = height;
        
        if (width > 0 && height > 0) {
            this.updateImpositionDisplay(width, height);
        } else {
            this.hideImpositionInfo();
        }
        
        this.updateConfiguration();
        this.debouncedPriceCalculation();
    }

    updateImpositionDisplay(width, height) {
        // Skip imposition display for posters (they use square footage)
        if (this.currentConfig.productType === 'posters') {
            this.showPosterAreaInfo(width, height);
            return;
        }
        
        const impositionData = this.impositionCalc.calculateImposition(width, height);
        
        if (impositionData.error) {
            this.showImpositionError(impositionData.error);
            return;
        }
        
        const efficiencyRating = this.impositionCalc.getEfficiencyRating(impositionData.efficiency);
        
        // Update displays
        document.getElementById('currentImposition').textContent = `${impositionData.copies} per sheet`;
        document.getElementById('efficiencyRating').innerHTML = `
            <span class="rating-icon">${efficiencyRating.icon}</span>
            <span class="rating-text">${efficiencyRating.message}</span>
            <span class="rating-percentage">${impositionData.efficiency}%</span>
        `;
        document.getElementById('efficiencyRating').style.color = efficiencyRating.color;
        
        document.getElementById('impositionDetails').textContent = 
            `${impositionData.copies} copies per 12.48×18.26" sheet (${impositionData.orientation})`;
        document.getElementById('bleedInfo').textContent = 
            `With bleed: ${this.impositionCalc.formatDimensions(impositionData.bleedWidth, impositionData.bleedHeight)}`;
        
        document.getElementById('impositionInfo').style.display = 'block';
    }

    showPosterAreaInfo(width, height) {
        const squareFeet = (width * height) / 144;
        const formattedSqFt = Math.round(squareFeet * 100) / 100;
        
        document.getElementById('currentImposition').textContent = `${formattedSqFt} sq ft`;
        document.getElementById('efficiencyRating').innerHTML = `
            <span class="rating-icon">📐</span>
            <span class="rating-text">Square footage pricing</span>
            <span class="rating-percentage">${formattedSqFt} sq ft</span>
        `;
        document.getElementById('efficiencyRating').style.color = '#17a2b8';
        
        document.getElementById('impositionDetails').textContent = 
            `${this.impositionCalc.formatDimensions(width, height)} = ${formattedSqFt} square feet`;
        document.getElementById('bleedInfo').textContent = 
            `Large format pricing based on area`;
        
        document.getElementById('impositionInfo').style.display = 'block';
    }

    showImpositionError(error) {
        document.getElementById('currentImposition').textContent = 'Size Error';
        document.getElementById('efficiencyRating').innerHTML = `
            <span class="rating-icon">❌</span>
            <span class="rating-text">${error}</span>
            <span class="rating-percentage">0%</span>
        `;
        document.getElementById('efficiencyRating').style.color = '#dc3545';
        
        document.getElementById('impositionDetails').textContent = 'Please adjust dimensions';
        document.getElementById('bleedInfo').textContent = 'Maximum: 12.23" × 18.01" (HP Indigo limit)';
        
        document.getElementById('impositionInfo').style.display = 'block';
    }

    hideImpositionInfo() {
        document.getElementById('impositionInfo').style.display = 'none';
        document.getElementById('currentImposition').textContent = '-';
    }

    updateConfiguration() {
        // Update all summary display elements
        document.getElementById('currentSize').textContent = 
            this.currentConfig.customWidth > 0 && this.currentConfig.customHeight > 0 
                ? this.impositionCalc.formatDimensions(this.currentConfig.customWidth, this.currentConfig.customHeight)
                : '-';
                
        // Update paper display - priority: specialty > text/cover
        let paperDisplay = '-';
        if (this.currentConfig.specialtyStock) {
            paperDisplay = paperStocks[this.currentConfig.specialtyStock].displayName;
        } else if (this.currentConfig.textPaper && this.currentConfig.coverPaper) {
            const textPaper = paperStocks[this.currentConfig.textPaper];
            const coverPaper = paperStocks[this.currentConfig.coverPaper];
            paperDisplay = `${textPaper.displayName} / ${coverPaper.displayName}`;
        } else if (this.currentConfig.textPaper) {
            paperDisplay = paperStocks[this.currentConfig.textPaper].displayName;
        } else if (this.currentConfig.coverPaper) {
            paperDisplay = paperStocks[this.currentConfig.coverPaper].displayName;
        }
        document.getElementById('currentPaper').textContent = paperDisplay;
        
        document.getElementById('currentQuantity').textContent = 
            this.currentConfig.quantity > 0 ? this.currentConfig.quantity.toLocaleString() : '-';
        
        document.getElementById('currentTurnaround').textContent = 
            this.getTurnaroundDisplayName(this.currentConfig.rushType);
    }

    debouncedPriceCalculation() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.calculatePricing();
        }, 300);
    }

    async calculatePricing() {
        if (this.isCalculating) return;
        
        // Validate required fields - specialty stock can replace text/cover paper
        if (!this.currentConfig.productType || 
            !this.currentConfig.customWidth || 
            !this.currentConfig.customHeight || 
            !this.currentConfig.quantity ||
            (!this.currentConfig.specialtyStock && !this.currentConfig.textPaper && !this.currentConfig.coverPaper)) {
            
            this.resetPricingDisplay();
            return;
        }
        
        this.isCalculating = true;
        
        try {
            // Create form data for existing calculator functions
            const formData = new FormData();
            formData.append('productType', this.currentConfig.productType);
            formData.append('customWidth', this.currentConfig.customWidth);
            formData.append('customHeight', this.currentConfig.customHeight);
            formData.append('quantity', this.currentConfig.quantity);
            formData.append('rushType', this.currentConfig.rushType);
            
            // Add paper selections
            if (this.currentConfig.textPaper) {
                formData.append('paperType', this.currentConfig.textPaper);
                formData.append('textPaper', this.currentConfig.textPaper);
            }
            if (this.currentConfig.coverPaper) {
                formData.append('coverPaper', this.currentConfig.coverPaper);
            }
            if (this.currentConfig.specialtyStock) {
                formData.append('specialtyStock', this.currentConfig.specialtyStock);
            }
            
            // Add product-specific options
            const specificOptions = this.getProductSpecificFormData();
            specificOptions.forEach(([key, value]) => {
                formData.append(key, value);
            });
            
            // Calculate pricing based on product type
            const pricing = await this.calculateUniversalPrice(formData);
            
            if (pricing.error) {
                this.showPricingError(pricing.error);
            } else {
                this.updatePricingDisplay(pricing);
            }
            
        } catch (error) {
            console.error('Pricing calculation error:', error);
            this.showPricingError('Unable to calculate pricing. Please check your configuration.');
        } finally {
            this.isCalculating = false;
        }
    }

    getProductSpecificFormData() {
        const formData = [];
        const productType = this.currentConfig.productType;
        
        // Add product-specific form data
        if (productType === 'brochures') {
            const foldType = document.getElementById('foldType')?.value || 'none';
            formData.push(['foldType', foldType]);
        } else if (productType === 'booklets') {
            const pages = document.getElementById('pages')?.value || '8';
            formData.push(['pages', pages]);
        } else if (productType === 'notebooks') {
            const bindingType = document.getElementById('bindingType')?.value || 'coil';
            const notebookPages = document.getElementById('notebookPages')?.value || '50';
            formData.push(['bindingType', bindingType]);
            formData.push(['pages', notebookPages]);
        } else if (productType === 'notepads') {
            const sheetsPerPad = document.getElementById('sheetsPerPad')?.value || '50';
            const contentType = document.getElementById('contentType')?.value || 'blank';
            formData.push(['sheetsPerPad', sheetsPerPad]);
            formData.push(['contentType', contentType]);
        } else if (productType === 'posters') {
            const posterMaterial = document.getElementById('posterMaterial')?.value || 'RMPS002';
            formData.push(['material', posterMaterial]);
        }
        
        return formData;
    }

    async calculateUniversalPrice(formData) {
        // Create custom pricing calculation for universal configurator
        const productType = formData.get('productType');
        const width = parseFloat(formData.get('customWidth'));
        const height = parseFloat(formData.get('customHeight'));
        const quantity = parseInt(formData.get('quantity'));
        const rushType = formData.get('rushType') || 'standard';
        
        // For posters, use square footage pricing
        if (productType === 'posters') {
            return this.calculatePosterPricing(width, height, quantity, rushType, formData);
        }
        
        // For brochures, use the original calculator for perfect consistency
        if (productType === 'brochures') {
            const brochureFormData = new FormData();
            
            // Map dimensions to standard brochure sizes
            if (width <= 9 && height <= 12) {
                brochureFormData.append('size', '8.5x11');
            } else if (width <= 9 && height <= 14.5) {
                brochureFormData.append('size', '8.5x14');
            } else {
                brochureFormData.append('size', '11x17');
            }
            
            brochureFormData.append('quantity', quantity);
            brochureFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
            brochureFormData.append('foldType', formData.get('foldType') || 'none');
            brochureFormData.append('rushType', rushType);
            
            // Call the original brochure calculator
            if (typeof calculateBrochurePrice === 'function') {
                const result = await calculateBrochurePrice(brochureFormData);
                if (result.error) {
                    return { error: result.error };
                }
                
                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    printingSetupCost: result.printingSetupCost,
                    finishingSetupCost: result.finishingSetupCost,
                    productionCost: result.productionCost,
                    materialCost: result.materialCost,
                    finishingCost: result.finishingCost,
                    subtotal: result.subtotal,
                    rushMultiplier: result.rushMultiplier,
                    sheetsRequired: result.sheetsRequired
                };
            }
        }
        
        // For name tags, use the original calculator for perfect consistency
        if (productType === 'name-tags') {
            const nameTagFormData = new FormData();
            
            // Map dimensions to standard name tag sizes
            if (width <= 2.5 && height <= 3.5) {
                nameTagFormData.append('size', '2.33x3');
            } else if (width <= 3.5 && height <= 4.5) {
                nameTagFormData.append('size', '3x4');
            } else {
                nameTagFormData.append('size', '4x6');
            }
            
            nameTagFormData.append('quantity', quantity);
            nameTagFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
            nameTagFormData.append('holePunch', formData.get('holePunch') || 'false');
            nameTagFormData.append('lanyard', formData.get('lanyard') || 'false');
            nameTagFormData.append('rushType', rushType);
            
            // Call the original name tag calculator
            if (typeof calculateNameTagPrice === 'function') {
                const result = await calculateNameTagPrice(nameTagFormData);
                if (result.error) {
                    return { error: result.error };
                }
                
                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    printingSetupCost: result.printingSetupCost,
                    finishingSetupCost: result.finishingSetupCost,
                    productionCost: result.productionCost,
                    materialCost: result.materialCost,
                    finishingCost: result.finishingCost,
                    subtotal: result.subtotal,
                    rushMultiplier: result.rushMultiplier,
                    sheetsRequired: result.sheetsRequired
                };
            }
        }
        
        // For table tents, use the original calculator for perfect consistency
        if (productType === 'table-tents') {
            // Create a form data object that matches what the original calculator expects
            const tableTentFormData = new FormData();
            // Map dimensions to standard table tent sizes
            if (width <= 4.5 && height <= 7) {
                tableTentFormData.append('size', '4x6');
            } else {
                tableTentFormData.append('size', '5x7');
            }
            tableTentFormData.append('quantity', quantity);
            tableTentFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
            tableTentFormData.append('rushType', rushType);
            
            // Call the original table tent calculator
            if (typeof calculateTableTentPrice === 'function') {
                const result = await calculateTableTentPrice(tableTentFormData);
                if (result.error) {
                    return { error: result.error };
                }
                
                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    printingSetupCost: result.printingSetupCost,
                    finishingSetupCost: result.finishingSetupCost,
                    productionCost: result.productionCost,
                    materialCost: result.materialCost,
                    finishingCost: result.finishingCost,
                    subtotal: result.subtotal,
                    rushMultiplier: result.rushMultiplier,
                    sheetsRequired: result.sheetsRequired
                };
            }
        }
        
        // For other products, calculate using imposition
        const impositionData = this.impositionCalc.calculateImposition(width, height);
        
        if (impositionData.error) {
            return { error: impositionData.error };
        }
        
        const sheetsRequired = this.impositionCalc.calculateSheetsRequired(quantity, impositionData.copies);
        
        // Get paper costs
        let paperCost = 0;
        const textPaper = formData.get('textPaper');
        const coverPaper = formData.get('coverPaper');
        
        if (textPaper && paperStocks[textPaper]) {
            paperCost += paperStocks[textPaper].costPerSheet * sheetsRequired;
        }
        if (coverPaper && paperStocks[coverPaper]) {
            paperCost += paperStocks[coverPaper].costPerSheet * sheetsRequired;
        }
        
        // If only one paper type selected, use it for full job
        if (!textPaper && coverPaper) {
            paperCost = paperStocks[coverPaper].costPerSheet * sheetsRequired;
        } else if (textPaper && !coverPaper) {
            paperCost = paperStocks[textPaper].costPerSheet * sheetsRequired;
        }
        
        // Calculate base costs using existing pricing formulas
        const setupFee = this.getSetupFee(productType, formData);
        const finishingSetupFee = this.getFinishingSetupFee(productType, formData);
        const productionCost = this.getProductionCost(quantity, productType);
        const clickCost = sheetsRequired * 0.10; // $0.10 per click
        const finishingCost = this.getFinishingCost(quantity, productType, formData);
        
        const materialCost = (paperCost + clickCost) * 1.5;
        const subtotal = setupFee + finishingSetupFee + productionCost + materialCost + finishingCost;
        
        // Apply rush multiplier
        const rushMultiplier = this.getRushMultiplier(rushType);
        const totalCost = subtotal * rushMultiplier;
        const unitPrice = totalCost / quantity;
        
        return {
            totalCost: Math.round(totalCost * 100) / 100,
            unitPrice: Math.round(unitPrice * 100) / 100,
            printingSetupCost: setupFee.toFixed(2),
            finishingSetupCost: finishingSetupFee.toFixed(2),
            productionCost: productionCost.toFixed(2),
            materialCost: materialCost.toFixed(2),
            finishingCost: finishingCost.toFixed(2),
            subtotal: subtotal.toFixed(2),
            rushMultiplier: rushMultiplier,
            sheetsRequired: sheetsRequired
        };
    }

    calculatePosterPricing(width, height, quantity, rushType, formData) {
        const squareFeet = (width * height) / 144;
        const material = formData.get('material') || 'RMPS002';
        
        // Material costs per square foot
        const materialCosts = {
            'RMPS002': 6.00, // Rite-Media Paper
            'RMFAB001': 9.00  // Fabric Material
        };
        
        const costPerSqFt = materialCosts[material] || 6.00;
        const materialCost = squareFeet * costPerSqFt * quantity;
        
        const setupFee = 30.00; // Standard setup for large format
        const subtotal = setupFee + materialCost;
        
        const rushMultiplier = this.getRushMultiplier(rushType);
        const totalCost = subtotal * rushMultiplier;
        const unitPrice = totalCost / quantity;
        
        return {
            totalCost: Math.round(totalCost * 100) / 100,
            unitPrice: Math.round(unitPrice * 100) / 100,
            printingSetupCost: setupFee.toFixed(2),
            finishingSetupCost: '0.00',
            productionCost: '0.00',
            materialCost: materialCost.toFixed(2),
            finishingCost: '0.00',
            subtotal: subtotal.toFixed(2),
            rushMultiplier: rushMultiplier,
            sheetsRequired: quantity,
            squareFeet: Math.round(squareFeet * 100) / 100
        };
    }

    getSetupFee(productType, formData) {
        // Streamlined setup fees: $15 for all products
        if (productType === 'booklets') {
            // Booklets: $15 base + $2 per page
            const pages = parseInt(formData.get('pages')) || 8;
            return 15.00 + (pages * 2);
        }
        
        if (productType === 'notepads') {
            // Notepads content-based setup fees
            const contentType = formData.get('contentType') || 'blank';
            if (contentType === 'blank') return 0;      // Blank pages = no setup
            if (contentType === 'lined') return 15.00;  // Lined template
            if (contentType === 'custom') return 30.00; // Custom design
            return 15.00;
        }
        
        // All other products: $15 flat setup fee
        return 15.00;
    }

    getFinishingSetupFee(productType, formData) {
        // Most products don't have separate finishing setup
        if (productType === 'brochures' && formData.get('foldType') !== 'none') {
            return 15.00;
        }
        if (productType === 'notepads') {
            return 15.00; // Padding setup
        }
        if (productType === 'table-tents') {
            return 15.00; // Finishing setup for scoring, folding, and tape
        }
        return 0;
    }

    getProductionCost(quantity, productType) {
        // Efficiency exponents by product type
        const exponents = {
            'brochures': 0.75,
            'postcards': 0.70,
            'flyers': 0.65,        // Fixed: was 0.70, should be 0.65
            'bookmarks': 0.65,
            'name-tags': 0.65,
            'booklets': 0.75,
            'notebooks': 0.80,
            'notepads': 0.65,
            'table-tents': 0.70
        };
        
        const exponent = exponents[productType] || 0.70;
        return Math.pow(quantity, exponent) * 1.50;
    }

    getFinishingCost(quantity, productType, formData) {
        if (productType === 'brochures') {
            const foldType = formData.get('foldType');
            if (foldType && foldType !== 'none' && typeof pricingConfig !== 'undefined') {
                const foldCost = pricingConfig.finishingCosts.folding[foldType] || 0.10;
                return quantity * foldCost;
            }
        }
        
        if (productType === 'table-tents') {
            // Comprehensive finishing: scoring, folding, tape application
            return quantity * 0.50;
        }
        
        if (productType === 'name-tags') {
            let cost = 0;
            const holePunch = formData.get('holePunch');
            const lanyard = formData.get('lanyard');
            
            if (holePunch === 'true') cost += 0.05; // $0.05 per tag for hole punch
            if (lanyard === 'true') cost += 1.25;   // $1.25 per tag for lanyard
            
            return quantity * cost;
        }
        
        return 0;
    }

    getRushMultiplier(rushType) {
        // Use values from pricingConfig
        if (typeof pricingConfig !== 'undefined' && pricingConfig.rushMultipliers[rushType]) {
            return pricingConfig.rushMultipliers[rushType].multiplier;
        }
        return 1.0;
    }

    updatePricingDisplay(pricing) {
        document.getElementById('livePrice').textContent = `$${pricing.totalCost}`;
        document.getElementById('liveUnitPrice').textContent = `$${pricing.unitPrice}`;
        
        // Update breakdown
        document.getElementById('redSetupCost').textContent = `$${pricing.printingSetupCost}`;
        document.getElementById('redProductionCost').textContent = `$${pricing.productionCost}`;
        document.getElementById('redMaterialCost').textContent = `$${pricing.materialCost}`;
        document.getElementById('redFinishingCost').textContent = `$${pricing.finishingCost}`;
        document.getElementById('redSubtotal').textContent = `$${pricing.subtotal}`;
        document.getElementById('redSheetsRequired').textContent = pricing.sheetsRequired;
        
        // Show/hide finishing setup fee
        const finishingSetupItem = document.getElementById('redFinishingSetupItem');
        const finishingSetupCost = document.getElementById('redFinishingSetupCost');
        if (pricing.finishingSetupCost && parseFloat(pricing.finishingSetupCost) > 0) {
            finishingSetupCost.textContent = `$${pricing.finishingSetupCost}`;
            finishingSetupItem.style.display = 'flex';
        } else {
            finishingSetupItem.style.display = 'none';
        }
        
        // Show/hide rush multiplier
        const rushItem = document.getElementById('redRushMultiplierItem');
        if (pricing.rushMultiplier > 1) {
            document.getElementById('redRushMultiplier').textContent = `${pricing.rushMultiplier}x`;
            rushItem.style.display = 'block';
        } else {
            rushItem.style.display = 'none';
        }
        
        // Update status
        document.getElementById('priceStatus').innerHTML = 
            '<span class="status-text text-success">Ready to add to cart</span>';
        
        // Enable add to cart button
        document.getElementById('addToCartBtn').disabled = false;
        
        // Store current pricing
        this.currentPricing = pricing;
    }

    resetPricingDisplay() {
        document.getElementById('livePrice').textContent = '$0.00';
        document.getElementById('liveUnitPrice').textContent = '$0.00';
        document.getElementById('priceStatus').innerHTML = 
            '<span class="status-text">Configure options to see pricing</span>';
        
        // Reset breakdown
        ['redSetupCost', 'redProductionCost', 'redMaterialCost', 'redFinishingCost', 'redSubtotal'].forEach(id => {
            document.getElementById(id).textContent = '$0.00';
        });
        document.getElementById('redSheetsRequired').textContent = '0';
        document.getElementById('redRushMultiplierItem').style.display = 'none';
        
        // Disable add to cart
        document.getElementById('addToCartBtn').disabled = true;
    }

    showPricingError(error) {
        document.getElementById('priceStatus').innerHTML = 
            `<span class="status-text text-danger">${error}</span>`;
        document.getElementById('addToCartBtn').disabled = true;
    }

    addToCart() {
        if (!this.currentPricing.totalCost || this.currentPricing.totalCost <= 0) {
            alert('Please configure the product and calculate pricing first.');
            return;
        }
        
        // Create cart item
        const cartItem = {
            id: Date.now().toString(),
            productType: this.currentConfig.productType,
            productName: this.getProductDisplayName(this.currentConfig.productType),
            configuration: { ...this.currentConfig },
            pricing: { ...this.currentPricing },
            addedAt: new Date().toISOString()
        };
        
        // Add product-specific configuration details
        cartItem.displayConfig = this.getDisplayConfiguration();
        
        // Add to cart using existing cart functionality
        if (typeof addItemToCart === 'function') {
            addItemToCart(cartItem);
            this.updateCartBadge();
            
            // Show success message
            alert(`${cartItem.productName} added to cart!`);
        } else {
            console.error('Cart functionality not available');
            alert('Unable to add to cart. Please refresh the page and try again.');
        }
    }

    getDisplayConfiguration() {
        const config = [];
        
        config.push(`Size: ${this.impositionCalc.formatDimensions(this.currentConfig.customWidth, this.currentConfig.customHeight)}`);
        
        if (this.currentConfig.textPaper && this.currentConfig.coverPaper) {
            config.push(`Paper: ${paperStocks[this.currentConfig.textPaper].displayName} / ${paperStocks[this.currentConfig.coverPaper].displayName}`);
        } else if (this.currentConfig.textPaper) {
            config.push(`Paper: ${paperStocks[this.currentConfig.textPaper].displayName}`);
        } else if (this.currentConfig.coverPaper) {
            config.push(`Paper: ${paperStocks[this.currentConfig.coverPaper].displayName}`);
        }
        
        config.push(`Quantity: ${this.currentConfig.quantity.toLocaleString()}`);
        config.push(`Turnaround: ${this.getTurnaroundDisplayName(this.currentConfig.rushType)}`);
        
        // Add product-specific details
        const productType = this.currentConfig.productType;
        if (productType === 'brochures') {
            const foldType = document.getElementById('foldType')?.value;
            if (foldType && foldType !== 'none') {
                config.push(`Folding: ${foldType}`);
            }
        }
        
        return config;
    }

    getProductDisplayName(productType) {
        const names = {
            'brochures': 'Brochures',
            'postcards': 'Postcards',
            'flyers': 'Flyers',
            'bookmarks': 'Bookmarks',
            'name-tags': 'Name Tags',
            'booklets': 'Booklets',
            'notebooks': 'Notebooks',
            'notepads': 'Notepads',
            'table-tents': 'Table Tents',
            'posters': 'Posters',
            'magnets': 'Magnets',
            'stickers': 'Stickers',
            'apparel': 'Apparel',
            'tote-bags': 'Tote Bags'
        };
        return names[productType] || productType;
    }

    getTurnaroundDisplayName(rushType) {
        const names = {
            'standard': 'Standard (3-5 days)',
            '2-day': '2-Day Rush',
            'next-day': 'Next Day',
            'same-day': 'Same Day'
        };
        return names[rushType] || 'Standard';
    }

    resetConfiguration() {
        // Clear dimension inputs
        document.getElementById('customWidth').value = '';
        document.getElementById('customHeight').value = '';
        
        // Reset paper selections
        document.getElementById('textPaper').value = '';
        document.getElementById('coverPaper').value = '';
        document.getElementById('specialtyStock').value = '';
        
        // Clear quantity
        document.getElementById('quantity').value = '';
        
        // Reset rush type to standard
        document.querySelector('input[name="rushType"][value="standard"]').checked = true;
        document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
        document.querySelector('.option-card[data-value="standard"]').classList.add('selected');
        
        // Clear configuration object
        this.currentConfig = {
            productType: this.currentConfig.productType, // Keep product type
            customWidth: 0,
            customHeight: 0,
            textPaper: '',
            coverPaper: '',
            specialtyStock: '',
            quantity: 0,
            rushType: 'standard'
        };
        
        this.resetPricingDisplay();
    }

    updateCartBadge() {
        // Update cart badge if cart functionality is available
        if (typeof updateCartDisplay === 'function') {
            updateCartDisplay();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing UniversalConfigurator...');
    
    // Wait a tick to ensure all scripts are loaded
    setTimeout(() => {
        if (typeof paperStocks === 'undefined') {
            console.error('Critical: paperStocks not loaded. Cannot initialize configurator.');
            alert('Configuration error. Please refresh the page.');
            return;
        }
        
        console.log('paperStocks available, creating UniversalConfigurator');
        try {
            new UniversalConfigurator();
        } catch (error) {
            console.error('Error initializing UniversalConfigurator:', error);
        }
    }, 100);
});