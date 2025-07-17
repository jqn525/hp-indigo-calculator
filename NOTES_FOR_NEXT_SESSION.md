# Notes for Next Session - Cart Price Display Issue

## Issue Summary
Magnets can now be added to cart successfully, but the cart view shows "Total: $undefined" instead of the actual price.

## Root Cause Analysis
Looking at cart.js line 150:
```javascript
<div class="cart-item-price">Total: $${pricing.totalCost}</div>
```

The cart is looking for `pricing.totalCost` but the promo calculator items have `pricing.totalPrice` (not totalCost).

## Fix Required
In cart.js, update the cart item display to use the correct property name:
- Change `pricing.totalCost` to `pricing.totalPrice` 
- This affects both the display and the getTotalCost() calculation

## Files to Update
1. `/js/cart.js` - Fix property references from totalCost to totalPrice
2. Consider adding fallback: `pricing.totalPrice || pricing.totalCost || 0`

## Test After Fix
1. Add magnets to cart
2. Verify price displays correctly
3. Test with other promo products (stickers, apparel, tote bags)
4. Check cart total calculation

## Version Info
Current version: v29.3
Next version should be: v29.4