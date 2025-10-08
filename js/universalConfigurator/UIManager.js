export class UIManager {
  constructor(impositionCalc) {
    this.impositionCalc = impositionCalc;
  }

  updateCurrentProduct(displayName) {
    const element = document.getElementById('currentProduct');
    if (element) {
      element.textContent = displayName;
    }
  }

  showSections(sectionIds) {
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'block';
      }
    });
  }

  hideSections(sectionIds) {
    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'none';
      }
    });
  }

  showSpecificOptions(title, html) {
    const section = document.getElementById('specificOptionsSection');
    const titleEl = document.getElementById('specificOptionsTitle');
    const content = document.getElementById('specificOptionsContent');

    if (section && titleEl && content) {
      titleEl.textContent = title;
      content.innerHTML = html;
      section.style.display = 'block';
    }
  }

  hideSpecificOptions() {
    const section = document.getElementById('specificOptionsSection');
    if (section) {
      section.style.display = 'none';
    }
  }

  updateConfigurationDisplay(config) {
    this.updateSize(config.customWidth, config.customHeight);
    this.updatePaper(config);
    this.updateQuantity(config.quantity);
    this.updateTurnaround(config.rushType);
    this.updatePrintingSides(config);
  }

  updateSize(width, height) {
    const element = document.getElementById('currentSize');
    if (element) {
      element.textContent = (width > 0 && height > 0)
        ? `${width}" × ${height}"`
        : '-';
    }
  }

  updatePaper(config) {
    const element = document.getElementById('currentPaper');
    if (!element || typeof paperStocks === 'undefined') return;

    let paperDisplay = '-';

    if (config.specialtyStock) {
      paperDisplay = paperStocks[config.specialtyStock]?.displayName || '-';
    } else if (config.posterMaterial) {
      paperDisplay = paperStocks[config.posterMaterial]?.displayName || '-';
    } else if (config.textPaper && config.coverPaper) {
      const textPaper = paperStocks[config.textPaper];
      const coverPaper = paperStocks[config.coverPaper];
      if (textPaper && coverPaper) {
        paperDisplay = `${textPaper.displayName} / ${coverPaper.displayName}`;
      }
    } else if (config.textPaper) {
      paperDisplay = paperStocks[config.textPaper]?.displayName || '-';
    } else if (config.coverPaper) {
      paperDisplay = paperStocks[config.coverPaper]?.displayName || '-';
    }

    element.textContent = paperDisplay;
  }

  updateQuantity(quantity) {
    const element = document.getElementById('currentQuantity');
    if (element) {
      element.textContent = quantity > 0 ? quantity.toLocaleString() : '-';
    }
  }

  updateTurnaround(rushType) {
    const element = document.getElementById('currentTurnaround');
    if (element) {
      const names = {
        'standard': 'Standard (3-5 days)',
        '2-day': '2-Day Rush',
        'next-day': 'Next Day',
        'same-day': 'Same Day'
      };
      element.textContent = names[rushType] || 'Standard';
    }
  }

  updatePrintingSides(config) {
    const display = document.getElementById('printingSidesDisplay');
    const current = document.getElementById('currentPrintingSides');

    if (!display || !current) return;

    const supportsPrintingSides = [
      'flat-prints', 'folded-prints', 'brochures', 'postcards', 'table-tents',
      'bookmarks', 'name-tags', 'flyers', 'booklets', 'notebooks',
      'notepads', 'perfect-bound-books'
    ].includes(config.productType);

    if (supportsPrintingSides) {
      const sides = config.printingSides || 'double-sided';
      current.textContent = sides === 'double-sided' ? 'Double-Sided' : 'Single-Sided';
      display.style.display = 'flex';
    } else {
      display.style.display = 'none';
    }
  }

  updateImpositionDisplay(width, height, productType) {
    if (productType === 'posters') {
      this.showPosterAreaInfo(width, height);
      return;
    }

    const impositionData = this.impositionCalc.calculateImposition(width, height);

    if (impositionData.error) {
      this.showImpositionError(impositionData.error);
      return;
    }

    const efficiencyRating = this.impositionCalc.getEfficiencyRating(impositionData.efficiency);

    document.getElementById('currentImposition').textContent = `${impositionData.copies} per sheet`;
    document.getElementById('efficiencyRating').innerHTML = `
      <span class="rating-icon">${efficiencyRating.icon}</span>
      <span class="rating-text">${efficiencyRating.message}</span>
      <span class="rating-percentage">${impositionData.efficiency}%</span>
    `;
    document.getElementById('efficiencyRating').style.color = efficiencyRating.color;
    document.getElementById('impositionDetails').textContent =
      `${impositionData.copies} copies per 12.48×18.26" sheet (${impositionData.orientation})`;
    document.getElementById('bleedInfo').textContent =
      `With bleed: ${this.impositionCalc.formatDimensions(impositionData.bleedWidth, impositionData.bleedHeight)}`;
    document.getElementById('impositionInfo').style.display = 'block';
  }

  showPosterAreaInfo(width, height) {
    const squareFeet = (width * height) / 144;
    const formattedSqFt = Math.round(squareFeet * 100) / 100;

    document.getElementById('currentImposition').textContent = `${formattedSqFt} sq ft`;
    document.getElementById('efficiencyRating').innerHTML = `
      <span class="rating-icon">📐</span>
      <span class="rating-text">Square footage pricing</span>
      <span class="rating-percentage">${formattedSqFt} sq ft</span>
    `;
    document.getElementById('efficiencyRating').style.color = '#17a2b8';
    document.getElementById('impositionDetails').textContent =
      `${this.impositionCalc.formatDimensions(width, height)} = ${formattedSqFt} square feet`;
    document.getElementById('bleedInfo').textContent = `Large format pricing based on area`;
    document.getElementById('impositionInfo').style.display = 'block';
  }

  showImpositionError(error) {
    document.getElementById('currentImposition').textContent = 'Size Error';
    document.getElementById('efficiencyRating').innerHTML = `
      <span class="rating-icon">❌</span>
      <span class="rating-text">${error}</span>
      <span class="rating-percentage">0%</span>
    `;
    document.getElementById('efficiencyRating').style.color = '#dc3545';
    document.getElementById('impositionDetails').textContent = 'Please adjust dimensions';
    document.getElementById('bleedInfo').textContent = 'Maximum: 12.23" × 18.01" (HP Indigo limit)';
    document.getElementById('impositionInfo').style.display = 'block';
  }

  hideImpositionInfo() {
    const element = document.getElementById('impositionInfo');
    if (element) {
      element.style.display = 'none';
    }
    const imposition = document.getElementById('currentImposition');
    if (imposition) {
      imposition.textContent = '-';
    }
  }

  updatePricingDisplay(pricing) {
    document.getElementById('livePrice').textContent = `$${parseFloat(pricing.totalCost || 0).toFixed(2)}`;
    document.getElementById('liveUnitPrice').textContent = `$${parseFloat(pricing.unitPrice || 0).toFixed(2)}`;

    document.getElementById('redSetupCost').textContent =
      `$${(parseFloat(pricing.printingSetupCost || 0) + parseFloat(pricing.finishingSetupCost || 0)).toFixed(2)}`;
    document.getElementById('redProductionCost').textContent =
      `$${parseFloat(pricing.productionCost || 0).toFixed(2)}`;
    document.getElementById('redMaterialCost').textContent =
      `$${parseFloat(pricing.materialCost || 0).toFixed(2)}`;
    document.getElementById('redFinishingCost').textContent =
      `$${parseFloat(pricing.finishingCost || 0).toFixed(2)}`;
    document.getElementById('redSubtotal').textContent =
      `$${parseFloat(pricing.subtotal || 0).toFixed(2)}`;
    document.getElementById('redSheetsRequired').textContent =
      parseInt(pricing.sheetsRequired || 0);

    const rushItem = document.getElementById('redRushMultiplierItem');
    if (pricing.rushMultiplier && pricing.rushMultiplier > 1) {
      document.getElementById('redRushMultiplier').textContent = `${pricing.rushMultiplier}x`;
      rushItem.style.display = 'flex';
    } else {
      rushItem.style.display = 'none';
    }

    const volumeItem = document.getElementById('redVolumeDiscountItem');
    if (pricing.volumeDiscount && pricing.volumeDiscount > 0) {
      document.getElementById('redVolumeDiscount').textContent =
        `${pricing.volumeDiscount}% (${pricing.volumeDiscountDescription || 'Volume Discount'})`;
      volumeItem.style.display = 'flex';
    } else {
      volumeItem.style.display = 'none';
    }

    document.getElementById('priceStatus').innerHTML =
      '<span class="status-text text-success">✓ Price calculated</span>';
    document.getElementById('addToCartBtn').disabled = false;
  }

  resetPricingDisplay() {
    document.getElementById('livePrice').textContent = '$0.00';
    document.getElementById('liveUnitPrice').textContent = '$0.00';
    document.getElementById('priceStatus').innerHTML =
      '<span class="status-text">Configure options to see pricing</span>';

    ['redSetupCost', 'redProductionCost', 'redMaterialCost', 'redFinishingCost', 'redSubtotal']
      .forEach(id => {
        document.getElementById(id).textContent = '$0.00';
      });

    document.getElementById('redSheetsRequired').textContent = '0';
    document.getElementById('redRushMultiplierItem').style.display = 'none';
    document.getElementById('redVolumeDiscountItem').style.display = 'none';
    document.getElementById('addToCartBtn').disabled = true;
  }

  showPricingError(error) {
    document.getElementById('priceStatus').innerHTML =
      `<span class="status-text text-danger">${error}</span>`;
    document.getElementById('addToCartBtn').disabled = true;
  }

  clearFormInputs(keepProductType = false) {
    if (!keepProductType) {
      const productType = document.getElementById('productType');
      if (productType) productType.value = '';
    }

    const inputs = ['customWidth', 'customHeight', 'textPaper', 'coverPaper', 'specialtyStock', 'quantity'];
    inputs.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });

    const printingSides = document.getElementById('printingSides');
    if (printingSides) printingSides.value = 'double-sided';

    const standardRadio = document.querySelector('input[name="rushType"][value="standard"]');
    if (standardRadio) standardRadio.checked = true;

    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    const standardCard = document.querySelector('.option-card[data-value="standard"]');
    if (standardCard) standardCard.classList.add('selected');
  }

  populatePaperOptions() {
    const textSelect = document.getElementById('textPaper');
    const coverSelect = document.getElementById('coverPaper');
    const specialtySelect = document.getElementById('specialtyStock');

    if (!textSelect || !coverSelect || !specialtySelect) {
      console.error('Paper select elements not found');
      return;
    }

    if (typeof paperStocks === 'undefined') {
      console.error('paperStocks not loaded');
      return;
    }

    textSelect.innerHTML = '<option value="">Select text paper...</option>';
    coverSelect.innerHTML = '<option value="">Select cover paper...</option>';
    specialtySelect.innerHTML = '<option value="">No specialty stock...</option>';

    Object.entries(paperStocks).forEach(([code, paper]) => {
      if (!paper || (!paper.costPerSheet && !paper.chargeRate)) return;

      const option = document.createElement('option');
      option.value = code;
      const price = paper.costPerSheet || paper.chargeRate;
      const unit = paper.chargeRate ? 'sqft' : 'sheet';
      option.textContent = `${paper.displayName} - $${price.toFixed(2)}/${unit}`;

      if (paper.type === 'text_stock') {
        textSelect.appendChild(option);
      } else if (paper.type === 'cover_stock') {
        coverSelect.appendChild(option);
      } else if (paper.type === 'adhesive_stock') {
        specialtySelect.appendChild(option);
      }
    });
  }
}
