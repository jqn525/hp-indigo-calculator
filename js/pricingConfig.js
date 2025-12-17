// Pricing Configuration for SFU Document Solutions
// All pricing rules, constraints, and multipliers

const pricingConfig = {
  // Fixed formula values
  formula: {
    setupFee: 15.00,           // S = $15.00 (prepress and printing setup)
    finishingSetupFee: 15.00,  // F_setup = $15.00 (finishing setup when required)
    baseProductionRate: 1.50,  // k = $1.50
    efficiencyExponent: 0.80,  // e = 0.80 (standardized for all products)
    clicksCost: 0.10           // Double-sided printing cost
  },

  // Product-specific formula parameters
  productFormulas: {
    // STREAMLINED CATEGORIES (Primary)
    'flat-prints': {
      hasFinishing: 'conditional',
      finishingSetupFee: 0,
      finishingLogic: 'flat-print-addons',
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    'folded-prints': {
      hasFinishing: 'conditional',
      finishingSetupFee: 15.00,
      finishingLogic: 'fold-based',
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },

    // LEGACY PRODUCTS (Backward Compatibility)
    brochures: {
      hasFinishing: 'conditional',
      finishingSetupFee: 15.00,
      finishingLogic: 'fold-based',
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    postcards: {
      hasFinishing: false,
      finishingSetupFee: 0,
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    'table-tents': {
      hasFinishing: true,
      finishingSetupFee: 15.00,
      finishingLogic: 'table-tent',
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    'name-tags': {
      hasFinishing: 'conditional',
      finishingSetupFee: 0,
      finishingLogic: 'name-tag',
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    flyers: {
      hasFinishing: false,
      finishingSetupFee: 0,
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    bookmarks: {
      hasFinishing: false,
      finishingSetupFee: 0,
      setupFeeMultiplier: 1.0,
      formula: 'standard'
    },
    booklets: {
      hasFinishing: true,
      finishingSetupFee: 15.00,
      finishingLogic: 'booklet',
      setupFeeMultiplier: 2.0, // Special case: double setup + page-based
      formula: 'booklet'
    },
    notebooks: {
      hasFinishing: true,
      finishingSetupFee: 15.00,
      finishingLogic: 'notebook',
      setupFeeMultiplier: 1.0,
      formula: 'notebook'
    },
    notepads: {
      hasFinishing: true,
      finishingSetupFee: 15.00,
      finishingLogic: 'notepad',
      setupFeeMultiplier: 1.0,
      formula: 'notepad'
    },
    posters: {
      formula: 'large-format',
      hasFinishing: false,
      setupFeeMultiplier: 0,
      efficiencyExponent: 0,
      finishingSetupFee: 0
    },
    'perfect-bound-books': {
      hasFinishing: true,
      finishingSetupFee: 30.00,
      finishingLogic: 'perfectBinding',
      setupFeeMultiplier: 2.0,
      formula: 'perfectBound'
    },
    envelopes: {
      hasFinishing: false,
      finishingSetupFee: 0,
      setupFeeMultiplier: 1.0,
      formula: 'envelope'
    }
  },

  // Product-specific constraints
  productConstraints: {
    // STREAMLINED CATEGORIES
    'flat-prints': {
      minQuantity: 25,
      maxQuantity: 5000,
      allowsCustomDimensions: true
    },
    'folded-prints': {
      minQuantity: 25,
      maxQuantity: 2500,
      allowsCustomDimensions: false
    },

    // LEGACY PRODUCTS (Backward Compatibility)
    brochures: {
      minQuantity: 25,
      maxQuantity: 2500
    },
    postcards: {
      minQuantity: 100,
      maxQuantity: 5000
    },
    'table-tents': {
      minQuantity: 10,
      maxQuantity: 100
    },
    'name-tags': {
      minQuantity: 50,
      maxQuantity: 5000
    },
    flyers: {
      minQuantity: 25,
      maxQuantity: 2500
    },
    bookmarks: {
      minQuantity: 100,  // 10-up imposition
      maxQuantity: 2500
    },
    booklets: {
      minQuantity: 10,
      maxQuantity: 1000,
      minPages: 8,
      maxPages: 48,
      pageMultiple: 4
    },
    posters: {
      minQuantity: 1,
      maxQuantity: 20
    },
    // Notebooks - Coil/Wire-O/Perfect bound
    notebooks: {
      minQuantity: 10,
      maxQuantity: 500
    },
    // Notepads - Glue-bound tear-away
    notepads: {
      minQuantity: 25,
      maxQuantity: 1000
    },
    // Perfect bound books - Professional binding
    'perfect-bound-books': {
      minQuantity: 5,
      maxQuantity: 500,
      minPages: 4,
      maxPages: 500,
      pageMultiple: 2,
      requiredCoverStock: true,
      allowsCustomDimensions: true
    },
    // Future products can be added here
    businessCards: {
      minQuantity: 100,  // Higher min due to high imposition
      maxQuantity: 5000
    },
    // Envelopes - Printed on Ricoh/Xante envelope printer
    envelopes: {
      minQuantity: 1,
      maxQuantity: 1000,
      allowsCustomDimensions: false
    }
  },

  // Imposition data - how many pieces per 13x19 sheet
  impositionData: {
    brochures: {
      '8.5x11': 2,
      '8.5x14': 1,
      '11x17': 1
    },
    posters: {
      // Large format - charged per square foot, not per sheet
      // Common roll media sizes (from 54" wide Epson SureColor)
      '18x24': { sqft: 3.0 },
      '22x28': { sqft: 4.3 },
      '24x36': { sqft: 6.0 },
      '36x48': { sqft: 12.0 },
      '48x72': { sqft: 24.0 },
      // Rigid substrate sizes (Mutoh flatbed 48x96" sheets)
      '48x96': { sqft: 32.0 }
    },
    // Future products
    businessCards: {
      '3.5x2': 21
    },
    bookmarks: {
      '2x6': 10,
      '2x7': 10,
      '2x8': 10
    },
    postcards: {
      '4x6': 8,
      '5x7': 4,
      '5.5x8.5': 4,
      '6x9': 2
    },
    'table-tents': {
      '4x6': 2,
      '5x7': 2
    },
    'name-tags': {
      '2.33x3': 20,
      '3x4': 12,
      '4x6': 4
    },
    flyers: {
      '5.5x8.5': 4,
      '8.5x11': 2,
      '8.5x14': 1,
      '11x17': 1
    },
    booklets: {
      '5.5x8.5': 4,  // 4-up imposition for compact booklet size
      '8.5x11': 4    // 4-up imposition for standard booklet size
    },
    notebooks: {
      '5.5x8.5': 4,  // 4-up imposition
      '8.5x11': 2    // 2-up imposition
    },
    notepads: {
      '4x6': 8,      // 8-up on 13×19
      '5x7': 4,      // 4-up on 13×19
      '5.5x8.5': 4,  // 4-up on 13×19
      '8.5x11': 2    // 2-up on 13×19
    }
  },

  // Finishing costs per unit
  finishingCosts: {
    // Flat print add-ons
    flatPrintAddons: {
      'holePunch': 0.05,
      'lanyard': 1.25
    },
    folding: {
      'none': 0,
      'bifold': 0.10,
      'trifold': 0.10,
      'table-tent': 0.50
    },
    cutting: 0.05,  // Postcards cutting cost per piece
    scoring: 0.10,   // Future finishing option
    bookletFinishing: {
      baseLabor: 0.25,
      coverCreasing: 0.10,
      bindingPerSheet: 0.10
    },
    // Notebook binding costs
    notebookBinding: {
      plasticCoil: 0.31,    // Hardware cost for plastic coil (rounded from 0.25 * 1.25)
      wireO: 0.35,          // Hardware cost for wire-o (premium option)
      perfectBinding: 0     // No hardware cost for perfect binding
    },
    notebookLabor: {
      plasticCoil: 2.50,    // Labor for plastic coil binding
      wireO: 3.00,          // Labor for wire-o binding (more intensive)
      perfectBinding: 3.00  // Labor for perfect binding
    },
    // Notepad finishing costs
    notepadPadding: 1.50,    // Glue padding labor per notepad
    // Perfect binding costs
    perfectBinding: {
      baseLabor: 3.00,       // Labor cost per book for perfect binding
      spineGlue: 0,          // Included in labor
      coverScoring: 0        // Included in setup
    }
  },

  // Rush order multipliers
  rushMultipliers: {
    'standard': {
      multiplier: 1.0,
      description: 'Standard (3-5 business days)',
      note: ''
    },
    '2-day': {
      multiplier: 1.25,
      description: '2-Day Rush (+25%)',
      note: 'Subject to current capacity'
    },
    'next-day': {
      multiplier: 1.50,
      description: 'Next-Day Rush (+50%)',
      note: 'Subject to current capacity'
    },
    'same-day': {
      multiplier: 2.0,
      description: 'Same-Day Rush (+100%)',
      note: 'Subject to current capacity - Call to confirm'
    }
  },

  // Large Format Volume Discounts (based on total square footage)
  largeFormatVolumeDiscounts: {
    tiers: [
      { minSqft: 0, maxSqft: 29.99, discount: 0, multiplier: 1.00, description: 'Standard Rate' },
      { minSqft: 30, maxSqft: 59.99, discount: 5, multiplier: 0.95, description: '5% Volume Discount (30-59 sqft)' },
      { minSqft: 60, maxSqft: 89.99, discount: 10, multiplier: 0.90, description: '10% Volume Discount (60-89 sqft)' },
      { minSqft: 90, maxSqft: 119.99, discount: 15, multiplier: 0.85, description: '15% Volume Discount (90-119 sqft)' },
      { minSqft: 120, maxSqft: Infinity, discount: 20, multiplier: 0.80, description: '20% Volume Discount (120+ sqft) - Maximum' }
    ]
  },

  // Envelope Pricing Configuration (Ricoh/Xante envelope printer)
  envelopeConfig: {
    setupFee: 15.00,
    envelopeMarkup: 1.5,
    maxQuantity: 1000,
    impressionRates: {
      color: {
        base: 0.32,
        250: 0.30,
        500: 0.28,
        750: 0.26,
        1000: 0.24
      },
      bw: {
        base: 0.13,
        250: 0.12,
        500: 0.11,
        750: 0.10,
        1000: 0.09
      }
    },
    volumeDiscountTiers: [
      { minQty: 1, maxQty: 249, colorRate: 0.32, bwRate: 0.13, discount: 0, description: 'Standard Rate' },
      { minQty: 250, maxQty: 499, colorRate: 0.30, bwRate: 0.12, discount: 6, description: '6% Volume Discount' },
      { minQty: 500, maxQty: 749, colorRate: 0.28, bwRate: 0.11, discount: 12, description: '12% Volume Discount' },
      { minQty: 750, maxQty: 999, colorRate: 0.26, bwRate: 0.10, discount: 19, description: '19% Volume Discount' },
      { minQty: 1000, maxQty: 1000, colorRate: 0.24, bwRate: 0.09, discount: 25, description: '25% Volume Discount' }
    ]
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pricingConfig;
}