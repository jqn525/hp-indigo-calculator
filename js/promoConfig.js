// Promotional Products Configuration
// Separate pricing system for outsourced promotional items

const promoConfig = {
  // Base pricing structure for promotional products
  pricing: {
    // Standard markup percentage over supplier cost
    markupPercentage: 0.40, // 40% markup
    
    // Setup fees for different decoration types
    setupFees: {
      'screen-print': 50.00,
      'embroidery': 75.00,
      'heat-transfer': 35.00,
      'dtf': 60.00,
      'full-color': 25.00,
      'spot-color': 35.00,
      'super-matte': 25.00,
      'vinyl': 45.00,
      'paper': 25.00,
      'clear': 50.00
    },
    
    // Rush multipliers
    rushMultipliers: {
      'standard': 1.0,
      'rush': 1.25,  // 25% increase for magnets/stickers
      'express': 1.50 // 50% increase for apparel
    },
    
    // Centralized decoration pricing (used by both apparel and tote bags)
    decorationPricing: {
      'dtf': {
        setupFee: 60.00,
        printingCost: 10.00  // per piece
      },
      'screen-print': {
        setupFee: 50.00,
        printingCost: 8.00   // per piece (placeholder - disabled for now)
      }
    }
  },

  // Product-specific constraints and base costs
  products: {
    magnets: {
      name: 'Custom Magnets',
      minQuantity: 25,
      maxQuantity: 1000,
      stepQuantity: 5,
      
      // Supplier cost brackets for linear interpolation pricing
      quantityBrackets: [25, 50, 100, 250, 500, 1000],
      
      // Supplier costs at each bracket (before 25% markup)
      supplierCosts: {
        '2x2': [41.00, 61.00, 101.00, 173.00, 293.00, 533.00],
        '3x3': [53.00, 85.00, 150.00, 295.00, 538.00, 1023.00],
        '4x4': [69.00, 118.00, 216.00, 460.00, 867.00, 1680.00],
        '5x5': [90.00, 159.00, 298.00, 666.00, 1279.00, 2504.00]
      },
      
      // Magnet-specific markup (25% instead of default 40%)
      markupPercentage: 0.25,
      
      // Legacy volume breaks (not used for magnets with new pricing)
      volumeBreaks: []
    },

    stickers: {
      name: 'Custom Stickers',
      minQuantity: 25,
      maxQuantity: 1000,
      stepQuantity: 5,
      
      // Supplier cost brackets for linear interpolation pricing
      quantityBrackets: [25, 50, 100, 250, 500, 1000],
      
      // Supplier costs at each bracket (before 25% markup)
      supplierCosts: {
        '2x2': [40.00, 59.00, 98.00, 150.00, 221.00, 344.00],
        '2.5x2.5': [44.00, 68.00, 113.00, 180.00, 277.00, 443.00],
        '3x3': [49.00, 77.00, 130.00, 214.00, 335.00, 545.00],
        '3.5x3.5': [54.00, 88.00, 147.00, 250.00, 399.00, 655.00],
        '4x4': [60.00, 100.00, 164.00, 286.00, 463.00, 776.00],
        '4.5x4.5': [67.00, 112.00, 183.00, 329.00, 538.00, 906.00],
        '5x5': [74.00, 123.00, 204.00, 374.00, 615.00, 1051.00],
        '5.5x5.5': [82.00, 136.00, 225.00, 418.00, 700.00, 1200.00]
      },
      
      // Sticker-specific markup (25% instead of default 40%)
      markupPercentage: 0.25,
      
      // Legacy volume breaks (not used with new pricing)
      volumeBreaks: []
    },

    'stickers-inhouse': {
      name: 'Standard Stickers (In-House)',
      minQuantity: 10,
      maxQuantity: 1000,
      stepQuantity: 1,
      
      // In-house production pricing
      pricePerSqFt: 12.00,
      setupFee: 30.00,
      
      // Standard sizes for quick reference
      standardSizes: {
        '2x2': 4,    // sq inches
        '3x3': 9,    // sq inches
        '4x4': 16,   // sq inches
        '5x5': 25,   // sq inches
        '6x6': 36    // sq inches
      },
      
      // Volume discounts for in-house production
      volumeBreaks: [
        { min: 10, max: 49, discount: 0.0 },
        { min: 50, max: 99, discount: 0.05 },
        { min: 100, max: 249, discount: 0.10 },
        { min: 250, max: 499, discount: 0.15 },
        { min: 500, max: 1000, discount: 0.20 }
      ]
    },

    apparel: {
      name: 'Custom Apparel',
      minQuantity: 10,
      maxQuantity: 5000,
      stepQuantity: 1,
      
      // Standard sizes (XS-XL) - garment cost with 25% markup
      baseCosts: {
        'gildan-6400': {
          'dtf': 5.25
        },
        'atc-f2700': {
          'dtf': 29.99
        },
        'gildan-sf000': {
          'dtf': 19.99
        },
        'gildan-1801': {
          'dtf': 15.03
        },
        'gildan-sf500': {
          'dtf': 24.38
        },
        'gildan-1850': {
          'dtf': 21.96
        }
      },
      
      // Extended sizes (2XL-4XL) - garment cost with 25% markup
      extendedSizeCosts: {
        'gildan-6400': {
          'dtf': 9.56
        },
        'atc-f2700': {
          'dtf': 33.74
        },
        'gildan-sf000': {
          'dtf': 27.49
        },
        'gildan-1801': {
          'dtf': 21.46
        },
        'gildan-sf500': {
          'dtf': 34.38
        },
        'gildan-1850': {
          'dtf': 30.20
        }
      },
      
      // Apparel uses the centralized decoration pricing from pricing.decorationPricing
      
      volumeBreaks: [
        { min: 10, max: 23, discount: 0.0 },
        { min: 24, max: 47, discount: 0.05 },
        { min: 48, max: 99, discount: 0.10 },
        { min: 100, max: 249, discount: 0.15 },
        { min: 250, max: 5000, discount: 0.20 }
      ]
    },

    'tote-bags': {
      name: 'Canvas Tote Bags',
      minQuantity: 10,
      maxQuantity: 5000,
      stepQuantity: 5,
      
      // Fixed pricing structure
      bagCost: 5.00,  // Bag cost already includes markup
      
      // Print size multipliers (applied to base decoration cost)
      printSizeMultipliers: {
        '10x10': 1.0,   // Standard size, no multiplier
        '12x12': 1.25   // 25% increase for larger size
      },
      
      // No volume discounts for simplified pricing
      volumeBreaks: [
        { min: 10, max: 5000, discount: 0.0 }
      ]
    }
  },

  // Helper function to get volume discount
  getVolumeDiscount: function(productType, quantity) {
    const product = this.products[productType];
    if (!product) return 0;
    
    const volumeBreak = product.volumeBreaks.find(
      vb => quantity >= vb.min && quantity <= vb.max
    );
    
    return volumeBreak ? volumeBreak.discount : 0;
  },

  // Helper function to get base cost
  getBaseCost: function(productType, specifications) {
    const product = this.products[productType];
    if (!product) return 0;
    
    let cost = 0;
    
    switch (productType) {
      case 'magnets':
        cost = product.baseCosts[specifications.size]?.[specifications.type] || 0;
        break;
        
      case 'stickers':
        cost = product.baseCosts[specifications.size]?.[specifications.type] || 0;
        break;
        
      case 'apparel':
        cost = product.baseCosts[specifications.garmentType]?.[specifications.decorationType] || 0;
        if (specifications.sizeMix === 'extended') {
          cost += product.extendedSizeFee;
        }
        break;
        
      case 'tote-bags':
        // For tote bags, return the bag cost + decoration printing cost (adjusted for size)
        const decorationData = this.pricing.decorationPricing[specifications.decorationType];
        const sizeMultiplier = product.printSizeMultipliers[specifications.size] || 1.0;
        const decorationCost = decorationData ? decorationData.printingCost * sizeMultiplier : 0;
        cost = product.bagCost + decorationCost;
        break;
    }
    
    return cost;
  }
};