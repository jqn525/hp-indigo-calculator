# Formula Calculation Guide for LLMs

**Version**: 1.0  
**Last Updated**: August 13, 2025  
**Purpose**: Prevent calculation errors in pricing formulas, especially with exponents

## ⚠️ CRITICAL: Common LLM Calculation Errors

### Most Common Error: Treating Exponents as Multiplication
```
❌ WRONG: 100^0.75 = 100 × 0.75 = 75
✅ CORRECT: 100^0.75 = POWER(100, 0.75) = 31.62

❌ WRONG: 250^0.70 = 250 × 0.70 = 175  
✅ CORRECT: 250^0.70 = POWER(250, 0.70) = 43.31
```

### Second Most Common Error: Wrong Order of Operations
```
❌ WRONG: 100^(0.75 × 1.50) = 100^1.125 = 42.17
✅ CORRECT: (100^0.75) × 1.50 = 31.62 × 1.50 = 47.43
```

## Two Formula Representations

### Mathematical Formula (Traditional)
```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
```

### Algorithmic Formula (LLM-Safe)
```python
# STEP 1: Calculate power component separately
power_result = POWER(quantity, efficiency_exponent)
production_cost = power_result * 1.50

# STEP 2: Calculate each cost component
setup_cost = setup_fee + (finishing_setup_fee if needs_finishing else 0)
material_cost = quantity * variable_cost_per_piece  
finishing_cost = quantity * finishing_cost_per_piece

# STEP 3: Sum all components
subtotal = setup_cost + production_cost + material_cost + finishing_cost

# STEP 4: Apply rush multiplier
total_cost = subtotal * rush_multiplier
```

## Mandatory Calculation Steps

### Step 1: Use Lookup Table (Recommended)
**Always check `05-COMMON-CALCULATIONS.json` first**

```json
// For 100 units with efficiency 0.75
"100": {"power": 31.62, "production": 47.43}
// Use "production" value directly - it's already Q^e × 1.50
```

### Step 2: Manual Calculation (If Not in Table)
**Only if quantity not in lookup table**

```
1. Calculate power: quantity^efficiency_exponent
   Example: POWER(125, 0.75) = 36.84
   
2. Multiply by rate: power_result × 1.50
   Example: 36.84 × 1.50 = 55.26
```

### Step 3: Interpolation (For In-Between Values)
**When quantity falls between table entries**

```
Example: 125 units with efficiency 0.75
Table has: 100 (31.62) and 150 (42.05)

power_result = 31.62 + (125-100) × (42.05-31.62) ÷ (150-100)
power_result = 31.62 + 25 × 10.43 ÷ 50
power_result = 31.62 + 5.22 = 36.84
production = 36.84 × 1.50 = 55.26
```

## Complete Calculation Examples

### Example 1: Simple Postcard (Use Lookup)
**Query**: "Cost for 250 postcards, 5×7", standard paper"

```python
# Step 1: Use lookup table (efficiency 0.70)
quantity = 250
lookup_result = 64.97  # From table: production cost already calculated

# Step 2: Other components
setup_cost = 30.00
material_cost = 250 * 0.142537 = 35.63  # From variable cost calculation
finishing_cost = 0.00  # Postcards have no finishing

# Step 3: Sum components  
subtotal = 30.00 + 64.97 + 35.63 + 0.00 = 130.60

# Step 4: Apply rush (standard = 1.0)
total_cost = 130.60 * 1.0 = 130.60
```

### Example 2: Brochure with Finishing (Use Lookup)
**Query**: "Cost for 100 tri-fold brochures, 8.5×11", 80# text"

```python
# Step 1: Use lookup table (efficiency 0.75)
quantity = 100
lookup_result = 47.43  # From table: production cost

# Step 2: Other components
setup_cost = 30.00 + 15.00  # Printing + finishing setup
material_cost = 100 * 0.160478 = 16.05
finishing_cost = 100 * 0.10 = 10.00  # Folding cost

# Step 3: Sum components
subtotal = 45.00 + 47.43 + 16.05 + 10.00 = 118.48

# Step 4: Apply rush (standard = 1.0)
total_cost = 118.48 * 1.0 = 118.48
```

### Example 3: Manual Calculation (Not in Table)
**Query**: "Cost for 175 flyers" (not in lookup table)

```python
# Step 1: Manual power calculation (efficiency 0.65)
# Interpolate between 150 (25.24) and 200 (29.24)
power_150 = 25.24
power_200 = 29.24
power_175 = 25.24 + (175-150) * (29.24-25.24) / (200-150)
power_175 = 25.24 + 25 * 4.00 / 50 = 25.24 + 2.00 = 27.24
production_cost = 27.24 * 1.50 = 40.86

# Step 2: Continue with other components...
```

## Verification Methods

### Method 1: Sanity Check Against Table
```
Your calculation for 100 units should be close to table value
If wildly different, you made an error
```

### Method 2: Compare Adjacent Quantities
```
125 units should be between 100 and 150 values
75 units should be between 50 and 100 values
```

### Method 3: Check Order of Magnitude
```
Efficiency exponents < 1.0 mean DIMINISHING returns
More quantity = proportionally LESS cost per unit
If your answer shows LINEAR scaling, it's wrong
```

## Error Prevention Checklist

### Before Starting Calculation:
- [ ] Identify correct efficiency exponent for product
- [ ] Check if quantity exists in lookup table
- [ ] Note the product type (affects other parameters)

### During Calculation:
- [ ] Used POWER function, not multiplication
- [ ] Calculated Q^e first, then multiplied by 1.50
- [ ] Added all components before applying rush multiplier
- [ ] Used correct variable cost per piece

### After Calculation:
- [ ] Result makes sense compared to similar quantities
- [ ] Higher quantities have lower per-unit costs
- [ ] Total cost seems reasonable for the product type

## Quick Reference: Efficiency Exponents

| Product | Exponent | Volume Discount |
|---------|----------|----------------|
| Flyers, Name Tags, Bookmarks, Notepads | 0.65 | Excellent |
| Postcards | 0.70 | Good |
| Brochures, Booklets | 0.75 | Standard |
| Notebooks | 0.80 | Limited |

## Emergency Fallback

**If still getting errors, use this simplified approach:**

1. Find closest quantity in lookup table
2. Use that production cost value
3. Adjust proportionally if needed
4. Continue with rest of calculation

**Example**: For 275 units, use 250 value (64.97) and add small adjustment rather than risk calculation error.

## Test Your Understanding

**Calculate production cost for 50 brochures (efficiency 0.75):**

Wrong approaches:
- 50 × 0.75 × 1.50 = 56.25 ❌
- 50^(0.75×1.50) = 26.16 ❌

Correct approach:
- Look up table: 50 units, efficiency 0.75 = 28.20 ✅
- Or manually: 50^0.75 × 1.50 = 18.80 × 1.50 = 28.20 ✅