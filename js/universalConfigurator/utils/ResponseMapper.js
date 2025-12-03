export class ResponseMapper {
  static mapStandardResponse(result) {
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
      finishingCost: result.finishingCost,
      subtotal: result.subtotal,
      rushMultiplier: result.rushMultiplier,
      sheetsRequired: result.sheetsRequired
    };
  }

  static mapNotebookResponse(result) {
    const base = this.mapStandardResponse(result);
    if (base.error) return base;

    return {
      ...base,
      laborCost: result.laborCost,
      bindingCost: result.bindingCost
    };
  }

  static mapNotepadResponse(result) {
    const base = this.mapStandardResponse(result);
    if (base.error) return base;

    return {
      ...base,
      laborCost: result.laborCost
    };
  }
}
