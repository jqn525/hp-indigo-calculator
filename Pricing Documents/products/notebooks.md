# Notebook Pricing Calculator

## Product Overview

**Product**: Coil/Wire-O/Perfect Bound Notebooks  
**Description**: Professional spiral and bound notebooks with dual paper selection  
**Turnaround**: 3-5 business days standard  

## Formula Components

**Complex Formula**: `C(Q) = S + F_setup + Q^e × k + Q × (M + L + B)`

- **Setup Fee (S)**: $0-30 (based on content type)
- **Finishing Setup (F_setup)**: $15.00 (always applied)
- **Efficiency Exponent (e)**: 0.80 (limited volume discounts due to binding complexity)
- **Base Production Rate (k)**: $1.50
- **Material Cost (M)**: Cover + text + clicks with 25% markup
- **Labor Cost (L)**: Binding labor per notebook
- **Binding Hardware (B)**: Hardware cost per notebook

### ⚠️ CALCULATION WARNING
**CRITICAL**: Use lookup table from `05-COMMON-CALCULATIONS.json` to avoid exponent errors!

**Common LLM Errors:**
- ❌ `25^0.80 = 25 × 0.80 = 20` (treating exponent as multiplication)
- ✅ `25^0.80 = 12.65` (from lookup table or POWER function)

**Lookup Table Reference (efficiency 0.80):**
- 10 units → production cost: $10.22
- 25 units → production cost: $18.98  
- 50 units → production cost: $33.95
- 100 units → production cost: $59.72

See `FORMULA-CALCULATION-GUIDE.md` for detailed instructions.

## Constraints and Options

### Quantity Limits
```json
{
  "minQuantity": 10,
  "maxQuantity": 500,
  "stepQuantity": 1,
  "note": "Lower quantities due to specialty product"
}
```

### Available Sizes and Impositions
```json
{
  "5.5x8.5": {
    "piecesPerSheet": 4,
    "layout": "2x2",
    "description": "Compact notebook size"
  },
  "8.5x11": {
    "piecesPerSheet": 2,
    "layout": "2x1",
    "description": "Standard notebook size (recommended)"
  }
}
```

### Page Options (Fixed)
```json
{
  "50": {
    "description": "50 pages (25 sheets)",
    "totalSheets": 25
  },
  "100": {
    "description": "100 pages (50 sheets)", 
    "totalSheets": 50,
    "recommended": true
  }
}
```

### Binding Types
```json
{
  "plasticCoil": {
    "hardwareCost": 0.31,
    "laborCost": 2.50,
    "totalPerNotebook": 2.81,
    "description": "Plastic coil binding (most popular)",
    "recommended": true
  },
  "wireO": {
    "hardwareCost": 0.35,
    "laborCost": 3.00,
    "totalPerNotebook": 3.35,
    "description": "Wire-O binding (premium option)"
  },
  "perfectBinding": {
    "hardwareCost": 0.00,
    "laborCost": 3.00,
    "totalPerNotebook": 3.00,
    "description": "Perfect binding (glued spine)"
  }
}
```

### Content Types (Affects Setup Fee)
```json
{
  "blank": {
    "setupFee": 0.00,
    "description": "Blank pages (no setup discount)",
    "clicks": 0
  },
  "lined": {
    "setupFee": 15.00,
    "description": "Standard lined template",
    "clicks": "calculated"
  },
  "custom": {
    "setupFee": 30.00,
    "description": "Custom design/layout",
    "clicks": "calculated"
  }
}
```

### Paper Options

#### Cover Paper (Required)
```json
{
  "LYNOC95FSC": {
    "displayName": "100# Cover Uncoated",
    "costPerSheet": 0.28010,
    "recommended": true
  },
  "PACDISC9513FSC": {
    "displayName": "100# Cover Silk",
    "costPerSheet": 0.17756
  },
  "LYNODIC11413FSC": {
    "displayName": "120# Cover Uncoated",
    "costPerSheet": 0.38147
  }
}
```

#### Text Paper (Required)
```json
{
  "LYNO416FSC": {
    "displayName": "80# Text Uncoated",
    "costPerSheet": 0.11397,
    "recommended": true
  },
  "LYNO52FSC": {
    "displayName": "100# Text Uncoated",
    "costPerSheet": 0.1425
  },
  "PACDIS42FSC": {
    "displayName": "80# Text Silk",
    "costPerSheet": 0.07702
  }
}
```

## Complex Calculation Steps

### Step 1: Calculate Setup Costs
```
baseSetup = contentType === 'blank' ? 0 : (contentType === 'lined' ? 15 : 30)
finishingSetup = 15.00  // Always applied
totalSetup = baseSetup + finishingSetup
```

### Step 2: Calculate Sheets Per Notebook
```
imposition = size === '5.5x8.5' ? 4 : 2
coverSheetsPerNotebook = 1 / imposition
textSheetsPerNotebook = pages / (imposition × 2)  // Double-sided
```

### Step 3: Calculate Clicks (HP Impressions)
```
coverClicks = 1  // Always 1 click for cover
textClicks = Math.round(textSheetsPerNotebook × 2)  // Both sides, rounded
totalClicks = coverClicks + textClicks
```

### Step 4: Calculate Material Costs Per Notebook
```
coverCost = coverSheetsPerNotebook × coverPaper.costPerSheet  
textCost = textSheetsPerNotebook × textPaper.costPerSheet
clickCost = totalClicks × 0.10
materialsCostPerUnit = (coverCost + textCost + clickCost) × 1.25  // 25% markup
```

### Step 5: Calculate Binding Costs
```
bindingHardware = bindingType.hardwareCost
laborCost = bindingType.laborCost
```

### Step 6: Apply Main Formula
```
productionCost = Q^0.80 × 1.50
materialsCostTotal = Q × materialsCostPerUnit
laborCostTotal = Q × laborCost  
bindingCostTotal = Q × bindingHardware
subtotal = totalSetup + productionCost + materialsCostTotal + laborCostTotal + bindingCostTotal
totalCost = subtotal × rushMultiplier
```

## Example Calculation

**Query**: "What is the cost for 25 notebooks, 8.5x11, 100 pages, plastic coil binding, blank pages, 100# Cover Uncoated, 80# Text Uncoated?"

### Input Parameters
- Quantity: 25
- Size: 8.5x11"
- Pages: 100
- Binding: plasticCoil
- Cover Paper: LYNOC95FSC
- Text Paper: LYNO416FSC  
- Content: blank
- Rush: standard

### Detailed Calculation
```
// Step 1: Setup Costs
baseSetup = 0.00 (blank pages discount)
finishingSetup = 15.00
totalSetup = 15.00

// Step 2: Sheets Per Notebook  
imposition = 2 (8.5x11)
coverSheetsPerNotebook = 1 / 2 = 0.5
textSheetsPerNotebook = 100 / (2 × 2) = 25

// Step 3: Clicks
coverClicks = 1
textClicks = Math.round(25 × 2) = 50
totalClicks = 51

// Step 4: Material Costs Per Notebook
coverCost = 0.5 × $0.28010 = $0.14005
textCost = 25 × $0.11397 = $2.84925
clickCost = 51 × $0.10 = $5.10
materialsCostPerUnit = ($0.14005 + $2.84925 + $5.10) × 1.25 = $10.11163

// Step 5: Binding Costs
bindingHardware = $0.31
laborCost = $2.50

// Step 6: Final Calculation
productionCost = 25^0.80 × $1.50 = $23.78
materialsCostTotal = 25 × $10.11163 = $252.79
laborCostTotal = 25 × $2.50 = $62.50
bindingCostTotal = 25 × $0.31 = $7.75
subtotal = $15.00 + $23.78 + $252.79 + $62.50 + $7.75 = $361.82
totalCost = $361.82 × 1.0 = $361.82
unitPrice = $361.82 ÷ 25 = $14.47
```

### Result
- **Total Cost**: $361.82
- **Unit Price**: $14.47
- **Cover Paper**: 100# Cover Uncoated
- **Text Paper**: 80# Text Uncoated
- **Binding**: Plastic Coil

## Validation Rules

1. **Quantity**: Must be 10-500
2. **Size**: Must be 5.5x8.5" or 8.5x11"
3. **Pages**: Must be exactly 50 or 100
4. **Binding**: Must be plasticCoil, wireO, or perfectBinding
5. **Content**: Must be blank, lined, or custom
6. **Papers**: Must select both cover and text paper

## Common Configurations

### Economy Option
- Size: 5.5x8.5"
- Pages: 50
- Binding: plasticCoil
- Content: blank (no setup fee)
- Papers: Budget options

### Standard Option (Recommended)
- Size: 8.5x11"  
- Pages: 100
- Binding: plasticCoil
- Content: lined
- Cover: 100# Cover Uncoated
- Text: 80# Text Uncoated

### Premium Option
- Size: 8.5x11"
- Pages: 100  
- Binding: wireO
- Content: custom
- Cover: 120# Cover Uncoated
- Text: 100# Text Uncoated

## Setup Fee Logic

**Critical**: Setup fee varies by content type as a customer discount.

```javascript
if (contentType === 'blank') {
  baseSetup = 0.00;  // Discount for simple blank notebooks
} else if (contentType === 'lined') {
  baseSetup = 15.00; // Standard template
} else if (contentType === 'custom') {
  baseSetup = 30.00; // Custom design work
}
```

## LLM Usage Notes

- Use efficiency exponent 0.80 (highest, due to binding complexity)
- Always include finishing setup fee ($15)
- Setup fee depends on content type (blank = $0 discount)
- Calculate clicks based on actual sheets and sides printed
- Use 25% markup on material costs (not 50% like other products)
- Both cover and text paper selections are required
- Binding costs include both hardware and labor components