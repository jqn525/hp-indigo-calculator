/**
 * Pricing Engine
 * Core pricing formula calculations and cost breakdowns
 */

class PricingEngine {
    constructor() {
        this.dataManager = window.pricingDataManager || new PricingDataManager();
    }

    async calculatePrice(productType, config) {
        try {
            // Validate configuration first
            const validation = ValidationUtils.validateConfiguration(config, productType);
            if (!validation.valid) {
                return {
                    error: validation.errors.join(', ')
                };
            }

            // Route to appropriate calculation method
            switch (productType) {
                case 'brochures':
                    return await this.calculateBrochurePrice(config);
                case 'postcards':
                    return await this.calculatePostcardPrice(config);
                case 'flyers':
                    return await this.calculateFlyerPrice(config);
                case 'booklets':
                    return await this.calculateBookletPrice(config);
                case 'posters':
                    return await this.calculatePosterPrice(config);
                case 'table-tents':
                    return await this.calculateTableTentPrice(config);
                case 'name-tags':
                    return await this.calculateNameTagPrice(config);
                case 'bookmarks':
                    return await this.calculateBookmarkPrice(config);
                case 'notebooks':
                case 'notepads':
                    return await this.calculateNotebookPrice(config);
                default:
                    return await this.calculateGenericPrice(productType, config);
            }
        } catch (error) {
            console.error('Pricing calculation error:', error);
            return { error: error.message };
        }
    }

    async calculateGenericPrice(productType, config) {
        const data = await this.dataManager.getPricingData();
        if (!data) {
            return { error: 'Pricing data not available' };
        }

        const quantity = parseInt(config.quantity);
        const size = config.size;
        const paperCode = config.paperType || config.textPaper;
        const rushType = config.rushType || 'standard';

        // Validate quantity constraints
        const validation = ValidationUtils.validateQuantity(quantity, productType, data.pricingConfigs.product_constraints);
        if (!validation.valid) {
            return { error: validation.message };
        }

        // Get formula configuration
        const formula = data.pricingConfigs.formula;
        const paperStock = await this.dataManager.getPaperStock(paperCode);
        if (!paperStock) {
            return { error: 'Invalid paper selection' };
        }

        // Get imposition
        const imposition = await ImpositionUtils.getImposition(size, productType, data.pricingConfigs.imposition_data);

        // Calculate using standard formula
        const result = await this.calculateStandardFormula({
            quantity,
            size,
            paperStock,
            imposition,
            formula,
            rushType,
            productType,
            config
        });

        return result;
    }

    async calculateStandardFormula(params) {
        const {
            quantity,
            size,
            paperStock,
            imposition,
            formula,
            rushType,
            productType,
            config
        } = params;

        // Formula: C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
        const S = formula.setupFee || 15.0;
        const F_setup = formula.finishingSetupFee || 15.0;
        const k = formula.baseProductionRate || 1.5;
        const e = this.getEfficiencyExponent(productType);
        const clicks = formula.clicksCost || 0.10;

        // Calculate variable cost per piece: v = (paper + clicks) × markup / imposition
        const paperCost = paperStock.costPerSheet || 0;
        const markup = formula.materialMarkup || 1.5;
        const v = (paperCost + clicks) * markup / imposition;

        // Calculate finishing cost per piece
        const f = await this.calculateFinishingCost(config, productType);

        // Determine if finishing is needed
        const needsFinishing = f > 0;

        // Get rush multiplier
        const rushData = await this.dataManager.getRushMultiplier(rushType);
        const rushMultiplier = rushData?.multiplier || 1.0;

        // Calculate cost components
        const printingSetupCost = S;
        const finishingSetupCost = needsFinishing ? F_setup : 0;
        const productionCost = Math.pow(quantity, e) * k;
        const materialCost = quantity * v;
        const finishingCost = quantity * f;

        // Calculate subtotal and apply rush multiplier
        const subtotal = printingSetupCost + finishingSetupCost + productionCost + materialCost + finishingCost;
        const totalCost = subtotal * rushMultiplier;

        // Calculate additional info
        const sheetsRequired = ImpositionUtils.calculateSheetUsage(quantity, imposition);
        const unitPrice = totalCost / quantity;

        return {
            total: parseFloat(totalCost.toFixed(2)),
            unitPrice: parseFloat(unitPrice.toFixed(2)),
            breakdown: {
                setup: parseFloat(printingSetupCost.toFixed(2)),
                production: parseFloat(productionCost.toFixed(2)),
                materials: parseFloat(materialCost.toFixed(2)),
                finishing: parseFloat(finishingCost.toFixed(2)),
                subtotal: parseFloat(subtotal.toFixed(2)),
                rushMultiplier: rushMultiplier > 1 ? `${rushMultiplier}x` : '1x'
            },
            details: {
                quantity,
                sheetsRequired,
                imposition,
                paperUsed: paperStock.displayName || paperStock.name,
                rushType
            }
        };
    }

    getEfficiencyExponent(productType) {
        const exponents = {
            'brochures': 0.75,
            'postcards': 0.70,
            'flyers': 0.75,
            'booklets': 0.80,
            'posters': 0.65,
            'table-tents': 0.75,
            'name-tags': 0.70,
            'bookmarks': 0.70,
            'notebooks': 0.80,
            'notepads': 0.80
        };

        return exponents[productType] || 0.75;
    }

    async calculateFinishingCost(config, productType) {
        const data = await this.dataManager.getPricingData();
        const finishingCosts = data?.pricingConfigs?.finishing_costs || {};

        let cost = 0;

        // Product-specific finishing
        switch (productType) {
            case 'brochures':
                if (config.foldType && config.foldType !== 'none') {
                    cost += finishingCosts.folding || 0.05;
                }
                break;

            case 'booklets':
                if (config.binding) {
                    cost += finishingCosts[config.binding] || finishingCosts['saddle-stitch'] || 0.15;
                }
                break;

            case 'postcards':
            case 'business-cards':
                if (config.coating && config.coating !== 'none') {
                    cost += finishingCosts[config.coating] || 0.02;
                }
                break;

            case 'table-tents':
                cost += finishingCosts.scoring || 0.08;
                break;

            case 'name-tags':
                if (config.perforation) {
                    cost += finishingCosts.perforation || 0.03;
                }
                break;
        }

        return cost;
    }

    async calculateBrochurePrice(config) {
        const data = await this.dataManager.getPricingData();
        if (!data) {
            return { error: 'Pricing data not available' };
        }

        return await this.calculateStandardFormula({
            quantity: parseInt(config.quantity),
            size: config.size,
            paperStock: await this.dataManager.getPaperStock(config.paperType),
            imposition: await ImpositionUtils.getImposition(config.size, 'brochures', data.pricingConfigs.imposition_data),
            formula: data.pricingConfigs.formula,
            rushType: config.rushType || 'standard',
            productType: 'brochures',
            config
        });
    }

    async calculatePostcardPrice(config) {
        const data = await this.dataManager.getPricingData();
        if (!data) {
            return { error: 'Pricing data not available' };
        }

        return await this.calculateStandardFormula({
            quantity: parseInt(config.quantity),
            size: config.size,
            paperStock: await this.dataManager.getPaperStock(config.paperType),
            imposition: await ImpositionUtils.getImposition(config.size, 'postcards', data.pricingConfigs.imposition_data),
            formula: data.pricingConfigs.formula,
            rushType: config.rushType || 'standard',
            productType: 'postcards',
            config
        });
    }

    async calculateFlyerPrice(config) {
        const data = await this.dataManager.getPricingData();
        if (!data) {
            return { error: 'Pricing data not available' };
        }

        return await this.calculateStandardFormula({
            quantity: parseInt(config.quantity),
            size: config.size,
            paperStock: await this.dataManager.getPaperStock(config.paperType),
            imposition: await ImpositionUtils.getImposition(config.size, 'flyers', data.pricingConfigs.imposition_data),
            formula: data.pricingConfigs.formula,
            rushType: config.rushType || 'standard',
            productType: 'flyers',
            config
        });
    }

    async calculateBookletPrice(config) {
        const data = await this.dataManager.getPricingData();
        if (!data) {
            return { error: 'Pricing data not available' };
        }

        // Booklets use both cover and text paper
        const coverPaper = await this.dataManager.getPaperStock(config.coverPaperType);
        const textPaper = await this.dataManager.getPaperStock(config.textPaperType);

        if (!coverPaper || !textPaper) {
            return { error: 'Invalid paper selection' };
        }

        const quantity = parseInt(config.quantity);
        const pages = parseInt(config.pages);
        const size = config.size;

        // Calculate text sheets needed (4 pages per sheet)
        const textSheets = Math.ceil((pages - 4) / 4); // Subtract cover pages
        const coverSheets = 1; // One cover sheet per booklet

        // Get imposition for covers and text
        const coverImposition = await ImpositionUtils.getImposition(size, 'booklets', data.pricingConfigs.imposition_data);
        const textImposition = coverImposition; // Usually same for both

        // Calculate material costs
        const coverMaterialCost = (coverPaper.costPerSheet * coverSheets / coverImposition) * quantity;
        const textMaterialCost = (textPaper.costPerSheet * textSheets / textImposition) * quantity;
        const totalMaterialCost = coverMaterialCost + textMaterialCost;

        // Calculate using modified formula for booklets
        const formula = data.pricingConfigs.formula;
        const S = formula.setupFee || 15.0;
        const F_setup = formula.finishingSetupFee || 15.0;
        const k = formula.baseProductionRate || 1.5;
        const e = 0.80; // Booklets have different efficiency
        const rushMultiplier = (await this.dataManager.getRushMultiplier(config.rushType || 'standard'))?.multiplier || 1.0;

        const printingSetupCost = S;
        const finishingSetupCost = F_setup; // Booklets always need binding
        const productionCost = Math.pow(quantity, e) * k;
        const finishingCost = quantity * (await this.calculateFinishingCost(config, 'booklets'));

        const subtotal = printingSetupCost + finishingSetupCost + productionCost + totalMaterialCost + finishingCost;
        const totalCost = subtotal * rushMultiplier;
        const unitPrice = totalCost / quantity;

        return {
            total: parseFloat(totalCost.toFixed(2)),
            unitPrice: parseFloat(unitPrice.toFixed(2)),
            breakdown: {
                setup: parseFloat(printingSetupCost.toFixed(2)),
                production: parseFloat(productionCost.toFixed(2)),
                materials: parseFloat(totalMaterialCost.toFixed(2)),
                finishing: parseFloat(finishingCost.toFixed(2)),
                subtotal: parseFloat(subtotal.toFixed(2)),
                rushMultiplier: rushMultiplier > 1 ? `${rushMultiplier}x` : '1x'
            },
            details: {
                quantity,
                pages,
                coverSheets: Math.ceil(quantity / coverImposition),
                textSheets: Math.ceil((quantity * textSheets) / textImposition),
                coverPaper: coverPaper.displayName || coverPaper.name,
                textPaper: textPaper.displayName || textPaper.name
            }
        };
    }

    async calculatePosterPrice(config) {
        // Posters typically use different paper and have simpler pricing
        return await this.calculateGenericPrice('posters', config);
    }

    async calculateTableTentPrice(config) {
        return await this.calculateGenericPrice('table-tents', config);
    }

    async calculateNameTagPrice(config) {
        return await this.calculateGenericPrice('name-tags', config);
    }

    async calculateBookmarkPrice(config) {
        return await this.calculateGenericPrice('bookmarks', config);
    }

    async calculateNotebookPrice(config) {
        return await this.calculateGenericPrice('notebooks', config);
    }
}

// Global singleton instance
if (typeof window !== 'undefined') {
    window.pricingEngine = window.pricingEngine || new PricingEngine();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PricingEngine;
}

// Global function for backward compatibility
async function calculatePrice(productType, config) {
    return await window.pricingEngine.calculatePrice(productType, config);
}