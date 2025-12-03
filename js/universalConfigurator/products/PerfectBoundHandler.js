import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';
import { ResponseMapper } from '../utils/ResponseMapper.js';

export class PerfectBoundHandler extends ProductHandler {
  constructor() {
    super('perfect-bound-books');
  }

  requiresMultiplePapers() {
    return true;
  }

  createOptionsHTML() {
    return `
      <div class="form-group">
        <label class="form-label">Number of Pages</label>
        <input type="number" class="form-control" id="pages" name="pages" value="40" min="4" max="500" step="2">
        <small class="form-text text-muted">Pages must be in multiples of 2 (minimum 4 pages, maximum 500 pages)</small>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Paper Selection</label>
        <div class="alert alert-info">
          <small>Select cover and text paper above. Cover paper will be used for front/back covers, text paper for interior pages.</small>
        </div>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    EventBindingHelper.bindChange('pages', onConfigChange);
  }

  getFormDataOptions() {
    const pages = document.getElementById('pages')?.value || '40';

    return [
      ['pages', pages]
    ];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const perfectBoundFormData = new FormData();

    let size = '8.5x11';
    if (width <= 6 && height <= 9) {
      size = '5.5x8.5';
    }

    perfectBoundFormData.append('size', size);
    perfectBoundFormData.append('quantity', quantity);
    perfectBoundFormData.append('pages', formData.get('pages') || '40');
    perfectBoundFormData.append('printingSides', formData.get('printingSides') || 'double-sided');
    perfectBoundFormData.append('coverPaper', formData.get('coverPaper'));
    perfectBoundFormData.append('textPaper', formData.get('textPaper'));
    perfectBoundFormData.append('customWidth', width);
    perfectBoundFormData.append('customHeight', height);
    perfectBoundFormData.append('rushType', rushType);

    if (typeof calculatePerfectBoundPrice === 'function') {
      const result = await calculatePerfectBoundPrice(perfectBoundFormData);
      return ResponseMapper.mapStandardResponse(result);
    }

    return { error: 'Perfect bound calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const pages = document.getElementById('pages')?.value;
    if (pages) {
      displayConfig.push(`Pages: ${pages}`);
    }

    return displayConfig;
  }
}
