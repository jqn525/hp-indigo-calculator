import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';

export class PosterHandler extends ProductHandler {
  constructor(pricingManager) {
    super('posters');
    this.pricingManager = pricingManager;
  }

  shouldShowPaperSection() {
    return false;
  }

  shouldShowPrintingSides() {
    return false;
  }

  createOptionsHTML() {
    let materialOptions = '<option value="">Select material...</option>';

    if (typeof paperStocks !== 'undefined') {
      Object.entries(paperStocks).forEach(([code, paper]) => {
        if (paper && paper.chargeRate &&
          (paper.type === 'large_format_paper' ||
            paper.type === 'large_format_fabric' ||
            paper.type === 'large_format_vinyl' ||
            paper.type === 'large_format_rigid')) {
          materialOptions += `<option value="${code}">${paper.displayName} - $${paper.chargeRate.toFixed(2)}/sqft</option>`;
        }
      });
    }

    return `
      <div class="form-group">
        <label class="form-label">Material Type</label>
        <select class="form-select" id="posterMaterial" name="posterMaterial">
          ${materialOptions}
        </select>
      </div>
      <div class="alert alert-info mt-3">
        <small><strong>Note:</strong> Select material first to set dimension constraints. Posters are priced per square foot.</small>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    setTimeout(() => {
      const posterMaterialSelect = document.getElementById('posterMaterial');
      if (posterMaterialSelect) {
        if (posterMaterialSelect.value) {
          this.handleMaterialChange(posterMaterialSelect.value);
        }

        posterMaterialSelect.addEventListener('change', (e) => {
          this.handleMaterialChange(e.target.value);
          onConfigChange();
        });
      }
    }, 100);
  }

  handleMaterialChange(materialCode) {
    if (!materialCode || !paperStocks[materialCode]) {
      return;
    }

    const material = paperStocks[materialCode];
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');
    const trimNote = document.querySelector('.trim-note');

    if (!widthInput || !heightInput || !trimNote) {
      return;
    }

    if (material.fixedWidth && material.fixedHeight) {
      widthInput.value = material.fixedWidth;
      heightInput.value = material.fixedHeight;
      widthInput.disabled = true;
      heightInput.disabled = true;
      widthInput.style.backgroundColor = '#f8f9fa';
      heightInput.style.backgroundColor = '#f8f9fa';
      trimNote.innerHTML = `<strong>Fixed size:</strong> ${material.fixedWidth}" × ${material.fixedHeight}" (substrate constraint)`;
    } else if (material.maxWidth) {
      widthInput.disabled = false;
      heightInput.disabled = false;
      widthInput.style.backgroundColor = '';
      heightInput.style.backgroundColor = '';
      widthInput.max = material.maxWidth;
      heightInput.max = 1000;

      if (parseFloat(widthInput.value) > material.maxWidth) {
        widthInput.value = material.maxWidth;
      }

      trimNote.innerHTML = `<strong>Maximum width:</strong> ${material.maxWidth}" • <strong>Height:</strong> Any length up to full roll`;
    }
  }

  getFormDataOptions() {
    const posterMaterial = document.getElementById('posterMaterial')?.value || 'RMPS002';
    return [['material', posterMaterial]];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    return this.pricingManager.calculatePosterPricing(width, height, quantity, rushType, formData);
  }

  getDisplayConfiguration(config) {
    const displayConfig = [];

    if (config.customWidth && config.customHeight) {
      const squareFeet = (config.customWidth * config.customHeight) / 144;
      displayConfig.push(`Size: ${config.customWidth}" × ${config.customHeight}" (${squareFeet.toFixed(2)} sq ft)`);
    }

    if (config.posterMaterial && typeof paperStocks !== 'undefined') {
      displayConfig.push(`Material: ${paperStocks[config.posterMaterial]?.displayName || config.posterMaterial}`);
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
