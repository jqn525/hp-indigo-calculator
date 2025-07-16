const pricingData = {
  basePrices: {
    '8.5x11': 0.05,
    '8.5x14': 0.06,
    '11x17': 0.08
  },
  
  paperMultipliers: {
    '80gsm': 1.0,
    '100gsm': 1.1,
    '120gsm': 1.2,
    '150gsm': 1.3,
    '200gsm': 1.4,
    '250gsm': 1.5
  },
  
  colorMultipliers: {
    '4c4c': 2.0,
    '4c0': 1.5,
    '4c1': 1.7,
    '1c1': 1.0
  },
  
  coatingPrices: {
    'none': 0,
    'matte': 0.02,
    'gloss': 0.02,
    'uv': 0.03,
    'softtouch': 0.04
  },
  
  foldingPrices: {
    'bifold': 0.01,
    'trifold': 0.015
  },
  
  quantityDiscounts: [
    { min: 100, max: 499, discount: 0 },
    { min: 500, max: 999, discount: 0.05 },
    { min: 1000, max: 2499, discount: 0.10 },
    { min: 2500, max: 4999, discount: 0.15 },
    { min: 5000, max: 9999, discount: 0.20 },
    { min: 10000, max: Infinity, discount: 0.25 }
  ]
};

function getQuantityDiscount(quantity) {
  const tier = pricingData.quantityDiscounts.find(
    tier => quantity >= tier.min && quantity <= tier.max
  );
  return tier ? tier.discount : 0;
}

function calculateBrochurePrice(formData) {
  const quantity = parseInt(formData.get('quantity'));
  const size = formData.get('size');
  const paperType = formData.get('paperType');
  const foldType = formData.get('foldType');
  
  const basePrice = pricingData.basePrices[size] || 0.05;
  
  const paperMultiplier = pricingData.paperMultipliers[paperType] || 1.0;
  const foldingCostPerUnit = pricingData.foldingPrices[foldType] || 0;
  
  const baseCostPerUnit = basePrice * paperMultiplier;
  
  const subtotalPerUnit = baseCostPerUnit + foldingCostPerUnit;
  
  const quantityDiscount = getQuantityDiscount(quantity);
  const discountedPricePerUnit = subtotalPerUnit * (1 - quantityDiscount);
  
  const totalPrice = discountedPricePerUnit * quantity;
  
  return {
    basePrice: (basePrice * quantity).toFixed(2),
    paperCost: ((basePrice * paperMultiplier - basePrice) * quantity).toFixed(2),
    foldingCost: (foldingCostPerUnit * quantity).toFixed(2),
    unitPrice: discountedPricePerUnit.toFixed(3),
    totalPrice: totalPrice.toFixed(2),
    discount: quantityDiscount
  };
}

const form = document.getElementById('brochureForm');
const resultsDiv = document.getElementById('results');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const pricing = calculateBrochurePrice(formData);
    
    document.getElementById('basePrice').textContent = `$${pricing.basePrice}`;
    document.getElementById('paperCost').textContent = `$${pricing.paperCost}`;
    document.getElementById('foldingCost').textContent = `$${pricing.foldingCost}`;
    document.getElementById('unitPrice').textContent = `$${pricing.unitPrice}`;
    document.getElementById('totalPrice').textContent = `$${pricing.totalPrice}`;
    
    resultsDiv.style.display = 'block';
    
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  
  form.addEventListener('reset', () => {
    resultsDiv.style.display = 'none';
  });
}