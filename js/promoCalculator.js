// Promotional Products Pricing Calculator
// Handles pricing calculations for outsourced promotional items

// Global promo pricing data cache
let promoPricingData = {
  promoConfig: null,
  isLoaded: false,
  isFromDatabase: false
};

// Initialize promo pricing data from database with fallback to static data
async function initializePromoPricingData() {
  if (promoPricingData.isLoaded) {
    return promoPricingData;
  }

  try {
    // Try to get data from database
    if (window.dbManager) {
      const pricingConfigs = await window.dbManager.getPricingConfigs();
      
      if (pricingConfigs && pricingConfigs.promo_pricing && pricingConfigs.promo_products) {
        promoPricingData.promoConfig = {
          pricing: pricingConfigs.promo_pricing,
          products: pricingConfigs.promo_products,
          getVolumeDiscount: promoConfig?.getVolumeDiscount || function() { return 0; },
          getBaseCost: promoConfig?.getBaseCost || function() { return 0; }
        };
        promoPricingData.isFromDatabase = true;
        promoPricingData.isLoaded = true;
        
        console.log('✅ Promo pricing data loaded from database');
        return promoPricingData;
      }
    }
  } catch (error) {
    console.warn('Database promo pricing data failed, falling back to static:', error);
  }

  // Fallback to static data
  if (typeof promoConfig !== 'undefined') {
    promoPricingData.promoConfig = promoConfig;
    promoPricingData.isFromDatabase = false;
    promoPricingData.isLoaded = true;
    
    console.log('📄 Using static promo pricing data');
    return promoPricingData;
  }

  console.error('❌ No promo pricing data available');
  return null;
}

// General promo product calculation function
async function calculatePromoPrice(productType, formData) {
  // Initialize promo pricing data
  const data = await initializePromoPricingData();
  if (!data) {
    return { error: 'Promo pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity
  const product = data.data.promoConfig.products[productType];
  if (!product) {
    return { error: 'Product type not found' };
  }
  
  if (quantity < product.minQuantity || quantity > product.maxQuantity) {
    return { 
      error: `Quantity must be between ${product.minQuantity} and ${product.maxQuantity}` 
    };
  }
  
  // Build specifications object based on product type
  let specifications = {};
  
  switch (productType) {
    case 'magnets':
      specifications = {
        size: formData.get('size'),
        type: formData.get('magnetType')
      };
      break;
      
    case 'stickers':
      specifications = {
        size: formData.get('size'),
        type: formData.get('stickerType')
      };
      break;
      
    case 'apparel':
      specifications = {
        garmentType: formData.get('garmentType'),
        decorationType: formData.get('decorationType'),
        sizeMix: formData.get('sizeMix')
      };
      break;
      
    case 'tote-bags':
      specifications = {
        bagType: formData.get('bagType'),
        size: formData.get('size'),
        decorationType: formData.get('decorationType')
      };
      break;
  }
  
  // Get base cost per unit
  const baseCost = data.data.promoConfig.getBaseCost(productType, specifications);
  if (baseCost === 0) {
    return { error: 'Invalid product configuration' };
  }
  
  // Calculate volume discount
  const volumeDiscount = data.promoConfig.getVolumeDiscount(productType, quantity);
  
  // Apply volume discount to base cost
  const discountedUnitCost = baseCost * (1 - volumeDiscount);
  
  // Calculate subtotal
  const subtotal = discountedUnitCost * quantity;
  
  // Add setup fee based on decoration type
  let setupFee = 0;
  const decorationType = specifications.decorationType || specifications.type;
  if (decorationType && data.promoConfig.pricing.setupFees[decorationType]) {
    setupFee = data.promoConfig.pricing.setupFees[decorationType];
  }
  
  // Calculate cost before markup
  const costBeforeMarkup = subtotal + setupFee;
  
  // Apply markup
  const markup = data.promoConfig.pricing.markupPercentage;
  const priceAfterMarkup = costBeforeMarkup * (1 + markup);
  
  // Apply rush multiplier
  const rushMultiplier = data.promoConfig.pricing.rushMultipliers[rushType] || 1.0;
  const finalPrice = priceAfterMarkup * rushMultiplier;
  
  // Calculate unit price
  const unitPrice = finalPrice / quantity;
  
  return {
    quantity: quantity,
    specifications: specifications,
    baseCost: baseCost,
    volumeDiscount: volumeDiscount,
    discountedUnitCost: discountedUnitCost,
    subtotal: subtotal,
    setupFee: setupFee,
    costBeforeMarkup: costBeforeMarkup,
    markup: markup,
    priceAfterMarkup: priceAfterMarkup,
    rushMultiplier: rushMultiplier,
    totalPrice: finalPrice,
    unitPrice: unitPrice,
    rushType: rushType
  };
}

// Individual product calculator functions
async function calculateMagnetPrice(formData) {
  // Initialize promo pricing data
  const data = await initializePromoPricingData();
  if (!data) {
    return { error: 'Promo pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate inputs
  const product = data.promoConfig.products.magnets;
  if (quantity < product.minQuantity || quantity > product.maxQuantity) {
    return { 
      error: `Quantity must be between ${product.minQuantity} and ${product.maxQuantity}` 
    };
  }
  
  // Validate 5-piece increments
  if ((quantity - product.minQuantity) % product.stepQuantity !== 0) {
    return { 
      error: `Quantity must be in increments of ${product.stepQuantity} pieces (25, 30, 35, etc.)` 
    };
  }
  
  // Get supplier cost using linear interpolation
  const brackets = product.quantityBrackets;
  const costs = product.supplierCosts[size];
  
  if (!costs) {
    return { error: 'Invalid size selected' };
  }
  
  let supplierCost;
  
  if (quantity <= brackets[0]) {
    // Below minimum bracket - use minimum pricing
    supplierCost = costs[0];
  } else if (quantity >= brackets[brackets.length - 1]) {
    // Above maximum bracket - extrapolate using highest rate
    const lastIndex = brackets.length - 1;
    const rate = (costs[lastIndex] - costs[lastIndex - 1]) / (brackets[lastIndex] - brackets[lastIndex - 1]);
    supplierCost = costs[lastIndex] + (quantity - brackets[lastIndex]) * rate;
  } else {
    // Linear interpolation between brackets
    let i = 0;
    while (i < brackets.length - 1 && quantity > brackets[i + 1]) {
      i++;
    }
    
    const q1 = brackets[i];
    const q2 = brackets[i + 1];
    const c1 = costs[i];
    const c2 = costs[i + 1];
    
    supplierCost = c1 + (quantity - q1) * (c2 - c1) / (q2 - q1);
  }
  
  // Apply 25% markup
  const priceAfterMarkup = supplierCost * (1 + product.markupPercentage);
  
  // Apply rush multiplier
  const rushMultiplier = data.promoConfig.pricing.rushMultipliers[rushType] || 1.0;
  const finalPrice = priceAfterMarkup * rushMultiplier;
  
  // Calculate unit price
  const unitPrice = finalPrice / quantity;
  
  return {
    quantity: quantity,
    specifications: {
      size: size,
      type: 'super-matte'
    },
    supplierCost: supplierCost,
    markup: product.markupPercentage,
    priceAfterMarkup: priceAfterMarkup,
    rushMultiplier: rushMultiplier,
    totalPrice: finalPrice,
    unitPrice: unitPrice,
    rushType: rushType
  };
}

async function calculateStickerPrice(formData) {
  // Initialize promo pricing data
  const data = await initializePromoPricingData();
  if (!data) {
    return { error: 'Promo pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const stickerType = formData.get('stickerType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Get product configuration
  const product = data.promoConfig.products.stickers;
  
  // Validate quantity constraints
  if (quantity < product.minQuantity || quantity > product.maxQuantity) {
    return {
      error: `Quantity must be between ${product.minQuantity} and ${product.maxQuantity}`
    };
  }
  
  // Validate step quantity (5-piece increments)
  if (quantity % product.stepQuantity !== 0) {
    return {
      error: `Quantity must be in increments of ${product.stepQuantity} pieces`
    };
  }
  
  // Get supplier cost data for the size
  const costs = product.supplierCosts[size];
  const brackets = product.quantityBrackets;
  
  if (!costs) {
    return {
      error: `Invalid size: ${size}`
    };
  }
  
  // Calculate supplier cost using linear interpolation
  let supplierCost;
  
  if (quantity <= brackets[0]) {
    // Use minimum bracket cost
    supplierCost = costs[0];
  } else if (quantity >= brackets[brackets.length - 1]) {
    // Use maximum bracket cost
    supplierCost = costs[costs.length - 1];
  } else {
    // Linear interpolation between brackets
    let i = 0;
    while (i < brackets.length - 1 && quantity > brackets[i + 1]) {
      i++;
    }
    
    const q1 = brackets[i];
    const q2 = brackets[i + 1];
    const c1 = costs[i];
    const c2 = costs[i + 1];
    
    supplierCost = c1 + (quantity - q1) * (c2 - c1) / (q2 - q1);
  }
  
  // Apply 25% markup
  const priceAfterMarkup = supplierCost * (1 + product.markupPercentage);
  
  // Apply rush multiplier
  const rushMultiplier = data.promoConfig.pricing.rushMultipliers[rushType] || 1.0;
  const finalPrice = priceAfterMarkup * rushMultiplier;
  
  // Calculate unit price
  const unitPrice = finalPrice / quantity;
  
  return {
    quantity: quantity,
    specifications: {
      size: size,
      type: stickerType
    },
    supplierCost: supplierCost,
    markup: product.markupPercentage,
    priceAfterMarkup: priceAfterMarkup,
    rushMultiplier: rushMultiplier,
    totalPrice: finalPrice,
    unitPrice: unitPrice,
    rushType: rushType
  };
}

async function calculateApparelPrice(formData) {
  // Initialize promo pricing data
  const data = await initializePromoPricingData();
  if (!data) {
    return { error: 'Promo pricing data not available' };
  }

  const garmentType = formData.get('garmentType');
  const decorationType = formData.get('decorationType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Get size quantities
  const sizeQuantities = {
    standard: {
      XS: parseInt(formData.get('sizeXS')) || 0,
      S: parseInt(formData.get('sizeS')) || 0,
      M: parseInt(formData.get('sizeM')) || 0,
      L: parseInt(formData.get('sizeL')) || 0,
      XL: parseInt(formData.get('sizeXL')) || 0
    },
    extended: {
      '2XL': parseInt(formData.get('size2XL')) || 0,
      '3XL': parseInt(formData.get('size3XL')) || 0,
      '4XL': parseInt(formData.get('size4XL')) || 0
    }
  };
  
  // Calculate total quantities
  const standardTotal = Object.values(sizeQuantities.standard).reduce((sum, qty) => sum + qty, 0);
  const extendedTotal = Object.values(sizeQuantities.extended).reduce((sum, qty) => sum + qty, 0);
  const totalQuantity = standardTotal + extendedTotal;
  
  // Get product configuration
  const product = data.promoConfig.products.apparel;
  
  // Validate minimum quantity
  if (totalQuantity < product.minQuantity) {
    return {
      error: `Minimum order is ${product.minQuantity} pieces total`
    };
  }
  
  // Get base costs (garment only)
  const standardGarmentCost = product.baseCosts[garmentType]?.[decorationType] || 0;
  const extendedGarmentCost = product.extendedSizeCosts[garmentType]?.[decorationType] || 0;
  
  // Get printing cost from centralized decoration pricing
  const decorationData = data.promoConfig.pricing.decorationPricing[decorationType];
  const printingCost = decorationData ? decorationData.printingCost : 0;
  
  if (standardGarmentCost === 0 && extendedGarmentCost === 0) {
    return {
      error: `Invalid garment type or decoration: ${garmentType} with ${decorationType}`
    };
  }
  
  // Calculate total cost per piece (garment + printing)
  const standardTotalCost = standardGarmentCost + printingCost;
  const extendedTotalCost = extendedGarmentCost + printingCost;
  
  // Calculate setup fee from centralized decoration pricing
  const setupFee = decorationData ? decorationData.setupFee : 0;
  
  // Calculate cost breakdowns
  const standardGarmentSubtotal = standardTotal * standardGarmentCost;
  const extendedGarmentSubtotal = extendedTotal * extendedGarmentCost;
  const garmentSubtotal = standardGarmentSubtotal + extendedGarmentSubtotal;
  
  const printingSubtotal = totalQuantity * printingCost;
  
  // Calculate raw subtotal (just the sum of all costs)
  const rawSubtotal = setupFee + garmentSubtotal + printingSubtotal;
  
  // Calculate subtotal before volume discount
  const standardSubtotal = standardTotal * standardTotalCost;
  const extendedSubtotal = extendedTotal * extendedTotalCost;
  const subtotal = standardSubtotal + extendedSubtotal + setupFee;
  
  // Apply volume discount based on total quantity
  const volumeDiscount = data.promoConfig.getVolumeDiscount('apparel', totalQuantity);
  const discountAmount = subtotal * volumeDiscount;
  const afterDiscount = subtotal - discountAmount;
  
  // Skip markup for apparel (prices already include markup)
  const priceAfterMarkup = afterDiscount;
  
  // Apply rush multiplier (use 'express' for apparel)
  const rushMultiplier = rushType === 'rush' ? data.promoConfig.pricing.rushMultipliers.express : data.promoConfig.pricing.rushMultipliers.standard;
  const finalPrice = priceAfterMarkup * rushMultiplier;
  
  // Calculate unit price
  const unitPrice = finalPrice / totalQuantity;
  
  return {
    quantity: totalQuantity,
    sizeBreakdown: sizeQuantities,
    standardQuantity: standardTotal,
    extendedQuantity: extendedTotal,
    specifications: {
      garmentType: garmentType,
      decorationType: decorationType
    },
    setupFee: setupFee,
    standardGarmentCost: standardGarmentCost,
    extendedGarmentCost: extendedGarmentCost,
    printingCost: printingCost,
    standardTotalCost: standardTotalCost,
    extendedTotalCost: extendedTotalCost,
    garmentSubtotal: garmentSubtotal,
    printingSubtotal: printingSubtotal,
    rawSubtotal: rawSubtotal,
    subtotal: subtotal,
    volumeDiscount: volumeDiscount,
    volumeDiscountPercent: (volumeDiscount * 100),
    discountAmount: discountAmount,
    afterDiscount: afterDiscount,
    beforeRushSubtotal: priceAfterMarkup,
    markup: 0,
    priceAfterMarkup: priceAfterMarkup,
    rushMultiplier: rushMultiplier,
    totalPrice: finalPrice,
    unitPrice: unitPrice,
    rushType: rushType
  };
}

async function calculateToteBagPrice(formData) {
  // Initialize promo pricing data
  const data = await initializePromoPricingData();
  if (!data) {
    return { error: 'Promo pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const decorationType = formData.get('decorationType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Get product configuration
  const product = data.promoConfig.products['tote-bags'];
  
  // Validate quantity
  if (quantity < product.minQuantity || quantity > product.maxQuantity) {
    return { 
      error: `Quantity must be between ${product.minQuantity} and ${product.maxQuantity}` 
    };
  }
  
  // Validate step quantity
  if ((quantity - product.minQuantity) % product.stepQuantity !== 0) {
    return { 
      error: `Quantity must be in increments of ${product.stepQuantity} pieces starting from ${product.minQuantity}` 
    };
  }
  
  // Get decoration pricing
  const decorationData = data.promoConfig.pricing.decorationPricing[decorationType];
  if (!decorationData) {
    return { error: `Invalid decoration type: ${decorationType}. Available types: ${Object.keys(data.promoConfig.pricing.decorationPricing).join(', ')}` };
  }
  
  // Calculate costs
  const bagCost = product.bagCost;
  const sizeMultiplier = product.printSizeMultipliers[size];
  if (sizeMultiplier === undefined) {
    return { error: `Invalid size: ${size}. Available sizes: ${Object.keys(product.printSizeMultipliers).join(', ')}` };
  }
  const printingCostPerPiece = decorationData.printingCost * sizeMultiplier;
  const unitCost = bagCost + printingCostPerPiece;
  
  // Calculate subtotal
  const subtotal = unitCost * quantity;
  
  // Add setup fee
  const setupFee = decorationData.setupFee;
  const totalBeforeRush = subtotal + setupFee;
  
  // Apply rush multiplier
  const rushMultiplier = data.promoConfig.pricing.rushMultipliers[rushType] || 1.0;
  const finalPrice = totalBeforeRush * rushMultiplier;
  
  // Calculate unit price
  const unitPrice = finalPrice / quantity;
  
  return {
    quantity: quantity,
    specifications: {
      bagType: formData.get('bagType'),
      size: size,
      decorationType: decorationType
    },
    bagCost: bagCost,
    printingCost: printingCostPerPiece,
    unitCost: unitCost,
    subtotal: subtotal,
    setupFee: setupFee,
    totalBeforeRush: totalBeforeRush,
    rushMultiplier: rushMultiplier,
    totalPrice: finalPrice,
    unitPrice: unitPrice,
    rushType: rushType
  };
}

// Helper function to format size breakdown for display
function formatSizeBreakdown(sizeBreakdown) {
  const parts = [];
  
  // Add standard sizes
  Object.entries(sizeBreakdown.standard).forEach(([size, qty]) => {
    if (qty > 0) {
      parts.push(`${qty}${size}`);
    }
  });
  
  // Add extended sizes
  Object.entries(sizeBreakdown.extended).forEach(([size, qty]) => {
    if (qty > 0) {
      parts.push(`${qty}${size}`);
    }
  });
  
  return parts.join(' + ');
}

// Helper function to get full garment description
function getGarmentDescription(garmentCode) {
  const garmentDescriptions = {
    'gildan-6400': 'T-shirts (100% Cotton, Soft Style) - Gildan 6400',
    'atc-f2700': 'Quarter Zip (50/50, Fleece Blend) - ATC F2700',
    'gildan-sf000': 'Crewneck (80/20, Soft Style Blend) - Gildan SF000',
    'gildan-1801': 'Crewneck (50/50, Heavy Blend) - Gildan 1801',
    'gildan-sf500': 'Hoodie (100% Cotton, Soft Style) - Gildan SF500',
    'gildan-1850': 'Hoodie (50/50, Heavy Blend) - Gildan 1850'
  };
  
  return garmentDescriptions[garmentCode] || garmentCode;
}

// DOM manipulation functions for promo product pages
document.addEventListener('DOMContentLoaded', function() {
  // Selection card handling
  const selectionCards = document.querySelectorAll('.selection-card');
  selectionCards.forEach(card => {
    card.addEventListener('click', function() {
      // Check if card is disabled
      if (this.classList.contains('disabled')) {
        return; // Do nothing for disabled cards
      }
      
      const section = this.closest('.selection-section');
      const hiddenInput = section.querySelector('input[type="hidden"]');
      
      // Remove selected class from siblings
      section.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      this.classList.add('selected');
      
      // Update hidden input value
      if (hiddenInput) {
        hiddenInput.value = this.dataset.value;
      }
    });
  });
  
  // Size breakdown handling for apparel
  const sizeInputs = document.querySelectorAll('.size-quantity');
  const totalQuantitySpan = document.getElementById('totalQuantity');
  const totalQuantityInput = document.getElementById('totalQuantityInput');
  
  function updateTotalQuantity() {
    let total = 0;
    sizeInputs.forEach(input => {
      const value = parseInt(input.value) || 0;
      total += value;
    });
    
    if (totalQuantitySpan) {
      totalQuantitySpan.textContent = total;
    }
    
    if (totalQuantityInput) {
      totalQuantityInput.value = total;
    }
  }
  
  // Add event listeners to size inputs
  sizeInputs.forEach(input => {
    input.addEventListener('input', updateTotalQuantity);
    input.addEventListener('change', updateTotalQuantity);
  });
  
  // Initial calculation
  updateTotalQuantity();
  
  // Form submission handling
  const forms = ['magnetForm', 'stickerForm', 'apparelForm', 'toteBagForm'];
  
  forms.forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        let result;
        
        // Determine which calculator to use based on form ID
        switch (formId) {
          case 'magnetForm':
            result = calculateMagnetPrice(formData);
            break;
          case 'stickerForm':
            result = calculateStickerPrice(formData);
            break;
          case 'apparelForm':
            result = calculateApparelPrice(formData);
            break;
          case 'toteBagForm':
            result = calculateToteBagPrice(formData);
            break;
        }
        
        if (result.error) {
          alert(result.error);
          return;
        }
        
        // Display results
        displayPromoResults(result, formId);
      });
    }
  });
  
  // Clear button handling
  const clearButtons = document.querySelectorAll('#clearBtn');
  clearButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const form = this.closest('form');
      if (form) {
        form.reset();
        
        // Reset selection cards to defaults
        form.querySelectorAll('.selection-section').forEach(section => {
          const cards = section.querySelectorAll('.selection-card');
          const hiddenInput = section.querySelector('input[type="hidden"]');
          
          cards.forEach(card => card.classList.remove('selected'));
          
          // Find and select the default card
          const defaultCard = section.querySelector('.selection-card[data-value="' + hiddenInput.value + '"]');
          if (defaultCard) {
            defaultCard.classList.add('selected');
          }
        });
        
        // Hide results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
          resultsSection.style.display = 'none';
        }
      }
    });
  });
  
  // Add to Cart button handling
  const addToCartButtons = document.querySelectorAll('#addToCartBtn');
  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const form = this.closest('form');
      if (form) {
        const formData = new FormData(form);
        let result;
        
        // Determine which calculator to use
        const formId = form.id;
        switch (formId) {
          case 'magnetForm':
            result = calculateMagnetPrice(formData);
            break;
          case 'stickerForm':
            result = calculateStickerPrice(formData);
            break;
          case 'apparelForm':
            result = calculateApparelPrice(formData);
            break;
          case 'toteBagForm':
            result = calculateToteBagPrice(formData);
            break;
        }
        
        if (result.error) {
          alert(result.error);
          return;
        }
        
        // Add to cart (assuming cart.js is loaded)
        if (typeof addToCart === 'function') {
          const cartItem = createPromoCartItem(result, formId);
          addToCart(cartItem);
        }
      }
    });
  });
});

// Display results function for promo products
function displayPromoResults(result, formId) {
  const resultsSection = document.getElementById('resultsSection');
  if (!resultsSection) return;
  
  // Update product-specific fields based on form type
  switch (formId) {
    case 'magnetForm':
      document.getElementById('resultSize').textContent = result.specifications.size;
      document.getElementById('resultType').textContent = result.specifications.type.replace('-', ' ');
      break;
      
    case 'stickerForm':
      document.getElementById('resultSize').textContent = result.specifications.size;
      document.getElementById('resultType').textContent = result.specifications.type.replace('-', ' ');
      break;
      
    case 'apparelForm':
      // Update cost breakdown details
      document.getElementById('setupFee').textContent = `$${result.setupFee.toFixed(2)}`;
      document.getElementById('garmentCost').textContent = `$${result.garmentSubtotal.toFixed(2)}`;
      document.getElementById('printingCost').textContent = `$${result.printingSubtotal.toFixed(2)}`;
      
      // Display raw subtotal (sum of all costs)
      document.getElementById('subtotal').textContent = `$${result.rawSubtotal.toFixed(2)}`;
      
      document.getElementById('unitPrice').textContent = `$${result.unitPrice.toFixed(2)}`;
      document.getElementById('totalPrice').textContent = `$${result.totalPrice.toFixed(2)}`;
      
      // Update descriptive fields
      document.getElementById('garmentDescription').textContent = getGarmentDescription(result.specifications.garmentType);
      document.getElementById('productionTime').textContent = result.rushType === 'standard' ? 'Standard (10-14 days)' : 'Rush (5-7 days)';
      
      // Update quantity display to show size breakdown
      const sizeBreakdownText = formatSizeBreakdown(result.sizeBreakdown);
      document.getElementById('quantityBreakdown').innerHTML = `${result.quantity.toLocaleString()}<br><small>${sizeBreakdownText}</small>`;
      
      // Show/hide volume discount
      const volumeDiscountItem = document.getElementById('volumeDiscountItem');
      if (result.volumeDiscount > 0) {
        document.getElementById('volumeDiscountAmount').textContent = `-$${result.discountAmount.toFixed(2)} (${result.volumeDiscountPercent.toFixed(0)}% off)`;
        volumeDiscountItem.style.display = 'flex';
      } else {
        volumeDiscountItem.style.display = 'none';
      }
      
      // Show/hide rush multiplier
      const rushMultiplierItem = document.getElementById('rushMultiplierItem');
      if (result.rushMultiplier > 1.0) {
        document.getElementById('rushMultiplier').textContent = `${result.rushMultiplier.toFixed(1)}x`;
        rushMultiplierItem.style.display = 'flex';
      } else {
        rushMultiplierItem.style.display = 'none';
      }
      break;
      
    case 'toteBagForm':
      document.getElementById('resultBagType').textContent = result.specifications.bagType.replace('-', ' ');
      document.getElementById('resultSize').textContent = result.specifications.size;
      document.getElementById('resultDecoration').textContent = result.specifications.decorationType.replace('-', ' ');
      break;
  }
  
  // Show results section
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Create cart item for promo products
function createPromoCartItem(result, formId) {
  let productType = 'Promo Product';
  let description = '';
  
  switch (formId) {
    case 'magnetForm':
      productType = 'Custom Magnets';
      description = `${result.specifications.size} ${result.specifications.type}`;
      break;
      
    case 'stickerForm':
      productType = 'Custom Stickers';
      description = `${result.specifications.size} ${result.specifications.type}`;
      break;
      
    case 'apparelForm':
      productType = 'Custom Apparel';
      const sizeBreakdown = formatSizeBreakdown(result.sizeBreakdown);
      const garmentDescription = getGarmentDescription(result.specifications.garmentType);
      description = `${garmentDescription} - DTF (${sizeBreakdown})`;
      break;
      
    case 'toteBagForm':
      productType = 'Canvas Tote Bags';
      description = `${result.specifications.bagType.replace('-', ' ')} ${result.specifications.size} - ${result.specifications.decorationType.replace('-', ' ')}`;
      break;
  }
  
  return {
    id: Date.now().toString(),
    productType: productType,
    description: description,
    quantity: result.quantity,
    unitPrice: result.unitPrice,
    totalPrice: result.totalPrice,
    details: {
      specifications: result.specifications,
      rushType: result.rushType,
      setupFee: result.setupFee,
      volumeDiscount: result.volumeDiscount
    },
    timestamp: new Date().toISOString()
  };
}