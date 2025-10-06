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
                if (!paper || (!paper.costPerSheet && !paper.chargeRate)) {
                    console.warn(`Invalid paper data for ${code}:`, paper);
                    return;
                }

                const option = document.createElement('option');
                option.value = code;
                const price = paper.costPerSheet || paper.chargeRate;
                const unit = paper.chargeRate ? 'sqft' : 'sheet';
                option.textContent = `${paper.displayName} - $${price.toFixed(2)}/${unit}`;
                
                if (paper.type === 'text_stock') {
                    textSelect.appendChild(option);
                } else if (paper.type === 'cover_stock') {
                    coverSelect.appendChild(option);
                } else if (paper.type === 'adhesive_stock') {
                    specialtySelect.appendChild(option);
                }
                // Note: Large format materials are handled separately in poster-specific options
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

        // Paper selections - with mutual exclusivity
        document.getElementById('textPaper').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('coverPaper').value = '';
                document.getElementById('specialtyStock').value = '';
                this.currentConfig.coverPaper = '';
                this.currentConfig.specialtyStock = '';
            }
            this.currentConfig.textPaper = e.target.value;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });

        document.getElementById('coverPaper').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('textPaper').value = '';
                document.getElementById('specialtyStock').value = '';
                this.currentConfig.textPaper = '';
                this.currentConfig.specialtyStock = '';
            }
            this.currentConfig.coverPaper = e.target.value;
            this.updateConfiguration();
            this.debouncedPriceCalculation();
        });

        document.getElementById('specialtyStock').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('textPaper').value = '';
                document.getElementById('coverPaper').value = '';
                this.currentConfig.textPaper = '';
                this.currentConfig.coverPaper = '';
            }
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
            case 'flat-prints':
                optionsTitle.textContent = 'Add-Ons & Options';
                optionsContent.innerHTML = this.createFlatPrintOptions();
                specificSection.style.display = 'block';
                this.bindFlatPrintEventListeners();
                break;

            case 'folded-prints':
                optionsTitle.textContent = 'Folding Options';
                optionsContent.innerHTML = this.createFoldedPrintOptions();
                specificSection.style.display = 'block';
                this.bindFoldedPrintEventListeners();
                break;

            case 'brochures':
                optionsTitle.textContent = 'Folding Options';
                optionsContent.innerHTML = this.createFoldingOptions();
                specificSection.style.display = 'block';
                break;

            case 'booklets':
                optionsTitle.textContent = 'Booklet Options';
                optionsContent.innerHTML = this.createBookletOptions();
                specificSection.style.display = 'block';
                // Add event listeners for booklet-specific options
                this.bindBookletEventListeners();
                break;
                
            case 'notebooks':
                optionsTitle.textContent = 'Binding Options';
                optionsContent.innerHTML = this.createBindingOptions();
                specificSection.style.display = 'block';
                // Add event listeners for notebook-specific options
                this.bindNotebookEventListeners();
                break;
                
            case 'notepads':
                optionsTitle.textContent = 'Pad Options';
                optionsContent.innerHTML = this.createNotepadOptions();
                specificSection.style.display = 'block';
                break;

            case 'perfect-bound-books':
                optionsTitle.textContent = 'Perfect Bound Book Options';
                optionsContent.innerHTML = this.createPerfectBoundOptions();
                specificSection.style.display = 'block';
                // Add event listeners for perfect bound book-specific options
                this.bindPerfectBoundEventListeners();
                break;

            case 'name-tags':
                optionsTitle.textContent = 'Finishing Options';
                optionsContent.innerHTML = this.createNameTagOptions();
                specificSection.style.display = 'block';
                // Add event listeners for name tag-specific options
                this.bindNameTagEventListeners();
                break;
                
            case 'posters':
                optionsTitle.textContent = 'Material Options';
                optionsContent.innerHTML = this.createPosterMaterialOptions();
                specificSection.style.display = 'block';
                // Hide standard paper section for posters
                document.getElementById('paperSection').style.display = 'none';
                // Bind poster material change event
                setTimeout(() => {
                    const posterMaterialSelect = document.getElementById('posterMaterial');
                    if (posterMaterialSelect) {
                        // Set initial value and store it
                        if (posterMaterialSelect.value) {
                            this.currentConfig.posterMaterial = posterMaterialSelect.value;
                            this.handlePosterMaterialChange(posterMaterialSelect.value);
                        }

                        posterMaterialSelect.addEventListener('change', (e) => {
                            this.handlePosterMaterialChange(e.target.value);
                        });
                    }
                }, 100);
                break;
                
            case 'stickers':
                // Stickers now support custom sizing for in-house production
                specificSection.style.display = 'block';
                optionsTitle.textContent = 'Sticker Options';
                optionsContent.innerHTML = `
                    <div class="mb-4">
                        <label class="form-label">Production Type</label>
                        <select class="form-select" id="stickerProductionType">
                            <option value="standard">Standard (In-House) - $12/sq ft + $30 setup</option>
                            <option value="premium">Premium (Supplier) - Custom Sizing Available</option>
                        </select>
                    </div>

                    <div id="standardStickerOptions">
                        <div class="mb-3">
                            <label class="form-label">Finish</label>
                            <select class="form-select" id="stickerFinish">
                                <option value="vinyl-matte">Vinyl Matte (Kiss-Cut)</option>
                            </select>
                        </div>
                        <div class="alert alert-success">
                            <strong>In-House Production:</strong> Enter any dimensions above.
                            Wide-format printing at $12/sq ft + $30 setup fee with volume discounts.
                        </div>
                    </div>

                    <div id="premiumStickerOptions" style="display: none;">
                        <div class="mb-3">
                            <label class="form-label">Finish</label>
                            <select class="form-select" id="premiumStickerFinish">
                                <option value="vinyl-matte">Premium Vinyl (Die-Cut)</option>
                            </select>
                        </div>
                        <div class="alert alert-info">
                            <strong>Premium Supplier:</strong> Enter any dimensions above.
                            Pricing uses advanced interpolation based on supplier cost structure.
                            <br><small>Also available with preset sizes on the <a href="stickers.html" class="alert-link">Stickers page</a>.</small>
                        </div>
                    </div>
                `;
                // Show dimensions section for custom sizing
                document.getElementById('dimensionsSection').style.display = 'block';
                // Hide paper section (not needed for stickers)
                document.getElementById('paperSection').style.display = 'none';
                // Add event listeners for sticker-specific options
                this.bindStickerEventListeners();
                break;

            case 'magnets':
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

    createFlatPrintOptions() {
        return `
            <div class="alert alert-info mb-3">
                <strong>Flat Prints:</strong> Perfect for postcards, flyers, bookmarks, and name tags.
                Supports standard presets or custom dimensions.
            </div>

            <div class="form-group">
                <label class="form-label">Optional Add-Ons</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="holePunch" name="holePunch" value="true">
                    <label class="form-check-label" for="holePunch">
                        Hole Punch (+$0.05/piece)
                    </label>
                </div>
                <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" id="lanyard" name="lanyard" value="true">
                    <label class="form-check-label" for="lanyard">
                        Include Lanyard (+$1.25/piece)
                    </label>
                </div>
                <small class="form-text text-muted mt-2 d-block">Add-ons not available with adhesive stock</small>
            </div>
        `;
    }

    createFoldedPrintOptions() {
        return `
            <div class="alert alert-info mb-3">
                <strong>Folded Prints:</strong> Includes brochures and table tents.
                Select folding type below.
            </div>

            <div class="form-group">
                <label class="form-label">Folding Type</label>
                <select class="form-select" id="foldType" name="foldType">
                    <option value="none">No Folding (Flat)</option>
                    <option value="bifold">Bi-Fold (2 panels) - +$0.10/piece</option>
                    <option value="trifold">Tri-Fold (3 panels) - +$0.10/piece</option>
                    <option value="table-tent">Table Tent - +$0.50/piece</option>
                </select>
                <small class="form-text text-muted">Table tents include scoring, folding, and assembly materials</small>
            </div>
        `;
    }

    bindFlatPrintEventListeners() {
        const holePunchCheck = document.getElementById('holePunch');
        const lanyardCheck = document.getElementById('lanyard');

        if (holePunchCheck) {
            holePunchCheck.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }

        if (lanyardCheck) {
            lanyardCheck.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
    }

    bindFoldedPrintEventListeners() {
        const foldTypeSelect = document.getElementById('foldType');

        if (foldTypeSelect) {
            foldTypeSelect.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
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
                <label class="form-label">Cover Type</label>
                <select class="form-select" id="coverType" name="coverType">
                    <option value="separate">Separate Cover Stock</option>
                    <option value="self">Self Cover (same paper throughout)</option>
                </select>
                <small class="form-text text-muted">Self cover uses text paper for entire booklet - most economical</small>
            </div>
            
            <div class="form-group mt-3">
                <label class="form-label">Paper Selection</label>
                <div class="alert alert-info">
                    <small id="bookletPaperInfo">Select cover and text paper above. For self-cover, only text paper will be used.</small>
                </div>
            </div>
        `;
    }

    bindBookletEventListeners() {
        // Add event listeners for booklet-specific form elements
        const pagesSelect = document.getElementById('pages');
        const coverTypeSelect = document.getElementById('coverType');
        
        if (pagesSelect) {
            pagesSelect.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
        
        if (coverTypeSelect) {
            coverTypeSelect.addEventListener('change', () => {
                this.handleCoverTypeChange();
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
        
        // Initialize the paper info text based on current cover type
        this.handleCoverTypeChange();
    }

    handleCoverTypeChange() {
        const coverTypeSelect = document.getElementById('coverType');
        const paperInfoText = document.getElementById('bookletPaperInfo');
        const coverPaperSelect = document.getElementById('coverPaper');
        const textPaperSelect = document.getElementById('textPaper');
        
        if (!coverTypeSelect || !paperInfoText) return;
        
        const coverType = coverTypeSelect.value;
        
        if (coverType === 'self') {
            // Self cover - only text paper needed
            paperInfoText.textContent = 'Select text paper above. The same paper will be used throughout the entire booklet (most economical option).';
            
            // Hide cover paper requirement (make it optional)
            if (coverPaperSelect) {
                const coverPaperGroup = coverPaperSelect.closest('.form-group');
                if (coverPaperGroup) {
                    coverPaperGroup.style.opacity = '0.5';
                    const label = coverPaperGroup.querySelector('label');
                    if (label) {
                        label.textContent = 'Cover Weight Paper (not used for self-cover)';
                    }
                }
            }
            
            // Emphasize text paper requirement
            if (textPaperSelect) {
                const textPaperGroup = textPaperSelect.closest('.form-group');
                if (textPaperGroup) {
                    textPaperGroup.style.opacity = '1';
                    const label = textPaperGroup.querySelector('label');
                    if (label) {
                        label.textContent = 'Text Weight Paper (used for entire booklet)';
                    }
                }
            }
        } else {
            // Separate cover - both papers needed
            paperInfoText.textContent = 'Select both cover and text paper above. Cover paper will be used for front/back covers, text paper for interior pages.';
            
            // Restore normal styling for both paper selectors
            if (coverPaperSelect) {
                const coverPaperGroup = coverPaperSelect.closest('.form-group');
                if (coverPaperGroup) {
                    coverPaperGroup.style.opacity = '1';
                    const label = coverPaperGroup.querySelector('label');
                    if (label) {
                        label.textContent = 'Cover Weight Paper';
                    }
                }
            }
            
            if (textPaperSelect) {
                const textPaperGroup = textPaperSelect.closest('.form-group');
                if (textPaperGroup) {
                    textPaperGroup.style.opacity = '1';
                    const label = textPaperGroup.querySelector('label');
                    if (label) {
                        label.textContent = 'Text Weight Paper';
                    }
                }
            }
        }
    }

    bindNameTagEventListeners() {
        // Add event listeners for name tag finishing options
        const holePunchCheckbox = document.getElementById('holePunch');
        const lanyardCheckbox = document.getElementById('lanyard');
        
        if (holePunchCheckbox) {
            holePunchCheckbox.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
        
        if (lanyardCheckbox) {
            lanyardCheckbox.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
        
        // Set up paper change listener to handle adhesive stock restrictions
        this.setupNameTagPaperRestrictions();
    }

    bindNotebookEventListeners() {
        // Add event listeners for notebook-specific form elements
        const bindingTypeSelect = document.getElementById('bindingType');
        const notebookPagesInput = document.getElementById('notebookPages');
        
        if (bindingTypeSelect) {
            bindingTypeSelect.addEventListener('change', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
        
        if (notebookPagesInput) {
            notebookPagesInput.addEventListener('input', () => {
                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
        }
    }

    setupNameTagPaperRestrictions() {
        // Monitor paper selections to disable finishing for adhesive stock
        const paperSelects = ['textPaper', 'coverPaper', 'specialtyStock'];
        
        paperSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    this.updateNameTagFinishingOptions();
                });
            }
        });
        
        // Initial update
        this.updateNameTagFinishingOptions();
    }

    updateNameTagFinishingOptions() {
        const holePunchCheckbox = document.getElementById('holePunch');
        const lanyardCheckbox = document.getElementById('lanyard');
        const finishingNote = document.getElementById('nameTagFinishingNote');
        const finishingOptions = document.getElementById('nameTagFinishingOptions');
        
        if (!holePunchCheckbox || !lanyardCheckbox || !finishingNote || !finishingOptions) return;
        
        // Check if adhesive stock is selected
        const specialtyStock = document.getElementById('specialtyStock')?.value;
        const isAdhesiveStock = specialtyStock === 'PAC51319WP';
        
        if (isAdhesiveStock) {
            // Disable finishing options for adhesive stock
            holePunchCheckbox.disabled = true;
            lanyardCheckbox.disabled = true;
            holePunchCheckbox.checked = false;
            lanyardCheckbox.checked = false;
            finishingNote.style.display = 'block';
            finishingOptions.style.opacity = '0.6';
        } else {
            // Enable finishing options for cover stock
            holePunchCheckbox.disabled = false;
            lanyardCheckbox.disabled = false;
            finishingNote.style.display = 'none';
            finishingOptions.style.opacity = '1';
        }
    }

    bindStickerEventListeners() {
        // Add event listeners for sticker-specific form elements
        const stickerProductionType = document.getElementById('stickerProductionType');
        const stickerFinish = document.getElementById('stickerFinish');
        const premiumStickerFinish = document.getElementById('premiumStickerFinish');

        if (stickerProductionType) {
            // Remove any existing event listeners to avoid duplicates
            stickerProductionType.removeEventListener('change', this.stickerProductionChangeHandler);

            // Create bound handler if it doesn't exist
            if (!this.stickerProductionChangeHandler) {
                this.stickerProductionChangeHandler = (e) => {
                    this.handleStickerProductionChange();
                };
            }

            stickerProductionType.addEventListener('change', this.stickerProductionChangeHandler);
        }

        if (stickerFinish) {
            stickerFinish.removeEventListener('change', this.stickerFinishChangeHandler);

            if (!this.stickerFinishChangeHandler) {
                this.stickerFinishChangeHandler = (e) => {
                    this.updateConfiguration();
                    this.debouncedPriceCalculation();
                };
            }

            stickerFinish.addEventListener('change', this.stickerFinishChangeHandler);
        }

        if (premiumStickerFinish) {
            premiumStickerFinish.removeEventListener('change', this.premiumStickerFinishChangeHandler);

            if (!this.premiumStickerFinishChangeHandler) {
                this.premiumStickerFinishChangeHandler = (e) => {
                    this.updateConfiguration();
                    this.debouncedPriceCalculation();
                };
            }

            premiumStickerFinish.addEventListener('change', this.premiumStickerFinishChangeHandler);
        }
    }

    createBindingOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Binding Type</label>
                <select class="form-select" id="bindingType" name="bindingType">
                    <option value="coil">Plastic Coil Binding ($0.31 hardware + $2.50 labor)</option>
                    <option value="wire-o">Wire-O Binding ($0.35 hardware + $3.00 labor)</option>
                    <option value="perfect">Perfect Binding ($0 hardware + $3.00 labor)</option>
                </select>
            </div>
            <div class="form-group mt-3">
                <label class="form-label">Number of Pages</label>
                <input type="number" class="form-control" id="notebookPages" name="notebookPages" 
                       min="1" max="500" value="50" placeholder="Enter number of pages">
                <small class="form-text text-muted">Enter any number of pages (1-500)</small>
            </div>
        `;
    }

    createNotepadOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Sheets per Pad</label>
                <input type="number" class="form-control" id="sheetsPerPad" name="sheetsPerPad" 
                       min="1" max="500" value="50" placeholder="Enter number of sheets">
                <small class="form-text text-muted">Enter any number of sheets (1-500)</small>
            </div>
            <div class="form-group mt-3">
                <label class="form-label">Content Type</label>
                <select class="form-select" id="contentType" name="contentType">
                    <option value="blank">Blank (No setup fee)</option>
                    <option value="lined">Lined (No setup fee)</option>
                    <option value="custom">Custom Design ($15 setup)</option>
                </select>
            </div>
        `;
    }

    createPosterMaterialOptions() {
        // Dynamically generate poster material options from paperStocks
        let materialOptions = '<option value="">Select material...</option>';

        if (typeof paperStocks !== 'undefined') {
            Object.entries(paperStocks).forEach(([code, paper]) => {
                if (paper && paper.chargeRate &&
                    (paper.type === 'large_format_paper' ||
                     paper.type === 'large_format_fabric' ||
                     paper.type === 'large_format_vinyl' ||
                     paper.type === 'large_format_rigid')) {
                    materialOptions += `<option value="${code}">${paper.displayName} - $${paper.chargeRate.toFixed(2)}/sqft</option>`;
                }
            });
        }

        return `
            <div class="form-group">
                <label class="form-label">Material Type</label>
                <select class="form-select" id="posterMaterial" name="posterMaterial">
                    ${materialOptions}
                </select>
            </div>
            <div class="alert alert-info mt-3">
                <small><strong>Note:</strong> Select material first to set dimension constraints. Posters are priced per square foot.</small>
            </div>
        `;
    }

    handleStickerProductionChange() {
        const productionType = document.getElementById('stickerProductionType').value;
        const standardOptions = document.getElementById('standardStickerOptions');
        const premiumOptions = document.getElementById('premiumStickerOptions');
        const dimensionsSection = document.getElementById('dimensionsSection');

        if (productionType === 'standard') {
            standardOptions.style.display = 'block';
            premiumOptions.style.display = 'none';
            dimensionsSection.style.display = 'block';
        } else {
            standardOptions.style.display = 'none';
            premiumOptions.style.display = 'block';
            dimensionsSection.style.display = 'block';
        }

        // Trigger pricing recalculation
        this.debouncedPriceCalculation();

        // Re-bind sticker event listeners when production type changes
        this.bindStickerEventListeners();
    }

    handlePosterMaterialChange(materialCode) {
        if (!materialCode || !paperStocks[materialCode]) {
            return;
        }

        const material = paperStocks[materialCode];
        const widthInput = document.getElementById('customWidth');
        const heightInput = document.getElementById('customHeight');
        const trimNote = document.querySelector('.trim-note');

        if (!widthInput || !heightInput || !trimNote) {
            return;
        }

        if (material.fixedWidth && material.fixedHeight) {
            // Rigid substrate - lock to fixed dimensions
            widthInput.value = material.fixedWidth;
            heightInput.value = material.fixedHeight;
            widthInput.disabled = true;
            heightInput.disabled = true;
            widthInput.style.backgroundColor = '#f8f9fa';
            heightInput.style.backgroundColor = '#f8f9fa';
            trimNote.innerHTML = `<strong>Fixed size:</strong> ${material.fixedWidth}" × ${material.fixedHeight}" (substrate constraint)`;
        } else if (material.maxWidth) {
            // Roll media - set max width, free height
            widthInput.disabled = false;
            heightInput.disabled = false;
            widthInput.style.backgroundColor = '';
            heightInput.style.backgroundColor = '';
            widthInput.max = material.maxWidth;
            heightInput.max = 1000; // Essentially unlimited for roll length

            // Adjust current value if it exceeds the new max
            if (parseFloat(widthInput.value) > material.maxWidth) {
                widthInput.value = material.maxWidth;
            }

            trimNote.innerHTML = `<strong>Maximum width:</strong> ${material.maxWidth}" • <strong>Height:</strong> Any length up to full roll`;
        }

        // Update the configuration and recalculate
        this.currentConfig.posterMaterial = materialCode;
        this.debouncedPriceCalculation();
    }

    createNameTagOptions() {
        return `
            <div class="form-group">
                <label class="form-label d-flex align-items-center">
                    <span>Finishing Options</span>
                    <button type="button" class="btn btn-link btn-sm p-0 ms-2" data-bs-toggle="tooltip" 
                            title="Finishing options are only available for cover stock papers">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                        </svg>
                    </button>
                </label>
                
                <div class="finishing-options" id="nameTagFinishingOptions">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="holePunch" name="holePunch" value="true">
                        <label class="form-check-label" for="holePunch">
                            <strong>Hole Punch</strong>
                            <small class="text-muted d-block">Add hole punch for lanyards (+$0.05 per tag)</small>
                        </label>
                    </div>
                    
                    <div class="form-check mt-2">
                        <input class="form-check-input" type="checkbox" id="lanyard" name="lanyard" value="true">
                        <label class="form-check-label" for="lanyard">
                            <strong>Basic Lanyard</strong>
                            <small class="text-muted d-block">Include basic lanyard with each name tag (+$1.25 per tag)</small>
                        </label>
                    </div>
                </div>
                
                <div class="alert alert-warning mt-3" id="nameTagFinishingNote" style="display: none;">
                    <small><strong>Note:</strong> Finishing options are not available for adhesive stock. Please select a cover stock paper to enable finishing options.</small>
                </div>
            </div>
        `;
    }

    createPerfectBoundOptions() {
        return `
            <div class="form-group">
                <label class="form-label">Number of Pages</label>
                <input type="number" class="form-control" id="pages" name="pages"
                       min="12" max="300" step="2" value="40" placeholder="40">
                <small class="form-text text-muted">Must be 12-300 pages in multiples of 2</small>
            </div>
            <div class="alert alert-info mt-3">
                <small><strong>Note:</strong> Common book sizes: 5.5×8.5" (Novel), 6×9" (Trade), 8.5×11" (Letter)</small>
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
                
        // Update paper display - priority: specialty > text/cover > poster material
        let paperDisplay = '-';
        if (this.currentConfig.specialtyStock) {
            paperDisplay = paperStocks[this.currentConfig.specialtyStock].displayName;
        } else if (this.currentConfig.posterMaterial) {
            paperDisplay = paperStocks[this.currentConfig.posterMaterial].displayName;
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
        
        // Validate required fields - specialty stock can replace text/cover paper, posters use posterMaterial
        if (!this.currentConfig.productType ||
            !this.currentConfig.customWidth ||
            !this.currentConfig.customHeight ||
            !this.currentConfig.quantity) {

            this.resetPricingDisplay();
            return;
        }

        // Validate material selection based on product type
        if (this.currentConfig.productType === 'posters') {
            if (!this.currentConfig.posterMaterial) {
                this.resetPricingDisplay();
                return;
            }
        } else if (this.currentConfig.productType === 'stickers') {
            // Stickers don't require paper selection - they use production type only
            // Validation already passed if we got here
        } else {
            if (!this.currentConfig.specialtyStock && !this.currentConfig.textPaper && !this.currentConfig.coverPaper) {
                this.resetPricingDisplay();
                return;
            }
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
        if (productType === 'flat-prints') {
            const holePunch = document.getElementById('holePunch')?.checked || false;
            const lanyard = document.getElementById('lanyard')?.checked || false;
            formData.push(['holePunch', holePunch ? 'true' : 'false']);
            formData.push(['lanyard', lanyard ? 'true' : 'false']);
        } else if (productType === 'folded-prints') {
            const foldType = document.getElementById('foldType')?.value || 'none';
            formData.push(['foldType', foldType]);
        } else if (productType === 'brochures') {
            const foldType = document.getElementById('foldType')?.value || 'none';
            formData.push(['foldType', foldType]);
        } else if (productType === 'booklets') {
            const pages = document.getElementById('pages')?.value || '8';
            const coverType = document.getElementById('coverType')?.value || 'separate';
            formData.push(['pages', pages]);
            formData.push(['coverType', coverType]);
        } else if (productType === 'notebooks') {
            const bindingType = document.getElementById('bindingType')?.value || 'coil';
            const notebookPages = document.getElementById('notebookPages')?.value || '50';
            formData.push(['bindingType', bindingType]);
            formData.push(['notebookPages', notebookPages]);
        } else if (productType === 'notepads') {
            const sheetsPerPad = document.getElementById('sheetsPerPad')?.value || '50';
            const contentType = document.getElementById('contentType')?.value || 'blank';
            formData.push(['sheetsPerPad', sheetsPerPad]);
            formData.push(['contentType', contentType]);
        } else if (productType === 'name-tags') {
            const holePunch = document.getElementById('holePunch')?.checked || false;
            const lanyard = document.getElementById('lanyard')?.checked || false;
            formData.push(['holePunch', holePunch ? 'true' : 'false']);
            formData.push(['lanyard', lanyard ? 'true' : 'false']);
        } else if (productType === 'posters') {
            const posterMaterial = document.getElementById('posterMaterial')?.value || 'RMPS002';
            formData.push(['material', posterMaterial]);
        } else if (productType === 'stickers') {
            const stickerProductionType = document.getElementById('stickerProductionType')?.value || 'standard';
            const stickerFinish = document.getElementById('stickerFinish')?.value || 'vinyl-matte';
            const premiumStickerFinish = document.getElementById('premiumStickerFinish')?.value || 'vinyl-matte';
            formData.push(['stickerProductionType', stickerProductionType]);
            formData.push(['stickerFinish', stickerFinish]);
            formData.push(['premiumStickerFinish', premiumStickerFinish]);
        } else if (productType === 'perfect-bound-books') {
            const pages = document.getElementById('pages')?.value || '40';
            formData.push(['pages', pages]);
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

        // For stickers, use sticker-specific pricing logic
        if (productType === 'stickers') {
            return await this.calculateStickerPricing(width, height, quantity, rushType, formData);
        }

        // For flat-prints, use the new streamlined calculator
        if (productType === 'flat-prints') {
            const flatPrintFormData = new FormData();

            // Use custom dimensions if provided, otherwise use a default size
            if (width && height) {
                flatPrintFormData.append('customWidth', width);
                flatPrintFormData.append('customHeight', height);
            } else {
                flatPrintFormData.append('size', '5x7'); // default size
            }

            flatPrintFormData.append('quantity', quantity);
            flatPrintFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));

            // Get add-on options from the form checkboxes
            const holePunchChecked = document.getElementById('holePunch')?.checked || false;
            const lanyardChecked = document.getElementById('lanyard')?.checked || false;
            flatPrintFormData.append('holePunch', holePunchChecked ? 'true' : 'false');
            flatPrintFormData.append('lanyard', lanyardChecked ? 'true' : 'false');

            flatPrintFormData.append('rushType', rushType);

            // Call the new flat-print calculator
            if (typeof calculateFlatPrintPrice === 'function') {
                const result = await calculateFlatPrintPrice(flatPrintFormData);
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

        // For folded-prints, use the new streamlined calculator
        if (productType === 'folded-prints') {
            const foldedPrintFormData = new FormData();

            // Map dimensions to standard sizes
            let size = '8.5x11'; // default
            if (width && height) {
                if (width <= 6 && height <= 9) {
                    size = '5.5x8.5';
                } else if (width <= 9 && height <= 12) {
                    size = '8.5x11';
                } else if (width <= 9 && height <= 14.5) {
                    size = '8.5x14';
                } else {
                    size = '11x17';
                }
            }

            foldedPrintFormData.append('size', size);
            foldedPrintFormData.append('quantity', quantity);
            foldedPrintFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
            foldedPrintFormData.append('foldType', formData.get('foldType') || 'none');
            foldedPrintFormData.append('rushType', rushType);

            // Call the new folded-print calculator
            if (typeof calculateFoldedPrintPrice === 'function') {
                const result = await calculateFoldedPrintPrice(foldedPrintFormData);
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
        
        // For booklets, use the original calculator for perfect consistency
        if (productType === 'booklets') {
            const bookletFormData = new FormData();
            
            // Map dimensions to standard booklet sizes
            let size = '8.5x11'; // default
            if (width <= 6 && height <= 9) {
                size = '5.5x8.5';
            }
            
            bookletFormData.append('size', size);
            bookletFormData.append('quantity', quantity);
            bookletFormData.append('pages', formData.get('pages') || '8');
            
            // Handle cover type selection
            const coverType = formData.get('coverType') || 'separate';
            if (coverType === 'self') {
                // Self cover: use text paper for entire booklet
                bookletFormData.append('coverPaperType', 'SELF_COVER');
                bookletFormData.append('textPaperType', formData.get('textPaper'));
            } else {
                // Separate cover: use both cover and text paper
                bookletFormData.append('coverPaperType', formData.get('coverPaper'));
                bookletFormData.append('textPaperType', formData.get('textPaper'));
            }
            
            bookletFormData.append('rushType', rushType);
            
            // Call the original booklet calculator
            if (typeof calculateBookletPrice === 'function') {
                const result = await calculateBookletPrice(bookletFormData);
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
        
        // For name tags, use the original calculator with custom dimensions
        if (productType === 'name-tags') {
            const nameTagFormData = new FormData();
            
            // Use custom dimensions directly (no size mapping)
            nameTagFormData.append('customWidth', width);
            nameTagFormData.append('customHeight', height);
            
            nameTagFormData.append('quantity', quantity);
            nameTagFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
            
            // Get finishing options from the form checkboxes
            const holePunchChecked = document.getElementById('holePunch')?.checked || false;
            const lanyardChecked = document.getElementById('lanyard')?.checked || false;
            nameTagFormData.append('holePunch', holePunchChecked ? 'true' : 'false');
            nameTagFormData.append('lanyard', lanyardChecked ? 'true' : 'false');
            
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
            // Note: Table tent calculator accounts for actual material dimensions (2.5x height for folds/base)
            if (width <= 4.5 && height <= 7) {
                tableTentFormData.append('size', '4x6'); // Uses ~4x15" material
            } else {
                tableTentFormData.append('size', '5x7'); // Uses ~5x17.5" material
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
        
        // For notepads, use the original calculator with custom dimensions and sheet count
        if (productType === 'notepads') {
            const notepadFormData = new FormData();
            
            // Create size string from custom dimensions
            const sizeString = `${width}x${height}`;
            notepadFormData.append('size', sizeString);
            notepadFormData.append('quantity', quantity);
            
            // Get custom sheet count from input field
            const sheetsPerPad = parseInt(formData.get('sheetsPerPad')) || 50;
            notepadFormData.append('sheets', sheetsPerPad);
            
            // Get content type and paper selections
            const contentType = formData.get('contentType') || 'blank';
            notepadFormData.append('pageContent', contentType);
            
            // Use selected paper for text, default backing to cardstock
            const textPaper = formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper');
            notepadFormData.append('textPaper', textPaper);
            notepadFormData.append('backingPaper', 'LYNOC95FSC'); // Default to 100# Cover Uncoated
            
            notepadFormData.append('rushType', rushType);
            
            // Call the original notepad calculator
            if (typeof calculateNotepadPrice === 'function') {
                const result = await calculateNotepadPrice(notepadFormData);
                if (result.error) {
                    return { error: result.error };
                }
                
                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    printingSetupCost: result.printingSetupCost || result.totalSetupCost,
                    finishingSetupCost: result.finishingSetupCost,
                    productionCost: result.productionCost,
                    materialCost: result.materialCost,
                    finishingCost: result.laborCost || '0.00',
                    subtotal: result.subtotal,
                    rushMultiplier: result.rushMultiplier,
                    sheetsRequired: Math.ceil((quantity * sheetsPerPad) / (result.imposition || 2))
                };
            }
        }
        
        // For notebooks, use the original calculator with custom dimensions, page count, and binding
        if (productType === 'notebooks') {
            const notebookFormData = new FormData();
            
            // Create size string from custom dimensions
            const sizeString = `${width}x${height}`;
            notebookFormData.append('size', sizeString);
            notebookFormData.append('quantity', quantity);
            
            // Get custom page count and binding type
            const notebookPages = parseInt(formData.get('notebookPages')) || 50;
            const bindingType = formData.get('bindingType') || 'coil';
            notebookFormData.append('pages', notebookPages);
            notebookFormData.append('bindingType', bindingType);
            
            // Use selected papers
            const coverPaper = formData.get('coverPaper');
            const textPaper = formData.get('textPaper');
            notebookFormData.append('coverPaper', coverPaper);
            notebookFormData.append('textPaper', textPaper);
            
            // Default page content to blank (can be enhanced later)
            notebookFormData.append('pageContent', 'blank');
            notebookFormData.append('rushType', rushType);
            
            // Call the original notebook calculator
            if (typeof calculateNotebookPrice === 'function') {
                const result = await calculateNotebookPrice(notebookFormData);
                if (result.error) {
                    return { error: result.error };
                }
                
                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost),
                    unitPrice: parseFloat(result.unitPrice),
                    printingSetupCost: result.printingSetupCost || result.totalSetupCost,
                    finishingSetupCost: result.finishingSetupCost,
                    productionCost: result.productionCost,
                    materialCost: result.materialCost,
                    finishingCost: (parseFloat(result.laborCost || 0) + parseFloat(result.bindingCost || 0)).toFixed(2),
                    subtotal: result.subtotal,
                    rushMultiplier: result.rushMultiplier,
                    sheetsRequired: Math.ceil(quantity * (parseFloat(result.coverSheetsPerNotebook) + parseFloat(result.textSheetsPerNotebook)))
                };
            }
        }

        // For perfect-bound-books, use the perfect bound calculator
        if (productType === 'perfect-bound-books') {
            const perfectBoundFormData = new FormData();

            // Add dimensions
            perfectBoundFormData.append('customWidth', width);
            perfectBoundFormData.append('customHeight', height);
            perfectBoundFormData.append('quantity', quantity);

            // Get page count from the form
            const pages = parseInt(formData.get('pages')) || 40;
            perfectBoundFormData.append('pages', pages);

            // Get paper selections
            perfectBoundFormData.append('textPaper', formData.get('textPaper'));
            perfectBoundFormData.append('coverPaper', formData.get('coverPaper'));
            perfectBoundFormData.append('rushType', rushType);

            // Call the perfect bound price calculator
            if (typeof calculatePerfectBoundPrice === 'function') {
                const result = await calculatePerfectBoundPrice(perfectBoundFormData);
                if (result.error) {
                    return { error: result.error };
                }

                // Convert to expected format
                return {
                    totalCost: parseFloat(result.totalCost_numeric || result.totalCost),
                    unitPrice: parseFloat(result.unitPrice_numeric || result.unitPrice),
                    printingSetupCost: parseFloat(result.breakdown?.setupCost || 0),
                    finishingSetupCost: 0,
                    productionCost: parseFloat(result.breakdown?.productionCost || 0),
                    materialCost: parseFloat(result.breakdown?.materialsCost || 0),
                    finishingCost: parseFloat(result.breakdown?.laborCost || 0),
                    subtotal: parseFloat(result.totalCost_numeric || result.totalCost),
                    rushMultiplier: parseFloat(result.breakdown?.rushMultiplier || 1),
                    sheetsRequired: parseInt(result.breakdown?.sheets?.total || 0)
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
            printingSetupCost: setupFee,
            finishingSetupCost: finishingSetupFee,
            productionCost: productionCost,
            materialCost: materialCost,
            finishingCost: finishingCost,
            subtotal: subtotal,
            rushMultiplier: rushMultiplier,
            sheetsRequired: sheetsRequired
        };
    }

    calculatePosterPricing(width, height, quantity, rushType, formData) {
        const squareFeet = (width * height) / 144;
        const materialCode = formData.get('material') || 'LARGE_FORMAT_PAPER';

        // Get material data from paperStocks
        const material = paperStocks[materialCode];
        if (!material) {
            throw new Error(`Material ${materialCode} not found in paperStocks`);
        }

        const costPerSqFt = material.chargeRate || 6.00;

        // Calculate total square footage for volume discount
        const totalSquareFootage = squareFeet * quantity;

        // Determine volume discount tier
        let volumeDiscount = { discount: 0, multiplier: 1.00, description: 'Standard Rate' };
        const volumeTiers = pricingConfig.largeFormatVolumeDiscounts?.tiers || [];

        for (const tier of volumeTiers) {
            if (totalSquareFootage >= tier.minSqft && totalSquareFootage <= tier.maxSqft) {
                volumeDiscount = tier;
                break;
            }
        }

        // Calculate costs with volume discount: material sqft rate × volumeDiscount × sqft × quantity
        const materialCost = squareFeet * costPerSqFt * volumeDiscount.multiplier * quantity;

        // Simple pricing: material sqft rate × sqft × quantity (no setup fee)
        const subtotal = materialCost;

        const rushMultiplier = this.getRushMultiplier(rushType);
        const totalCost = subtotal * rushMultiplier;
        const unitPrice = totalCost / quantity;

        // Calculate savings from volume discount
        const originalMaterialCost = squareFeet * costPerSqFt * quantity;
        const volumeSavings = originalMaterialCost - materialCost;

        return {
            totalCost: Math.round(totalCost * 100) / 100,
            unitPrice: Math.round(unitPrice * 100) / 100,
            printingSetupCost: 0,
            finishingSetupCost: 0,
            productionCost: 0,
            materialCost: materialCost,
            finishingCost: 0,
            subtotal: subtotal,
            rushMultiplier: rushMultiplier,
            sheetsRequired: quantity,
            squareFeet: Math.round(squareFeet * 100) / 100,
            totalSquareFootage: Math.round(totalSquareFootage * 100) / 100,
            volumeDiscount: volumeDiscount.discount,
            volumeDiscountDescription: volumeDiscount.description,
            volumeSavings: Math.round(volumeSavings * 100) / 100
        };
    }

    async calculateStickerPricing(width, height, quantity, rushType, formData) {
        const squareFeet = (width * height) / 144;
        const productionType = formData.get('stickerProductionType') || 'standard';

        if (productionType === 'standard') {
            // Standard (In-House) pricing: $12/sq ft + $30 setup + volume discounts
            const costPerSqFt = 12.00;
            const setupFee = 30.00;

            // Calculate base material cost
            const baseMaterialCost = squareFeet * costPerSqFt * quantity;

            // Apply volume discounts based on total square footage
            const totalSqFt = squareFeet * quantity;
            let volumeDiscount = 1.0;

            if (totalSqFt >= 50) volumeDiscount = 0.90;      // 10% off for 50+ sq ft
            else if (totalSqFt >= 25) volumeDiscount = 0.95; // 5% off for 25+ sq ft

            const materialCost = baseMaterialCost * volumeDiscount;
            const subtotal = setupFee + materialCost;

            const rushMultiplier = this.getRushMultiplier(rushType);
            const totalCost = subtotal * rushMultiplier;
            const unitPrice = totalCost / quantity;

            return {
                totalCost: Math.round(totalCost * 100) / 100,
                unitPrice: Math.round(unitPrice * 100) / 100,
                printingSetupCost: setupFee,
                finishingSetupCost: 0,
                productionCost: 0,
                materialCost: materialCost,
                finishingCost: 0,
                subtotal: subtotal,
                rushMultiplier: rushMultiplier,
                sheetsRequired: quantity,
                squareFeet: Math.round(squareFeet * 100) / 100,
                volumeDiscount: volumeDiscount
            };
        } else {
            // Premium (Supplier) pricing with interpolation using custom dimensions
            if (typeof calculatePremiumStickerCustomPrice === 'function') {
                try {
                    const result = await calculatePremiumStickerCustomPrice(width, height, quantity, 'vinyl-matte', rushType);

                    if (result.error) {
                        return { error: result.error };
                    }

                    return {
                        totalCost: Math.round(result.totalCost * 100) / 100,
                        unitPrice: Math.round(result.unitPrice * 100) / 100,
                        printingSetupCost: 0,
                        finishingSetupCost: 0,
                        productionCost: 0,
                        materialCost: result.supplierCost || 0,
                        finishingCost: 0,
                        subtotal: result.supplierCost || 0,
                        rushMultiplier: result.rushMultiplier || 1,
                        sheetsRequired: quantity,
                        squareFeet: Math.round(squareFeet * 100) / 100,
                        interpolationData: {
                            area: width * height,
                            supplierCost: result.supplierCost,
                            markup: result.markup,
                            priceAfterMarkup: result.priceAfterMarkup
                        }
                    };
                } catch (error) {
                    console.error('Premium sticker calculation error:', error);
                    return { error: 'Unable to calculate premium sticker pricing' };
                }
            } else {
                // Fallback if calculatePremiumStickerCustomPrice is not available
                const fallbackCostPerSqFt = 15.00;
                const setupFee = 50.00;

                const materialCost = squareFeet * fallbackCostPerSqFt * quantity;
                const subtotal = setupFee + materialCost;

                const rushMultiplier = this.getRushMultiplier(rushType);
                const totalCost = subtotal * rushMultiplier;
                const unitPrice = totalCost / quantity;

                return {
                    totalCost: Math.round(totalCost * 100) / 100,
                    unitPrice: Math.round(unitPrice * 100) / 100,
                    printingSetupCost: setupFee,
                    finishingSetupCost: 0,
                    productionCost: 0,
                    materialCost: materialCost,
                    finishingCost: 0,
                    subtotal: subtotal,
                    rushMultiplier: rushMultiplier,
                    sheetsRequired: quantity,
                    squareFeet: Math.round(squareFeet * 100) / 100
                };
            }
        }
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
            if (contentType === 'lined') return 0;      // Lined pages = no setup
            if (contentType === 'custom') return 15.00; // Custom design
            return 0;
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
        document.getElementById('livePrice').textContent = `$${parseFloat(pricing.totalCost).toFixed(2)}`;
        document.getElementById('liveUnitPrice').textContent = `$${parseFloat(pricing.unitPrice).toFixed(2)}`;
        
        // Update breakdown - handle different field names for different product types
        const isSticker = this.currentConfig.productType === 'stickers';

        // Setup cost
        const setupCost = isSticker ? (pricing.setupFee || 0) : (parseFloat(pricing.printingSetupCost) || 0);
        document.getElementById('redSetupCost').textContent = `$${setupCost.toFixed(2)}`;

        // Production cost - different for standard vs premium stickers
        if (isSticker) {
            const isPremium = pricing.productionType === 'premium';
            const productionCost = isPremium ? 'Premium die-cut production' : 'Wide format production';
            document.getElementById('redProductionCost').textContent = productionCost;
        } else {
            const productionCost = parseFloat(pricing.productionCost) || 0;
            document.getElementById('redProductionCost').textContent = `$${productionCost.toFixed(2)}`;
        }

        // Material cost
        const materialCost = parseFloat(pricing.materialCost) || 0;
        document.getElementById('redMaterialCost').textContent = `$${materialCost.toFixed(2)}`;

        // Show/hide volume discount (large format only)
        const volumeDiscountItem = document.getElementById('redVolumeDiscountItem');
        const volumeDiscountPercent = document.getElementById('redVolumeDiscountPercent');
        const volumeDiscountAmount = document.getElementById('redVolumeDiscount');

        if (pricing.volumeDiscount && pricing.volumeDiscount > 0) {
            volumeDiscountPercent.textContent = `(${pricing.volumeDiscount}% off)`;
            volumeDiscountAmount.textContent = `-$${parseFloat(pricing.volumeSavings).toFixed(2)}`;
            volumeDiscountItem.style.display = 'flex';
        } else {
            volumeDiscountItem.style.display = 'none';
        }

        // Finishing cost - different for standard vs premium stickers
        if (isSticker) {
            const isPremium = pricing.productionType === 'premium';
            const finishingCost = isPremium ? 'Die-cut included' : 'Kiss-cut included';
            document.getElementById('redFinishingCost').textContent = finishingCost;
        } else {
            const finishingCost = parseFloat(pricing.finishingCost) || 0;
            document.getElementById('redFinishingCost').textContent = `$${finishingCost.toFixed(2)}`;
        }

        document.getElementById('redSubtotal').textContent = `$${parseFloat(pricing.subtotal).toFixed(2)}`;

        // Sheets required - only relevant for HP Indigo products
        if (isSticker) {
            const areaInfo = pricing.areaInSqFt ? `${pricing.areaInSqFt.toFixed(4)} sq ft` : 'N/A';
            document.getElementById('redSheetsRequired').textContent = areaInfo;
        } else {
            document.getElementById('redSheetsRequired').textContent = pricing.sheetsRequired || 0;
        }
        
        // Show/hide finishing setup fee
        const finishingSetupItem = document.getElementById('redFinishingSetupItem');
        const finishingSetupCostElement = document.getElementById('redFinishingSetupCost');
        const finishingSetupCostValue = parseFloat(pricing.finishingSetupCost) || 0;
        if (finishingSetupCostValue > 0) {
            finishingSetupCostElement.textContent = `$${finishingSetupCostValue.toFixed(2)}`;
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
            '<span class="status-text text-white">Ready to add to cart</span>';
        
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
        document.getElementById('redVolumeDiscountItem').style.display = 'none';

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
            'flat-prints': 'Flat Prints',
            'folded-prints': 'Folded Prints',
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
            'perfect-bound-books': 'Perfect Bound Books',
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

    bindPerfectBoundEventListeners() {
        // Add event listeners for perfect bound book-specific form elements
        const pagesInput = document.getElementById('pages');

        // Pages input listener
        if (pagesInput) {
            pagesInput.addEventListener('input', () => {
                // Validate even numbers
                const pages = parseInt(pagesInput.value);
                if (pages && pages % 2 !== 0) {
                    pagesInput.setCustomValidity('Page count must be an even number');
                } else {
                    pagesInput.setCustomValidity('');
                }

                this.updateConfiguration();
                this.debouncedPriceCalculation();
            });
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