/**
 * Validation Utilities
 * Handles validation of quantities, constraints, and configuration data
 */

class ValidationUtils {
    static validateQuantity(quantity, productType, constraints) {
        if (!constraints || !constraints[productType]) {
            return { valid: true };
        }

        const productConstraints = constraints[productType];

        if (quantity < productConstraints.minQuantity) {
            return {
                valid: false,
                message: `Minimum quantity is ${productConstraints.minQuantity}`
            };
        }

        if (quantity > productConstraints.maxQuantity) {
            return {
                valid: false,
                message: `Maximum quantity is ${productConstraints.maxQuantity}`
            };
        }

        return { valid: true };
    }

    static validateSize(size, productType, impositionData) {
        if (!impositionData || !impositionData[productType]) {
            return { valid: true }; // No constraints available
        }

        const productImposition = impositionData[productType];

        if (size && !productImposition[size]) {
            return {
                valid: false,
                message: `Size ${size} is not available for ${productType}`
            };
        }

        return { valid: true };
    }

    static validatePaperStock(paperCode, paperStocks) {
        if (!paperStocks || !paperCode) {
            return {
                valid: false,
                message: 'Paper selection is required'
            };
        }

        if (!paperStocks[paperCode]) {
            return {
                valid: false,
                message: 'Invalid paper selection'
            };
        }

        return { valid: true };
    }

    static validateDimensions(width, height, productType) {
        const minDimension = 0.5; // Minimum 0.5 inches
        const maxDimension = 72;  // Maximum 72 inches (6 feet)

        if (width < minDimension || height < minDimension) {
            return {
                valid: false,
                message: `Minimum dimension is ${minDimension}"`
            };
        }

        if (width > maxDimension || height > maxDimension) {
            return {
                valid: false,
                message: `Maximum dimension is ${maxDimension}"`
            };
        }

        // Product-specific dimension validation
        switch (productType) {
            case 'business-cards':
                if (width > 4 || height > 3) {
                    return {
                        valid: false,
                        message: 'Business cards cannot exceed 4" × 3"'
                    };
                }
                break;

            case 'postcards':
                if (width > 12 || height > 9) {
                    return {
                        valid: false,
                        message: 'Postcards cannot exceed 12" × 9"'
                    };
                }
                break;

            case 'posters':
                if (width < 8 || height < 8) {
                    return {
                        valid: false,
                        message: 'Posters must be at least 8" × 8"'
                    };
                }
                break;
        }

        return { valid: true };
    }

    static validateBookletPages(pages) {
        if (!pages || pages < 4) {
            return {
                valid: false,
                message: 'Booklets must have at least 4 pages'
            };
        }

        if (pages > 100) {
            return {
                valid: false,
                message: 'Booklets cannot exceed 100 pages'
            };
        }

        if (pages % 4 !== 0) {
            return {
                valid: false,
                message: 'Page count must be divisible by 4'
            };
        }

        return { valid: true };
    }

    static validateConfiguration(config, productType) {
        const errors = [];

        // Common validations
        if (!config.quantity || config.quantity <= 0) {
            errors.push('Quantity is required and must be greater than 0');
        }

        // Product-specific validations
        switch (productType) {
            case 'brochures':
                if (!config.size) errors.push('Size is required');
                if (!config.foldType) errors.push('Fold type is required');
                if (!config.paperType) errors.push('Paper type is required');
                break;

            case 'booklets':
                if (!config.size) errors.push('Size is required');
                if (!config.pages) errors.push('Page count is required');
                if (!config.coverPaperType) errors.push('Cover paper type is required');
                if (!config.textPaperType) errors.push('Text paper type is required');

                const pageValidation = this.validateBookletPages(config.pages);
                if (!pageValidation.valid) {
                    errors.push(pageValidation.message);
                }
                break;

            case 'postcards':
            case 'flyers':
                if (!config.size) errors.push('Size is required');
                if (!config.paperType) errors.push('Paper type is required');
                break;

            case 'stickers':
                if (!config.size) errors.push('Size is required');
                if (!config.stickerType) errors.push('Sticker type is required');
                break;

            case 'magnets':
                if (!config.size) errors.push('Size is required');
                if (!config.magnetType) errors.push('Magnet type is required');
                break;

            case 'apparel':
                if (!config.garmentType) errors.push('Garment type is required');
                if (!config.decorationType) errors.push('Decoration type is required');
                if (!config.totalQuantity || config.totalQuantity <= 0) {
                    errors.push('Total quantity is required for apparel');
                }
                break;
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    static validateFormData(formData, productType) {
        const config = {};

        // Extract configuration from form data
        for (const [key, value] of formData.entries()) {
            config[key] = value;
        }

        // Convert numeric fields
        if (config.quantity) config.quantity = parseInt(config.quantity);
        if (config.pages) config.pages = parseInt(config.pages);
        if (config.totalQuantity) config.totalQuantity = parseInt(config.totalQuantity);

        return this.validateConfiguration(config, productType);
    }

    static sanitizeInput(input, type = 'string') {
        if (input === null || input === undefined) {
            return '';
        }

        const str = String(input).trim();

        switch (type) {
            case 'number':
                const num = parseFloat(str);
                return isNaN(num) ? 0 : num;

            case 'integer':
                const int = parseInt(str);
                return isNaN(int) ? 0 : int;

            case 'string':
            default:
                // Basic XSS prevention
                return str.replace(/[<>]/g, '');
        }
    }

    static sanitizeConfiguration(config) {
        const sanitized = {};

        for (const [key, value] of Object.entries(config)) {
            switch (key) {
                case 'quantity':
                case 'pages':
                case 'totalQuantity':
                    sanitized[key] = this.sanitizeInput(value, 'integer');
                    break;

                case 'customWidth':
                case 'customHeight':
                    sanitized[key] = this.sanitizeInput(value, 'number');
                    break;

                default:
                    sanitized[key] = this.sanitizeInput(value, 'string');
                    break;
            }
        }

        return sanitized;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationUtils;
}

// Global access
if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
}

// Legacy compatibility function
function validateQuantity(quantity, productType, constraints) {
    console.warn('validateQuantity() function is deprecated. Use ValidationUtils.validateQuantity() instead.');
    return ValidationUtils.validateQuantity(quantity, productType, constraints);
}