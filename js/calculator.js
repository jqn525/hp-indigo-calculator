// Validate quantity constraints for a product
function validateQuantity(quantity, productType) {
  const constraints = pricingConfig.productConstraints[productType];
  if (!constraints) return { valid: true };
  
  if (quantity < constraints.minQuantity) {
    return { 
      valid: false, 
      message: `Minimum quantity is ${constraints.minQuantity}` 
    };
  }
  
  if (quantity > constraints.maxQuantity) {
    return { 
      valid: false, 
      message: `Maximum quantity is ${constraints.maxQuantity}` 
    };
  }
  
  return { valid: true };
}

function calculateBrochurePrice(formData) {
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const foldType = formData.get('foldType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'brochures');
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = pricingConfig.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const F_setup = config.finishingSetupFee; // $15.00 (finishing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = config.efficiencyExponent;     // 0.75
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = pricingConfig.impositionData.brochures[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Get finishing cost per unit
  const f = pricingConfig.finishingCosts.folding[foldType] || 0;
  
  // Determine if finishing is required
  const needsFinishing = foldType && foldType !== 'none' && f > 0;
  
  // Get rush multiplier
  const rushMultiplier = pricingConfig.rushMultipliers[rushType]?.multiplier || 1.0;
  
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
  
  console.log('Calculation details:', {
    selectedPaper: selectedPaper.displayName,
    paperCost: paperCost,
    imposition: imposition,
    v: v,
    f: f,
    rushMultiplier: rushMultiplier
  });
  
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

function calculatePostcardPrice(formData) {
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate quantity constraints
  const validation = validateQuantity(quantity, 'postcards');
  if (!validation.valid) {
    return {
      error: validation.message
    };
  }
  
  // Get configuration values
  const config = pricingConfig.formula;
  const S = config.setupFee;               // $30.00 (printing setup)
  const F_setup = config.finishingSetupFee; // $15.00 (finishing setup)
  const k = config.baseProductionRate;     // $1.50
  const e = 0.70;                          // 0.70 for postcards (greater economy of scale)
  const clicks = config.clicksCost;        // $0.10
  
  // Get paper and imposition data
  const selectedPaper = paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }
  
  const paperCost = selectedPaper.costPerSheet;
  const imposition = pricingConfig.impositionData.postcards[size];
  if (!imposition) {
    return { error: 'Invalid size selection' };
  }
  
  // Calculate variable cost per piece: v = (paper + clicks) × 1.5 / imposition
  const v = (paperCost + clicks) * 1.5 / imposition;
  
  // Postcards have no finishing costs
  const f = 0;
  const needsFinishing = false;
  
  // Get rush multiplier
  const rushMultiplier = pricingConfig.rushMultipliers[rushType]?.multiplier || 1.0;
  
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
  
  console.log('Postcard calculation details:', {
    selectedPaper: selectedPaper.displayName,
    paperCost: paperCost,
    imposition: imposition,
    v: v,
    f: f,
    rushMultiplier: rushMultiplier
  });
  
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

// Handle brochure form
const brochureForm = document.getElementById('brochureForm');
const brochureResults = document.getElementById('results');

if (brochureForm) {
  brochureForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(brochureForm);
    const pricing = calculateBrochurePrice(formData);
    
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
const postcardResults = document.getElementById('results');

if (postcardForm) {
  postcardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(postcardForm);
    const pricing = calculatePostcardPrice(formData);
    
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
  
  console.log('Flyer calculation details:', {
    selectedPaper: selectedPaper.displayName,
    paperCost: paperCost,
    imposition: imposition,
    v: v,
    e: e,
    rushMultiplier: rushMultiplier
  });
  
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
const flyerResults = document.getElementById('results');

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
  
  console.log('Bookmark calculation details:', {
    selectedPaper: selectedPaper.displayName,
    paperCost: paperCost,
    imposition: imposition,
    v: v,
    e: e,
    rushMultiplier: rushMultiplier
  });
  
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
const bookmarkResults = document.getElementById('results');

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

