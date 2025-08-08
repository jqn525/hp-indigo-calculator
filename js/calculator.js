// Global pricing data cache
let pricingData = {
  paperStocks: null,
  pricingConfigs: null,
  isLoaded: false,
  isFromDatabase: false
};

// Initialize pricing data from static files with optional database override
async function initializePricingData() {
  if (pricingData.isLoaded) {
    return pricingData;
  }

  // Load from static files first (authoritative source)
  if (typeof paperStocks !== 'undefined' && typeof pricingConfig !== 'undefined') {
    pricingData.paperStocks = paperStocks;
    pricingData.pricingConfigs = {
      formula: pricingConfig.formula,
      product_constraints: pricingConfig.productConstraints,
      imposition_data: pricingConfig.impositionData,
      finishing_costs: pricingConfig.finishingCosts,
      rush_multipliers: pricingConfig.rushMultipliers
    };
    pricingData.isFromDatabase = false;
    pricingData.isLoaded = true;
    
    console.log('📄 Using static pricing data (authoritative)');
    return pricingData;
  }

  // Fallback to database only if static files unavailable
  try {
    if (window.dbManager) {
      const dbData = await window.dbManager.getPricingData();
      
      if (dbData.paperStocks && dbData.pricingConfigs) {
        pricingData.paperStocks = dbData.paperStocks;
        pricingData.pricingConfigs = dbData.pricingConfigs;
        pricingData.isFromDatabase = dbData.isFromDatabase;
        pricingData.isLoaded = true;
        
        console.log('🗄️ Using database pricing data (fallback)');
        return pricingData;
      }
    }
  } catch (error) {
    console.warn('Database fallback failed:', error);
  }

  console.error('❌ No pricing data available');
  return null;
}

// Validate quantity constraints for a product
function validateQuantity(quantity, productType, constraints) {
  if (!constraints || !constraints[productType]) return { valid: true };
  
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

async function calculateBrochurePrice(formData) {
  // Initialize pricing data
  const data = await initializePricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const foldType = formData.get('foldType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'brochures', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = data.pricingConfigs.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const F_setup = config.finishingSetupFee; // $15.00 (finishing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = config.efficiencyExponent;     // 0.75
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = data.paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = data.pricingConfigs.imposition_data.brochures[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Get finishing cost per unit
  const f = data.pricingConfigs.finishing_costs.folding[foldType] || 0;
  
  // Determine if finishing is required
  const needsFinishing = foldType && foldType !== 'none' && f > 0;
  
  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  
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
  const sheetsRequired = Math.ceil(quantity / imposition);
  const unitPrice = totalCost / quantity;
  
  
  return {
    printingSetupCost: printingSetupCost.toFixed(2),
    finishingSetupCost: finishingSetupCost.toFixed(2),
    needsFinishing: needsFinishing,
    productionCost: productionCost.toFixed(2),
    materialCost: materialCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: sheetsRequired,
    paperUsed: selectedPaper.displayName,
    imposition: imposition
  };
}

async function calculatePostcardPrice(formData) {
  // Initialize pricing data
  const data = await initializePricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'postcards', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = data.pricingConfigs.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const F_setup = config.finishingSetupFee; // $15.00 (finishing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = 0.70;                          // 0.70 for postcards (greater economy of scale)
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = data.paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = data.pricingConfigs.imposition_data.postcards[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Postcards have no finishing costs
  const f = 0;
  const needsFinishing = false;
  
  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  
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
  const sheetsRequired = Math.ceil(quantity / imposition);
  const unitPrice = totalCost / quantity;
  
  
  return {
    printingSetupCost: printingSetupCost.toFixed(2),
    finishingSetupCost: finishingSetupCost.toFixed(2),
    needsFinishing: needsFinishing,
    productionCost: productionCost.toFixed(2),
    materialCost: materialCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: sheetsRequired,
    paperUsed: selectedPaper.displayName,
    imposition: imposition
  };
}

// Calculate Name Tag pricing (identical to postcards)
async function calculateNameTagPrice(formData) {
  // Initialize pricing data
  const data = await initializePricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  const hasHolePunch = formData.get('holePunch') === 'true';
  const hasLanyard = formData.get('lanyard') === 'true';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'name-tags', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = data.pricingConfigs.formula;
  const S = 15.00;                         // $15.00 (printing setup - reduced for name tags)
  const F_setup = 0;                       // No setup fee for finishing (standalone unit)
  const k = config.baseProductionRate;     // $1.50
  const e = 0.65;                          // 0.65 for name tags (better volume discounts)
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = data.paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = data.pricingConfigs.imposition_data['name-tags'][size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Calculate finishing costs based on paper type and selections
  // Only allow finishing for cover stock, not adhesive
  const isAdhesive = paperCode === 'PAC51319WP';
  let f = 0;
  if (!isAdhesive) {
    if (hasHolePunch) f += 0.05;  // $0.05 per tag for hole punch
    if (hasLanyard) f += 1.25;    // $1.25 per tag for basic lanyard
  }
  const needsFinishing = f > 0;
  
  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  
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
  const sheetsRequired = Math.ceil(quantity / imposition);
  const unitPrice = totalCost / quantity;
  
  
  return {
    printingSetupCost: printingSetupCost.toFixed(2),
    finishingSetupCost: finishingSetupCost.toFixed(2),
    needsFinishing: needsFinishing,
    productionCost: productionCost.toFixed(2),
    materialCost: materialCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: sheetsRequired,
    paperUsed: selectedPaper.displayName,
    imposition: imposition,
    breakdown: {
      setupFee: printingSetupCost,
      finishingSetupFee: finishingSetupCost,
      productionCost: productionCost,
      materialCost: materialCost,
      finishingCost: finishingCost,
      subtotal: subtotal,
      rushMultiplier: rushMultiplier
    }
  };
}

// Handle brochure form
const brochureForm = document.getElementById('brochureForm');
const brochureResults = document.getElementById('resultsSection');

if (brochureForm) {
  brochureForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = brochureForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Calculating...';
    submitBtn.disabled = true;
    
    try {
      const formData = new FormData(brochureForm);
      const pricing = await calculateBrochurePrice(formData);
      
      // Handle errors
      if (pricing.error) {
        alert(pricing.error);
        return;
      }
    
    // Update the display
    document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
    document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
    document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
    document.getElementById('finishingCost').textContent = `$${pricing.finishingCost}`;
    document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
    document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
    
    // Show/hide finishing setup fee
    const finishingSetupItem = document.getElementById('finishingSetupItem');
    const finishingSetupCost = document.getElementById('finishingSetupCost');
    
    if (pricing.needsFinishing) {
      finishingSetupItem.style.display = 'flex';
      finishingSetupCost.textContent = `$${pricing.finishingSetupCost}`;
    } else {
      finishingSetupItem.style.display = 'none';
    }
    
    // Show/hide rush multiplier
    const rushMultiplierItem = document.getElementById('rushMultiplierItem');
    const rushMultiplierSpan = document.getElementById('rushMultiplier');
    
    if (pricing.rushMultiplier > 1.0) {
      rushMultiplierItem.style.display = 'flex';
      rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
    } else {
      rushMultiplierItem.style.display = 'none';
    }
    
      brochureResults.style.display = 'block';
      brochureResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Show Add to Cart button
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
        addToCartBtn.style.display = 'inline-block';
        addToCartBtn.onclick = () => {
          if (window.cartManager) {
            window.cartManager.addCurrentConfiguration('brochures', formData, pricing);
          }
        };
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating price. Please try again.');
    } finally {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  brochureForm.addEventListener('reset', () => {
    brochureResults.style.display = 'none';
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

// Handle postcard form
const postcardForm = document.getElementById('postcardForm');
const postcardResults = document.getElementById('resultsSection');

if (postcardForm) {
  postcardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = postcardForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Calculating...';
    submitBtn.disabled = true;
    
    try {
      const formData = new FormData(postcardForm);
      const pricing = await calculatePostcardPrice(formData);
      
      // Handle errors
      if (pricing.error) {
        alert(pricing.error);
        return;
      }
    
    // Update the display
    document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
    document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
    document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
    document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
    document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
    
    // Show/hide rush multiplier
    const rushMultiplierItem = document.getElementById('rushMultiplierItem');
    const rushMultiplierSpan = document.getElementById('rushMultiplier');
    
    if (pricing.rushMultiplier > 1.0) {
      rushMultiplierItem.style.display = 'flex';
      rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
    } else {
      rushMultiplierItem.style.display = 'none';
    }
    
    postcardResults.style.display = 'block';
      postcardResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Show Add to Cart button
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
        addToCartBtn.style.display = 'inline-block';
        addToCartBtn.onclick = () => {
          if (window.cartManager) {
            window.cartManager.addCurrentConfiguration('postcards', formData, pricing);
          }
        };
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating price. Please try again.');
    } finally {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  postcardForm.addEventListener('reset', () => {
    postcardResults.style.display = 'none';
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

// Handle name tag form
const nameTagForm = document.getElementById('nameTagForm');
if (nameTagForm) {
  nameTagForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(nameTagForm);
    const pricing = await calculateNameTagPrice(formData);
    
    // Handle errors
    if (pricing.error) {
      alert(pricing.error);
      return;
    }
    
    // Update the display - Name tags use same elements as postcards
    document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
    document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
    document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
    document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
    document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
    
    // Show/hide rush multiplier
    const rushMultiplierItem = document.getElementById('rushMultiplierItem');
    const rushMultiplierSpan = document.getElementById('rushMultiplier');
    if (pricing.rushMultiplier > 1) {
      rushMultiplierItem.style.display = 'flex';
      rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
    } else {
      rushMultiplierItem.style.display = 'none';
    }
    
    // Show results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.style.display = 'block';
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Show Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'inline-block';
      addToCartBtn.disabled = false;
      addToCartBtn.onclick = () => {
        if (window.cartManager) {
          window.cartManager.addCurrentConfiguration('name-tags', formData, pricing);
        }
      };
    }
  });
  
  nameTagForm.addEventListener('reset', () => {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.style.display = 'none';
    }
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

function calculateFlyerPrice(formData) {
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'flyers');
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = pricingConfig.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = 0.70;                          // 0.70 for flyers (better volume discount)
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = pricingConfig.impositionData.flyers[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Flyers have no finishing costs
  const f = 0;
  const needsFinishing = false;
  
  // Get rush multiplier
  const rushMultiplier = pricingConfig.rushMultipliers[rushType]?.multiplier || 1.0;
  
  // Calculate cost components
  const printingSetupCost = S;
  const finishingSetupCost = 0;
  const productionCost = Math.pow(quantity, e) * k;
  const materialCost = quantity * v;
  const finishingCost = 0;
  
  // Calculate subtotal and apply rush multiplier
  const subtotal = printingSetupCost + finishingSetupCost + productionCost + materialCost + finishingCost;
  const totalCost = subtotal * rushMultiplier;
  
  // Calculate additional info
  const sheetsRequired = Math.ceil(quantity / imposition);
  const unitPrice = totalCost / quantity;
  
  
  return {
    printingSetupCost: printingSetupCost.toFixed(2),
    finishingSetupCost: finishingSetupCost.toFixed(2),
    needsFinishing: needsFinishing,
    productionCost: productionCost.toFixed(2),
    materialCost: materialCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: sheetsRequired,
    paperUsed: selectedPaper.displayName,
    imposition: imposition
  };
}

// Handle flyer form
const flyerForm = document.getElementById('flyerForm');
const flyerResults = document.getElementById('resultsSection');

if (flyerForm) {
  flyerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(flyerForm);
    const pricing = calculateFlyerPrice(formData);
    
    // Handle errors
    if (pricing.error) {
      alert(pricing.error);
      return;
    }
    
    // Update the display
    document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
    document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
    document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
    document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
    document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
    
    // Show/hide rush multiplier
    const rushMultiplierItem = document.getElementById('rushMultiplierItem');
    const rushMultiplierSpan = document.getElementById('rushMultiplier');
    
    if (pricing.rushMultiplier > 1.0) {
      rushMultiplierItem.style.display = 'flex';
      rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
    } else {
      rushMultiplierItem.style.display = 'none';
    }
    
    flyerResults.style.display = 'block';
    flyerResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Show Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'inline-block';
      addToCartBtn.onclick = () => {
        if (window.cartManager) {
          window.cartManager.addCurrentConfiguration('flyers', formData, pricing);
        }
      };
    }
  });
  
  flyerForm.addEventListener('reset', () => {
    flyerResults.style.display = 'none';
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

function calculateBookmarkPrice(formData) {
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'bookmarks');
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = pricingConfig.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = 0.65;                          // 0.65 for bookmarks (excellent volume discounts)
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = pricingConfig.impositionData.bookmarks[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Bookmarks have no finishing costs
  const f = 0;
  const needsFinishing = false;
  
  // Get rush multiplier
  const rushMultiplier = pricingConfig.rushMultipliers[rushType]?.multiplier || 1.0;
  
  // Calculate cost components
  const printingSetupCost = S;
  const finishingSetupCost = 0;
  const productionCost = Math.pow(quantity, e) * k;
  const materialCost = quantity * v;
  const finishingCost = 0;
  
  // Calculate subtotal and apply rush multiplier
  const subtotal = printingSetupCost + finishingSetupCost + productionCost + materialCost + finishingCost;
  const totalCost = subtotal * rushMultiplier;
  
  // Calculate additional info
  const sheetsRequired = Math.ceil(quantity / imposition);
  const unitPrice = totalCost / quantity;
  
  
  return {
    printingSetupCost: printingSetupCost.toFixed(2),
    finishingSetupCost: finishingSetupCost.toFixed(2),
    needsFinishing: needsFinishing,
    productionCost: productionCost.toFixed(2),
    materialCost: materialCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: sheetsRequired,
    paperUsed: selectedPaper.displayName,
    imposition: imposition
  };
}

// Handle bookmark form
const bookmarkForm = document.getElementById('bookmarkForm');
const bookmarkResults = document.getElementById('resultsSection');

if (bookmarkForm) {
  bookmarkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(bookmarkForm);
    const pricing = calculateBookmarkPrice(formData);
    
    // Handle errors
    if (pricing.error) {
      alert(pricing.error);
      return;
    }
    
    // Update the display
    document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
    document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
    document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
    document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
    document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
    
    // Show/hide rush multiplier
    const rushMultiplierItem = document.getElementById('rushMultiplierItem');
    const rushMultiplierSpan = document.getElementById('rushMultiplier');
    
    if (pricing.rushMultiplier > 1.0) {
      rushMultiplierItem.style.display = 'flex';
      rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
    } else {
      rushMultiplierItem.style.display = 'none';
    }
    
    bookmarkResults.style.display = 'block';
    bookmarkResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Show Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'inline-block';
      addToCartBtn.onclick = () => {
        if (window.cartManager) {
          window.cartManager.addCurrentConfiguration('bookmarks', formData, pricing);
        }
      };
    }
  });
  
  bookmarkForm.addEventListener('reset', () => {
    bookmarkResults.style.display = 'none';
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

async function calculateBookletPrice(formData) {
  // Initialize pricing data
  const data = await initializePricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const pages = parseInt(formData.get('pages'));
  const coverPaperCode = formData.get('coverPaperType');
  const textPaperCode = formData.get('textPaperType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate pages
  const bookletConstraints = data.pricingConfigs.product_constraints.booklets;
  
  if (pages < bookletConstraints.minPages || pages > bookletConstraints.maxPages) {
    return { error: `Page count must be between ${bookletConstraints.minPages} and ${bookletConstraints.maxPages}` };
  }
  
  if (pages % bookletConstraints.pageMultiple !== 0) {
    return { error: `Page count must be a multiple of ${bookletConstraints.pageMultiple}` };
  }
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'booklets', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }
  
  // Get paper data
  const coverPaper = data.paperStocks[coverPaperCode];
  const textPaper = data.paperStocks[textPaperCode];
  
  if (!coverPaper || !textPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  // Calculate text sheets (pages - 4 for cover) / 4
  const textSheets = (pages - 4) / 4;
  
  // Get imposition
  const imposition = data.pricingConfigs.imposition_data.booklets['8.5x11'] || 4;
  
  // Calculate materials cost per booklet
  // Calculate sheets per booklet
  const coverSheetsPerBooklet = 1;  // Always 1 cover sheet per booklet
  const textSheetsPerBooklet = textSheets;  // Already calculated as (pages-4)/4

  // Get click cost from config
  const clicksCost = data.pricingConfigs.formula.clicksCost || 0.10;
  const clicksPerBooklet = pages / 2;  // Pages/2 = impressions (both sides)

  // Calculate material cost per booklet
  const coverCost = coverSheetsPerBooklet * coverPaper.costPerSheet;
  const textCost = textSheetsPerBooklet * textPaper.costPerSheet;  
  const clickCost = clicksPerBooklet * clicksCost;
  const materialsCostPerUnit = (coverCost + textCost + clickCost) * 1.25;
  
  // Get finishing costs
  const bookletFinishing = data.pricingConfigs.finishing_costs.bookletFinishing;
  const finishingPerUnit = bookletFinishing.coverCreasing + (bookletFinishing.bindingPerSheet * textSheets);
  
  // Apply formula: C(Q) = S_base + S_pages + P(Q) + M(Q) + F_base + F_variable
  // Where M(Q) includes paper costs + click charges
  const baseSetup = 30 + (2 * pages);
  const production = Math.pow(quantity, 0.75) * 6;
  const materials = quantity * materialsCostPerUnit;
  const finishingSetup = 30;
  const finishing = quantity * finishingPerUnit;
  
  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  
  // Calculate totals
  const subtotal = baseSetup + production + materials + finishingSetup + finishing;
  const totalCost = subtotal * rushMultiplier;
  const unitPrice = totalCost / quantity;
  
  // Calculate sheets required
  const coverSheetsRequired = Math.ceil((quantity * 1) / imposition);  // 1 sheet per booklet
  const textSheetsRequired = Math.ceil((quantity * textSheets) / imposition);  // textSheets per booklet
  const totalSheetsRequired = coverSheetsRequired + textSheetsRequired;
  
  
  return {
    printingSetupCost: baseSetup.toFixed(2),
    finishingSetupCost: finishingSetup.toFixed(2),
    needsFinishing: true,
    productionCost: production.toFixed(2),
    materialCost: materials.toFixed(2),
    finishingCost: finishing.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: totalSheetsRequired,
    coverPaperUsed: coverPaper.displayName || coverPaper.display_name,
    textPaperUsed: textPaper.displayName || textPaper.display_name,
    pages: pages,
    textSheets: textSheets,
    imposition: imposition,
    // Additional breakdown data for configurator compatibility
    breakdown: {
      setupFee: baseSetup,
      finishingSetupFee: finishingSetup,
      productionCost: production,
      materialCost: materials,
      finishingCost: finishing,
      subtotal: subtotal,
      rushMultiplier: rushMultiplier,
      sheetsRequired: totalSheetsRequired,
      // Detailed material breakdown for display
      coverCost: coverCost,
      textCost: textCost,
      clickCost: clickCost,
      materialsCostPerUnit: materialsCostPerUnit
    }
  };
}

// Handle booklet form
const bookletForm = document.getElementById('bookletCalculator');
const bookletResults = document.getElementById('resultsSection');

if (bookletForm) {
  bookletForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = bookletForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Calculating...';
    submitBtn.disabled = true;
    
    try {
      const formData = new FormData(bookletForm);
      const pricing = await calculateBookletPrice(formData);
      
      // Handle errors
      if (pricing.error) {
        alert(pricing.error);
        return;
      }
      
      // Update the display
      document.getElementById('printingSetupCost').textContent = `$${pricing.printingSetupCost}`;
      document.getElementById('productionCost').textContent = `$${pricing.productionCost}`;
      document.getElementById('materialCost').textContent = `$${pricing.materialCost}`;
      document.getElementById('finishingCost').textContent = `$${pricing.finishingCost}`;
      document.getElementById('subtotal').textContent = `$${pricing.subtotal}`;
      document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
      document.getElementById('totalPrice').textContent = `$${pricing.totalCost}`;
      document.getElementById('sheetsRequired').textContent = pricing.sheetsRequired;
      
      // Show/hide finishing setup cost
      const finishingSetupItem = document.getElementById('finishingSetupItem');
      const finishingSetupCost = document.getElementById('finishingSetupCost');
      
      if (pricing.needsFinishing) {
        finishingSetupItem.style.display = 'flex';
        finishingSetupCost.textContent = `$${pricing.finishingSetupCost}`;
      } else {
        finishingSetupItem.style.display = 'none';
      }
      
      // Show/hide rush multiplier
      const rushMultiplierItem = document.getElementById('rushMultiplierItem');
      const rushMultiplierSpan = document.getElementById('rushMultiplier');
      
      if (pricing.rushMultiplier > 1.0) {
        rushMultiplierItem.style.display = 'flex';
        rushMultiplierSpan.textContent = `${pricing.rushMultiplier}x`;
      } else {
        rushMultiplierItem.style.display = 'none';
      }
      
      bookletResults.style.display = 'block';
      bookletResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // Show Add to Cart button
      const addToCartBtn = document.getElementById('addToCartBtn');
      if (addToCartBtn) {
        addToCartBtn.style.display = 'inline-block';
        addToCartBtn.onclick = () => {
          if (window.cartManager) {
            window.cartManager.addCurrentConfiguration('booklets', formData, pricing);
          }
        };
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating price. Please try again.');
    } finally {
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
  
  bookletForm.addEventListener('reset', () => {
    bookletResults.style.display = 'none';
    
    // Hide Add to Cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.style.display = 'none';
    }
  });
}

// Card Selection Functionality
class CardSelection {
  constructor() {
    this.init();
  }
  
  init() {
    // Handle all selection cards
    const selectionCards = document.querySelectorAll('.selection-card');
    
    selectionCards.forEach(card => {
      card.addEventListener('click', (e) => this.handleCardClick(e));
      
      // Keyboard support
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleCardClick(e);
        }
      });
      
      // Make cards focusable for keyboard navigation
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }
    });
    
    // Handle form reset
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('reset', () => this.handleFormReset());
    });
  }
  
  handleCardClick(event) {
    const clickedCard = event.currentTarget;
    const selectionGrid = clickedCard.closest('.selection-grid');
    const selectionSection = clickedCard.closest('.selection-section');
    const hiddenInput = selectionSection.querySelector('input[type="hidden"]');
    
    if (!selectionGrid || !hiddenInput) return;
    
    // Remove selected class from all cards in this grid
    const allCards = selectionGrid.querySelectorAll('.selection-card');
    allCards.forEach(card => card.classList.remove('selected'));
    
    // Add selected class to clicked card
    clickedCard.classList.add('selected');
    
    // Update hidden input value
    const selectedValue = clickedCard.dataset.value;
    if (selectedValue) {
      hiddenInput.value = selectedValue;
      
      // Dispatch change event for form validation/other listeners
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  
  handleFormReset() {
    // Reset to default selections
    setTimeout(() => {
      this.resetToDefaults();
    }, 0); // Timeout to ensure form reset completes first
  }
  
  resetToDefaults() {
    // Define default selections based on page type
    const path = window.location.pathname;
    let defaults = {};
    
    if (path.includes('brochures')) {
      defaults = {
        'size': '8.5x11',
        'foldType': 'trifold', 
        'paperType': 'LYNO416FSC',
        'rushType': 'standard'
      };
    } else if (path.includes('postcards')) {
      defaults = {
        'size': '5x7',
        'paperType': 'LYNOC95FSC',
        'rushType': 'standard'
      };
    } else if (path.includes('name-tags')) {
      defaults = {
        'size': '5x7',
        'paperType': 'LYNOC95FSC',
        'rushType': 'standard'
      };
    } else if (path.includes('flyers')) {
      defaults = {
        'size': '8.5x11',
        'paperType': 'LYNO416FSC',
        'rushType': 'standard'
      };
    } else if (path.includes('bookmarks')) {
      defaults = {
        'size': '2x7',
        'paperType': 'COUDCCDIC123513FSC',
        'rushType': 'standard'
      };
    }
    
    // Reset each section to defaults
    Object.keys(defaults).forEach(inputName => {
      const hiddenInput = document.querySelector(`input[name="${inputName}"]`);
      if (hiddenInput) {
        const selectionSection = hiddenInput.closest('.selection-section');
        const targetCard = selectionSection.querySelector(`[data-value="${defaults[inputName]}"]`);
        
        if (targetCard) {
          // Remove selected from all cards in this section
          const allCards = selectionSection.querySelectorAll('.selection-card');
          allCards.forEach(card => card.classList.remove('selected'));
          
          // Select the default card
          targetCard.classList.add('selected');
          hiddenInput.value = defaults[inputName];
        }
      }
    });
  }
}

// Initialize card selection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CardSelection();
});

