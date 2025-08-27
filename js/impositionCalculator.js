/**
 * Imposition Calculator with HP Indigo Production Specifications
 * Calculates how many copies fit on a 12.48×18.26" maximum image area
 * Accounts for 0.125" bleed on all sides
 */

class ImpositionCalculator {
    constructor() {
        // HP Indigo production specifications
        this.BLEED = 0.125;              // 1/8" bleed on all sides
        this.PRINTABLE_WIDTH = 12.48;    // HP Indigo max image width
        this.PRINTABLE_HEIGHT = 18.26;   // HP Indigo max image height
        this.MAX_TRIM_WIDTH = 12.23;     // Maximum customer trim width (12.48 - 0.25)
        this.MAX_TRIM_HEIGHT = 18.01;    // Maximum customer trim height (18.26 - 0.25)
        this.MIN_SIZE = 1;               // Minimum dimension (1 inch)
    }

    /**
     * Calculate imposition for given trim size
     * @param {number} trimWidth - Customer's desired width (inches)
     * @param {number} trimHeight - Customer's desired height (inches)
     * @returns {Object} Imposition data with copies per sheet and efficiency
     */
    calculateImposition(trimWidth, trimHeight) {
        // Validate input dimensions
        if (trimWidth < this.MIN_SIZE || trimHeight < this.MIN_SIZE) {
            return {
                copies: 0,
                efficiency: 0,
                error: "Dimensions must be at least 1 inch"
            };
        }

        // Add bleed to get actual file dimensions
        const bleedWidth = trimWidth + (this.BLEED * 2);   // 0.125" × 2 = 0.25"
        const bleedHeight = trimHeight + (this.BLEED * 2);  // 0.125" × 2 = 0.25"

        // Check if size fits on sheet
        if (bleedWidth > this.PRINTABLE_WIDTH || bleedHeight > this.PRINTABLE_HEIGHT) {
            return {
                copies: 0,
                efficiency: 0,
                error: `Size too large. Maximum trim size: ${this.MAX_TRIM_WIDTH}" × ${this.MAX_TRIM_HEIGHT}" (HP Indigo limit)`
            };
        }

        // Calculate imposition in both orientations
        const portraitAcross = Math.floor(this.PRINTABLE_WIDTH / bleedWidth);
        const portraitDown = Math.floor(this.PRINTABLE_HEIGHT / bleedHeight);
        const portraitCopies = portraitAcross * portraitDown;

        const landscapeAcross = Math.floor(this.PRINTABLE_WIDTH / bleedHeight);
        const landscapeDown = Math.floor(this.PRINTABLE_HEIGHT / bleedWidth);
        const landscapeCopies = landscapeAcross * landscapeDown;

        // Use best orientation
        const copies = Math.max(portraitCopies, landscapeCopies);
        const bestOrientation = portraitCopies >= landscapeCopies ? 'portrait' : 'landscape';

        // Calculate efficiency (percentage of sheet area used)
        const itemArea = bleedWidth * bleedHeight;
        const totalItemArea = copies * itemArea;
        const sheetArea = this.PRINTABLE_WIDTH * this.PRINTABLE_HEIGHT;
        const efficiency = (totalItemArea / sheetArea) * 100;

        return {
            copies,
            efficiency: Math.round(efficiency * 10) / 10, // Round to 1 decimal
            orientation: bestOrientation,
            bleedWidth: Math.round(bleedWidth * 1000) / 1000, // Round to 3 decimals
            bleedHeight: Math.round(bleedHeight * 1000) / 1000,
            error: null
        };
    }

    /**
     * Get efficiency rating based on percentage
     * @param {number} efficiency - Efficiency percentage
     * @returns {Object} Rating with color and message
     */
    getEfficiencyRating(efficiency) {
        if (efficiency >= 70) {
            return {
                level: 'excellent',
                color: '#28a745',
                icon: '✅',
                message: 'Excellent sheet utilization'
            };
        } else if (efficiency >= 50) {
            return {
                level: 'good',
                color: '#17a2b8',
                icon: '👍',
                message: 'Good sheet utilization'
            };
        } else if (efficiency >= 30) {
            return {
                level: 'fair',
                color: '#ffc107',
                icon: '⚠️',
                message: 'Consider optimizing size for better efficiency'
            };
        } else {
            return {
                level: 'poor',
                color: '#dc3545',
                icon: '❌',
                message: 'Poor efficiency - strongly consider resizing'
            };
        }
    }

    /**
     * Suggest optimized dimensions for better imposition
     * @param {number} trimWidth - Current trim width
     * @param {number} trimHeight - Current trim height
     * @returns {Array} Array of suggested dimensions
     */
    suggestOptimizedSizes(trimWidth, trimHeight) {
        const suggestions = [];
        const currentImposition = this.calculateImposition(trimWidth, trimHeight);
        
        // Common efficient impositions to try
        const targetImpositions = [4, 6, 8, 10, 12, 16, 20];
        
        for (let target of targetImpositions) {
            if (target <= currentImposition.copies) continue; // Skip worse options
            
            // Try to find dimensions that achieve this imposition
            for (let across = 1; across <= 6; across++) {
                const down = target / across;
                if (down !== Math.floor(down)) continue; // Must be whole number
                
                const maxBleedWidth = this.PRINTABLE_WIDTH / across;
                const maxBleedHeight = this.PRINTABLE_HEIGHT / down;
                
                const suggestedTrimWidth = maxBleedWidth - (this.BLEED * 2);
                const suggestedTrimHeight = maxBleedHeight - (this.BLEED * 2);
                
                // Check if suggestion is reasonable (within 20% of original)
                if (suggestedTrimWidth > 0 && suggestedTrimHeight > 0 &&
                    Math.abs(suggestedTrimWidth - trimWidth) / trimWidth <= 0.2 &&
                    Math.abs(suggestedTrimHeight - trimHeight) / trimHeight <= 0.2) {
                    
                    const roundedWidth = Math.round(suggestedTrimWidth * 8) / 8; // Round to 1/8"
                    const roundedHeight = Math.round(suggestedTrimHeight * 8) / 8;
                    
                    const testImposition = this.calculateImposition(roundedWidth, roundedHeight);
                    
                    if (testImposition.copies > currentImposition.copies) {
                        suggestions.push({
                            width: roundedWidth,
                            height: roundedHeight,
                            copies: testImposition.copies,
                            efficiency: testImposition.efficiency,
                            improvement: testImposition.copies - currentImposition.copies
                        });
                    }
                }
            }
        }
        
        // Remove duplicates and sort by improvement
        const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
            index === self.findIndex(s => s.width === suggestion.width && s.height === suggestion.height)
        );
        
        return uniqueSuggestions
            .sort((a, b) => b.improvement - a.improvement)
            .slice(0, 3); // Return top 3 suggestions
    }

    /**
     * Calculate sheets required for a given quantity
     * @param {number} quantity - Number of items needed
     * @param {number} copies - Copies per sheet (imposition)
     * @returns {number} Number of sheets required
     */
    calculateSheetsRequired(quantity, copies) {
        if (copies <= 0) return 0;
        return Math.ceil(quantity / copies);
    }

    /**
     * Format dimensions for display
     * @param {number} width - Width in inches
     * @param {number} height - Height in inches
     * @returns {string} Formatted dimension string
     */
    formatDimensions(width, height) {
        const formatDimension = (dim) => {
            // Convert to fraction if it's a common fraction
            const fractions = {
                0.125: '⅛',
                0.25: '¼',
                0.375: '⅜',
                0.5: '½',
                0.625: '⅝',
                0.75: '¾',
                0.875: '⅞'
            };
            
            const whole = Math.floor(dim);
            const decimal = dim - whole;
            
            if (fractions[decimal]) {
                return whole > 0 ? `${whole}${fractions[decimal]}` : fractions[decimal].substring(0);
            }
            
            return dim.toString();
        };
        
        return `${formatDimension(width)}" × ${formatDimension(height)}"`;
    }
}

// Export for use in other modules
window.ImpositionCalculator = ImpositionCalculator;