// Small Format Category Page - Product Filtering and View Controls
class SmallFormatFilters {
  constructor() {
    this.products = document.querySelectorAll('.product-card-enhanced');
    this.noResultsElement = document.getElementById('noResults');
    this.currentView = 'grid';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateProductCount();
  }

  setupEventListeners() {
    // Filter controls
    const quantityFilter = document.getElementById('quantityFilter');
    const paperFilter = document.getElementById('paperFilter');
    const turnaroundFilter = document.getElementById('turnaroundFilter');
    const resetButton = document.querySelector('.reset-filters');

    if (quantityFilter) {
      quantityFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (paperFilter) {
      paperFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (turnaroundFilter) {
      turnaroundFilter.addEventListener('change', () => this.applyFilters());
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetFilters());
    }

    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.closest('.view-btn').dataset.view;
        this.setView(view);
      });
    });

    // Product comparison (future feature)
    document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.updateComparison());
    });
  }

  applyFilters() {
    const quantityFilter = document.getElementById('quantityFilter').value;
    const paperFilter = document.getElementById('paperFilter').value;
    const turnaroundFilter = document.getElementById('turnaroundFilter').value;

    let visibleCount = 0;

    this.products.forEach(product => {
      const productQuantity = product.dataset.quantity;
      const productPaper = product.dataset.paper;
      const productTurnaround = product.dataset.turnaround;

      let show = true;

      // Quantity filter
      if (quantityFilter && !this.matchesQuantityRange(productQuantity, quantityFilter)) {
        show = false;
      }

      // Paper filter
      if (paperFilter && !productPaper.includes(paperFilter)) {
        show = false;
      }

      // Turnaround filter
      if (turnaroundFilter && !productTurnaround.includes(turnaroundFilter)) {
        show = false;
      }

      if (show) {
        product.style.display = 'block';
        visibleCount++;
      } else {
        product.style.display = 'none';
      }
    });

    // Show/hide no results message
    if (visibleCount === 0) {
      this.noResultsElement.style.display = 'block';
    } else {
      this.noResultsElement.style.display = 'none';
    }

    this.updateProductCount(visibleCount);
  }

  matchesQuantityRange(productRange, filterRange) {
    // Parse product range (e.g., "25-2500")
    const [productMin, productMax] = productRange.split('-').map(Number);
    
    switch (filterRange) {
      case '25-100':
        return productMin <= 100 && productMax >= 25;
      case '100-500':
        return productMin <= 500 && productMax >= 100;
      case '500-1000':
        return productMin <= 1000 && productMax >= 500;
      case '1000+':
        return productMax >= 1000;
      default:
        return true;
    }
  }

  resetFilters() {
    // Reset all filter selects
    document.getElementById('quantityFilter').value = '';
    document.getElementById('paperFilter').value = '';
    document.getElementById('turnaroundFilter').value = '';

    // Show all products
    this.products.forEach(product => {
      product.style.display = 'block';
    });

    // Hide no results message
    this.noResultsElement.style.display = 'none';
    
    this.updateProductCount();
  }

  setView(view) {
    // Update active view button
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    // Update grid class
    const grid = document.getElementById('productsGrid');
    grid.classList.remove('grid-view', 'list-view');
    grid.classList.add(`${view}-view`);

    this.currentView = view;
  }

  updateProductCount(count = null) {
    if (count === null) {
      count = this.products.length;
    }

    // Update any product count displays
    const countElements = document.querySelectorAll('.product-count');
    countElements.forEach(element => {
      element.textContent = `${count} product${count !== 1 ? 's' : ''}`;
    });
  }

  updateComparison() {
    // Get selected products for comparison
    const selectedProducts = Array.from(document.querySelectorAll('.compare-checkbox:checked'));
    const compareButton = document.getElementById('compareButton');
    
    if (compareButton) {
      if (selectedProducts.length >= 2) {
        compareButton.style.display = 'block';
        compareButton.textContent = `Compare ${selectedProducts.length} Products`;
      } else {
        compareButton.style.display = 'none';
      }
    }
  }

  // Quick price calculation for preview (simplified)
  calculateQuickPrice(product, quantity = 100) {
    const baseRates = {
      'brochures': 0.85,
      'postcards': 0.45,
      'name-tags': 0.45,
      'flyers': 0.65,
      'bookmarks': 0.75
    };

    const productType = product.dataset.product;
    const baseRate = baseRates[productType] || 1.00;
    
    // Simple quantity discount
    let discount = 1.0;
    if (quantity >= 1000) discount = 0.8;
    else if (quantity >= 500) discount = 0.85;
    else if (quantity >= 250) discount = 0.9;
    else if (quantity >= 100) discount = 0.95;

    return (baseRate * discount).toFixed(2);
  }
}

// Global function for reset button
function resetFilters() {
  if (window.smallFormatFilters) {
    window.smallFormatFilters.resetFilters();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.smallFormatFilters = new SmallFormatFilters();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmallFormatFilters;
}