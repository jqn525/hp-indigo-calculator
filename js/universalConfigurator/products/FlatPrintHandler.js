import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';
import { ResponseMapper } from '../utils/ResponseMapper.js';

export class FlatPrintHandler extends ProductHandler {
  constructor() {
    super('flat-prints');
  }

  createOptionsHTML() {
    return `
      <div class="alert alert-info mb-3">
        <strong>Flat Prints:</strong> Perfect for postcards, flyers, bookmarks, and name tags.
        Supports standard presets or custom dimensions.
      </div>

      <div class="form-group">
        <label class="form-label">Optional Add-Ons</label>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="holePunch" name="holePunch" value="true">
          <label class="form-check-label" for="holePunch">
            Hole Punch (+$0.05/piece)
          </label>
        </div>
        <div class="form-check mt-2">
          <input class="form-check-input" type="checkbox" id="lanyard" name="lanyard" value="true">
          <label class="form-check-label" for="lanyard">
            Include Lanyard (+$1.25/piece)
          </label>
        </div>
        <small class="form-text text-muted mt-2 d-block">Add-ons not available with adhesive stock</small>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    EventBindingHelper.bindChange('holePunch', onConfigChange);
    EventBindingHelper.bindChange('lanyard', onConfigChange);
  }

  getFormDataOptions() {
    const holePunch = document.getElementById('holePunch')?.checked || false;
    const lanyard = document.getElementById('lanyard')?.checked || false;

    return [
      ['holePunch', holePunch ? 'true' : 'false'],
      ['lanyard', lanyard ? 'true' : 'false']
    ];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const flatPrintFormData = new FormData();

    if (width && height) {
      flatPrintFormData.append('customWidth', width);
      flatPrintFormData.append('customHeight', height);
    } else {
      flatPrintFormData.append('size', '5x7');
    }

    flatPrintFormData.append('quantity', quantity);
    flatPrintFormData.append('paperType', formData.get('specialtyStock') || formData.get('textPaper') || formData.get('coverPaper'));
    flatPrintFormData.append('printingSides', formData.get('printingSides') || 'double-sided');
    flatPrintFormData.append('holePunch', formData.get('holePunch'));
    flatPrintFormData.append('lanyard', formData.get('lanyard'));
    flatPrintFormData.append('rushType', rushType);

    if (typeof calculateFlatPrintPrice === 'function') {
      const result = await calculateFlatPrintPrice(flatPrintFormData);
      return ResponseMapper.mapStandardResponse(result);
    }

    return { error: 'Flat print calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const holePunch = document.getElementById('holePunch')?.checked;
    const lanyard = document.getElementById('lanyard')?.checked;

    if (holePunch) displayConfig.push('Add-on: Hole Punch');
    if (lanyard) displayConfig.push('Add-on: Lanyard');

    return displayConfig;
  }
}
