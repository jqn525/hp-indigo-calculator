# SFU Document Solutions Pricing Documents

**Created**: August 13, 2025  
**Purpose**: LLM-optimized pricing documentation for accurate price calculations

## Documentation Structure

### Core Reference Files
- **00-MASTER-PRICING-REFERENCE.md** - Complete pricing formula and system overview
- **01-PAPER-STOCKS-DATABASE.json** - Structured paper data with costs and specifications  
- **02-PRODUCT-CONSTRAINTS.json** - Quantity limits, efficiency exponents, and business rules
- **03-IMPOSITION-DATA.json** - Sheet layouts and pieces-per-sheet data
- **04-FINISHING-OPERATIONS.json** - Finishing costs and operation details
- **05-COMMON-CALCULATIONS.json** - Pre-calculated exponent values to prevent calculation errors
- **FORMULA-CALCULATION-GUIDE.md** - Step-by-step calculation instructions for LLMs

### Product-Specific Calculators (`/products/`)
- **postcards.md** - Simple digital press product (no finishing)
- **brochures.md** - Digital press with conditional finishing
- **notebooks.md** - Complex multi-paper binding product
- **posters.md** - Large format square-footage pricing
- **magnets.md** - Promotional product with linear interpolation

### Calculation Examples (`/examples/`)
- **calculation-examples.md** - Step-by-step walkthroughs for common queries

## Usage for LLMs

When a user asks for pricing (e.g., "What is the cost for 250 copies of a 5x7" postcard?"):

1. **Load the appropriate product file** (e.g., `products/postcards.md`)
2. **Extract parameters** from the query (quantity, size, paper, options)  
3. **⚠️ CRITICAL: Use lookup table** from `05-COMMON-CALCULATIONS.json` for production costs
4. **Follow the calculation steps** in the product document
5. **Verify against FORMULA-CALCULATION-GUIDE.md** if unsure about calculations
6. **Return the structured result** with total cost, unit price, and details

### 🚨 AVOID EXPONENT CALCULATION ERRORS
**Always use pre-calculated values from `05-COMMON-CALCULATIONS.json`**

- For 250 postcards (0.70 efficiency): production cost = **$64.97** (not $175!)
- For 100 brochures (0.75 efficiency): production cost = **$47.43** (not $75!)  
- For 25 notebooks (0.80 efficiency): production cost = **$18.98** (not $20!)

## Key Features

- **Self-contained**: Each product file includes ALL data needed for calculations
- **Structured Data**: JSON format for easy parsing by LLMs
- **Step-by-step Examples**: Detailed calculation walkthroughs
- **Validation Rules**: Business constraints and error checking
- **Multiple Product Types**: Digital press, large format, and promotional pricing

## Data Sources

All data is extracted from the live pricing system:
- `js/pricingConfig.js` - Product constraints and formulas
- `js/paperStocks.js` - Paper costs and specifications
- `js/promoConfig.js` - Promotional product data
- `js/calculator.js` - Pricing function implementations

## Query Examples That Work

- "What is the cost for 250 copies of a 5x7" postcard?"
- "How much for 100 tri-fold brochures on 80# text uncoated?"  
- "Cost for 25 notebooks, 100 pages, plastic coil binding?"
- "Price for 5 posters, 24x36 inches, on paper?"
- "What's the cost for 150 magnets, 3x3 inches?"

Each query will be processed using the appropriate product calculator with accurate, step-by-step calculations based on the real pricing system parameters.