import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';
import { ResponseMapper } from '../utils/ResponseMapper.js';

export class FoldedPrintHandler extends ProductHandler {
  constructor() {
    super('folded-prints');
  }

  createOptionsHTML() {
    return `
      <div class="alert alert-info mb-3">
        <strong>Folded Prints:</strong> Includes brochures and table tents.
        Select folding type below.
      </div>

      <div class="form-group">
        <label class="form-label">Folding Type</label>
        <select class="form-select" id="foldType" name="foldType">
          <option value="none">No Folding (Flat)</option>
          <option value="bifold">Bi-Fold (2 panels) - +$0.10/piece</option>
          <option value="trifold">Tri-Fold (3 panels) - +$0.10/piece</option>
          <option value="table-tent">Table Tent - +$0.50/piece</option>
        </select>
        <small class="form-text text-muted">Table tents include scoring, folding, and assembly materials</small>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    EventBindingHelper.bindChange('foldType', onConfigChange);
  }

  getFormDataOptions() {
    const foldType = document.getElementById('foldType')?.value || 'none';
    return [['foldType', foldType]];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const foldedPrintFormData = new FormData();

    let size = '8.5x11';
    if (width && height) {
      if (width <= 6 && height <= 9) {
        size = '5.5x8.5';
      } else if (width <= 9 && height <= 12) {
        size = '8.5x11';
      } else if (width <= 9 && height <= 14.5) {
        size = '8.5x14';
      } else {
        size = '11x17';
      }
    }

    foldedPrintFormData.append('size', size);
    foldedPrintFormData.append('quantity', quantity);
    foldedPrintFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
    foldedPrintFormData.append('printingSides', formData.get('printingSides') || 'double-sided');
    foldedPrintFormData.append('foldType', formData.get('foldType') || 'none');
    foldedPrintFormData.append('rushType', rushType);

    if (typeof calculateFoldedPrintPrice === 'function') {
      const result = await calculateFoldedPrintPrice(foldedPrintFormData);
      return ResponseMapper.mapStandardResponse(result);
    }

    return { error: 'Folded print calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const foldType = document.getElementById('foldType')?.value;
    if (foldType && foldType !== 'none') {
      displayConfig.push(`Folding: ${foldType}`);
    }

    return displayConfig;
  }
}
