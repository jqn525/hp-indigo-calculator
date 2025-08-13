# Pricing Documentation Generation Prompt Template

**Version**: 1.0  
**Created**: August 13, 2025  
**Purpose**: Template for generating LLM-optimized pricing documentation for new products

## How to Use This Template

When adding a new product to the pricing system, use this comprehensive prompt with Claude Code or Claude Desktop to generate consistent, high-quality documentation.

---

## PROMPT TEMPLATE

```
I need you to create comprehensive LLM-optimized pricing documentation for a new product in our SFU Document Solutions pricing system. Please analyze the codebase and generate the complete documentation package following the established patterns.

### PROJECT CONTEXT

This is the SFU Document Solutions pricing calculator (https://docsol.ca) - a PWA for HP Indigo digital press products. The pricing system uses a static-first architecture with all data in JavaScript files, not a database.

**Core Formula**: C(Q) = (S + F_setup + Q^e × k + Q × v + Q × f) × r

**Key Files to Examine:**
- `js/pricingConfig.js` - Product constraints and formulas
- `js/paperStocks.js` - Paper costs and specifications  
- `js/calculator.js` - Pricing function implementations
- `Pricing Documents/` - Existing documentation structure

### NEW PRODUCT INFORMATION

**Product Name**: [PRODUCT_NAME]
**Product Type**: [PRODUCT_TYPE - e.g., "digital_press", "large_format", "promotional"]
**Description**: [PRODUCT_DESCRIPTION]

**Pricing Parameters:**
- Efficiency Exponent (e): [EFFICIENCY_EXPONENT]
- Setup Fee (S): [SETUP_FEE]
- Finishing Setup (F_setup): [FINISHING_SETUP]
- Quantity Range: [MIN_QUANTITY] to [MAX_QUANTITY]
- Available Sizes: [SIZE_LIST]
- Imposition Data: [IMPOSITION_DETAILS]
- Paper Types Allowed: [PAPER_TYPES]
- Finishing Options: [FINISHING_OPTIONS]
- Rush Options: [RUSH_OPTIONS]

### REQUIRED DELIVERABLES

Please create the following files in the `Pricing Documents/` folder:

#### 1. Update Core Reference Files

**Update `05-COMMON-CALCULATIONS.json`:**
- Add new efficiency exponent section if not already present
- Include pre-calculated values for the new exponent
- Add verification examples for the new product

**Update relevant constraint files if needed:**
- Add product constraints to appropriate reference files
- Include imposition data if new sizes
- Add finishing operations if new finishing types

#### 2. Create Product Calculator

**Create `products/[PRODUCT_NAME].md`:**
- Complete product overview
- Formula components with calculation warnings
- Constraints and options (JSON format)
- Available sizes with impositions
- Paper options with costs
- Rush options
- Step-by-step calculation methodology
- Example calculations with verification
- Validation rules
- Common configurations
- LLM usage notes

**Required Sections:**
```markdown
# [Product Name] Pricing Calculator

## Product Overview
## Formula Components (with ⚠️ CALCULATION WARNING)
## Constraints and Options
### Quantity Limits
### Available Sizes and Impositions  
### [Other Options - Paper, Finishing, etc.]
### Rush Options
## Calculation Steps
## Example Calculation
## Validation Rules
## Common Configurations
## LLM Usage Notes
```

#### 3. Add to Calculation Examples

**Update `examples/calculation-examples.md`:**
- Add a complete example calculation for the new product
- Include step-by-step walkthrough
- Show lookup table usage
- Include verification steps

#### 4. Update README

**Update `README.md`:**
- Add new product to the product list
- Include in query examples
- Update any relevant sections

### DOCUMENTATION REQUIREMENTS

#### Calculation Error Prevention
- **MANDATORY**: Include calculation warning section in product file
- Reference `05-COMMON-CALCULATIONS.json` for exponent values
- Show common LLM errors vs correct calculations
- Include lookup table quick reference

#### LLM-Friendly Format
- Use structured JSON blocks for data
- Include self-contained examples
- Provide verification methods
- Use clear section headers for easy parsing

#### Consistency Standards
- Follow established file naming conventions
- Use consistent markdown formatting
- Include version information and dates
- Match existing documentation style

### EXAMPLE OUTPUT STRUCTURE

For reference, examine these existing files:
- `products/postcards.md` - Simple digital press product
- `products/brochures.md` - Product with conditional finishing
- `products/notebooks.md` - Complex multi-component product
- `products/posters.md` - Large format square-footage pricing
- `products/magnets.md` - Promotional linear interpolation

### VERIFICATION REQUIREMENTS

After generating documentation:
1. Ensure all efficiency exponent calculations use lookup tables
2. Verify example calculations are mathematically correct
3. Check that all product constraints are documented
4. Confirm formatting matches existing files
5. Test that LLM can follow the instructions to calculate prices

### SPECIAL CONSIDERATIONS

**If Digital Press Product:**
- Include imposition data and material cost calculations
- Document paper compatibility
- Include finishing logic if applicable

**If Large Format Product:**
- Use square-footage pricing methodology
- Include material charge rates
- Document size constraints

**If Promotional Product:**
- Use supplier cost tables and linear interpolation
- Include specific markup percentages
- Document quantity validation rules

Please analyze the codebase, extract the relevant data, and generate the complete documentation package following these specifications.
```

---

## USAGE INSTRUCTIONS

### Step 1: Gather Product Information
Before using the prompt, collect this information about your new product:

```
Product Name: ________________________
Product Type: ________________________
Efficiency Exponent: __________________
Setup Fee: ___________________________
Quantity Range: ______________________
Available Sizes: _____________________
Imposition Data: _____________________
Paper Types: ________________________
Finishing Options: __________________
```

### Step 2: Customize the Prompt
Replace all bracketed placeholders `[PRODUCT_NAME]`, `[EFFICIENCY_EXPONENT]`, etc. with your specific product information.

### Step 3: Execute with Claude
Use the customized prompt with Claude Code or Claude Desktop to generate the documentation package.

### Step 4: Review and Integrate
- Verify all calculations in examples
- Check formatting consistency
- Test LLM usability with sample queries
- Update main README.md with new product information

## EXAMPLE CUSTOMIZATION

For a hypothetical "Business Cards" product:

```
**Product Name**: Business Cards
**Product Type**: digital_press
**Description**: Professional business cards with premium paper options

**Pricing Parameters:**
- Efficiency Exponent (e): 0.65
- Setup Fee (S): $30.00
- Finishing Setup (F_setup): $0.00 (no finishing)
- Quantity Range: 100 to 5000
- Available Sizes: ["3.5x2"]
- Imposition Data: {"3.5x2": {"piecesPerSheet": 21, "layout": "7x3"}}
- Paper Types Allowed: ["cover_stock"]
- Finishing Options: ["none"]
- Rush Options: ["standard", "2-day", "next-day", "same-day"]
```

## QUALITY CHECKLIST

When documentation is complete, verify:

- [ ] Product file includes calculation warning section
- [ ] Lookup table values are included for common quantities
- [ ] Example calculations are mathematically correct
- [ ] All constraints and options are documented
- [ ] Formatting matches existing files
- [ ] LLM can successfully calculate prices using the documentation
- [ ] Files are added to appropriate folders
- [ ] README.md is updated with new product

## MAINTENANCE NOTES

- Update this template when documentation patterns change
- Add new product types to the template as they're developed
- Include lessons learned from documentation generation
- Keep example customizations current with actual products

This template ensures consistent, high-quality documentation that prevents the LLM calculation errors we've solved and maintains the comprehensive coverage needed for accurate automated pricing.