import { ProductHandler } from './ProductHandler.js';
import { EventBindingHelper } from '../utils/EventBindingHelper.js';
import { ResponseMapper } from '../utils/ResponseMapper.js';

export class BookletHandler extends ProductHandler {
  constructor() {
    super('booklets');
  }

  requiresMultiplePapers() {
    return true;
  }

  createOptionsHTML() {
    return `
      <div class="form-group">
        <label class="form-label">Number of Pages</label>
        <select class="form-select" id="pages" name="pages">
          ${Array.from({ length: 11 }, (_, i) => {
      const pages = (i + 2) * 4;
      return `<option value="${pages}">${pages} pages</option>`;
    }).join('')}
        </select>
        <small class="form-text text-muted">Pages must be in multiples of 4</small>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Cover Type</label>
        <select class="form-select" id="coverType" name="coverType">
          <option value="separate">Separate Cover Stock</option>
          <option value="self">Self Cover (same paper throughout)</option>
        </select>
        <small class="form-text text-muted">Self cover uses text paper for entire booklet - most economical</small>
      </div>

      <div class="form-group mt-3">
        <label class="form-label">Paper Selection</label>
        <div class="alert alert-info">
          <small id="bookletPaperInfo">Select cover and text paper above. For self-cover, only text paper will be used.</small>
        </div>
      </div>
    `;
  }

  bindEventListeners(onConfigChange) {
    EventBindingHelper.bindChange('pages', onConfigChange);

    const coverTypeSelect = document.getElementById('coverType');
    if (coverTypeSelect) {
      coverTypeSelect.addEventListener('change', () => {
        this.handleCoverTypeChange();
        onConfigChange();
      });
    }

    this.handleCoverTypeChange();
  }

  handleCoverTypeChange() {
    const coverTypeSelect = document.getElementById('coverType');
    const paperInfoText = document.getElementById('bookletPaperInfo');
    const coverPaperSelect = document.getElementById('coverPaper');
    const textPaperSelect = document.getElementById('textPaper');

    if (!coverTypeSelect || !paperInfoText) return;

    const coverType = coverTypeSelect.value;

    if (coverType === 'self') {
      paperInfoText.textContent = 'Select text paper above. The same paper will be used throughout the entire booklet (most economical option).';

      if (coverPaperSelect) {
        const coverPaperGroup = coverPaperSelect.closest('.form-group');
        if (coverPaperGroup) {
          coverPaperGroup.style.opacity = '0.5';
          const label = coverPaperGroup.querySelector('label');
          if (label) {
            label.textContent = 'Cover Weight Paper (not used for self-cover)';
          }
        }
      }

      if (textPaperSelect) {
        const textPaperGroup = textPaperSelect.closest('.form-group');
        if (textPaperGroup) {
          textPaperGroup.style.opacity = '1';
          const label = textPaperGroup.querySelector('label');
          if (label) {
            label.textContent = 'Text Weight Paper (used for entire booklet)';
          }
        }
      }
    } else {
      paperInfoText.textContent = 'Select both cover and text paper above. Cover paper will be used for front/back covers, text paper for interior pages.';

      if (coverPaperSelect) {
        const coverPaperGroup = coverPaperSelect.closest('.form-group');
        if (coverPaperGroup) {
          coverPaperGroup.style.opacity = '1';
          const label = coverPaperGroup.querySelector('label');
          if (label) {
            label.textContent = 'Cover Weight Paper';
          }
        }
      }

      if (textPaperSelect) {
        const textPaperGroup = textPaperSelect.closest('.form-group');
        if (textPaperGroup) {
          textPaperGroup.style.opacity = '1';
          const label = textPaperGroup.querySelector('label');
          if (label) {
            label.textContent = 'Text Weight Paper';
          }
        }
      }
    }
  }

  getFormDataOptions() {
    const pages = document.getElementById('pages')?.value || '8';
    const coverType = document.getElementById('coverType')?.value || 'separate';

    return [
      ['pages', pages],
      ['coverType', coverType]
    ];
  }

  async calculatePrice(formData) {
    const width = parseFloat(formData.get('customWidth'));
    const height = parseFloat(formData.get('customHeight'));
    const quantity = parseInt(formData.get('quantity'));
    const rushType = formData.get('rushType') || 'standard';

    const bookletFormData = new FormData();

    let size = '8.5x11';
    if (width <= 6 && height <= 9) {
      size = '5.5x8.5';
    }

    bookletFormData.append('size', size);
    bookletFormData.append('quantity', quantity);
    bookletFormData.append('pages', formData.get('pages') || '8');
    bookletFormData.append('printingSides', formData.get('printingSides') || 'double-sided');

    const coverType = formData.get('coverType') || 'separate';
    if (coverType === 'self') {
      bookletFormData.append('coverPaperType', 'SELF_COVER');
      bookletFormData.append('textPaperType', formData.get('textPaper'));
    } else {
      bookletFormData.append('coverPaperType', formData.get('coverPaper'));
      bookletFormData.append('textPaperType', formData.get('textPaper'));
    }

    bookletFormData.append('rushType', rushType);

    if (typeof calculateBookletPrice === 'function') {
      const result = await calculateBookletPrice(bookletFormData);
      return ResponseMapper.mapStandardResponse(result);
    }

    return { error: 'Booklet calculator not available' };
  }

  getDisplayConfiguration(config) {
    const displayConfig = super.getDisplayConfiguration(config);

    const pages = document.getElementById('pages')?.value;
    if (pages) {
      displayConfig.push(`Pages: ${pages}`);
    }

    const coverType = document.getElementById('coverType')?.value;
    if (coverType) {
      displayConfig.push(`Cover: ${coverType === 'self' ? 'Self Cover' : 'Separate Cover'}`);
    }

    return displayConfig;
  }
}
