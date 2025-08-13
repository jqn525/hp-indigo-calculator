# Pricing Calculation Examples

**Version**: 1.0  
**Last Updated**: August 13, 2025  
**Purpose**: Step-by-step calculation walkthroughs for common pricing queries

## Example Queries and Solutions

### Example 1: Simple Postcard Query
**Query**: "What is the cost for 250 copies of a 5×7" postcard?"

#### Step 1: Identify Product and Parameters
- Product: Postcards
- Quantity: 250
- Size: 5×7" 
- Paper: Assume default (100# Cover Uncoated - LYNOC95FSC)
- Rush: Standard

#### Step 2: Load Product Data
```json
{
  "efficiencyExponent": 0.70,
  "setupFee": 30.00,
  "finishingSetup": 0.00,
  "baseProductionRate": 1.50,
  "clicksCost": 0.10,
  "markup": 1.5
}
```

#### Step 3: Load Paper and Imposition Data
```json
{
  "paperCost": 0.28010,
  "imposition": 4,
  "rushMultiplier": 1.0
}
```

#### Step 4: Calculate Variable Cost (v)
```
v = (paperCost + clicksCost) × markup ÷ imposition
v = (0.28010 + 0.10) × 1.5 ÷ 4
v = 0.38010 × 1.5 ÷ 4
v = 0.570150 ÷ 4
v = 0.142537
```

#### Step 5: Apply Main Formula
```
C(Q) = S + Q^e × k + Q × v × r

setupFee = 30.00
productionCost = 250^0.70 × 1.50 = 39.53
materialCost = 250 × 0.142537 = 35.63
subtotal = 30.00 + 39.53 + 35.63 = 105.16
totalCost = 105.16 × 1.0 = 105.16
unitPrice = 105.16 ÷ 250 = 0.421
sheetsRequired = Math.ceil(250 ÷ 4) = 63
```

#### Step 6: Result
- **Total Cost**: $105.16
- **Unit Price**: $0.421
- **Sheets Required**: 63

---

### Example 2: Brochure with Finishing
**Query**: "How much for 100 tri-fold brochures, 8.5×11, on 80# Text Uncoated?"

#### Step 1: Identify Product and Parameters
- Product: Brochures
- Quantity: 100
- Size: 8.5×11"
- Paper: LYNO416FSC (80# Text Uncoated)
- Fold: trifold
- Rush: Standard

#### Step 2: Load Product Data
```json
{
  "efficiencyExponent": 0.75,
  "setupFee": 30.00,
  "finishingSetup": 15.00,
  "baseProductionRate": 1.50,
  "clicksCost": 0.10,
  "markup": 1.5,
  "foldingCost": 0.10
}
```

#### Step 3: Load Paper and Imposition Data
```json
{
  "paperCost": 0.11397,
  "imposition": 2,
  "rushMultiplier": 1.0
}
```

#### Step 4: Check Finishing Requirements
```
foldType = "trifold"
needsFinishing = true
finishingSetupCost = 15.00
finishingCostPerPiece = 0.10
```

#### Step 5: Calculate Variable Cost (v)
```
v = (0.11397 + 0.10) × 1.5 ÷ 2
v = 0.21397 × 1.5 ÷ 2  
v = 0.320955 ÷ 2
v = 0.160478
```

#### Step 6: Apply Full Formula
```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r

setupFee = 30.00
finishingSetup = 15.00
productionCost = 100^0.75 × 1.50 = 47.43
materialCost = 100 × 0.160478 = 16.05
finishingCost = 100 × 0.10 = 10.00
subtotal = 30.00 + 15.00 + 47.43 + 16.05 + 10.00 = 118.48
totalCost = 118.48 × 1.0 = 118.48
unitPrice = 118.48 ÷ 100 = 1.185
sheetsRequired = Math.ceil(100 ÷ 2) = 50
```

#### Step 7: Result
- **Total Cost**: $118.48
- **Unit Price**: $1.185
- **Sheets Required**: 50
- **Finishing**: Tri-fold

---

### Example 3: Complex Notebook Query
**Query**: "Cost for 25 notebooks, 8.5×11, 100 pages, plastic coil binding, lined pages, 100# Cover Uncoated cover, 80# Text Uncoated interior?"

#### Step 1: Identify Product and Parameters
- Product: Notebooks
- Quantity: 25
- Size: 8.5×11"
- Pages: 100
- Binding: plasticCoil
- Content: lined
- Cover Paper: LYNOC95FSC
- Text Paper: LYNO416FSC
- Rush: Standard

#### Step 2: Load Product Data
```json
{
  "efficiencyExponent": 0.80,
  "baseProductionRate": 1.50,
  "clicksCost": 0.10,
  "materialMarkup": 1.25,
  "finishingSetup": 15.00
}
```

#### Step 3: Calculate Setup Costs
```
contentType = "lined"
baseSetup = 15.00  // Not blank, so no discount
finishingSetup = 15.00
totalSetup = 15.00 + 15.00 = 30.00
```

#### Step 4: Calculate Sheets Per Notebook
```
imposition = 2  // For 8.5×11
coverSheetsPerNotebook = 1 ÷ 2 = 0.5
textSheetsPerNotebook = 100 ÷ (2 × 2) = 25
```

#### Step 5: Calculate Clicks
```
coverClicks = 1
textClicks = Math.round(25 × 2) = 50
totalClicks = 1 + 50 = 51
```

#### Step 6: Calculate Material Costs Per Notebook
```
coverCost = 0.5 × 0.28010 = 0.14005
textCost = 25 × 0.11397 = 2.84925
clickCost = 51 × 0.10 = 5.10
materialsCostPerUnit = (0.14005 + 2.84925 + 5.10) × 1.25 = 10.11163
```

#### Step 7: Calculate Binding Costs
```
bindingHardware = 0.31  // Plastic coil hardware
laborCost = 2.50       // Plastic coil labor
```

#### Step 8: Apply Main Formula
```
productionCost = 25^0.80 × 1.50 = 23.78
materialsCostTotal = 25 × 10.11163 = 252.79
laborCostTotal = 25 × 2.50 = 62.50
bindingCostTotal = 25 × 0.31 = 7.75
subtotal = 30.00 + 23.78 + 252.79 + 62.50 + 7.75 = 376.82
totalCost = 376.82 × 1.0 = 376.82
unitPrice = 376.82 ÷ 25 = 15.07
```

#### Step 9: Result
- **Total Cost**: $376.82
- **Unit Price**: $15.07
- **Setup**: $30.00 (printing + finishing)
- **Binding**: Plastic coil

---

### Example 4: Large Format Poster
**Query**: "What's the cost for 3 posters, 24×36 inches, on paper material?"

#### Step 1: Identify Product and Parameters
- Product: Posters (large format)
- Quantity: 3
- Size: 24×36"
- Material: RMPS002 (Paper - 9mil Matte)
- Rush: Standard

#### Step 2: Load Product Data
```json
{
  "setupFee": 30.00,
  "pricingMethod": "square_footage"
}
```

#### Step 3: Calculate Square Footage
```
size = "24x36"
squareFootage = 6.0  // From preset sizes table
```

#### Step 4: Load Material Data
```json
{
  "materialRate": 6.0,
  "rushMultiplier": 1.0
}
```

#### Step 5: Apply Square Footage Formula
```
setupFee = 30.00
materialCostPerPoster = 6.0 × 6.0 = 36.00
totalMaterialCost = 36.00 × 3 = 108.00
subtotal = 30.00 + 108.00 = 138.00
totalCost = 138.00 × 1.0 = 138.00
unitPrice = 138.00 ÷ 3 = 46.00
```

#### Step 6: Result
- **Total Cost**: $138.00
- **Unit Price**: $46.00
- **Square Footage**: 6.0 sq ft per poster

---

### Example 5: Promotional Magnet with Interpolation
**Query**: "Cost for 75 pieces of 3×3 inch magnets?"

#### Step 1: Identify Product and Parameters
- Product: Magnets (promotional)
- Quantity: 75
- Size: 3×3"
- Rush: Standard

#### Step 2: Load Supplier Cost Data
```json
{
  "quantityBrackets": [25, 50, 100, 250, 500, 1000],
  "supplierCosts_3x3": [53.00, 85.00, 150.00, 295.00, 538.00, 1023.00],
  "markup": 0.25,
  "rushMultiplier": 1.0
}
```

#### Step 3: Find Interpolation Points
```
quantity = 75
75 falls between brackets 50 and 100
Q1 = 50, Q2 = 100
C1 = 85.00, C2 = 150.00
```

#### Step 4: Linear Interpolation
```
supplierCost = C1 + (Q - Q1) × (C2 - C1) ÷ (Q2 - Q1)
supplierCost = 85.00 + (75 - 50) × (150.00 - 85.00) ÷ (100 - 50)
supplierCost = 85.00 + 25 × 65.00 ÷ 50
supplierCost = 85.00 + 32.50 = 117.50
```

#### Step 5: Apply Markup and Rush
```
costAfterMarkup = 117.50 × (1 + 0.25) = 146.88
totalCost = 146.88 × 1.0 = 146.88
unitPrice = 146.88 ÷ 75 = 1.96
```

#### Step 6: Result
- **Total Cost**: $146.88
- **Unit Price**: $1.96
- **Supplier Cost**: $117.50 (interpolated)

---

## Common Calculation Patterns

### Pattern 1: Digital Press Products
```javascript
// Standard formula structure
setupFee = product.setupFee
finishingSetup = needsFinishing ? product.finishingSetup : 0
productionCost = Math.pow(quantity, product.efficiencyExponent) * 1.50
materialCost = quantity * variableCostPerPiece
finishingCost = quantity * finishingCostPerPiece
subtotal = setupFee + finishingSetup + productionCost + materialCost + finishingCost
totalCost = subtotal * rushMultiplier
```

### Pattern 2: Variable Cost Calculation
```javascript
variableCostPerPiece = (paperCost + clicksCost) * markup / imposition
```

### Pattern 3: Large Format Products
```javascript
materialCost = squareFootage * materialRate * quantity
totalCost = (setupFee + materialCost) * rushMultiplier
```

### Pattern 4: Promotional Products
```javascript
supplierCost = interpolate(quantity, brackets, costs)
customerCost = supplierCost * (1 + markup) * rushMultiplier
```

## Validation Checklist

1. **Quantity**: Within min/max limits for product
2. **Size**: Available for product type
3. **Paper**: Compatible with product constraints
4. **Finishing**: Available and properly calculated
5. **Rush**: Valid multiplier applied
6. **Formula**: Correct efficiency exponent used
7. **Calculations**: All components included in subtotal

## LLM Usage Tips

1. Always identify the product type first
2. Load the correct efficiency exponent for the product
3. Check if finishing is required before adding finishing costs
4. Use the correct markup percentage (varies by product type)
5. Apply rush multiplier as the final step
6. Validate all inputs against product constraints
7. Round currency values to 2 decimal places for final result