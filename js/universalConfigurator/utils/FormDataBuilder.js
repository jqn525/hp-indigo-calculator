export class FormDataBuilder {
  static buildBaseFormData(config) {
    const formData = new FormData();
    formData.append('productType', config.productType);
    formData.append('customWidth', config.customWidth);
    formData.append('customHeight', config.customHeight);
    formData.append('quantity', config.quantity);
    formData.append('rushType', config.rushType);
    formData.append('printingSides', config.printingSides || 'double-sided');

    if (config.textPaper) {
      formData.append('paperType', config.textPaper);
      formData.append('textPaper', config.textPaper);
    }
    if (config.coverPaper) {
      formData.append('coverPaper', config.coverPaper);
    }
    if (config.specialtyStock) {
      formData.append('specialtyStock', config.specialtyStock);
    }

    return formData;
  }

  static appendProductOptions(formData, options) {
    options.forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  }

  static getElementValue(elementId, defaultValue = '') {
    const element = document.getElementById(elementId);
    if (!element) return defaultValue;

    if (element.type === 'checkbox') {
      return element.checked;
    }
    return element.value || defaultValue;
  }

  static buildProductFormData(productType, baseFormData) {
    const specificOptions = [];

    switch (productType) {
      case 'flat-prints':
      case 'name-tags':
        specificOptions.push(
          ['holePunch', this.getElementValue('holePunch') ? 'true' : 'false'],
          ['lanyard', this.getElementValue('lanyard') ? 'true' : 'false']
        );
        break;

      case 'folded-prints':
      case 'brochures':
        specificOptions.push(['foldType', this.getElementValue('foldType', 'none')]);
        break;

      case 'booklets':
        specificOptions.push(
          ['pages', this.getElementValue('pages', '8')],
          ['coverType', this.getElementValue('coverType', 'separate')]
        );
        break;

      case 'notebooks':
        specificOptions.push(
          ['bindingType', this.getElementValue('bindingType', 'coil')],
          ['notebookPages', this.getElementValue('notebookPages', '50')]
        );
        break;

      case 'notepads':
        specificOptions.push(
          ['sheetsPerPad', this.getElementValue('sheetsPerPad', '50')],
          ['contentType', this.getElementValue('contentType', 'blank')]
        );
        break;

      case 'posters':
        specificOptions.push(['material', this.getElementValue('posterMaterial', 'RMPS002')]);
        break;

      case 'stickers':
        specificOptions.push(
          ['stickerProductionType', this.getElementValue('stickerProductionType', 'standard')],
          ['stickerFinish', this.getElementValue('stickerFinish', 'vinyl-matte')],
          ['premiumStickerFinish', this.getElementValue('premiumStickerFinish', 'vinyl-matte')]
        );
        break;

      case 'perfect-bound-books':
        specificOptions.push(['pages', this.getElementValue('pages', '40')]);
        break;
    }

    return this.appendProductOptions(baseFormData, specificOptions);
  }
}
