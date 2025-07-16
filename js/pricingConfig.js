// Pricing Configuration for HP Indigo Calculator
// All pricing rules, constraints, and multipliers

const pricingConfig = {
  // Fixed formula values
  formula: {
    setupFee: 30.00,           // S = $30.00 (prepress and printing setup)
    finishingSetupFee: 15.00,  // F_setup = $15.00 (finishing setup when required)
    baseProductionRate: 1.50,  // k = $1.50
    efficiencyExponent: 0.75,  // e = 0.75
    clicksCost: 0.10           // Double-sided printing cost
  },

  // Product-specific constraints
  productConstraints: {
    brochures: {
      minQuantity: 25,
      maxQuantity: 2500
    },
    postcards: {
      minQuantity: 100,
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
    // Future products can be added here
    businessCards: {
      minQuantity: 100,  // Higher min due to high imposition
      maxQuantity: 5000
    }
  },

  // Imposition data - how many pieces per 13x19 sheet
  impositionData: {
    brochures: {
      '8.5x11': 2,
      '8.5x14': 1,
      '11x17': 1
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
    flyers: {
      '5.5x8.5': 4,
      '8.5x11': 2,
      '8.5x14': 1,
      '11x17': 1
    }
  },

  // Finishing costs per unit
  finishingCosts: {
    folding: {
      'bifold': 0.10,
      'trifold': 0.10
    },
    cutting: 0.05,  // Postcards cutting cost per piece
    scoring: 0.10   // Future finishing option
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
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = pricingConfig;
}