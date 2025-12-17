import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';

export class EnvelopeHandler extends ProductHandler {
  constructor() {
    super('envelopes');
    this.envelopesByCategory = {
      business: [
        { sku: 'SUPX10WSFSC-S', name: '#10 Business White (4-1/8" × 9-1/2")' },
        { sku: 'SUPX10ASFSCNL', name: '#10 Business Artline/Security (4-1/8" × 9-1/2")' },
        { sku: 'SUPX10WWSFSCDNL', name: '#10 Business Window White (4-1/8" × 9-1/2")' }
      ],
      invitation: [
        { sku: 'SUPX2IWSDSSFSCNL', name: '#2 Invitation White (4-1/8" × 6-1/8")' },
        { sku: 'SUPX4IWSDSSFSCNL', name: '#4 Invitation White (5" × 6-1/2")' },
        { sku: 'SUPXA6WSFSCNL', name: 'A6 White (4-3/4" × 6-1/2")' },
        { sku: 'SUPXT41WASFSCNL', name: 'T-4 Window Artline (5-3/4" × 9")' }
      ],
      booklet: [
        { sku: 'SUPX3BWSFSCNL', name: '#3 Booklet White (6-1/2" × 9-1/2")' },
        { sku: 'SUPX7BWSFSC-S', name: '#7 Booklet White (9" × 12")' },
        { sku: 'SUPX7BNKRSFSCNL', name: '#7 Booklet Kraft (9" × 12")' },
        { sku: 'SUPX8BWSFSCNL', name: '#8 Booklet White (10" × 13")' },
        { sku: 'SUPX8BNKRSFSCNL', name: '#8 Booklet Kraft (10" × 13")' }
      ],
      catalogue: [
        { sku: 'SUPX69WEFSCNL', name: '#3 Catalogue White (6-1/2" × 9-1/2")' },
        { sku: 'SUPX710WEFSCNL', name: '#5 Catalogue White (7-1/2" × 10-1/2")' },
        { sku: 'SUPX912WEFSC-S', name: '#7 Catalogue White (9" × 12")' },
        { sku: 'SUPX912NKEFSC-S', name: '#7 Catalogue Kraft (9" × 12")' },
        { sku: 'SUPX912WAEFSCNL', name: '#7 Catalogue Artline (9" × 12")' }
      ],
      premium: [
        { sku: 'CLACCNWA6FSC', name: 'A6 Classic Crest Natural White (4-3/4" × 6-1/2")' },
        { sku: 'CLACCNWA7FSC', name: 'A7 Classic Crest Natural White (5-1/4" × 7-1/4")' },
        { sku: 'CLACSRWA6FSC', name: 'A6 Classic Crest Solar White (4-3/4" × 6-1/2")' },
        { sku: 'CLACSRWA7FSC', name: 'A7 Classic Crest Solar White (5-1/4" × 7-1/4")' }
      ]
    };
  }

  shouldShowPaperSection() {
    return false;
  }

  shouldShowDimensions() {
    return false;
  }

  shouldShowPrintingSides() {
    return false;
  }

  createOptionsHTML() {
    return `
      <div class="mb-3">
        <label class="form-label">Envelope Category</label>
        <select class="form-select" id="envelopeCategory">
          <option value="business">Business (#10)</option>
          <option value="invitation">Invitation</option>
          <option value="booklet">Booklet (Side Opening)</option>
          <option value="catalogue">Catalogue (End Opening)</option>
          <option value="premium">Premium (Classic Crest 80#)</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Envelope Stock</label>
        <select class="form-select" id="envelopeStock">
          ${this.getEnvelopeOptions('business')}
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Print Type</label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="envelopePrintType" id="printTypeColor" value="color" checked>
          <label class="btn btn-outline-primary" for="printTypeColor">Color ($0.32/imp)</label>
          <input type="radio" class="btn-check" name="envelopePrintType" id="printTypeBW" value="bw">
          <label class="btn btn-outline-primary" for="printTypeBW">B&W ($0.13/imp)</label>
        </div>
      </div>

      <div id="envelopeStockInfo" class="mb-3">
        ${this.getStockInfoHTML('SUPX10WSFSC-S')}
      </div>

      <div class="alert alert-info">
        <strong>Volume Discounts:</strong> Printing rates decrease at 250, 500, 750, and 1,000 units.
        <br><small>Max in-house quantity: 1,000. For larger orders, contact us for bulk pricing.</small>
      </div>
    `;
  }

  getEnvelopeOptions(category) {
    const envelopes = this.envelopesByCategory[category] || [];
    return envelopes.map(env =>
      `<option value="${env.sku}">${env.name}</option>`
    ).join('');
  }

  getStockInfoHTML(sku) {
    if (typeof paperStocks === 'undefined' || !paperStocks[sku]) {
      return '';
    }
    const stock = paperStocks[sku];
    return `
      <div class="card bg-light">
        <div class="card-body py-2">
          <small class="text-muted">
            <strong>Selected:</strong> ${stock.displayName}<br>
            <strong>Base cost:</strong> $${stock.costPerUnit.toFixed(4)}/envelope (+ 1.5× markup)
          </small>
        </div>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    this.onConfigChange = onConfigChange;

    EventBindingHelper.bindWithCleanup('envelopeCategory', 'change', this, 'handleCategoryChange');
    EventBindingHelper.bindWithCleanup('envelopeStock', 'change', this, 'handleStockChange');
    EventBindingHelper.bindRadioGroup('envelopePrintType', onConfigChange);
  }

  handleCategoryChange() {
    const category = document.getElementById('envelopeCategory')?.value || 'business';
    const stockSelect = document.getElementById('envelopeStock');

    if (stockSelect) {
      stockSelect.innerHTML = this.getEnvelopeOptions(category);
      this.updateStockInfo();
    }

    if (this.onConfigChange) {
      this.onConfigChange();
    }
  }

  handleStockChange() {
    this.updateStockInfo();
    if (this.onConfigChange) {
      this.onConfigChange();
    }
  }

  updateStockInfo() {
    const sku = document.getElementById('envelopeStock')?.value;
    const infoDiv = document.getElementById('envelopeStockInfo');
    if (infoDiv && sku) {
      infoDiv.innerHTML = this.getStockInfoHTML(sku);
    }
  }

  getFormDataOptions() {
    const category = document.getElementById('envelopeCategory')?.value || 'business';
    const stock = document.getElementById('envelopeStock')?.value || '';
    const printType = document.querySelector('input[name="envelopePrintType"]:checked')?.value || 'color';

    return [
      ['envelopeCategory', category],
      ['envelopeStock', stock],
      ['printType', printType]
    ];
  }

  async calculatePrice(formData) {
    if (typeof calculateEnvelopePrice === 'function') {
      return await calculateEnvelopePrice(formData);
    }
    return { error: 'Envelope calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = [];

    const stockSelect = document.getElementById('envelopeStock');
    if (stockSelect) {
      const selectedOption = stockSelect.options[stockSelect.selectedIndex];
      if (selectedOption) {
        displayConfig.push(`Envelope: ${selectedOption.text}`);
      }
    }

    const printType = document.querySelector('input[name="envelopePrintType"]:checked')?.value;
    if (printType) {
      displayConfig.push(`Print: ${printType === 'color' ? 'Color' : 'Black & White'}`);
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
