import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';
import { ResponseMapper } from '../utils/ResponseMapper.js';

export class NotebookHandler extends ProductHandler {
  constructor() {
    super('notebooks');
  }

  requiresMultiplePapers() {
    return true;
  }

  createOptionsHTML() {
    return `
      <div class="form-group">
        <label class="form-label">Number of Pages</label>
        <input type="number" class="form-control" id="pages" name="pages" value="50" min="20" max="200" step="4">
        <small class="form-text text-muted">Pages must be in multiples of 4 (minimum 20, maximum 200)</small>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Binding Type</label>
        <select class="form-select" id="bindingType" name="bindingType">
          <option value="plasticCoil" selected>Plastic Coil Binding</option>
          <option value="wireO">Wire-O Binding</option>
          <option value="perfectBinding">Perfect Binding</option>
        </select>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Page Content</label>
        <select class="form-select" id="pageContent" name="pageContent">
          <option value="blank" selected>Blank Pages</option>
          <option value="lined">Lined Pages</option>
          <option value="graph">Graph Paper</option>
        </select>
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
    EventBindingHelper.bindChange('bindingType', onConfigChange);
    EventBindingHelper.bindChange('pageContent', onConfigChange);
  }

  getFormDataOptions() {
    const pages = document.getElementById('pages')?.value || '50';
    const bindingType = document.getElementById('bindingType')?.value || 'plasticCoil';
    const pageContent = document.getElementById('pageContent')?.value || 'blank';

    return [
      ['pages', pages],
      ['bindingType', bindingType],
      ['pageContent', pageContent]
    ];
  }

  async calculatePrice(formData) {
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const notebookFormData = new FormData();

    notebookFormData.append('customWidth', formData.get('customWidth') || '8.5');
    notebookFormData.append('customHeight', formData.get('customHeight') || '11');
    notebookFormData.append('quantity', quantity);
    notebookFormData.append('pages', formData.get('pages') || '50');
    notebookFormData.append('bindingType', formData.get('bindingType') || 'plasticCoil');
    notebookFormData.append('pageContent', formData.get('pageContent') || 'blank');
    notebookFormData.append('printingSides', formData.get('printingSides') || 'double-sided');
    notebookFormData.append('coverPaper', formData.get('coverPaper'));
    notebookFormData.append('textPaper', formData.get('textPaper'));
    notebookFormData.append('rushType', rushType);

    if (typeof calculateNotebookPrice === 'function') {
      const result = await calculateNotebookPrice(notebookFormData);
      return ResponseMapper.mapNotebookResponse(result);
    }

    return { error: 'Notebook calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const pages = document.getElementById('pages')?.value;
    const bindingType = document.getElementById('bindingType')?.value;
    const pageContent = document.getElementById('pageContent')?.value;

    if (pages) {
      displayConfig.push(`Pages: ${pages}`);
    }
    if (bindingType) {
      const bindingNames = {
        'plasticCoil': 'Plastic Coil',
        'wireO': 'Wire-O',
        'perfectBinding': 'Perfect Binding'
      };
      displayConfig.push(`Binding: ${bindingNames[bindingType] || bindingType}`);
    }
    if (pageContent) {
      const contentNames = {
        'blank': 'Blank',
        'lined': 'Lined',
        'graph': 'Graph'
      };
      displayConfig.push(`Content: ${contentNames[pageContent] || pageContent}`);
    }

    return displayConfig;
  }
}
