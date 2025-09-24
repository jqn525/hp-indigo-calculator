/**
 * Pricing Data Manager
 * Handles loading, caching, and accessing pricing data from static files and database
 */

class PricingDataManager {
    constructor() {
        this.data = {
            paperStocks: null,
            pricingConfigs: null,
            isLoaded: false,
            isFromDatabase: false
        };
    }

    async initialize() {
        if (this.data.isLoaded) {
            return this.data;
        }

        // Load from static files first (authoritative source)
        if (typeof paperStocks !== 'undefined' && typeof pricingConfig !== 'undefined') {
            this.data.paperStocks = paperStocks;
            this.data.pricingConfigs = {
                formula: pricingConfig.formula,
                productFormulas: pricingConfig.productFormulas,
                product_constraints: pricingConfig.productConstraints,
                imposition_data: pricingConfig.impositionData,
                finishing_costs: pricingConfig.finishingCosts,
                rush_multipliers: pricingConfig.rushMultipliers
            };
            this.data.isFromDatabase = false;
            this.data.isLoaded = true;

            console.log('📄 Using static pricing data (authoritative)');
            return this.data;
        }

        // Fallback to database only if static files unavailable
        try {
            if (window.dbManager) {
                const dbData = await window.dbManager.getPricingData();

                if (dbData.paperStocks && dbData.pricingConfigs) {
                    this.data.paperStocks = dbData.paperStocks;
                    this.data.pricingConfigs = dbData.pricingConfigs;
                    this.data.isFromDatabase = dbData.isFromDatabase;
                    this.data.isLoaded = true;

                    console.log('🗄️ Using database pricing data (fallback)');
                    return this.data;
                }
            }
        } catch (error) {
            console.warn('Database fallback failed:', error);
        }

        console.error('❌ No pricing data available');
        return null;
    }

    async getPricingData() {
        if (!this.data.isLoaded) {
            await this.initialize();
        }
        return this.data;
    }

    async getPaperStock(paperCode) {
        const data = await this.getPricingData();
        return data?.paperStocks?.[paperCode] || null;
    }

    async getFormulaConfig() {
        const data = await this.getPricingData();
        return data?.pricingConfigs?.formula || null;
    }

    async getProductConstraints(productType) {
        const data = await this.getPricingData();
        return data?.pricingConfigs?.product_constraints?.[productType] || null;
    }

    async getImpositionData(productType) {
        const data = await this.getPricingData();
        return data?.pricingConfigs?.imposition_data?.[productType] || null;
    }

    async getFinishingCosts(finishingType) {
        const data = await this.getPricingData();
        return data?.pricingConfigs?.finishing_costs?.[finishingType] || null;
    }

    async getRushMultiplier(rushType) {
        const data = await this.getPricingData();
        return data?.pricingConfigs?.rush_multipliers?.[rushType] || null;
    }

    isDataFromDatabase() {
        return this.data.isFromDatabase;
    }

    isDataLoaded() {
        return this.data.isLoaded;
    }

    clearCache() {
        this.data = {
            paperStocks: null,
            pricingConfigs: null,
            isLoaded: false,
            isFromDatabase: false
        };
    }
}

// Global singleton instance
if (typeof window !== 'undefined') {
    window.pricingDataManager = window.pricingDataManager || new PricingDataManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PricingDataManager;
}

// Legacy compatibility function
async function initializePricingData() {
    console.warn('initializePricingData() is deprecated. Use window.pricingDataManager.getPricingData() instead.');
    return await window.pricingDataManager.getPricingData();
}