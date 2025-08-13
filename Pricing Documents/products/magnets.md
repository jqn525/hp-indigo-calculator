# Magnet Pricing Calculator

## Product Overview

**Product**: Custom Magnets (Promotional)  
**Description**: Outsourced promotional magnets using linear interpolation pricing  
**Turnaround**: Standard delivery from supplier  

## Pricing Method

**Linear Interpolation Formula**: 
```
supplierCost = C1 + (Q - Q1) × (C2 - C1) ÷ (Q2 - Q1)
customerPrice = supplierCost × (1 + markup)
```

This is NOT the standard digital press formula - magnets use supplier cost tables.

## Constraints and Options

### Quantity Limits
```json
{
  "minQuantity": 25,
  "maxQuantity": 1000,
  "stepQuantity": 5,
  "note": "Must be in increments of 5 pieces"
}
```

### Available Sizes
```json
{
  "2x2": "2×2 inch square",
  "3x3": "3×3 inch square", 
  "4x4": "4×4 inch square",
  "5x5": "5×5 inch square"
}
```

### Supplier Cost Tables

**Quantity Brackets**: [25, 50, 100, 250, 500, 1000]

#### 2×2 Inch Magnets
```json
{
  "25": 41.00,
  "50": 61.00,
  "100": 101.00,
  "250": 173.00,
  "500": 293.00,
  "1000": 533.00
}
```

#### 3×3 Inch Magnets
```json
{
  "25": 53.00,
  "50": 85.00,
  "100": 150.00,
  "250": 295.00,
  "500": 538.00,
  "1000": 1023.00
}
```

#### 4×4 Inch Magnets  
```json
{
  "25": 69.00,
  "50": 118.00,
  "100": 216.00,
  "250": 460.00,
  "500": 867.00,
  "1000": 1680.00
}
```

#### 5×5 Inch Magnets
```json
{
  "25": 90.00,
  "50": 159.00,
  "100": 298.00,
  "250": 666.00,
  "500": 1279.00,
  "1000": 2504.00
}
```

### Markup
```json
{
  "markupPercentage": 0.25,
  "description": "25% markup over supplier cost",
  "note": "Lower markup than digital press products"
}
```

### Rush Options
```json
{
  "standard": {"multiplier": 1.0, "description": "Standard delivery"},
  "rush": {"multiplier": 1.25, "description": "Rush delivery (+25%)"}
}
```

## Calculation Steps

### Step 1: Find Quantity Brackets
```javascript
// Find the two quantity brackets that surround the requested quantity
for (let i = 0; i < quantityBrackets.length - 1; i++) {
  if (quantity <= quantityBrackets[i + 1]) {
    Q1 = quantityBrackets[i];
    Q2 = quantityBrackets[i + 1];
    C1 = supplierCosts[size][i];
    C2 = supplierCosts[size][i + 1];
    break;
  }
}
```

### Step 2: Linear Interpolation
```javascript
supplierCost = C1 + (quantity - Q1) × (C2 - C1) / (Q2 - Q1)
```

### Step 3: Apply Markup and Rush
```javascript
costAfterMarkup = supplierCost × (1 + 0.25)
totalCost = costAfterMarkup × rushMultiplier
unitPrice = totalCost / quantity
```

## Example Calculations

### Example 1: Exact Bracket Match
**Query**: "What is the cost for 100 pieces of 3×3 inch magnets?"

```
// Input Parameters
quantity = 100
size = "3x3" 
rushType = "standard"

// Direct bracket match (no interpolation needed)
supplierCost = 150.00  // Direct from table
costAfterMarkup = 150.00 × 1.25 = 187.50
totalCost = 187.50 × 1.0 = 187.50
unitPrice = 187.50 ÷ 100 = 1.875

// Result
Total Cost: $187.50
Unit Price: $1.875
Supplier Cost: $150.00
```

### Example 2: Interpolation Required  
**Query**: "What is the cost for 75 pieces of 2×2 inch magnets?"

```
// Input Parameters
quantity = 75
size = "2x2"
rushType = "standard"

// Find brackets: 75 falls between 50 and 100
Q1 = 50, Q2 = 100
C1 = 61.00, C2 = 101.00

// Linear interpolation
supplierCost = 61.00 + (75 - 50) × (101.00 - 61.00) ÷ (100 - 50)
supplierCost = 61.00 + 25 × 40.00 ÷ 50  
supplierCost = 61.00 + 20.00 = 81.00

// Apply markup
costAfterMarkup = 81.00 × 1.25 = 101.25
totalCost = 101.25 × 1.0 = 101.25
unitPrice = 101.25 ÷ 75 = 1.35

// Result  
Total Cost: $101.25
Unit Price: $1.35
Supplier Cost: $81.00 (interpolated)
```

### Example 3: Rush Order
**Query**: "What is the cost for 350 pieces of 4×4 inch magnets with rush delivery?"

```
// Input Parameters
quantity = 350
size = "4x4"
rushType = "rush"

// Find brackets: 350 falls between 250 and 500
Q1 = 250, Q2 = 500
C1 = 460.00, C2 = 867.00

// Linear interpolation  
supplierCost = 460.00 + (350 - 250) × (867.00 - 460.00) ÷ (500 - 250)
supplierCost = 460.00 + 100 × 407.00 ÷ 250
supplierCost = 460.00 + 162.80 = 622.80

// Apply markup and rush
costAfterMarkup = 622.80 × 1.25 = 778.50
totalCost = 778.50 × 1.25 = 973.13
unitPrice = 973.13 ÷ 350 = 2.78

// Result
Total Cost: $973.13
Unit Price: $2.78
Supplier Cost: $622.80 (interpolated)
Rush Multiplier: 1.25x
```

## Validation Rules

1. **Quantity**: Must be 25-1000 in increments of 5
2. **Size**: Must be 2x2, 3x3, 4x4, or 5x5
3. **Rush**: Must be standard or rush
4. **Quantity Validation**: `quantity % 5 === 0`

## Size Comparison

| Size | Cost Range | Best For |
|------|------------|----------|
| 2×2" | Lowest | Budget option, simple designs |
| 3×3" | Low-Medium | Good balance of cost and visibility |  
| 4×4" | Medium-High | Professional appearance |
| 5×5" | Highest | Maximum impact, detailed designs |

## LLM Usage Notes

- **NOT a digital press product** - use linear interpolation, not efficiency formula
- Always validate quantity is in increments of 5
- Use 25% markup (lower than standard 50% for digital products)
- Linear interpolation required for quantities between bracket points
- Supplier cost tables are authoritative - no paper/imposition calculations
- Only two rush options (standard, rush) vs. four for digital products