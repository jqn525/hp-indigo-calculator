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
      productFormulas: pricingConfig.productFormulas,
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


// Dynamic imposition calculation helper functions
function getDynamicImposition(width, height) {
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

// Parse size strings like "4x6" or "8.5x11" 
function parseSizeString(sizeStr) {
  const parts = sizeStr.replace(/['"]/g, '').split('x');
  return {
    width: parseFloat(parts[0]),
    height: parseFloat(parts[1])
  };
}

async function calculateBookletPrice(formData) {
  // Initialize pricing data
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size') || '8.5x11';
  const pages = parseInt(formData.get('pages'));
  const coverPaperCode = formData.get('coverPaperType');
  const textPaperCode = formData.get('textPaperType');
  const rushType = formData.get('rushType') || 'standard';

  // Get printing sides configuration
  const printingSides = formData.get('printingSides') || 'double-sided';
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksCost = printingSides === 'double-sided' ? 0.10 : 0.05;
  
  // Validate pages
  const bookletConstraints = data.pricingConfigs.product_constraints.booklets;
  
  if (pages < bookletConstraints.minPages || pages > bookletConstraints.maxPages) {
    return { error: `Page count must be between ${bookletConstraints.minPages} and ${bookletConstraints.maxPages}` };
  }
  
  if (pages % bookletConstraints.pageMultiple !== 0) {
    return { error: `Page count must be a multiple of ${bookletConstraints.pageMultiple}` };
  }
  
  // Validate quantity constraints
  const validation = ValidationUtils.validateQuantity(quantity, 'booklets', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }
  
  // Check if using self cover option
  const isSelfCover = coverPaperCode === 'SELF_COVER';
  
  // Get paper data
  let coverPaper, textPaper;
  
  if (isSelfCover) {
    // For self cover, entire booklet uses text paper
    textPaper = data.paperStocks[textPaperCode];
    coverPaper = textPaper; // Cover is same as text paper
    
    if (!textPaper) {
      return { error: 'Invalid text paper selection' };
    }
  } else {
    // Regular booklet with separate cover stock
    coverPaper = data.paperStocks[coverPaperCode];
    textPaper = data.paperStocks[textPaperCode];
    
    if (!coverPaper || !textPaper) {
      return { error: 'Invalid paper selection' };
    }
  }
  
  // Calculate sheets based on cover type
  let coverSheetsPerBooklet, textSheetsPerBooklet;
  
  if (isSelfCover) {
    // Self cover: all sheets are text weight
    coverSheetsPerBooklet = 0;
    textSheetsPerBooklet = pages / 4;  // Total pages / 4 pages per sheet
  } else {
    // Regular cover: 1 cover sheet + remaining text sheets
    coverSheetsPerBooklet = 1;
    textSheetsPerBooklet = (pages - 4) / 4;  // (pages - cover) / 4
  }
  
  // Use dynamic imposition calculation with static fallback
  const dimensions = parseSizeString(size);
  const dynamicImposition = getDynamicImposition(dimensions.width, dimensions.height);
  const imposition = dynamicImposition || data.pricingConfigs.imposition_data.booklets[size] || 4;
  console.log(`Booklets ${size}: Dynamic=${dynamicImposition}, Static=${data.pricingConfigs.imposition_data.booklets[size]}, Using=${imposition}`);

  // Calculate multi-up factor (how many booklets fit on 13x19 sheet)
  // For 5.5x8.5: 2 booklets per sheet, for 8.5x11: 1 booklet per sheet
  const multiUpFactor = (dimensions.width <= 6.5 && dimensions.height <= 9) ? 2 : 1;
  console.log(`Booklets ${size}: Multi-up factor=${multiUpFactor} booklets per sheet set`);

  // Calculate clicks per booklet based on actual sheets (not impressions)
  const sheetsPerBooklet = coverSheetsPerBooklet + textSheetsPerBooklet;
  const clicksPerBooklet = sheetsPerBooklet / multiUpFactor;

  // Calculate material cost per booklet (account for multi-up production)
  const coverCost = (coverSheetsPerBooklet * coverPaper.costPerSheet) / multiUpFactor;
  const textCost = (textSheetsPerBooklet * textPaper.costPerSheet) / multiUpFactor;
  const clickCost = clicksPerBooklet * clicksCost;
  const materialsCostPerUnit = (coverCost + textCost + clickCost) * 1.25;
  
  // Get finishing costs
  const bookletFinishing = data.pricingConfigs.finishing_costs.bookletFinishing;
  
  // Self cover doesn't need cover creasing (text weight doesn't require it)
  const coverCreasing = isSelfCover ? 0 : bookletFinishing.coverCreasing;
  const finishingPerUnit = bookletFinishing.baseLabor + coverCreasing + (bookletFinishing.bindingPerSheet * textSheetsPerBooklet);
  
  // Apply formula: C(Q) = S_base + S_pages + P(Q) + M(Q) + F_base + F_variable
  // Where M(Q) includes paper costs + click charges
  const baseSetup = (pricingConfig.formula.setupFee * 2) + (2 * pages);
  const S_total = quantity * sheetsPerBooklet;
  const k = pricingConfig.formula.baseProductionRate;
  const e = pricingConfig.formula.efficiencyExponent;
  const production = Math.pow(S_total, e) * k;
  const materials = quantity * materialsCostPerUnit;
  const finishingSetup = pricingConfig.formula.finishingSetupFee;
  const finishing = quantity * finishingPerUnit;
  
  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  
  // Calculate totals
  const subtotal = baseSetup + production + materials + finishingSetup + finishing;
  const totalCost = subtotal * rushMultiplier;
  const unitPrice = totalCost / quantity;
  
  // Calculate sheets required
  // For booklets, show total booklet sheets needed (not divided by press sheet imposition)
  const coverSheetsRequired = Math.ceil(quantity * coverSheetsPerBooklet);
  const textSheetsRequired = Math.ceil(quantity * textSheetsPerBooklet);
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
    size: size,
    coverPaperUsed: isSelfCover ? 'Self Cover' : (coverPaper.displayName || coverPaper.display_name),
    textPaperUsed: textPaper.displayName || textPaper.display_name,
    pages: pages,
    textSheets: textSheetsPerBooklet,
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

async function calculateNotebookPrice(formData) {
  // Initialize pricing data
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const customWidth = parseFloat(formData.get('customWidth')) || 8.5;
  const customHeight = parseFloat(formData.get('customHeight')) || 11;
  const pages = parseInt(formData.get('pages'));
  const bindingType = formData.get('bindingType');
  const coverPaperCode = formData.get('coverPaper');
  const textPaperCode = formData.get('textPaper');
  const pageContent = formData.get('pageContent');
  const rushType = formData.get('rushType') || 'standard';

  // Get printing sides configuration
  const printingSides = formData.get('printingSides') || 'double-sided';
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksCost = printingSides === 'double-sided' ? 0.10 : 0.05;

  // Validate quantity constraints
  const validation = ValidationUtils.validateQuantity(quantity, 'notebooks', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }

  // Get paper data
  const coverPaper = data.paperStocks[coverPaperCode];
  const textPaper = data.paperStocks[textPaperCode];

  if (!coverPaper || !textPaper) {
    return { error: 'Invalid paper selection' };
  }

  // Setup costs - waive setup for blank pages as discount
  const baseSetup = pageContent === 'blank' ? 0 : pricingConfig.formula.setupFee;
  const finishingSetup = pricingConfig.formula.finishingSetupFee;  // Always applied
  const totalSetup = baseSetup + finishingSetup;

  // Use dynamic imposition calculation based on custom dimensions
  const dynamicImposition = getDynamicImposition(customWidth, customHeight);
  const imposition = dynamicImposition || 2;
  console.log(`Notebooks ${customWidth}x${customHeight}: Imposition=${imposition}`);

  // Calculate sheets needed per notebook
  const coverSheetsPerNotebook = 1 / imposition;
  const textSheetsPerNotebook = pages / (imposition * sidesMultiplier);  // Pages per sheet (accounting for sides)

  // Click calculations - all pages go through HP (including blank)
  const coverClicks = 1; // Cover always double-sided
  const textClicks = Math.round(textSheetsPerNotebook * sidesMultiplier);  // Sheets × sides, rounded
  const totalClicks = coverClicks + textClicks;

  // Material costs per notebook
  const coverCost = coverSheetsPerNotebook * coverPaper.costPerSheet;
  const textCost = textSheetsPerNotebook * textPaper.costPerSheet;
  const clickCost = totalClicks * clicksCost;
  const materialsCostPerUnit = (coverCost + textCost + clickCost) * 1.25;
  
  // Binding costs based on type
  const bindingHardware = data.pricingConfigs.finishing_costs.notebookBinding[bindingType] || 0;
  const laborCost = data.pricingConfigs.finishing_costs.notebookLabor[bindingType] || 2.50;

  // Apply formula: C(Q) = S + F_setup + S_total^e × k + Q × (M + L + B)
  const sheetsPerNotebook = coverSheetsPerNotebook + textSheetsPerNotebook;
  const S_total = quantity * sheetsPerNotebook;
  const config = data.pricingConfigs.formula;
  const k = config.baseProductionRate;
  const e = config.efficiencyExponent;
  const productionCost = Math.pow(S_total, e) * k;
  const materialsCostTotal = quantity * materialsCostPerUnit;
  const laborCostTotal = quantity * laborCost;
  const bindingCostTotal = quantity * bindingHardware;
  
  const subtotal = totalSetup + productionCost + materialsCostTotal + laborCostTotal + bindingCostTotal;
  
  // Rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  const total = subtotal * rushMultiplier;
  
  return {
    quantity: quantity,
    width: customWidth,
    height: customHeight,
    pages: pages,
    bindingType: bindingType,
    coverPaper: coverPaper.displayName,
    textPaper: textPaper.displayName,
    pageContent: pageContent,
    unitPrice: (total / quantity).toFixed(2),
    totalCost: total.toFixed(2),
    printingSetupCost: baseSetup.toFixed(2),
    finishingSetupCost: finishingSetup.toFixed(2),
    totalSetupCost: totalSetup.toFixed(2),
    productionCost: productionCost.toFixed(2),
    materialCost: materialsCostTotal.toFixed(2),
    laborCost: laborCostTotal.toFixed(2),
    bindingCost: bindingCostTotal.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    // Detailed breakdown for display
    coverCost: coverCost.toFixed(4),
    textCost: textCost.toFixed(4),
    clickCost: clickCost.toFixed(4),
    materialsCostPerUnit: materialsCostPerUnit.toFixed(4),
    coverSheetsPerNotebook: coverSheetsPerNotebook.toFixed(2),
    textSheetsPerNotebook: textSheetsPerNotebook.toFixed(2),
    totalClicks: totalClicks,
    imposition: imposition
  };
}

async function calculateNotepadPrice(formData) {
  // Initialize pricing data
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const customWidth = parseFloat(formData.get('customWidth'));
  const customHeight = parseFloat(formData.get('customHeight'));
  const sheets = parseInt(formData.get('sheets'));
  const paperCode = formData.get('textPaper');
  const backingPaperCode = formData.get('backingPaper') || 'LYNOC95FSC'; // Default to 100# Cover Uncoated
  const pageContent = formData.get('pageContent');
  const rushType = formData.get('rushType') || 'standard';

  // Get printing sides configuration (notepads typically single-sided but allow flexibility)
  const printingSides = formData.get('printingSides') || 'single-sided'; // Default to single-sided for notepads
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksCost = printingSides === 'double-sided' ? 0.10 : 0.05;

  // Validate quantity constraints
  const validation = ValidationUtils.validateQuantity(quantity, 'notepads', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }

  // Get paper data
  const textPaper = data.paperStocks[paperCode];
  const backingPaper = data.paperStocks[backingPaperCode];

  if (!textPaper || !backingPaper) {
    return { error: 'Invalid paper selection' };
  }

  // Setup costs based on content type
  let baseSetup = 0;
  if (pageContent === 'custom') {
    baseSetup = pricingConfig.formula.setupFee; // Custom design setup ($15)
  } else if (pageContent === 'lined') {
    baseSetup = 0; // Lined pages (no setup needed)
  } else {
    baseSetup = 0;  // Blank pages (no setup needed)
  }

  const finishingSetup = pricingConfig.formula.finishingSetupFee;  // Always applied for padding
  const totalSetup = baseSetup + finishingSetup;

  // Use dynamic imposition calculation for custom dimensions
  const imposition = getDynamicImposition(customWidth, customHeight);

  if (!imposition) {
    return { error: 'Unable to calculate imposition for given dimensions' };
  }

  console.log(`Notepads ${customWidth}×${customHeight}: Imposition=${imposition}`);

  // Calculate sheets needed per notepad
  const backingSheetsPerPad = 1 / imposition;  // Backing sheet (cardstock)

  // Calculate 13x19" press sheets needed for production
  const pressSheetsNeeded = (quantity * sheets) / imposition;  // Total press sheets for all notepads

  // Material costs per notepad
  // Text paper cost: based on press sheets needed divided by quantity
  const textCostPerUnit = (pressSheetsNeeded * textPaper.costPerSheet) / quantity;
  const backingCost = backingSheetsPerPad * backingPaper.costPerSheet;
  // Click charges: all pages need clicks (blank pages save $15 setup but still incur clicks)
  const clickCostPerUnit = (pressSheetsNeeded * clicksCost) / quantity;
  const materialsCostPerUnit = (textCostPerUnit + backingCost + clickCostPerUnit) * 1.25;
  
  // Padding labor cost - $0.01 per sheet
  const paddingLaborPerSheet = 0.01;
  const paddingLabor = sheets * paddingLaborPerSheet;  // $0.01 per sheet per notepad

  // Apply formula: C(Q) = S + F_setup + S_total^e × k + Q × (M + L)
  const S_total = pressSheetsNeeded;  // Total sheets through press
  const config = data.pricingConfigs.formula;
  const k = config.baseProductionRate;
  const e = config.efficiencyExponent;
  const productionCost = Math.pow(S_total, e) * k;
  const materialsCostTotal = quantity * materialsCostPerUnit;
  const laborCostTotal = quantity * paddingLabor;
  
  const subtotal = totalSetup + productionCost + materialsCostTotal + laborCostTotal;
  
  // Rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  const total = subtotal * rushMultiplier;
  
  return {
    quantity: quantity,
    size: `${customWidth}" × ${customHeight}"`,
    sheets: sheets,
    textPaper: textPaper.displayName,
    backingPaper: backingPaper.displayName,
    pageContent: pageContent,
    unitPrice: (total / quantity).toFixed(2),
    totalCost: total.toFixed(2),
    printingSetupCost: baseSetup.toFixed(2),
    finishingSetupCost: finishingSetup.toFixed(2),
    totalSetupCost: totalSetup.toFixed(2),
    productionCost: productionCost.toFixed(2),
    materialCost: materialsCostTotal.toFixed(2),
    laborCost: laborCostTotal.toFixed(2),
    finishingCost: laborCostTotal.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    sheetsRequired: pressSheetsNeeded,
    // Detailed breakdown for display
    textCost: textCostPerUnit.toFixed(4),
    backingCost: backingCost.toFixed(4),
    clickCost: clickCostPerUnit.toFixed(4),
    materialsCostPerUnit: materialsCostPerUnit.toFixed(4),
    textSheetsPerPad: sheets,
    backingSheetsPerPad: backingSheetsPerPad.toFixed(2),
    totalClicks: pressSheetsNeeded,
    imposition: imposition
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

// Poster Price Calculator (Large Format)
async function calculatePosterPrice(formData) {
  // Initialize pricing data if not already loaded
  const data = await window.pricingDataManager.getPricingData();
  
  const size = formData.get('size');
  const material = formData.get('material');
  const quantity = parseInt(formData.get('quantity')) || 1;
  const rushType = formData.get('rushType') || 'standard';
  
  // Validate inputs
  const posterConstraints = data.pricingConfigs.product_constraints?.posters;
  if (posterConstraints && (quantity < posterConstraints.minQuantity || quantity > posterConstraints.maxQuantity)) {
    throw new Error(`Quantity must be between ${posterConstraints.minQuantity} and ${posterConstraints.maxQuantity}`);
  }
  
  // Get material data
  const materialData = data.paperStocks[material];
  if (!materialData) {
    throw new Error(`Material ${material} not found`);
  }
  
  // Get size data and calculate square footage
  let squareFootage;
  
  if (size === 'custom') {
    // Handle custom size - get dimensions from form data
    const customWidth = parseFloat(formData.get('customWidth')) || 0;
    const customHeight = parseFloat(formData.get('customHeight')) || 0;
    
    if (customWidth < 6 || customHeight < 6) {
      throw new Error('Custom dimensions must be at least 6 inches');
    }
    
    // Validate width constraints based on material
    const maxWidth = material === 'QMPFL501503' ? 48 : 52; // fabric vs paper
    if (customWidth > maxWidth) {
      const materialName = material === 'QMPFL501503' ? 'fabric' : 'paper';
      throw new Error(`Width cannot exceed ${maxWidth} inches for ${materialName}`);
    }
    
    if (customHeight > 120) {
      throw new Error('Height cannot exceed 120 inches');
    }
    
    // Calculate square footage from custom dimensions
    squareFootage = (customWidth * customHeight) / 144; // Convert sq inches to sq feet
    
    // Practical area limit
    if (squareFootage > 50) {
      throw new Error('Total area cannot exceed 50 square feet');
    }
  } else {
    // Handle preset sizes
    const sizeData = data.pricingConfigs.imposition_data?.posters?.[size];
    if (!sizeData) {
      throw new Error(`Size ${size} not found for posters`);
    }
    squareFootage = sizeData.sqft;
  }
  const chargeRate = materialData.chargeRate; // per sqft

  // Calculate total square footage for volume discount
  const totalSquareFootage = squareFootage * quantity;

  // Determine volume discount tier
  let volumeDiscount = { discount: 0, multiplier: 1.00, description: 'Standard Rate' };
  const volumeTiers = data.pricingConfigs.largeFormatVolumeDiscounts?.tiers || [];

  for (const tier of volumeTiers) {
    if (totalSquareFootage >= tier.minSqft && totalSquareFootage <= tier.maxSqft) {
      volumeDiscount = tier;
      break;
    }
  }

  // Calculate costs with volume discount: material sqft rate × volumeDiscount × sqft × quantity
  const materialCostPerPoster = squareFootage * chargeRate * volumeDiscount.multiplier;
  const totalMaterialCost = materialCostPerPoster * quantity;

  // Get rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;

  // Calculate totals (no setup fee, no production cost - material only)
  const subtotal = totalMaterialCost;
  const totalCost = subtotal * rushMultiplier;
  const unitPrice = totalCost / quantity;

  // Calculate savings from volume discount
  const originalMaterialCost = squareFootage * chargeRate * quantity;
  const volumeSavings = originalMaterialCost - totalMaterialCost;

  return {
    printingSetupCost: "0.00",
    finishingSetupCost: "0.00",
    needsFinishing: false,
    productionCost: "0.00",
    materialCost: totalMaterialCost.toFixed(2),
    finishingCost: "0.00",
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(2),
    squareFootage: squareFootage.toFixed(1),
    totalSquareFootage: totalSquareFootage.toFixed(1),
    materialRate: chargeRate.toFixed(2),
    materialUsed: materialData.displayName,
    volumeDiscount: volumeDiscount.discount,
    volumeDiscountDescription: volumeDiscount.description,
    volumeSavings: volumeSavings.toFixed(2),
    // Additional breakdown data for configurator compatibility
    setupCost: 0,
    productionCost_numeric: 0,
    materialCost_numeric: totalMaterialCost,
    finishingCost_numeric: 0,
    subtotal_numeric: subtotal,
    totalCost_numeric: totalCost,
    unitPrice_numeric: unitPrice
  };
}

async function calculatePerfectBoundPrice(formData) {
  // Initialize pricing data
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const pages = parseInt(formData.get('pages'));
  const textPaperCode = formData.get('textPaper');
  const coverPaperCode = formData.get('coverPaper');
  const rushType = formData.get('rushType') || 'standard';

  // Get custom dimensions
  const customWidth = parseFloat(formData.get('customWidth')) || 8.5;
  const customHeight = parseFloat(formData.get('customHeight')) || 11;

  // Get printing sides configuration (interior pages only, cover is always double-sided)
  const printingSides = formData.get('printingSides') || 'double-sided';
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksPerSheet = printingSides === 'double-sided' ? 0.10 : 0.05;

  // Validate constraints
  const perfectBoundConstraints = data.pricingConfigs.product_constraints['perfect-bound-books'];

  if (quantity < perfectBoundConstraints.minQuantity || quantity > perfectBoundConstraints.maxQuantity) {
    return { error: `Quantity must be between ${perfectBoundConstraints.minQuantity} and ${perfectBoundConstraints.maxQuantity}` };
  }

  if (pages < perfectBoundConstraints.minPages || pages > perfectBoundConstraints.maxPages) {
    return { error: `Page count must be between ${perfectBoundConstraints.minPages} and ${perfectBoundConstraints.maxPages}` };
  }

  if (pages % perfectBoundConstraints.pageMultiple !== 0) {
    return { error: `Page count must be in multiples of ${perfectBoundConstraints.pageMultiple}` };
  }

  // Validate paper selections
  const textPaper = data.paperStocks[textPaperCode];
  const coverPaper = data.paperStocks[coverPaperCode];

  if (!textPaper || textPaper.type !== 'text_stock') {
    return { error: 'Please select a valid text paper' };
  }

  if (!coverPaper || coverPaper.type !== 'cover_stock') {
    return { error: 'Please select a valid cover paper (cover stock required)' };
  }

  // Enforce 80# minimum cover weight
  const coverWeight = parseInt(coverPaper.weight.replace('#', ''));
  if (coverWeight < 80) {
    return { error: 'Cover stock must be 80# or heavier for perfect binding' };
  }

  // Calculate imposition using dynamic calculator
  const impositionCalc = new ImpositionCalculator();
  const impositionResult = impositionCalc.calculateImposition(customWidth, customHeight);

  if (impositionResult.error) {
    return { error: impositionResult.error };
  }

  const pagesPerSheet = impositionResult.copies * sidesMultiplier; // Account for printing sides

  // Calculate sheets needed
  const interiorPages = pages - 4; // Subtract cover pages
  const interiorSheets = Math.ceil(interiorPages / pagesPerSheet);
  const coverSheets = 1; // Always 1 sheet for cover
  const totalSheets = interiorSheets + coverSheets;

  // Get pricing formula values
  const config = data.pricingConfigs.formula;
  const perfectBoundConfig = data.pricingConfigs.productFormulas['perfect-bound-books'];

  const S = config.setupFee * (perfectBoundConfig.setupFeeMultiplier || 1); // $15.00 × 2 = $30.00
  const F_setup = perfectBoundConfig.finishingSetupFee; // $30.00 perfect binding setup
  const k = config.baseProductionRate; // $1.50 per sheet
  const e = config.efficiencyExponent; // 0.75

  // Calculate material costs with variable click charges
  const interiorCost = interiorSheets * textPaper.costPerSheet;
  const coverCost = coverSheets * coverPaper.costPerSheet;
  const interiorClicks = interiorSheets * clicksPerSheet; // Interior uses variable click cost
  const coverClicks = coverSheets * 0.10; // Cover always double-sided
  const clickCost = interiorClicks + coverClicks;
  const materialCost = (interiorCost + coverCost + clickCost) * 1.25;

  console.log('Material Debug:', {
    pages,
    interiorSheets,
    coverSheets,
    totalSheets,
    interiorCost,
    coverCost,
    clickCost,
    materialCost,
    'per book': materialCost,
    'total for qty': materialCost * quantity
  });

  // Calculate variable cost per piece: material cost per book
  const v = materialCost;

  // Get finishing cost per unit
  const f = data.pricingConfigs.finishing_costs.perfectBinding.baseLabor; // $4.50

  // Apply formula: C(Q) = (S + F_setup + S_total^e × k + Q × v + Q × f) × r
  const S_total = quantity * totalSheets;
  const productionCost = Math.pow(S_total, e) * k;
  const materialsCost = quantity * v;
  const finishingCost = quantity * f;

  const subtotal = S + F_setup + productionCost + materialsCost + finishingCost;

  // Apply rush multiplier
  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;
  const totalCost = subtotal * rushMultiplier;

  const unitPrice = totalCost / quantity;

  return {
    printingSetupCost: S.toFixed(2),
    finishingSetupCost: F_setup.toFixed(2),
    productionCost: productionCost.toFixed(2),
    materialCost: materialsCost.toFixed(2),
    finishingCost: finishingCost.toFixed(2),
    subtotal: subtotal.toFixed(2),
    rushMultiplier: rushMultiplier,
    rushType: rushType,
    totalCost: totalCost.toFixed(2),
    unitPrice: unitPrice.toFixed(3),
    sheetsRequired: totalSheets,
    size: `${customWidth}" × ${customHeight}"`,
    textPaper: textPaper.displayName,
    coverPaper: coverPaper.displayName,
    pages: pages,
    quantity: quantity,
    interiorSheets: interiorSheets,
    coverSheets: coverSheets
  };
}

async function calculateFlatPrintPrice(formData) {
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const customWidth = parseFloat(formData.get('customWidth'));
  const customHeight = parseFloat(formData.get('customHeight'));
  const paperCode = formData.get('paperType');
  const rushType = formData.get('rushType') || 'standard';
  const hasHolePunch = formData.get('holePunch') === 'true';
  const hasLanyard = formData.get('lanyard') === 'true';

  // Get printing sides configuration
  const printingSides = formData.get('printingSides') || 'double-sided';
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksPerPiece = printingSides === 'double-sided' ? 0.10 : 0.05;

  const validation = ValidationUtils.validateQuantity(quantity, 'flat-prints', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }

  const config = data.pricingConfigs.formula;
  const S = config.setupFee;
  const k = config.baseProductionRate;
  const e = config.efficiencyExponent;     // 0.80 (standardized)

  const selectedPaper = data.paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }

  const paperCost = selectedPaper.costPerSheet;

  let width, height, displaySize;
  if (customWidth && customHeight) {
    width = customWidth;
    height = customHeight;
    displaySize = `${customWidth}"×${customHeight}"`;
  } else if (size) {
    const dimensions = parseSizeString(size);
    width = dimensions.width;
    height = dimensions.height;
    displaySize = size;
  } else {
    return { error: 'Size or custom dimensions required' };
  }

  const dynamicImposition = getDynamicImposition(width, height);
  if (!dynamicImposition) {
    return { error: 'Unable to calculate imposition for given dimensions' };
  }

  const impositionPerSide = dynamicImposition;
  const imposition = impositionPerSide; // Flat products: imposition doesn't change with sides
  const v = (paperCost + clicksPerPiece) * 1.5 / imposition;

  const isAdhesive = paperCode === 'PAC51319WP';
  let f = 0;
  if (!isAdhesive) {
    if (hasHolePunch) f += 0.05;
    if (hasLanyard) f += 1.25;
  }
  const needsFinishing = f > 0;

  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;

  const printingSetupCost = S;
  const finishingSetupCost = 0;
  const S_total = Math.ceil(quantity / imposition);
  const productionCost = Math.pow(S_total, e) * k;
  const materialCost = quantity * v;
  const finishingCost = quantity * f;

  const subtotal = printingSetupCost + finishingSetupCost + productionCost + materialCost + finishingCost;
  const totalCost = subtotal * rushMultiplier;

  const sheetsRequired = S_total;
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
    size: displaySize
  };
}

async function calculateFoldedPrintPrice(formData) {
  const data = await window.pricingDataManager.getPricingData();
  if (!data) {
    return { error: 'Pricing data not available' };
  }

  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperCode = formData.get('paperType');
  const foldType = formData.get('foldType') || 'none';
  const rushType = formData.get('rushType') || 'standard';

  // Get printing sides configuration
  const printingSides = formData.get('printingSides') || 'double-sided';
  const sidesMultiplier = printingSides === 'double-sided' ? 2 : 1;
  const clicksPerPiece = printingSides === 'double-sided' ? 0.10 : 0.05;

  const validation = ValidationUtils.validateQuantity(quantity, 'folded-prints', data.pricingConfigs.product_constraints);
  if (!validation.valid) {
    return { error: validation.message };
  }

  const config = data.pricingConfigs.formula;
  const S = config.setupFee;
  const F_setup = config.finishingSetupFee;
  const k = config.baseProductionRate;
  const e = config.efficiencyExponent;     // 0.80 (standardized)

  const selectedPaper = data.paperStocks[paperCode];
  if (!selectedPaper) {
    return { error: 'Invalid paper selection' };
  }

  const paperCost = selectedPaper.costPerSheet;

  const dimensions = parseSizeString(size);
  let dynamicImposition;

  if (foldType === 'table-tent') {
    const materialHeight = dimensions.height * 2.5;
    dynamicImposition = getDynamicImposition(dimensions.width, materialHeight);
  } else {
    dynamicImposition = getDynamicImposition(dimensions.width, dimensions.height);
  }

  if (!dynamicImposition) {
    return { error: 'Unable to calculate imposition for given size' };
  }

  const impositionPerSide = dynamicImposition;
  const imposition = impositionPerSide; // Flat products: imposition doesn't change with sides
  const v = (paperCost + clicksPerPiece) * 1.5 / imposition;

  const f = data.pricingConfigs.finishing_costs.folding[foldType] || 0;
  const needsFinishing = foldType && foldType !== 'none' && f > 0;

  const rushMultiplier = data.pricingConfigs.rush_multipliers[rushType]?.multiplier || 1.0;

  const printingSetupCost = S;
  const finishingSetupCost = needsFinishing ? F_setup : 0;
  const S_total = Math.ceil(quantity / imposition);
  const productionCost = Math.pow(S_total, e) * k;
  const materialCost = quantity * v;
  const finishingCost = quantity * f;

  const subtotal = printingSetupCost + finishingSetupCost + productionCost + materialCost + finishingCost;
  const totalCost = subtotal * rushMultiplier;

  const sheetsRequired = S_total;
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
    foldType: foldType
  };
}

// Export functions globally for universal configurator
if (typeof window !== 'undefined') {
  window.calculateFlatPrintPrice = calculateFlatPrintPrice;
  window.calculateFoldedPrintPrice = calculateFoldedPrintPrice;
  window.calculateBookletPrice = calculateBookletPrice;
  window.calculateNotebookPrice = calculateNotebookPrice;
  window.calculateNotepadPrice = calculateNotepadPrice;
  window.calculatePosterPrice = calculatePosterPrice;
  window.calculatePerfectBoundPrice = calculatePerfectBoundPrice;
}

// Initialize card selection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CardSelection();
});

