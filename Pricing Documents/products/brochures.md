# Brochure Pricing Calculator

## Product Overview

**Product**: Tri-fold and Bi-fold Brochures  
**Description**: Professional marketing brochures with folding options  
**Turnaround**: 3-5 business days standard  

## Formula Components

**Full Formula**: `C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r`

- **Setup Fee (S)**: $30.00
- **Finishing Setup (F_setup)**: $15.00 (when folding required)
- **Efficiency Exponent (e)**: 0.75 (standard volume discounts)
- **Base Production Rate (k)**: $1.50
- **Click Cost**: $0.10 per double-sided impression
- **Markup**: 1.5x (50% markup)
- **Finishing Cost (f)**: $0.10 per piece (when folding applied)

### ⚠️ CALCULATION WARNING
**CRITICAL**: Use lookup table from `05-COMMON-CALCULATIONS.json` to avoid exponent errors!

**Common LLM Errors:**
- ❌ `100^0.75 = 100 × 0.75 = 75` (treating exponent as multiplication)
- ✅ `100^0.75 = 31.62` (from lookup table or POWER function)

**Lookup Table Reference (efficiency 0.75):**
- 50 units → production cost: $28.20
- 100 units → production cost: $47.43  
- 250 units → production cost: $84.35

See `FORMULA-CALCULATION-GUIDE.md` for detailed instructions.

## Constraints and Options

### Quantity Limits
```json
{
  "minQuantity": 25,
  "maxQuantity": 2500,
  "stepQuantity": 1,
  "note": "Lower minimum due to business/marketing focus"
}
```

### Available Sizes and Impositions
```json
{
  "8.5x11": {
    "piecesPerSheet": 2,
    "layout": "2-up",
    "description": "Standard letter size (recommended)"
  },
  "8.5x14": {
    "piecesPerSheet": 1,
    "layout": "1-up",
    "description": "Legal size"
  },
  "11x17": {
    "piecesPerSheet": 1,
    "layout": "1-up",
    "description": "Tabloid size"
  }
}
```

### Folding Options
```json
{
  "none": {
    "costPerPiece": 0.00,
    "finishingSetup": 0.00,
    "description": "No folding (flat brochure)"
  },
  "bifold": {
    "costPerPiece": 0.10,
    "finishingSetup": 15.00,
    "description": "Single fold creating 4 panels"
  },
  "trifold": {
    "costPerPiece": 0.10,
    "finishingSetup": 15.00,
    "description": "Two folds creating 6 panels (recommended)"
  }
}
```

### Paper Options (Text and Cover Stock)
```json
{
  "textStock": {
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
    },
    "PACDIS52FSC": {
      "displayName": "100# Text Silk",
      "costPerSheet": 0.09536
    }
  },
  "coverStock": {
    "LYNOC95FSC": {
      "displayName": "100# Cover Uncoated",
      "costPerSheet": 0.28010
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
}
```

### Rush Options
```json
{
  "standard": {"multiplier": 1.0, "description": "3-5 business days"},
  "2-day": {"multiplier": 1.25, "description": "2-Day Rush (+25%)"},
  "next-day": {"multiplier": 1.5, "description": "Next-Day Rush (+50%)"},
  "same-day": {"multiplier": 2.0, "description": "Same-Day Rush (+100%)"}
}
```

## Calculation Steps

### Step 1: Calculate Variable Cost (v)
```
v = (paperCost + clicksCost) × markup ÷ imposition
v = (paperCostPerSheet + 0.10) × 1.5 ÷ piecesPerSheet
```

### Step 2: Determine Finishing Requirements
```
needsFinishing = (foldType !== 'none' && foldType exists)
finishingSetup = needsFinishing ? 15.00 : 0.00
finishingCostPerPiece = needsFinishing ? 0.10 : 0.00
```

### Step 3: Apply Main Formula
```
printingSetup = 30.00
finishingSetup = determined above
productionCost = Q^0.75 × 1.50
materialCost = Q × v
finishingCost = Q × finishingCostPerPiece
subtotal = printingSetup + finishingSetup + productionCost + materialCost + finishingCost
totalCost = subtotal × rushMultiplier
```

### Step 4: Calculate Additional Info
```
unitPrice = totalCost ÷ quantity
sheetsRequired = Math.ceil(quantity ÷ piecesPerSheet)
```

## Example Calculation

**Query**: "What is the cost for 100 tri-fold brochures on 80# Text Uncoated, 8.5x11 size?"

### Input Parameters
- Quantity: 100
- Size: 8.5x11"
- Paper: LYNO416FSC (80# Text Uncoated) 
- Fold Type: trifold
- Rush: standard

### Calculation
```
paperCost = $0.11397 per sheet
imposition = 2 pieces per sheet
v = ($0.11397 + $0.10) × 1.5 ÷ 2 = $0.160458

needsFinishing = true (trifold selected)
finishingSetup = $15.00
finishingCostPerPiece = $0.10

printingSetup = $30.00
finishingSetup = $15.00
productionCost = 100^0.75 × $1.50 = $47.43
materialCost = 100 × $0.160458 = $16.05
finishingCost = 100 × $0.10 = $10.00
subtotal = $30.00 + $15.00 + $47.43 + $16.05 + $10.00 = $118.48
totalCost = $118.48 × 1.0 = $118.48
unitPrice = $118.48 ÷ 100 = $1.185
sheetsRequired = Math.ceil(100 ÷ 2) = 50 sheets
```

### Result
- **Total Cost**: $118.48
- **Unit Price**: $1.185
- **Sheets Required**: 50
- **Paper Used**: 80# Text Uncoated
- **Finishing**: Tri-fold

## Validation Rules

1. **Quantity**: Must be 25-2500
2. **Size**: Must be from available sizes list (8.5x11, 8.5x14, 11x17)
3. **Paper**: Must be text stock or cover stock
4. **Folding**: Must be none, bifold, or trifold
5. **Rush**: Must be valid rush type

## Common Configurations

### Economy Option
- Size: 8.5x11"
- Paper: 80# Text Silk (PACDIS42FSC)
- Fold: trifold
- Best value with silk finish

### Standard Option (Recommended)  
- Size: 8.5x11"
- Paper: 80# Text Uncoated (LYNO416FSC)
- Fold: trifold
- Most popular configuration

### Premium Option
- Size: 11x17" 
- Paper: 100# Cover Uncoated (LYNOC95FSC)
- Fold: bifold
- Large format with premium paper

### No-Fold Option
- Size: 8.5x11"
- Paper: Any
- Fold: none
- Saves $15 setup + $0.10 per piece finishing

## Finishing Logic

**Important**: Finishing setup and per-piece costs only apply when folding is selected.

```javascript
if (foldType === 'bifold' || foldType === 'trifold') {
  finishingSetup = 15.00
  finishingCostPerPiece = 0.10
} else {
  finishingSetup = 0.00
  finishingCostPerPiece = 0.00
}
```

## LLM Usage Notes

- Always check if folding is required before adding finishing costs
- Use efficiency exponent 0.75 for brochures
- Finishing setup fee ($15) only when folding selected
- Both text and cover stock are allowed
- 8.5x11" is most economical due to 2-up imposition