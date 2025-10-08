export class ConfigurationManager {
  constructor() {
    this.config = this.getDefaultConfig();
    this.pricing = this.getDefaultPricing();
    this.listeners = [];
  }

  getDefaultConfig() {
    return {
      productType: '',
      customWidth: 0,
      customHeight: 0,
      textPaper: '',
      coverPaper: '',
      specialtyStock: '',
      posterMaterial: '',
      quantity: 0,
      rushType: 'standard',
      printingSides: 'double-sided'
    };
  }

  getDefaultPricing() {
    return {
      total: 0,
      unitPrice: 0,
      breakdown: {}
    };
  }

  getConfig() {
    return { ...this.config };
  }

  getPricing() {
    return { ...this.pricing };
  }

  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    this.notifyListeners('config', this.config);
  }

  updatePricing(pricing) {
    this.pricing = { ...this.pricing, ...pricing };
    this.notifyListeners('pricing', this.pricing);
  }

  resetConfig(keepProductType = false) {
    const productType = keepProductType ? this.config.productType : '';
    this.config = {
      ...this.getDefaultConfig(),
      productType
    };
    this.notifyListeners('config', this.config);
  }

  resetPricing() {
    this.pricing = this.getDefaultPricing();
    this.notifyListeners('pricing', this.pricing);
  }

  setProductType(productType) {
    this.config.productType = productType;
    this.notifyListeners('productType', productType);
  }

  setDimensions(width, height) {
    this.config.customWidth = width;
    this.config.customHeight = height;
    this.notifyListeners('dimensions', { width, height });
  }

  setPaper(type, value) {
    if (type === 'text') {
      this.config.textPaper = value;
    } else if (type === 'cover') {
      this.config.coverPaper = value;
    } else if (type === 'specialty') {
      this.config.specialtyStock = value;
    } else if (type === 'poster') {
      this.config.posterMaterial = value;
    }
    this.notifyListeners('paper', { type, value });
  }

  setQuantity(quantity) {
    this.config.quantity = quantity;
    this.notifyListeners('quantity', quantity);
  }

  setRushType(rushType) {
    this.config.rushType = rushType;
    this.notifyListeners('rushType', rushType);
  }

  setPrintingSides(sides) {
    this.config.printingSides = sides;
    this.notifyListeners('printingSides', sides);
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener(type, data);
      } catch (error) {
        console.error('Error in config listener:', error);
      }
    });
  }

  clearPaperSelections(except = null) {
    if (except !== 'text') this.config.textPaper = '';
    if (except !== 'cover') this.config.coverPaper = '';
    if (except !== 'specialty') this.config.specialtyStock = '';
    if (except !== 'poster') this.config.posterMaterial = '';
  }
}
