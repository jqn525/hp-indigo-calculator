/**
 * Imposition Utilities
 * Handles imposition calculations, size parsing, and layout optimization
 */

class ImpositionUtils {
    static parseSizeString(sizeStr) {
        if (!sizeStr) return { width: 0, height: 0 };

        const parts = sizeStr.replace(/['"]/g, '').split('x');
        return {
            width: parseFloat(parts[0]) || 0,
            height: parseFloat(parts[1]) || 0
        };
    }

    static formatSizeString(width, height) {
        return `${width}x${height}`;
    }

    static async getDynamicImposition(width, height) {
        // Use the ImpositionCalculator for accurate calculations
        if (typeof ImpositionCalculator === 'undefined') {
            console.warn('ImpositionCalculator not loaded, using static fallback');
            return null;
        }

        try {
            const calc = new ImpositionCalculator();
            const result = calc.calculateImposition(width, height);

            if (result.error) {
                console.error('Imposition calculation error:', result.error);
                return null;
            }

            return result.copies || 1;
        } catch (error) {
            console.error('Error in getDynamicImposition:', error);
            return null;
        }
    }

    static async getImposition(size, productType, impositionData) {
        // First try dynamic calculation
        const dimensions = this.parseSizeString(size);
        if (dimensions.width > 0 && dimensions.height > 0) {
            const dynamicImposition = await this.getDynamicImposition(dimensions.width, dimensions.height);
            if (dynamicImposition) {
                console.log(`${productType} ${size}: Using dynamic imposition ${dynamicImposition}`);
                return dynamicImposition;
            }
        }

        // Fallback to static data
        const staticImposition = impositionData?.[productType]?.[size];
        if (staticImposition) {
            console.log(`${productType} ${size}: Using static imposition ${staticImposition}`);
            return staticImposition;
        }

        console.warn(`No imposition data found for ${productType} ${size}`);
        return 1; // Default fallback
    }

    static calculateSheetUsage(quantity, imposition) {
        if (!imposition || imposition <= 0) return 0;
        return Math.ceil(quantity / imposition);
    }

    static calculateWaste(quantity, imposition) {
        const sheetsNeeded = this.calculateSheetUsage(quantity, imposition);
        const totalCapacity = sheetsNeeded * imposition;
        const waste = totalCapacity - quantity;
        const wastePercentage = totalCapacity > 0 ? (waste / totalCapacity) * 100 : 0;

        return {
            wasteQuantity: waste,
            wastePercentage: Math.round(wastePercentage * 100) / 100
        };
    }

    static getStandardSizes(productType) {
        const sizes = {
            'brochures': ['8.5x11', '11x17'],
            'postcards': ['4x6', '5x7', '6x9'],
            'flyers': ['8.5x11', '11x17'],
            'business-cards': ['3.5x2'],
            'booklets': ['8.5x11', '5.5x8.5'],
            'posters': ['11x17', '18x24', '24x36'],
            'table-tents': ['4x6', '5x7'],
            'name-tags': ['3x4', '2.25x3.5'],
            'bookmarks': ['2x6', '2.5x8'],
            'stickers': ['3x3', '4x4', '2x2'],
            'magnets': ['3x3', '4x4', '2x2']
        };

        return sizes[productType] || [];
    }

    static validateSize(size, productType) {
        const standardSizes = this.getStandardSizes(productType);

        if (standardSizes.length === 0) {
            return { valid: true }; // No restrictions for this product type
        }

        return {
            valid: standardSizes.includes(size),
            message: standardSizes.includes(size) ?
                '' : `Available sizes: ${standardSizes.join(', ')}`
        };
    }

    static getOptimalImposition(width, height, sheetWidth = 12, sheetHeight = 18) {
        if (width <= 0 || height <= 0) return null;

        // Calculate how many pieces fit across and down
        const acrossNormal = Math.floor(sheetWidth / width);
        const downNormal = Math.floor(sheetHeight / height);

        // Calculate rotated layout
        const acrossRotated = Math.floor(sheetWidth / height);
        const downRotated = Math.floor(sheetHeight / width);

        const normalImposition = acrossNormal * downNormal;
        const rotatedImposition = acrossRotated * downRotated;

        // Return the better layout
        if (normalImposition >= rotatedImposition) {
            return {
                across: acrossNormal,
                down: downNormal,
                total: normalImposition,
                rotated: false,
                efficiency: this.calculateEfficiency(width, height, acrossNormal, downNormal, sheetWidth, sheetHeight)
            };
        } else {
            return {
                across: acrossRotated,
                down: downRotated,
                total: rotatedImposition,
                rotated: true,
                efficiency: this.calculateEfficiency(height, width, acrossRotated, downRotated, sheetWidth, sheetHeight)
            };
        }
    }

    static calculateEfficiency(pieceWidth, pieceHeight, across, down, sheetWidth, sheetHeight) {
        const usedArea = pieceWidth * pieceHeight * across * down;
        const totalArea = sheetWidth * sheetHeight;
        return totalArea > 0 ? usedArea / totalArea : 0;
    }

    static getAreaSquareInches(size) {
        const dimensions = this.parseSizeString(size);
        return dimensions.width * dimensions.height;
    }

    static isCustomSize(size, productType) {
        const standardSizes = this.getStandardSizes(productType);
        return !standardSizes.includes(size);
    }

    static suggestAlternativeSize(width, height, productType) {
        const standardSizes = this.getStandardSizes(productType);
        const targetArea = width * height;

        let bestMatch = null;
        let smallestDifference = Infinity;

        standardSizes.forEach(size => {
            const dimensions = this.parseSizeString(size);
            const area = dimensions.width * dimensions.height;
            const difference = Math.abs(area - targetArea);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                bestMatch = size;
            }
        });

        return bestMatch;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImpositionUtils;
}

// Global access
if (typeof window !== 'undefined') {
    window.ImpositionUtils = ImpositionUtils;
}

// Legacy compatibility functions
function getDynamicImposition(width, height) {
    console.warn('getDynamicImposition() function is deprecated. Use ImpositionUtils.getDynamicImposition() instead.');
    return ImpositionUtils.getDynamicImposition(width, height);
}

function parseSizeString(sizeStr) {
    console.warn('parseSizeString() function is deprecated. Use ImpositionUtils.parseSizeString() instead.');
    return ImpositionUtils.parseSizeString(sizeStr);
}