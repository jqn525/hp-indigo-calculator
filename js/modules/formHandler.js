/**
 * Unified Form Handler
 * Handles form interactions, validation, and state management across all product configurators
 */

class FormHandler {
    constructor(productType, config = {}) {
        this.productType = productType;
        this.config = {
            autoCalculate: true,
            debounceTime: 300,
            validateOnBlur: true,
            updateSummaryOnChange: true,
            ...config
        };

        this.currentValues = {};
        this.validationRules = {};
        this.isCalculating = false;
        this.debounceTimer = null;
        this.eventListeners = new Map();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.extractInitialValues();
        this.setupValidation();
    }

    extractInitialValues() {
        // Extract current form values
        const form = this.getForm();
        if (!form) return;

        const formData = new FormData(form);
        for (const [key, value] of formData.entries()) {
            this.currentValues[key] = value;
        }

        // Handle special cases for different input types
        this.extractSpecialValues();
    }

    extractSpecialValues() {
        // Handle option cards (radio-like selections)
        document.querySelectorAll('.option-card.selected').forEach(card => {
            const option = card.dataset.option;
            const value = card.dataset.value;
            if (option && value) {
                this.currentValues[option] = value;
            }
        });

        // Handle quantity input specifically
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            this.currentValues.quantity = parseInt(quantityInput.value) || 0;
        }

        // Handle custom dimensions
        const customWidth = document.getElementById('customWidth');
        const customHeight = document.getElementById('customHeight');
        if (customWidth) this.currentValues.customWidth = parseFloat(customWidth.value) || 0;
        if (customHeight) this.currentValues.customHeight = parseFloat(customHeight.value) || 0;
    }

    setupEventListeners() {
        this.setupOptionCardListeners();
        this.setupQuantityListeners();
        this.setupInputListeners();
        this.setupFormSubmissionListeners();
    }

    setupOptionCardListeners() {
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            const listener = (e) => {
                e.preventDefault();
                const option = card.dataset.option;
                const value = card.dataset.value;

                if (option && value) {
                    this.selectOption(option, value, card);
                }
            };

            card.addEventListener('click', listener);
            this.eventListeners.set(card, listener);
        });
    }

    setupQuantityListeners() {
        const quantityInput = document.getElementById('quantity');
        const minusBtn = document.querySelector('.quantity-btn.minus, .qty-btn.minus');
        const plusBtn = document.querySelector('.quantity-btn.plus, .qty-btn.plus');

        if (quantityInput) {
            const inputListener = (e) => {
                const value = parseInt(e.target.value) || 0;
                this.updateQuantity(value);
            };

            const blurListener = (e) => {
                if (this.config.validateOnBlur) {
                    this.validateField('quantity', e.target.value);
                }
            };

            quantityInput.addEventListener('input', inputListener);
            quantityInput.addEventListener('blur', blurListener);

            this.eventListeners.set(quantityInput, { input: inputListener, blur: blurListener });
        }

        if (minusBtn) {
            const listener = () => {
                const current = parseInt(quantityInput?.value) || 0;
                const step = this.getQuantityStep();
                const constraints = this.getConstraints();
                const newValue = Math.max(constraints.minQuantity || 1, current - step);
                this.updateQuantity(newValue);
            };

            minusBtn.addEventListener('click', listener);
            this.eventListeners.set(minusBtn, listener);
        }

        if (plusBtn) {
            const listener = () => {
                const current = parseInt(quantityInput?.value) || 0;
                const step = this.getQuantityStep();
                const constraints = this.getConstraints();
                const newValue = Math.min(constraints.maxQuantity || 10000, current + step);
                this.updateQuantity(newValue);
            };

            plusBtn.addEventListener('click', listener);
            this.eventListeners.set(plusBtn, listener);
        }

        // Quantity suggestion buttons
        document.querySelectorAll('.qty-suggestion').forEach(btn => {
            const listener = (e) => {
                const qty = parseInt(e.target.dataset.qty);
                if (qty) this.updateQuantity(qty);
            };

            btn.addEventListener('click', listener);
            this.eventListeners.set(btn, listener);
        });
    }

    setupInputListeners() {
        // Handle all other form inputs
        const form = this.getForm();
        if (!form) return;

        const inputs = form.querySelectorAll('input:not(#quantity), select, textarea');
        inputs.forEach(input => {
            const changeListener = (e) => {
                this.updateValue(e.target.name || e.target.id, e.target.value);
            };

            const blurListener = (e) => {
                if (this.config.validateOnBlur) {
                    this.validateField(e.target.name || e.target.id, e.target.value);
                }
            };

            input.addEventListener('change', changeListener);
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                input.addEventListener('input', changeListener);
            }
            input.addEventListener('blur', blurListener);

            this.eventListeners.set(input, { change: changeListener, blur: blurListener });
        });
    }

    setupFormSubmissionListeners() {
        const addToCartBtn = document.querySelector('#addToCartBtn, .add-to-cart-btn');
        if (addToCartBtn) {
            const listener = (e) => {
                e.preventDefault();
                this.handleFormSubmission('addToCart');
            };

            addToCartBtn.addEventListener('click', listener);
            this.eventListeners.set(addToCartBtn, listener);
        }

        // Handle form submission
        const form = this.getForm();
        if (form) {
            const listener = (e) => {
                e.preventDefault();
                this.handleFormSubmission('submit');
            };

            form.addEventListener('submit', listener);
            this.eventListeners.set(form, listener);
        }
    }

    selectOption(option, value, card) {
        // Update visual selection
        const optionGroup = document.querySelectorAll(`.option-card[data-option="${option}"]`);
        optionGroup.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // Update the corresponding form input if it exists
        const input = document.querySelector(`input[name="${option}"][value="${value}"], input[name="${option}"]`);
        if (input) {
            if (input.type === 'radio' || input.type === 'checkbox') {
                input.checked = true;
            } else {
                input.value = value;
            }
        }

        // Update internal state
        this.updateValue(option, value);
    }

    updateQuantity(quantity) {
        const quantityInput = document.getElementById('quantity');
        if (quantityInput) {
            quantityInput.value = quantity;
        }

        // Update quantity suggestions visual state
        document.querySelectorAll('.qty-suggestion').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.qty) === quantity);
        });

        this.updateValue('quantity', quantity);
    }

    updateValue(key, value) {
        const oldValue = this.currentValues[key];
        this.currentValues[key] = value;

        // Trigger change event for listeners
        this.emit('valueChanged', { key, oldValue, newValue: value });

        // Update configuration summary if enabled
        if (this.config.updateSummaryOnChange) {
            this.updateSummary();
        }

        // Auto-calculate if enabled
        if (this.config.autoCalculate) {
            this.debouncedCalculate();
        }
    }

    validateField(fieldName, value) {
        if (!this.validationRules[fieldName]) return { valid: true };

        const rule = this.validationRules[fieldName];
        const result = rule.validate(value, this.currentValues);

        // Update field visual state
        const input = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (input) {
            input.classList.toggle('is-invalid', !result.valid);
            input.classList.toggle('is-valid', result.valid);
        }

        // Show/hide error message
        const errorElement = document.querySelector(`#${fieldName}-error, .${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = result.message || '';
            errorElement.style.display = result.valid ? 'none' : 'block';
        }

        return result;
    }

    validateForm() {
        let isValid = true;
        const errors = {};

        // Validate quantity using ValidationUtils
        if (typeof ValidationUtils !== 'undefined') {
            const quantityValidation = ValidationUtils.validateQuantity(
                this.currentValues.quantity,
                this.productType,
                this.getConstraints()
            );

            if (!quantityValidation.valid) {
                isValid = false;
                errors.quantity = quantityValidation.message;
            }

            // Validate full configuration
            const configValidation = ValidationUtils.validateConfiguration(this.currentValues, this.productType);
            if (!configValidation.valid) {
                isValid = false;
                configValidation.errors.forEach(error => {
                    const field = error.toLowerCase().includes('quantity') ? 'quantity' :
                                 error.toLowerCase().includes('size') ? 'size' :
                                 error.toLowerCase().includes('paper') ? 'paperType' : 'general';
                    errors[field] = error;
                });
            }
        }

        // Custom validation rules
        for (const [fieldName, rule] of Object.entries(this.validationRules)) {
            const result = this.validateField(fieldName, this.currentValues[fieldName]);
            if (!result.valid) {
                isValid = false;
                errors[fieldName] = result.message;
            }
        }

        return { valid: isValid, errors };
    }

    addValidationRule(fieldName, validateFn, message = '') {
        this.validationRules[fieldName] = {
            validate: validateFn,
            message: message
        };
    }

    removeValidationRule(fieldName) {
        delete this.validationRules[fieldName];
    }

    getFormData() {
        // Return sanitized form data
        if (typeof ValidationUtils !== 'undefined') {
            return ValidationUtils.sanitizeConfiguration(this.currentValues);
        }
        return { ...this.currentValues };
    }

    getForm() {
        return document.querySelector('form, .configurator-form') ||
               document.querySelector(`#${this.productType}Form`) ||
               document.querySelector('.configuration-panel form');
    }

    getConstraints() {
        // Get product constraints from global configuration
        if (typeof window.pricingConfigs !== 'undefined' && window.pricingConfigs.product_constraints) {
            return window.pricingConfigs.product_constraints[this.productType] || {};
        }
        return {};
    }

    getQuantityStep() {
        const steps = {
            'table-tents': 5,
            'name-tags': 10,
            'stickers': 5,
            'magnets': 5
        };
        return steps[this.productType] || 25;
    }

    updateSummary() {
        // Update configuration summary display
        this.emit('summaryUpdate', this.currentValues);

        // Update specific summary elements if they exist
        Object.entries(this.currentValues).forEach(([key, value]) => {
            const summaryElement = document.querySelector(`#current${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (summaryElement) {
                summaryElement.textContent = this.formatSummaryValue(key, value);
            }
        });
    }

    formatSummaryValue(key, value) {
        // Format values for display in summary
        switch (key) {
            case 'paperType':
                return this.getPaperDisplayName(value);
            case 'rushType':
                return value === 'standard' ? 'Standard' : value === '2-day' ? '2-Day Rush' :
                       value === 'next-day' ? 'Next Day' : value === 'same-day' ? 'Same Day' : value;
            case 'quantity':
                return parseInt(value).toLocaleString();
            default:
                return value;
        }
    }

    getPaperDisplayName(paperCode) {
        // Get human-readable paper name
        if (typeof window.paperStocks !== 'undefined' && window.paperStocks[paperCode]) {
            return window.paperStocks[paperCode].description || paperCode;
        }
        return paperCode;
    }

    debouncedCalculate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.calculate();
        }, this.config.debounceTime);
    }

    async calculate() {
        if (this.isCalculating) return;

        this.isCalculating = true;
        this.emit('calculationStart');

        try {
            const validation = this.validateForm();
            if (!validation.valid) {
                this.emit('calculationError', validation.errors);
                return;
            }

            const formData = new FormData();
            Object.entries(this.currentValues).forEach(([key, value]) => {
                formData.append(key, value);
            });

            // Trigger calculation event for listeners
            this.emit('calculate', { formData, productType: this.productType });

        } catch (error) {
            console.error('Form calculation error:', error);
            this.emit('calculationError', error);
        } finally {
            this.isCalculating = false;
            this.emit('calculationEnd');
        }
    }

    async handleFormSubmission(action) {
        const validation = this.validateForm();
        if (!validation.valid) {
            this.emit('validationError', validation.errors);
            return false;
        }

        const formData = this.getFormData();
        this.emit('formSubmit', { action, formData, productType: this.productType });

        return true;
    }

    // Event system for external listeners
    on(event, callback) {
        if (!this.listeners) this.listeners = {};
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners || !this.listeners[event]) return;
        const index = this.listeners[event].indexOf(callback);
        if (index > -1) {
            this.listeners[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners || !this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    destroy() {
        // Clean up event listeners
        for (const [element, listeners] of this.eventListeners) {
            if (typeof listeners === 'function') {
                element.removeEventListener('click', listeners);
            } else {
                Object.entries(listeners).forEach(([event, listener]) => {
                    element.removeEventListener(event, listener);
                });
            }
        }

        this.eventListeners.clear();

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.listeners = {};
    }

    // Static utility methods
    static createForProduct(productType, config = {}) {
        return new FormHandler(productType, config);
    }

    static getProductTypeFromPage() {
        // Auto-detect product type from current page
        if (document.getElementById('postcardForm')) return 'postcards';
        if (document.getElementById('nameTagForm')) return 'name-tags';
        if (document.getElementById('flyerForm')) return 'flyers';
        if (document.getElementById('bookmarkForm')) return 'bookmarks';
        if (document.getElementById('brochureForm')) return 'brochures';
        if (document.getElementById('bookletCalculator')) return 'booklets';
        if (document.getElementById('magnetForm')) return 'magnets';
        if (document.getElementById('stickerForm')) return 'stickers';
        if (document.getElementById('apparelForm')) return 'apparel';
        if (document.getElementById('toteBagForm')) return 'tote-bags';
        if (document.getElementById('tableTentForm')) return 'table-tents';
        if (document.getElementById('posterForm')) return 'posters';

        return 'brochures'; // Default fallback
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}

// Global access
if (typeof window !== 'undefined') {
    window.FormHandler = FormHandler;
}