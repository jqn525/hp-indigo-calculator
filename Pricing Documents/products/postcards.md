# Postcard Pricing Calculator

## Product Overview

**Product**: Promotional Postcards  
**Description**: High-quality postcards for marketing and promotional use  
**Turnaround**: 3-5 business days standard  

## Formula Components

**Base Formula**: `C(Q) = S + Q^e × k + Q × v × r`

- **Setup Fee (S)**: $30.00
- **Finishing Setup (F_setup)**: $0.00 (no finishing available)
- **Efficiency Exponent (e)**: 0.70 (good volume discounts)
- **Base Production Rate (k)**: $1.50
- **Click Cost**: $0.10 per double-sided impression
- **Markup**: 1.5x (50% markup)

### ⚠️ CALCULATION WARNING
**CRITICAL**: Use lookup table from `05-COMMON-CALCULATIONS.json` to avoid exponent errors!

**Common LLM Errors:**
- ❌ `250^0.70 = 250 × 0.70 = 175` (treating exponent as multiplication)
- ✅ `250^0.70 = 43.31` (from lookup table or POWER function)

**Lookup Table Reference (efficiency 0.70):**
- 100 units → production cost: $37.68
- 250 units → production cost: $64.97  
- 500 units → production cost: $113.69

See `FORMULA-CALCULATION-GUIDE.md` for detailed instructions.

## Constraints and Options

### Quantity Limits
```json
{
  "minQuantity": 100,
  "maxQuantity": 5000,
  "stepQuantity": 1,
  "note": "Higher minimums due to setup costs"
}
```

### Available Sizes and Impositions
```json
{
  "4x6": {
    "piecesPerSheet": 8,
    "layout": "4x2",
    "description": "Standard postcard size"
  },
  "5x7": {
    "piecesPerSheet": 4,
    "layout": "2x2", 
    "description": "Large postcard (recommended)"
  },
  "5.5x8.5": {
    "piecesPerSheet": 4,
    "layout": "2x2",
    "description": "Half-letter size"
  },
  "6x9": {
    "piecesPerSheet": 2,
    "layout": "2x1",
    "description": "Large format postcard"
  }
}
```

### Paper Options (Cover Stock Only)
```json
{
  "LYNOC95FSC": {
    "displayName": "100# Cover Uncoated",
    "costPerSheet": 0.28010,
    "category": "standard_cover",
    "recommended": true
  },
  "PACDISC9513FSC": {
    "displayName": "100# Cover Silk", 
    "costPerSheet": 0.17756,
    "category": "standard_silk_cover"
  },
  "LYNODIC11413FSC": {
    "displayName": "120# Cover Uncoated",
    "costPerSheet": 0.38147,
    "category": "heavy_cover"
  },
  "PACDISC12413FSC": {
    "displayName": "130# Cover Silk",
    "costPerSheet": 0.23176,
    "category": "premium_silk_cover"
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

### Step 2: Apply Main Formula
```
productionCost = Q^0.70 × 1.50
materialCost = Q × v
subtotal = 30.00 + productionCost + materialCost
totalCost = subtotal × rushMultiplier
```

### Step 3: Calculate Additional Info
```
unitPrice = totalCost ÷ quantity
sheetsRequired = Math.ceil(quantity ÷ piecesPerSheet)
```

## Example Calculation

**Query**: "What is the cost for 250 copies of a 5x7" postcard on 100# Cover Uncoated?"

### Input Parameters
- Quantity: 250
- Size: 5x7"
- Paper: LYNOC95FSC (100# Cover Uncoated)
- Rush: standard

### Calculation
```
paperCost = $0.28010 per sheet
imposition = 4 pieces per sheet
v = ($0.28010 + $0.10) × 1.5 ÷ 4 = $0.142537

setupFee = $30.00
productionCost = 250^0.70 × $1.50 = $39.53
materialCost = 250 × $0.142537 = $35.63
subtotal = $30.00 + $39.53 + $35.63 = $105.16
totalCost = $105.16 × 1.0 = $105.16
unitPrice = $105.16 ÷ 250 = $0.421
sheetsRequired = Math.ceil(250 ÷ 4) = 63 sheets
```

### Result
- **Total Cost**: $105.16
- **Unit Price**: $0.421
- **Sheets Required**: 63
- **Paper Used**: 100# Cover Uncoated

## Validation Rules

1. **Quantity**: Must be 100-5000
2. **Size**: Must be from available sizes list
3. **Paper**: Must be cover stock only
4. **Rush**: Must be valid rush type
5. **No Finishing**: Postcards have no finishing options

## Common Configurations

### Economy Option
- Size: 4x6"
- Paper: 100# Cover Silk (PACDISC9513FSC)
- Lower cost due to high imposition (8-up)

### Standard Option (Recommended)
- Size: 5x7" 
- Paper: 100# Cover Uncoated (LYNOC95FSC)
- Best balance of size and cost

### Premium Option
- Size: 6x9"
- Paper: 120# Cover Uncoated (LYNODIC11413FSC)
- Large size with premium paper weight

## LLM Usage Notes

- Always verify quantity is within 100-5000 range
- Use correct efficiency exponent (0.70) for postcards
- No finishing setup fee or finishing costs
- Paper must be cover stock only
- Use imposition value to calculate variable cost correctly