import { ConfigurationManager } from './universalConfigurator/ConfigurationManager.js';
import { UIManager } from './universalConfigurator/UIManager.js';
import { PricingManager } from './universalConfigurator/PricingManager.js';
import { ProductHandlerFactory } from './universalConfigurator/products/ProductHandlerFactory.js';
import { ValidationHelper } from './universalConfigurator/utils/ValidationHelper.js';
import { EventBindingHelper } from './universalConfigurator/utils/EventBindingHelper.js';

class UniversalConfigurator {
  constructor() {
    this.impositionCalc = new ImpositionCalculator();
    this.configManager = new ConfigurationManager();
    this.uiManager = new UIManager(this.impositionCalc);
    this.pricingManager = new PricingManager();
    this.productHandlerFactory = new ProductHandlerFactory(this.pricingManager, this.configManager);

    this.currentProductHandler = null;
    this.debounceTimer = null;
    this.isCalculating = false;

    this.currentConfig = this.configManager.getConfig();
    this.currentPricing = this.configManager.getPricing();

    this.init();
  }

  init() {
    this.uiManager.populatePaperOptions();
    this.bindEvents();
    this.updateCartBadge();
  }

  bindEvents() {
    EventBindingHelper.bindChange('productType', (e) => {
      this.handleProductTypeChange(e.target.value);
    });

    EventBindingHelper.bindInput('customWidth', () => this.handleDimensionChange());
    EventBindingHelper.bindInput('customHeight', () => this.handleDimensionChange());

    this.bindPaperSelections();
    this.bindCommonInputs();
    this.bindTurnaroundOptions();

    EventBindingHelper.bindClick('addToCartBtn', () => this.addToCart());
  }

  bindPaperSelections() {
    const textPaper = document.getElementById('textPaper');
    const coverPaper = document.getElementById('coverPaper');
    const specialtyStock = document.getElementById('specialtyStock');

    if (textPaper) {
      textPaper.addEventListener('change', (e) => {
        if (e.target.value) {
          specialtyStock.value = '';
          this.configManager.setPaper('specialty', '');

          if (!this.requiresMultiplePapers()) {
            coverPaper.value = '';
            this.configManager.setPaper('cover', '');
          }
        }
        this.currentConfig.textPaper = e.target.value;
        this.configManager.setPaper('text', e.target.value);
        this.updateConfiguration();
        this.debouncedPriceCalculation();
      });
    }

    if (coverPaper) {
      coverPaper.addEventListener('change', (e) => {
        if (e.target.value) {
          specialtyStock.value = '';
          this.configManager.setPaper('specialty', '');

          if (!this.requiresMultiplePapers()) {
            textPaper.value = '';
            this.configManager.setPaper('text', '');
          }
        }
        this.currentConfig.coverPaper = e.target.value;
        this.configManager.setPaper('cover', e.target.value);
        this.updateConfiguration();
        this.debouncedPriceCalculation();
      });
    }

    if (specialtyStock) {
      specialtyStock.addEventListener('change', (e) => {
        if (e.target.value) {
          textPaper.value = '';
          coverPaper.value = '';
          this.configManager.setPaper('text', '');
          this.configManager.setPaper('cover', '');
          this.currentConfig.textPaper = '';
          this.currentConfig.coverPaper = '';
        }
        this.currentConfig.specialtyStock = e.target.value;
        this.configManager.setPaper('specialty', e.target.value);
        this.updateConfiguration();
        this.debouncedPriceCalculation();
      });
    }
  }

  bindCommonInputs() {
    EventBindingHelper.bindChange('printingSides', (e) => {
      this.currentConfig.printingSides = e.target.value;
      this.configManager.setPrintingSides(e.target.value);
      this.updateConfiguration();
      this.debouncedPriceCalculation();
    });

    EventBindingHelper.bindInput('quantity', (e) => {
      this.currentConfig.quantity = parseInt(e.target.value) || 0;
      this.configManager.setQuantity(this.currentConfig.quantity);
      this.updateConfiguration();
      this.debouncedPriceCalculation();
    });
  }

  bindTurnaroundOptions() {
    document.querySelectorAll('input[name="rushType"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentConfig.rushType = e.target.value;
        this.configManager.setRushType(e.target.value);
        this.updateConfiguration();
        this.debouncedPriceCalculation();
      });
    });

    document.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        const option = card.dataset.option;
        const value = card.dataset.value;

        if (option === 'turnaround') {
          card.parentNode.querySelectorAll('.option-card').forEach(c =>
            c.classList.remove('selected')
          );
          card.classList.add('selected');

          const radio = card.querySelector('input[type="radio"]');
          if (radio) {
            radio.checked = true;
            this.currentConfig.rushType = value;
            this.configManager.setRushType(value);
            this.updateConfiguration();
            this.debouncedPriceCalculation();
          }
        }
      });
    });
  }

  handleProductTypeChange(productType) {
    this.currentConfig.productType = productType;
    this.configManager.setProductType(productType);

    const sections = ['dimensionsSection', 'paperSection', 'printingSidesSection', 'quantitySection', 'turnaroundSection'];

    if (!productType) {
      this.uiManager.hideSections(sections);
      this.uiManager.hideSpecificOptions();
      this.uiManager.hideImpositionInfo();
      return;
    }

    this.currentProductHandler = this.productHandlerFactory.getHandler(productType);

    if (!this.currentProductHandler) {
      console.warn(`No handler found for product type: ${productType}`);
      this.uiManager.hideSpecificOptions();
      return;
    }

    this.uiManager.showSections(sections);
    this.uiManager.updateCurrentProduct(this.currentProductHandler.getDisplayName());

    if (!this.currentProductHandler.shouldShowPaperSection()) {
      this.uiManager.hideSections(['paperSection']);
    }

    if (!this.currentProductHandler.shouldShowPrintingSides()) {
      this.uiManager.hideSections(['printingSidesSection']);
    }

    const optionsHTML = this.currentProductHandler.createOptionsHTML();
    if (optionsHTML) {
      this.uiManager.showSpecificOptions(
        `${this.currentProductHandler.getDisplayName()} Options`,
        optionsHTML
      );

      this.currentProductHandler.bindEventListeners(() => {
        this.updateConfiguration();
        this.debouncedPriceCalculation();
      });
    } else {
      this.uiManager.hideSpecificOptions();
    }

    this.resetConfiguration();
    this.updateConfiguration();
  }

  handleDimensionChange() {
    const width = parseFloat(document.getElementById('customWidth').value) || 0;
    const height = parseFloat(document.getElementById('customHeight').value) || 0;

    this.currentConfig.customWidth = width;
    this.currentConfig.customHeight = height;
    this.configManager.setDimensions(width, height);

    if (width > 0 && height > 0) {
      this.uiManager.updateImpositionDisplay(width, height, this.currentConfig.productType);
    } else {
      this.uiManager.hideImpositionInfo();
    }

    this.updateConfiguration();
    this.debouncedPriceCalculation();
  }

  updateConfiguration() {
    this.currentConfig = this.configManager.getConfig();
    this.uiManager.updateConfigurationDisplay(this.currentConfig);
  }

  debouncedPriceCalculation() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.calculatePricing();
    }, 300);
  }

  async calculatePricing() {
    if (this.isCalculating) return;

    const validation = ValidationHelper.validateConfiguration(this.currentConfig);
    if (!validation.valid) {
      this.uiManager.resetPricingDisplay();
      return;
    }

    if (!this.currentProductHandler) {
      this.uiManager.resetPricingDisplay();
      return;
    }

    this.isCalculating = true;

    try {
      const pricing = await this.pricingManager.calculatePrice(this.currentConfig, this.currentProductHandler);

      if (pricing.error) {
        this.uiManager.showPricingError(pricing.error);
      } else {
        this.currentPricing = pricing;
        this.configManager.updatePricing(pricing);
        this.uiManager.updatePricingDisplay(pricing);
      }
    } catch (error) {
      console.error('Pricing calculation error:', error);
      this.uiManager.showPricingError('Unable to calculate pricing. Please check your configuration.');
    } finally {
      this.isCalculating = false;
    }
  }

  addToCart() {
    if (!this.currentPricing.totalCost || this.currentPricing.totalCost <= 0) {
      alert('Please configure the product and calculate pricing first.');
      return;
    }

    const displayConfig = this.currentProductHandler ?
      this.currentProductHandler.getDisplayConfiguration(this.currentConfig) :
      [];

    const cartItem = {
      id: Date.now().toString(),
      productType: this.currentConfig.productType,
      productName: this.currentProductHandler?.getDisplayName() || this.currentConfig.productType,
      configuration: { ...this.currentConfig },
      pricing: { ...this.currentPricing },
      addedAt: new Date().toISOString(),
      displayConfig: displayConfig
    };

    if (typeof addItemToCart === 'function') {
      addItemToCart(cartItem);
      this.updateCartBadge();
      alert(`${cartItem.productName} added to cart!`);
    } else {
      console.error('Cart functionality not available');
      alert('Unable to add to cart. Please refresh the page and try again.');
    }
  }

  requiresMultiplePapers() {
    return this.currentProductHandler?.requiresMultiplePapers() || false;
  }

  resetConfiguration() {
    document.getElementById('customWidth').value = '';
    document.getElementById('customHeight').value = '';
    document.getElementById('textPaper').value = '';
    document.getElementById('coverPaper').value = '';
    document.getElementById('specialtyStock').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('printingSides').value = 'double-sided';

    const standardRadio = document.querySelector('input[name="rushType"][value="standard"]');
    if (standardRadio) standardRadio.checked = true;

    document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
    const standardCard = document.querySelector('.option-card[data-value="standard"]');
    if (standardCard) standardCard.classList.add('selected');

    this.currentConfig = {
      ...this.configManager.getDefaultConfig(),
      productType: this.currentConfig.productType
    };
    this.configManager.resetConfig(true);

    this.uiManager.resetPricingDisplay();
  }

  updateCartBadge() {
    if (typeof updateCartDisplay === 'function') {
      updateCartDisplay();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing UniversalConfigurator...');

  setTimeout(() => {
    if (typeof paperStocks === 'undefined') {
      console.error('Critical: paperStocks not loaded. Cannot initialize configurator.');
      alert('Configuration error. Please refresh the page.');
      return;
    }

    console.log('paperStocks available, creating UniversalConfigurator');
    try {
      new UniversalConfigurator();
    } catch (error) {
      console.error('Error initializing UniversalConfigurator:', error);
    }
  }, 100);
});
