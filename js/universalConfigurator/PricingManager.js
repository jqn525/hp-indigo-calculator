import { FormDataBuilder } from './utils/FormDataBuilder.js';

export class PricingManager {
  constructor() {
    this.isCalculating = false;
  }

  async calculatePrice(config, productHandler) {
    if (this.isCalculating) return null;

    this.isCalculating = true;

    try {
      const formData = FormDataBuilder.buildBaseFormData(config);
      const productOptions = productHandler.getFormDataOptions();
      FormDataBuilder.appendProductOptions(formData, productOptions);

      const pricing = await productHandler.calculatePrice(formData);

      if (pricing.error) {
        return { error: pricing.error };
      }

      return pricing;
    } catch (error) {
      console.error('Pricing calculation error:', error);
      return { error: 'Unable to calculate pricing. Please check your configuration.' };
    } finally {
      this.isCalculating = false;
    }
  }

  getRushMultiplier(rushType) {
    if (typeof pricingConfig !== 'undefined' && pricingConfig.rushMultipliers[rushType]) {
      return pricingConfig.rushMultipliers[rushType].multiplier;
    }
    return 1.0;
  }

  getSetupFee(productType, formData) {
    if (productType === 'booklets') {
      const pages = parseInt(formData.get('pages')) || 8;
      return 15.00 + (pages * 2);
    }

    if (productType === 'notepads') {
      const contentType = formData.get('contentType') || 'blank';
      if (contentType === 'blank') return 0;
      if (contentType === 'lined') return 0;
      if (contentType === 'custom') return 15.00;
      return 0;
    }

    return 15.00;
  }

  getFinishingSetupFee(productType, formData) {
    if (productType === 'brochures' && formData.get('foldType') !== 'none') {
      return 15.00;
    }
    if (productType === 'notepads') {
      return 15.00;
    }
    if (productType === 'table-tents') {
      return 15.00;
    }
    return 0;
  }

  getProductionCost(quantity, productType) {
    const exponents = {
      'brochures': 0.75,
      'postcards': 0.70,
      'flyers': 0.65,
      'bookmarks': 0.65,
      'name-tags': 0.65,
      'booklets': 0.75,
      'notebooks': 0.80,
      'notepads': 0.65,
      'table-tents': 0.70
    };

    const exponent = exponents[productType] || 0.70;
    return Math.pow(quantity, exponent) * 1.50;
  }

  getFinishingCost(quantity, productType, formData) {
    if (productType === 'brochures') {
      const foldType = formData.get('foldType');
      if (foldType && foldType !== 'none' && typeof pricingConfig !== 'undefined') {
        const foldCost = pricingConfig.finishingCosts.folding[foldType] || 0.10;
        return quantity * foldCost;
      }
    }

    if (productType === 'table-tents') {
      return quantity * 0.50;
    }

    if (productType === 'name-tags') {
      let cost = 0;
      const holePunch = formData.get('holePunch');
      const lanyard = formData.get('lanyard');

      if (holePunch === 'true') cost += 0.05;
      if (lanyard === 'true') cost += 1.25;

      return quantity * cost;
    }

    return 0;
  }

  calculatePosterPricing(width, height, quantity, rushType, formData) {
    const squareFeet = (width * height) / 144;
    const materialCode = formData.get('material') || 'LARGE_FORMAT_PAPER';

    const material = paperStocks[materialCode];
    if (!material) {
      throw new Error(`Material ${materialCode} not found in paperStocks`);
    }

    const costPerSqFt = material.chargeRate || 6.00;
    const totalSquareFootage = squareFeet * quantity;

    let volumeDiscount = { discount: 0, multiplier: 1.00, description: 'Standard Rate' };
    const volumeTiers = pricingConfig.largeFormatVolumeDiscounts?.tiers || [];

    for (const tier of volumeTiers) {
      if (totalSquareFootage >= tier.minSqft && totalSquareFootage <= tier.maxSqft) {
        volumeDiscount = tier;
        break;
      }
    }

    const materialCost = squareFeet * costPerSqFt * volumeDiscount.multiplier * quantity;
    const subtotal = materialCost;
    const rushMultiplier = this.getRushMultiplier(rushType);
    const totalCost = subtotal * rushMultiplier;
    const unitPrice = totalCost / quantity;

    const originalMaterialCost = squareFeet * costPerSqFt * quantity;
    const volumeSavings = originalMaterialCost - materialCost;

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      unitPrice: Math.round(unitPrice * 100) / 100,
      printingSetupCost: 0,
      finishingSetupCost: 0,
      productionCost: 0,
      materialCost: materialCost,
      finishingCost: 0,
      subtotal: subtotal,
      rushMultiplier: rushMultiplier,
      sheetsRequired: quantity,
      squareFeet: Math.round(squareFeet * 100) / 100,
      totalSquareFootage: Math.round(totalSquareFootage * 100) / 100,
      volumeDiscount: volumeDiscount.discount,
      volumeDiscountDescription: volumeDiscount.description,
      volumeSavings: Math.round(volumeSavings * 100) / 100
    };
  }

  async calculateStickerPricing(width, height, quantity, rushType, formData) {
    const squareFeet = (width * height) / 144;
    const productionType = formData.get('stickerProductionType') || 'standard';

    if (productionType === 'standard') {
      const costPerSqFt = 12.00;
      const setupFee = 30.00;
      const baseMaterialCost = squareFeet * costPerSqFt * quantity;
      const totalSqFt = squareFeet * quantity;

      // Tiered volume discount structure for stickers (15 sq ft increments, max 25% off)
      let volumeDiscount = 1.0;
      if (totalSqFt >= 75) volumeDiscount = 0.75;        // 25% OFF (max discount)
      else if (totalSqFt >= 60) volumeDiscount = 0.80;   // 20% OFF
      else if (totalSqFt >= 45) volumeDiscount = 0.85;   // 15% OFF
      else if (totalSqFt >= 30) volumeDiscount = 0.90;   // 10% OFF
      else if (totalSqFt >= 15) volumeDiscount = 0.95;   // 5% OFF
      else volumeDiscount = 1.0;                          // Standard rate

      const materialCost = baseMaterialCost * volumeDiscount;
      const subtotal = setupFee + materialCost;
      const rushMultiplier = this.getRushMultiplier(rushType);
      const totalCost = subtotal * rushMultiplier;
      const unitPrice = totalCost / quantity;

      return {
        totalCost: Math.round(totalCost * 100) / 100,
        unitPrice: Math.round(unitPrice * 100) / 100,
        printingSetupCost: setupFee,
        finishingSetupCost: 0,
        productionCost: 0,
        materialCost: materialCost,
        finishingCost: 0,
        subtotal: subtotal,
        rushMultiplier: rushMultiplier,
        sheetsRequired: quantity,
        squareFeet: Math.round(squareFeet * 100) / 100,
        volumeDiscount: volumeDiscount
      };
    } else {
      if (typeof calculatePremiumStickerCustomPrice === 'function') {
        try {
          const result = await calculatePremiumStickerCustomPrice(width, height, quantity, 'vinyl-matte', rushType);

          if (result.error) {
            return { error: result.error };
          }

          return {
            totalCost: Math.round(result.totalCost * 100) / 100,
            unitPrice: Math.round(result.unitPrice * 100) / 100,
            printingSetupCost: 0,
            finishingSetupCost: 0,
            productionCost: 0,
            materialCost: result.supplierCost || 0,
            finishingCost: 0,
            subtotal: result.supplierCost || 0,
            rushMultiplier: result.rushMultiplier || 1,
            sheetsRequired: quantity,
            squareFeet: Math.round(squareFeet * 100) / 100,
            interpolationData: {
              area: width * height,
              supplierCost: result.supplierCost,
              markup: result.markup,
              priceAfterMarkup: result.priceAfterMarkup
            }
          };
        } catch (error) {
          console.error('Premium sticker calculation error:', error);
          return { error: 'Unable to calculate premium sticker pricing' };
        }
      } else {
        const fallbackCostPerSqFt = 15.00;
        const setupFee = 50.00;
        const materialCost = squareFeet * fallbackCostPerSqFt * quantity;
        const subtotal = setupFee + materialCost;
        const rushMultiplier = this.getRushMultiplier(rushType);
        const totalCost = subtotal * rushMultiplier;
        const unitPrice = totalCost / quantity;

        return {
          totalCost: Math.round(totalCost * 100) / 100,
          unitPrice: Math.round(unitPrice * 100) / 100,
          printingSetupCost: setupFee,
          finishingSetupCost: 0,
          productionCost: 0,
          materialCost: materialCost,
          finishingCost: 0,
          subtotal: subtotal,
          rushMultiplier: rushMultiplier,
          sheetsRequired: quantity,
          squareFeet: Math.round(squareFeet * 100) / 100
        };
      }
    }
  }
}
