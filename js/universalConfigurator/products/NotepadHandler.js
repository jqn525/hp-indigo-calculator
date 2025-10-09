import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';

export class NotepadHandler extends ProductHandler {
  constructor() {
    super('notepads');
  }

  requiresMultiplePapers() {
    return true;
  }

  createOptionsHTML() {
    return `
      <div class="form-group">
        <label class="form-label">Size</label>
        <select class="form-select" id="size" name="size">
          <option value="4x6">4" × 6"</option>
          <option value="5x7">5" × 7"</option>
          <option value="5.5x8.5" selected>5.5" × 8.5"</option>
          <option value="8.5x11">8.5" × 11"</option>
        </select>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Number of Sheets</label>
        <input type="number" class="form-control" id="sheets" name="sheets" value="50" min="25" max="100" step="1">
        <small class="form-text text-muted">Number of tear-away sheets per notepad (25-100)</small>
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
          <small>Select text paper for notepad pages and cover paper for backing cardboard. Text paper will be used for sheets, cover paper for rigid backing.</small>
        </div>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    EventBindingHelper.bindChange('size', onConfigChange);
    EventBindingHelper.bindChange('sheets', onConfigChange);
    EventBindingHelper.bindChange('pageContent', onConfigChange);
  }

  getFormDataOptions() {
    const size = document.getElementById('size')?.value || '5.5x8.5';
    const sheets = document.getElementById('sheets')?.value || '50';
    const pageContent = document.getElementById('pageContent')?.value || 'blank';

    return [
      ['size', size],
      ['sheets', sheets],
      ['pageContent', pageContent]
    ];
  }

  async calculatePrice(formData) {
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const notepadFormData = new FormData();

    notepadFormData.append('size', formData.get('size') || '5.5x8.5');
    notepadFormData.append('quantity', quantity);
    notepadFormData.append('sheets', formData.get('sheets') || '50');
    notepadFormData.append('pageContent', formData.get('pageContent') || 'blank');
    notepadFormData.append('printingSides', formData.get('printingSides') || 'single-sided');
    notepadFormData.append('textPaper', formData.get('textPaper'));
    notepadFormData.append('backingPaper', formData.get('coverPaper'));
    notepadFormData.append('rushType', rushType);

    if (typeof calculateNotepadPrice === 'function') {
      const result = await calculateNotepadPrice(notepadFormData);
      if (result.error) {
        return { error: result.error };
      }

      return {
        totalCost: parseFloat(result.totalCost),
        unitPrice: parseFloat(result.unitPrice),
        printingSetupCost: result.printingSetupCost,
        finishingSetupCost: result.finishingSetupCost,
        productionCost: result.productionCost,
        materialCost: result.materialCost,
        laborCost: result.laborCost,
        subtotal: result.subtotal,
        rushMultiplier: result.rushMultiplier
      };
    }

    return { error: 'Notepad calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const size = document.getElementById('size')?.value;
    const sheets = document.getElementById('sheets')?.value;
    const pageContent = document.getElementById('pageContent')?.value;

    if (size) {
      displayConfig.push(`Size: ${size}`);
    }
    if (sheets) {
      displayConfig.push(`Sheets: ${sheets}`);
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
