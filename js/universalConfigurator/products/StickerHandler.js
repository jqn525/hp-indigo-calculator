import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';

export class StickerHandler extends ProductHandler {
  constructor(pricingManager) {
    super('stickers');
    this.pricingManager = pricingManager;
  }

  shouldShowPaperSection() {
    return false;
  }

  shouldShowPrintingSides() {
    return false;
  }

  createOptionsHTML() {
    return `
      <div class="mb-4">
        <label class="form-label">Production Type</label>
        <select class="form-select" id="stickerProductionType">
          <option value="standard">Standard (In-House) - $12/sq ft + $30 setup</option>
          <option value="premium">Premium (Supplier) - Custom Sizing Available</option>
        </select>
      </div>

      <div id="standardStickerOptions">
        <div class="mb-3">
          <label class="form-label">Finish</label>
          <select class="form-select" id="stickerFinish">
            <option value="vinyl-matte">Vinyl Matte (Kiss-Cut)</option>
          </select>
        </div>
        <div class="alert alert-success">
          <strong>In-House Production:</strong> Enter any dimensions above.
          Wide-format printing at $12/sq ft + $30 setup fee with volume discounts.
        </div>
      </div>

      <div id="premiumStickerOptions" style="display: none;">
        <div class="mb-3">
          <label class="form-label">Finish</label>
          <select class="form-select" id="premiumStickerFinish">
            <option value="vinyl-matte">Premium Vinyl (Die-Cut)</option>
          </select>
        </div>
        <div class="alert alert-info">
          <strong>Premium Supplier:</strong> Enter any dimensions above.
          Pricing uses advanced interpolation based on supplier cost structure.
        </div>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    this.onConfigChange = onConfigChange;

    const productionTypeSelect = document.getElementById('stickerProductionType');
    if (productionTypeSelect) {
      EventBindingHelper.bindWithCleanup('stickerProductionType', 'change', this, 'handleProductionChange');
    }

    EventBindingHelper.bindChange('stickerFinish', onConfigChange);
    EventBindingHelper.bindChange('premiumStickerFinish', onConfigChange);
  }

  handleProductionChange() {
    const productionTypeSelect = document.getElementById('stickerProductionType');
    if (!productionTypeSelect) return;

    const productionType = productionTypeSelect.value;
    const standardOptions = document.getElementById('standardStickerOptions');
    const premiumOptions = document.getElementById('premiumStickerOptions');

    if (productionType === 'standard') {
      standardOptions.style.display = 'block';
      premiumOptions.style.display = 'none';
    } else {
      standardOptions.style.display = 'none';
      premiumOptions.style.display = 'block';
    }

    if (this.onConfigChange) {
      this.onConfigChange();
    }
  }

  getFormDataOptions() {
    const stickerProductionType = document.getElementById('stickerProductionType')?.value || 'standard';
    const stickerFinish = document.getElementById('stickerFinish')?.value || 'vinyl-matte';
    const premiumStickerFinish = document.getElementById('premiumStickerFinish')?.value || 'vinyl-matte';

    return [
      ['stickerProductionType', stickerProductionType],
      ['stickerFinish', stickerFinish],
      ['premiumStickerFinish', premiumStickerFinish]
    ];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    return await this.pricingManager.calculateStickerPricing(width, height, quantity, rushType, formData);
  }

  getDisplayConfiguration(config) {
    const displayConfig = [];

    if (config.customWidth && config.customHeight) {
      const squareFeet = (config.customWidth * config.customHeight) / 144;
      displayConfig.push(`Size: ${config.customWidth}" × ${config.customHeight}" (${squareFeet.toFixed(2)} sq ft)`);
    }

    const productionType = document.getElementById('stickerProductionType')?.value;
    if (productionType) {
      displayConfig.push(`Production: ${productionType === 'standard' ? 'In-House' : 'Premium Supplier'}`);
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
}
