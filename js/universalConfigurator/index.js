import { UniversalConfiguratorCore } from './UniversalConfiguratorCore.js';

export function initializeUniversalConfigurator() {
  if (typeof ImpositionCalculator === 'undefined') {
    console.error('ImpositionCalculator not loaded');
    return null;
  }

  if (typeof paperStocks === 'undefined') {
    console.error('paperStocks not loaded');
    return null;
  }

  const impositionCalc = new ImpositionCalculator();
  return new UniversalConfiguratorCore(impositionCalc);
}

if (typeof window !== 'undefined') {
  window.initializeUniversalConfigurator = initializeUniversalConfigurator;
}
