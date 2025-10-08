import { ConfigurationManager } from './ConfigurationManager.js';
import { UIManager } from './UIManager.js';
import { PricingManager } from './PricingManager.js';
import { ProductHandlerFactory } from './products/ProductHandlerFactory.js';
import { ValidationHelper } from './utils/ValidationHelper.js';
import { EventBindingHelper } from './utils/EventBindingHelper.js';

export class UniversalConfiguratorCore {
  constructor(impositionCalc) {
    this.impositionCalc = impositionCalc;
    this.configManager = new ConfigurationManager();
    this.uiManager = new UIManager(impositionCalc);
    this.pricingManager = new PricingManager();
    this.productHandlerFactory = new ProductHandlerFactory(this.pricingManager);

    this.currentProductHandler = null;
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.uiManager.populatePaperOptions();
    this.bindCoreEvents();
    this.updateCartBadge();
  }

  bindCoreEvents() {
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

          if (!this.currentProductHandler?.requiresMultiplePapers()) {
            coverPaper.value = '';
            this.configManager.setPaper('cover', '');
          }
        }
        this.configManager.setPaper('text', e.target.value);
        this.updateAndCalculate();
      });
    }

    if (coverPaper) {
      coverPaper.addEventListener('change', (e) => {
        if (e.target.value) {
          specialtyStock.value = '';
          this.configManager.setPaper('specialty', '');

          if (!this.currentProductHandler?.requiresMultiplePapers()) {
            textPaper.value = '';
            this.configManager.setPaper('text', '');
          }
        }
        this.configManager.setPaper('cover', e.target.value);
        this.updateAndCalculate();
      });
    }

    if (specialtyStock) {
      specialtyStock.addEventListener('change', (e) => {
        if (e.target.value) {
          textPaper.value = '';
          coverPaper.value = '';
          this.configManager.setPaper('text', '');
          this.configManager.setPaper('cover', '');
        }
        this.configManager.setPaper('specialty', e.target.value);
        this.updateAndCalculate();
      });
    }
  }

  bindCommonInputs() {
    EventBindingHelper.bindChange('printingSides', (e) => {
      this.configManager.setPrintingSides(e.target.value);
      this.updateAndCalculate();
    });

    EventBindingHelper.bindInput('quantity', (e) => {
      this.configManager.setQuantity(parseInt(e.target.value) || 0);
      this.updateAndCalculate();
    });
  }

  bindTurnaroundOptions() {
    EventBindingHelper.bindRadioGroup('rushType', (e) => {
      this.configManager.setRushType(e.target.value);
      this.updateAndCalculate();
    });

    EventBindingHelper.bindOptionCards((value) => {
      this.configManager.setRushType(value);
      this.updateAndCalculate();
    });
  }

  handleProductTypeChange(productType) {
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

      this.currentProductHandler.bindEventListeners(() => this.updateAndCalculate());
    } else {
      this.uiManager.hideSpecificOptions();
    }

    this.configManager.resetConfig(true);
    this.uiManager.clearFormInputs(true);
    this.updateConfiguration();
  }

  handleDimensionChange() {
    const width = parseFloat(document.getElementById('customWidth').value) || 0;
    const height = parseFloat(document.getElementById('customHeight').value) || 0;

    this.configManager.setDimensions(width, height);

    if (width > 0 && height > 0) {
      const config = this.configManager.getConfig();
      this.uiManager.updateImpositionDisplay(width, height, config.productType);
    } else {
      this.uiManager.hideImpositionInfo();
    }

    this.updateAndCalculate();
  }

  updateConfiguration() {
    const config = this.configManager.getConfig();
    this.uiManager.updateConfigurationDisplay(config);
  }

  updateAndCalculate() {
    this.updateConfiguration();
    this.debouncedPriceCalculation();
  }

  debouncedPriceCalculation() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.calculatePricing();
    }, 300);
  }

  async calculatePricing() {
    const config = this.configManager.getConfig();

    const validation = ValidationHelper.validateConfiguration(config);
    if (!validation.valid) {
      this.uiManager.resetPricingDisplay();
      return;
    }

    if (!this.currentProductHandler) {
      this.uiManager.resetPricingDisplay();
      return;
    }

    try {
      const pricing = await this.pricingManager.calculatePrice(config, this.currentProductHandler);

      if (pricing.error) {
        this.uiManager.showPricingError(pricing.error);
      } else {
        this.configManager.updatePricing(pricing);
        this.uiManager.updatePricingDisplay(pricing);
      }
    } catch (error) {
      console.error('Pricing calculation error:', error);
      this.uiManager.showPricingError('Unable to calculate pricing. Please check your configuration.');
    }
  }

  addToCart() {
    const pricing = this.configManager.getPricing();

    if (!pricing.total || pricing.total <= 0) {
      alert('Please configure the product and calculate pricing first.');
      return;
    }

    const config = this.configManager.getConfig();
    const displayConfig = this.currentProductHandler ?
      this.currentProductHandler.getDisplayConfiguration(config) :
      [];

    const cartItem = {
      id: Date.now().toString(),
      productType: config.productType,
      productName: this.currentProductHandler?.getDisplayName() || config.productType,
      configuration: { ...config },
      pricing: { ...pricing },
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

  updateCartBadge() {
    if (typeof updateCartDisplay === 'function') {
      updateCartDisplay();
    }
  }
}
