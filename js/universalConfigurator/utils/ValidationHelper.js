export class ValidationHelper {
  static validateBasicConfig(config) {
    if (!config.productType) {
      return { valid: false, error: 'Product type is required' };
    }

    if (!config.customWidth || !config.customHeight) {
      return { valid: false, error: 'Dimensions are required' };
    }

    if (!config.quantity || config.quantity <= 0) {
      return { valid: false, error: 'Quantity must be greater than 0' };
    }

    return { valid: true };
  }

  static validateMaterialSelection(config) {
    if (config.productType === 'posters') {
      if (!config.posterMaterial) {
        return { valid: false, error: 'Material selection is required for posters' };
      }
    } else if (config.productType === 'stickers') {
      return { valid: true };
    } else {
      if (!config.specialtyStock && !config.textPaper && !config.coverPaper) {
        return { valid: false, error: 'Paper selection is required' };
      }
    }

    return { valid: true };
  }

  static validateConfiguration(config) {
    const basicValidation = this.validateBasicConfig(config);
    if (!basicValidation.valid) return basicValidation;

    const materialValidation = this.validateMaterialSelection(config);
    if (!materialValidation.valid) return materialValidation;

    return { valid: true };
  }

  static validateDimensions(width, height, maxWidth = 12.23, maxHeight = 18.01) {
    if (width <= 0 || height <= 0) {
      return { valid: false, error: 'Dimensions must be greater than 0' };
    }

    if (width > maxWidth || height > maxHeight) {
      return { valid: false, error: `Maximum dimensions: ${maxWidth}" × ${maxHeight}"` };
    }

    return { valid: true };
  }

  static validateEvenNumber(value, fieldName = 'Value') {
    const num = parseInt(value);
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a number` };
    }

    if (num % 2 !== 0) {
      return { valid: false, error: `${fieldName} must be an even number` };
    }

    return { valid: true };
  }

  static validateRange(value, min, max, fieldName = 'Value') {
    const num = parseInt(value);
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a number` };
    }

    if (num < min || num > max) {
      return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }

    return { valid: true };
  }
}
