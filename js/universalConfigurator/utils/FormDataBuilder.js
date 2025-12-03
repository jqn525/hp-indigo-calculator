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
}
