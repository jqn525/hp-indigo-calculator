export class ProductHandler {
  constructor(productType) {
    this.productType = productType;
  }

  getProductType() {
    return this.productType;
  }

  getDisplayName() {
    const names = {
      'flat-prints': 'Flat Prints',
      'folded-prints': 'Folded Prints',
      'brochures': 'Brochures',
      'postcards': 'Postcards',
      'flyers': 'Flyers',
      'bookmarks': 'Bookmarks',
      'name-tags': 'Name Tags',
      'booklets': 'Booklets',
      'notebooks': 'Notebooks',
      'notepads': 'Notepads',
      'table-tents': 'Table Tents',
      'posters': 'Posters',
      'perfect-bound-books': 'Perfect Bound Books',
      'magnets': 'Magnets',
      'stickers': 'Stickers',
      'apparel': 'Apparel',
      'tote-bags': 'Tote Bags'
    };
    return names[this.productType] || this.productType;
  }

  createOptionsHTML() {
    return '';
  }

  bindEventListeners(onConfigChange) {
    return;
  }

  shouldShowDimensions() {
    return true;
  }

  shouldShowPaperSection() {
    return true;
  }

  shouldShowPrintingSides() {
    return true;
  }

  requiresMultiplePapers() {
    return false;
  }

  getFormDataOptions() {
    return [];
  }

  async calculatePrice(formData) {
    throw new Error('calculatePrice must be implemented by subclass');
  }

  getDisplayConfiguration(config) {
    const displayConfig = [];

    if (config.customWidth && config.customHeight) {
      displayConfig.push(`Size: ${config.customWidth}" × ${config.customHeight}"`);
    }

    if (config.textPaper && config.coverPaper && typeof paperStocks !== 'undefined') {
      displayConfig.push(`Paper: ${paperStocks[config.textPaper].displayName} / ${paperStocks[config.coverPaper].displayName}`);
    } else if (config.textPaper && typeof paperStocks !== 'undefined') {
      displayConfig.push(`Paper: ${paperStocks[config.textPaper].displayName}`);
    } else if (config.coverPaper && typeof paperStocks !== 'undefined') {
      displayConfig.push(`Paper: ${paperStocks[config.coverPaper].displayName}`);
    }

    if (config.quantity) {
      displayConfig.push(`Quantity: ${config.quantity.toLocaleString()}`);
    }

    if (config.rushType) {
      const rushNames = {
        'standard': 'Standard (3-5 days)',
        '2-day': '2-Day Rush',
        'next-day': 'Next Day',
        'same-day': 'Same Day'
      };
      displayConfig.push(`Turnaround: ${rushNames[config.rushType] || 'Standard'}`);
    }

    return displayConfig;
  }

  cleanup() {
    return;
  }
}
