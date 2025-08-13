# Poster Pricing Calculator

## Product Overview

**Product**: Large Format Posters  
**Description**: Large format posters using square-footage pricing  
**Turnaround**: 3-5 business days standard  

## Formula Components

**Square Footage Formula**: `C(Q) = (S + squareFootage × materialRate × Q) × r`

- **Setup Fee (S)**: $30.00
- **Pricing Method**: Per square foot
- **No Volume Efficiency**: Linear pricing per square foot
- **No Finishing**: Large format products have no finishing options

## Constraints and Options

### Quantity Limits
```json
{
  "minQuantity": 1,
  "maxQuantity": 20,
  "stepQuantity": 1,
  "note": "Limited quantities for large format work"
}
```

### Preset Sizes
```json
{
  "18x24": {
    "dimensions": "18 × 24 inches",
    "squareFootage": 3.0,
    "description": "Small poster size"
  },
  "22x28": {
    "dimensions": "22 × 28 inches", 
    "squareFootage": 4.3,
    "description": "Medium poster size"
  },
  "24x36": {
    "dimensions": "24 × 36 inches",
    "squareFootage": 6.0,
    "description": "Large poster size (recommended)"
  },
  "36x48": {
    "dimensions": "36 × 48 inches",
    "squareFootage": 12.0,
    "description": "Extra large poster size"
  }
}
```

### Custom Size Rules
```json
{
  "minDimension": 6,
  "maxHeight": 120,
  "maxWidth": {
    "paper": 52,
    "fabric": 48
  },
  "maxArea": 50,
  "calculation": "squareFootage = (width × height) ÷ 144"
}
```

### Material Options
```json
{
  "RMPS002": {
    "displayName": "Paper - 9mil Matte",
    "chargeRate": 6.0,
    "maxWidth": 54,
    "description": "Standard poster paper",
    "recommended": true
  },
  "QMPFL501503": {
    "displayName": "Fabric - 8mil Matte Coated",
    "chargeRate": 9.0,
    "maxWidth": 50,
    "description": "Premium fabric material"
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

### Step 1: Determine Square Footage
**For Preset Sizes:**
```
squareFootage = presetSizes[size].squareFootage
```

**For Custom Sizes:**
```
squareFootage = (customWidth × customHeight) ÷ 144
```

### Step 2: Validate Dimensions (Custom Only)
```
if (customWidth < 6 || customHeight < 6) error
if (customWidth > materialMaxWidth) error  
if (customHeight > 120) error
if (squareFootage > 50) error
```

### Step 3: Calculate Costs
```
setupFee = 30.00
materialCostPerPoster = squareFootage × materialChargeRate
totalMaterialCost = materialCostPerPoster × quantity
subtotal = setupFee + totalMaterialCost
totalCost = subtotal × rushMultiplier
```

### Step 4: Calculate Additional Info
```
unitPrice = totalCost ÷ quantity
```

## Example Calculations

### Example 1: Preset Size
**Query**: "What is the cost for 5 posters, 24x36, on paper material?"

```
// Input Parameters
quantity = 5
size = "24x36"
material = "RMPS002"
rush = "standard"

// Calculation
squareFootage = 6.0
materialRate = 6.0
setupFee = 30.00
materialCostPerPoster = 6.0 × 6.0 = 36.00
totalMaterialCost = 36.00 × 5 = 180.00
subtotal = 30.00 + 180.00 = 210.00
totalCost = 210.00 × 1.0 = 210.00
unitPrice = 210.00 ÷ 5 = 42.00

// Result
Total Cost: $210.00
Unit Price: $42.00
Square Footage: 6.0 sq ft per poster
```

### Example 2: Custom Size
**Query**: "What is the cost for 2 custom posters, 30x40 inches, on fabric material?"

```
// Input Parameters  
quantity = 2
customWidth = 30
customHeight = 40
material = "QMPFL501503"
rush = "standard"

// Validation
width = 30 (< 48 fabric limit ✓)
height = 40 (< 120 limit ✓) 
area = (30 × 40) ÷ 144 = 8.33 (< 50 limit ✓)

// Calculation
squareFootage = 8.33
materialRate = 9.0
setupFee = 30.00
materialCostPerPoster = 8.33 × 9.0 = 74.97
totalMaterialCost = 74.97 × 2 = 149.94
subtotal = 30.00 + 149.94 = 179.94
totalCost = 179.94 × 1.0 = 179.94
unitPrice = 179.94 ÷ 2 = 89.97

// Result
Total Cost: $179.94
Unit Price: $89.97
Square Footage: 8.33 sq ft per poster
```

## Validation Rules

1. **Quantity**: Must be 1-20
2. **Size**: Must be preset size or valid custom dimensions
3. **Custom Dimensions**: 
   - Minimum 6" on both dimensions
   - Maximum width depends on material (48" fabric, 52" paper)
   - Maximum height 120"
   - Maximum area 50 square feet
4. **Material**: Must be RMPS002 (paper) or QMPFL501503 (fabric)
5. **Rush**: Must be valid rush type

## Common Configurations

### Small Format Option
- Size: 18x24"
- Material: Paper (6.0/sq ft)
- Lowest cost option

### Standard Option (Recommended)
- Size: 24x36"  
- Material: Paper (6.0/sq ft)
- Good size and value balance

### Premium Option
- Size: 36x48"
- Material: Fabric (9.0/sq ft)
- Large size with premium material

### Custom Option
- Size: Custom dimensions
- Material: Based on requirements
- Flexible sizing within constraints

## Material Selection Guide

**Paper Material (RMPS002)**
- Charge Rate: $6.00/sq ft
- Max Width: 54" (52" practical limit)
- Best for: Standard posters, indoor use
- Cost Effective: Lower per-square-foot rate

**Fabric Material (QMPFL501503)**  
- Charge Rate: $9.00/sq ft
- Max Width: 50" (48" practical limit)
- Best for: Premium displays, fabric texture
- Premium Option: Higher per-square-foot rate

## LLM Usage Notes

- Use square footage pricing, not traditional imposition
- No efficiency exponent - linear pricing per square foot
- Setup fee always $30, no finishing costs
- Custom size validation is critical
- Material width limits affect custom size validation
- No volume discounts - each poster costs the same per square foot