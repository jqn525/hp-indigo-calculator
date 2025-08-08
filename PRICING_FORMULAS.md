# SFU Document Solutions Pricing Calculator - Formula Guide

*Complete reference for all pricing formulas and calculations*

---

## Table of Contents

1. [Core Formula Structure](#core-formula-structure)
2. [HP Indigo Digital Press Products](#hp-indigo-digital-press-products)
3. [Promotional Products (Outsourced)](#promotional-products-outsourced)
4. [Configuration Parameters](#configuration-parameters)
5. [Paper Stock Specifications](#paper-stock-specifications)
6. [Formula Examples](#formula-examples)

---

## Core Formula Structure

The SFU Document Solutions pricing calculator uses two distinct pricing systems:

### **HP Indigo Digital Press Formula**
Used for products printed in-house on HP Indigo digital presses.

**Base Formula:**
```
C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r
```

**Where:**
- `C(Q)` = Total cost for quantity Q
- `S` = Setup fee (varies: $30 standard, $15 name tags)
- `F_setup` = Finishing setup fee ($15.00, if finishing required)
- `Q` = Quantity ordered
- `e` = Efficiency exponent (varies by product: 0.75 brochures, 0.70 postcards/flyers, 0.65 name tags/bookmarks)
- `k` = Base production rate ($1.50)
- `v` = Variable cost per piece (paper + clicks) × 1.5 / imposition
- `f` = Finishing cost per piece
- `r` = Rush multiplier (1.0 - 2.0x)

**Data Source:** All pricing parameters come from static files (`/js/pricingConfig.js`, `/js/paperStocks.js`) - no database dependencies.

### **Promotional Products Formula**
Used for outsourced promotional items with supplier-based pricing.

**Linear Interpolation Formula (Magnets/Stickers):**
```
C(Q) = [C1 + (Q - Q1) × (C2 - C1) / (Q2 - Q1)] × (1 + markup) × r
```

**Fixed Cost Formula (Apparel/Tote Bags):**
```
C(Q) = (base_cost × Q + setup_fee) × (1 - volume_discount) × r
```

---

## HP Indigo Digital Press Products

> **Note:** All pricing data is managed via static files for optimal performance. Edit `/js/pricingConfig.js` and `/js/paperStocks.js` to update pricing parameters.

### 1. **Brochures** 📄

**Product Details:**
- Quantity Range: 25 - 2,500 pieces
- Sizes: 8.5×11", 8.5×14", 11×17"
- Finishing: Tri-fold, Bi-fold, or None
- Efficiency Exponent: `e = 0.75`

**Formula:**
```
C(Q) = (30 + F_setup + Q^0.75 × 1.5 + Q × v + Q × f) × r
```

**Cost Components:**
- **Setup Fee (S):** $30.00 (printing setup)
- **Finishing Setup (F_setup):** $15.00 (if folding required)
- **Production Cost:** `Q^0.75 × $1.50`
- **Material Cost:** `Q × v` where `v = (paper_cost + $0.10) × 1.5 / imposition`
- **Finishing Cost:** `Q × f` where `f = $0.10` (folding cost per piece)

**Imposition Values:**
- 8.5×11": 2-up (2 pieces per sheet)
- 8.5×14": 1-up (1 piece per sheet)
- 11×17": 1-up (1 piece per sheet)

---

### 2. **Postcards** 📮

**Product Details:**
- Quantity Range: 100 - 5,000 pieces
- Sizes: 4×6", 5×7", 5.5×8.5", 6×9"
- Finishing: None (cutting only)
- Efficiency Exponent: `e = 0.70`

**Formula:**
```
C(Q) = (30 + Q^0.70 × 1.5 + Q × v) × r
```

**Cost Components:**
- **Setup Fee (S):** $30.00 (printing setup)
- **No Finishing Setup:** $0.00
- **Production Cost:** `Q^0.70 × $1.50`
- **Material Cost:** `Q × v` where `v = (paper_cost + $0.10) × 1.5 / imposition`
- **No Finishing Cost:** $0.00

**Imposition Values:**
- 4×6": 8-up (8 pieces per sheet)
- 5×7": 4-up (4 pieces per sheet)
- 5.5×8.5": 4-up (4 pieces per sheet)
- 6×9": 2-up (2 pieces per sheet)

---

### 3. **Flyers** 📋

**Product Details:**
- Quantity Range: 25 - 2,500 pieces
- Sizes: 5.5×8.5", 8.5×11", 8.5×14", 11×17"
- Finishing: None
- Efficiency Exponent: `e = 0.70`

**Formula:**
```
C(Q) = (30 + Q^0.70 × 1.5 + Q × v) × r
```

**Cost Components:**
- Same structure as postcards
- Uses text and cover stock subset for paper options

**Imposition Values:**
- 5.5×8.5": 4-up (4 pieces per sheet)
- 8.5×11": 2-up (2 pieces per sheet)
- 8.5×14": 1-up (1 piece per sheet)
- 11×17": 1-up (1 piece per sheet)

---

### 4. **Bookmarks** 🔖

**Product Details:**
- Quantity Range: 100 - 2,500 pieces
- Sizes: 2×6", 2×7", 2×8"
- Paper: Premium 130# Cover (Uncoated/Silk only)
- Efficiency Exponent: `e = 0.65` (excellent volume discounts)

**Formula:**
```
C(Q) = (30 + Q^0.65 × 1.5 + Q × v) × r
```

**Cost Components:**
- **Best Volume Pricing:** Lowest efficiency exponent (0.65)
- **Premium Paper Only:** 130# Cover Uncoated/Silk
- **High Imposition:** 10-up for all sizes (10 pieces per sheet)

**Imposition Values:**
- All sizes: 10-up (10 pieces per sheet)

---

### 5. **Name Tags** 🏷️

**Product Details:**
- Quantity Range: 50 - 5,000 pieces (optimized for small orders)
- Sizes: 2.33×3", 3×4", 4×6"
- Papers: 120# Cover Uncoated, Adhesive Stock
- Finishing: Hole punch (+$0.05/tag), Lanyard (+$1.25/tag)
- Efficiency Exponent: `e = 0.65` (excellent volume discounts)

**Formula:**
```
C(Q) = (15 + F_setup + Q^0.65 × 1.5 + Q × v + Q × f) × r
```

**Cost Components:**
- **Reduced Setup Fee (S):** $15.00 (optimized for smaller orders)
- **Finishing Setup (F_setup):** $0.00 (finishing charged per unit)
- **Production Cost:** `Q^0.65 × $1.50` (excellent volume discounts)
- **Material Cost:** `Q × v` where `v = (paper_cost + $0.10) × 1.5 / imposition`
- **Finishing Cost:** `Q × f` (hole punch $0.05, lanyard $1.25)

**Imposition Values:**
- 2.33×3": 20-up (20 pieces per sheet)
- 3×4": 12-up (12 pieces per sheet)
- 4×6": 4-up (4 pieces per sheet)

**Pricing Examples (3×4 size):**
- 50 qty: $40.35 ($0.81/unit)
- 100 qty: $58.43 ($0.58/unit)
- 150 qty: $74.07 ($0.49/unit)
- 200 qty: $88.36 ($0.44/unit)

---

### 6. **Booklets** 📖

**Product Details:**
- Quantity Range: 10 - 500 pieces
- Pages: 8 - 48 pages (multiples of 4)
- Papers: Dual selection (cover + text paper)
- Finishing: Saddle-stitched binding

**Complex Formula:**
```
C(Q) = (S_base + S_pages + Q^0.75 × 6 + Q × M + F_setup + Q × F_variable) × r
```

**Where:**
- `S_base = $30` (base setup)
- `S_pages = $2 × pages` (page setup fee)
- `M` = Materials cost per booklet
- `F_setup = $30` (finishing setup)
- `F_variable` = Variable finishing cost per booklet

**Materials Calculation:**
```
M = (cover_cost + text_cost + click_cost) × 1.25
```

**Where:**
- `cover_cost = 1 × cover_paper_cost` (1 sheet per booklet)
- `text_cost = ((pages - 4) / 4) × text_paper_cost` (text sheets)
- `click_cost = (pages / 2) × $0.10` (impressions × click cost)

**Finishing Calculation:**
```
F_variable = $0.10 + (text_sheets × $0.05)
```

**Where:**
- `$0.10` = Cover creasing cost
- `text_sheets × $0.05` = Binding cost per text sheet

---

## Promotional Products (Outsourced)

### 1. **Magnets** 🧲

**Product Details:**
- Quantity Range: 25 - 1,000 pieces (5-piece increments)
- Sizes: 2×2", 3×3", 4×4", 5×5"
- Material: Super-matte magnetic material

**Linear Interpolation Formula:**
```
C(Q) = supplier_cost(Q) × 1.25 × r
```

**Supplier Cost Brackets:**
| Quantity | 2×2" | 3×3" | 4×4" | 5×5" |
|----------|------|------|------|------|
| 25       | $41  | $53  | $69  | $90  |
| 50       | $61  | $85  | $118 | $159 |
| 100      | $101 | $150 | $216 | $298 |
| 250      | $173 | $295 | $460 | $666 |
| 500      | $293 | $538 | $867 | $1,279 |
| 1000     | $533 | $1,023 | $1,680 | $2,504 |

**Linear Interpolation:**
```
supplier_cost = C1 + (Q - Q1) × (C2 - C1) / (Q2 - Q1)
```

---

### 2. **Stickers** 🏷️

**Product Details:**
- Quantity Range: 25 - 1,000 pieces (5-piece increments)
- Sizes: 2×2", 3×3", 4×4", 5×5"
- Materials: Vinyl, Paper, Clear options

**Linear Interpolation Formula:**
Same structure as magnets with 25% markup.

**Supplier Cost Brackets:**
| Quantity | 2×2" | 3×3" | 4×4" | 5×5" |
|----------|------|------|------|------|
| 25       | $40  | $49  | $60  | $74  |
| 50       | $59  | $77  | $100 | $123 |
| 100      | $98  | $130 | $164 | $204 |
| 250      | $150 | $214 | $286 | $374 |
| 500      | $221 | $335 | $463 | $615 |
| 1000     | $344 | $545 | $776 | $1,051 |

---

### 3. **Apparel** 👕

**Product Details:**
- Quantity Range: 10 - 5,000 pieces
- Garment Types: T-shirts, Hoodies, Quarter-zips, Crewnecks
- Decoration: DTF (Direct-to-Film)
- Size Mix: Standard (XS-XL) and Extended (2XL-4XL)

**Formula:**
```
C(Q) = (setup_fee + garment_cost × Q + decoration_cost × Q) × (1 - volume_discount) × r
```

**Cost Components:**
- **Setup Fee:** $60.00 (DTF setup)
- **Garment Costs:** Vary by type and size range
- **Decoration Cost:** $10.00 per piece (DTF printing)
- **Volume Discounts:** 0% - 20% based on quantity

**Volume Discount Structure:**
| Quantity Range | Discount |
|----------------|----------|
| 10 - 23        | 0%       |
| 24 - 47        | 5%       |
| 48 - 99        | 10%      |
| 100 - 249      | 15%      |
| 250 - 5,000    | 20%      |

**Sample Garment Costs (Standard Sizes):**
- Gildan T-shirt (6400): $5.25
- Gildan Hoodie (SF500): $24.38
- ATC Quarter-zip (F2700): $29.99

**Extended Size Upcharge:**
- Extended sizes (2XL-4XL) cost approximately 80% more than standard

---

### 4. **Tote Bags** 🛍️

**Product Details:**
- Quantity Range: 10 - 5,000 pieces (5-piece increments)
- Sizes: 10×10", 12×12" print areas
- Decoration: DTF, Screen-print
- Material: Canvas tote bags

**Formula:**
```
C(Q) = (bag_cost × Q + decoration_cost × Q × size_multiplier + setup_fee) × r
```

**Cost Components:**
- **Bag Cost:** $5.00 per bag (includes markup)
- **Decoration Cost:** $10.00 base (DTF)
- **Setup Fee:** $60.00 (DTF)
- **Size Multipliers:**
  - 10×10": 1.0× (no multiplier)
  - 12×12": 1.25× (25% increase)

---

## Configuration Parameters

### Rush Order Multipliers

| Rush Type | Multiplier | Description |
|-----------|------------|-------------|
| Standard  | 1.0×       | 3-5 business days |
| 2-Day Rush| 1.25×      | +25% surcharge |
| Next-Day  | 1.50×      | +50% surcharge |
| Same-Day  | 2.0×       | +100% surcharge |

### Efficiency Exponents

The efficiency exponent (`e`) determines volume discount rates:

| Product | Exponent | Volume Discount Rate |
|---------|----------|---------------------|
| Name Tags | 0.65 | Excellent (best discounts) |
| Bookmarks | 0.65 | Excellent (best discounts) |
| Postcards | 0.70 | Very Good |
| Flyers | 0.70 | Very Good |
| Brochures | 0.75 | Good |
| Booklets | 0.75 | Good |

**Lower exponents = Better volume pricing**

### Setup Fees

| Fee Type | Amount | When Applied |
|----------|--------|-------------|
| Base Setup | $30.00 | Most HP Indigo products |
| Name Tags Setup | $15.00 | Name tags only (optimized pricing) |
| Finishing Setup | $15.00 | When finishing required |
| DTF Setup | $60.00 | Apparel and tote bags |
| Screen-print Setup | $50.00 | Alternative decoration |

---

## Paper Stock Specifications

### Text Stocks
| Code | Weight | Finish | Cost/Sheet | Usage |
|------|--------|---------|------------|-------|
| LYNODI312FSC | 60# Text | Uncoated | $0.085 | Light text |
| LYNO416FSC | 80# Text | Uncoated | $0.114 | Standard text |
| LYNO52FSC | 100# Text | Uncoated | $0.143 | Heavy text |
| PACDIS42FSC | 80# Text | Silk | $0.077 | Silk finish |
| PACDIS52FSC | 100# Text | Silk | $0.095 | Heavy silk |

### Cover Stocks
| Code | Weight | Finish | Cost/Sheet | Usage |
|------|--------|---------|------------|-------|
| LYNOC76FSC | 80# Cover | Uncoated | $0.224 | Light cover |
| LYNOC95FSC | 100# Cover | Uncoated | $0.280 | Standard cover |
| LYNODIC11413FSC | 120# Cover | Uncoated | $0.381 | Heavy cover |
| COUDCCDIC123513FSC | 130# Cover | Uncoated | $0.538 | Premium (bookmarks) |
| PACDISC7613FSC | 80# Cover | Silk | $0.142 | Silk light |
| PACDISC9513FSC | 100# Cover | Silk | $0.178 | Silk standard |
| PACDISC12413FSC | 130# Cover | Silk | $0.232 | Silk premium |

---

## Formula Examples

### Example 1: Brochure Calculation
**Configuration:**
- Quantity: 250 pieces
- Size: 8.5×11" (2-up imposition)
- Paper: 100# Cover Uncoated ($0.280/sheet)
- Finishing: Tri-fold ($0.10/piece)
- Rush: Standard (1.0×)

**Calculation:**
```
v = (0.280 + 0.10) × 1.5 / 2 = 0.285
S = 30.00
F_setup = 15.00 (finishing required)
Production = 250^0.75 × 1.5 = 125.66
Materials = 250 × 0.285 = 71.25
Finishing = 250 × 0.10 = 25.00
Subtotal = 30 + 15 + 125.66 + 71.25 + 25 = 266.91
Total = 266.91 × 1.0 = $266.91
Unit Price = $1.067
```

### Example 2: Magnet Linear Interpolation
**Configuration:**
- Quantity: 75 pieces (2×2")
- Rush: Standard (1.0×)

**Calculation:**
```
Q1 = 50, C1 = $61
Q2 = 100, C2 = $101
Supplier Cost = 61 + (75-50) × (101-61) / (100-50) = $81.00
Customer Price = 81.00 × 1.25 × 1.0 = $101.25
Unit Price = $1.35
```

### Example 3: Booklet Calculation
**Configuration:**
- Quantity: 50 booklets
- Pages: 16 pages
- Cover: 100# Cover Silk ($0.178/sheet)
- Text: 80# Text Uncoated ($0.114/sheet)
- Rush: Standard (1.0×)

**Calculation:**
```
Text sheets = (16-4)/4 = 3 sheets per booklet
Cover cost = 1 × 0.178 = $0.178
Text cost = 3 × 0.114 = $0.342
Click cost = (16/2) × 0.10 = $0.80
Materials per unit = (0.178 + 0.342 + 0.80) × 1.25 = $1.65

Base setup = 30 + (2 × 16) = $62
Production = 50^0.75 × 6 = $119.72
Materials = 50 × 1.65 = $82.50
Finishing setup = $30
Variable finishing = 50 × (0.10 + 3×0.05) = $12.50

Subtotal = 62 + 119.72 + 82.50 + 30 + 12.50 = $306.72
Total = $306.72 × 1.0 = $306.72
Unit Price = $6.13
```

---

## Summary

The SFU Document Solutions pricing calculator employs sophisticated mathematical models to ensure accurate, competitive pricing across all product categories. The HP Indigo formula emphasizes production efficiency gains through power-law scaling, while promotional products use market-based supplier costs with consistent markup strategies.

**Key Pricing Principles:**
1. **Volume Discounts:** All products offer better per-unit pricing at higher quantities
2. **Material Optimization:** Imposition calculations maximize sheet utilization
3. **Transparent Costs:** Setup fees and finishing costs are clearly separated
4. **Rush Flexibility:** Consistent multiplier system across all products
5. **Quality Focus:** Premium paper stocks and finishing options available

This comprehensive system enables accurate quoting while maintaining profitability and competitive positioning in the digital printing market.