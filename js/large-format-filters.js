// Large Format Category Page - Product Filtering and View Controls
class LargeFormatFilters {
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
    const sizeFilter = document.getElementById('sizeFilter');
    const materialFilter = document.getElementById('materialFilter');
    const turnaroundFilter = document.getElementById('turnaroundFilter');
    const resetButton = document.querySelector('.reset-filters');

    if (sizeFilter) {
      sizeFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (materialFilter) {
      materialFilter.addEventListener('change', () => this.applyFilters());
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
    const sizeFilter = document.getElementById('sizeFilter').value;
    const materialFilter = document.getElementById('materialFilter').value;
    const turnaroundFilter = document.getElementById('turnaroundFilter').value;

    let visibleCount = 0;

    this.products.forEach(product => {
      const productSize = product.dataset.size;
      const productMaterial = product.dataset.material;
      const productTurnaround = product.dataset.turnaround;

      let show = true;

      // Size filter
      if (sizeFilter && !productSize.includes(sizeFilter)) {
        show = false;
      }

      // Material filter
      if (materialFilter && !productMaterial.includes(materialFilter)) {
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

  resetFilters() {
    // Reset all filter selects
    document.getElementById('sizeFilter').value = '';
    document.getElementById('materialFilter').value = '';
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

  // Quick price estimation for large format (simplified preview)
  calculateQuickPrice(product, size = 'medium') {
    const baseRates = {
      'banners': 8.50,
      'posters': 12.00,
      'signage': 25.00,
      'vehicle-graphics': 45.00,
      'trade-show': 35.00,
      'window-graphics': 15.00
    };

    const sizeMultipliers = {
      'small': 1.0,
      'medium': 2.5,
      'large': 4.0,
      'extra-large': 6.5
    };

    const productType = product.dataset.product;
    const baseRate = baseRates[productType] || 20.00;
    const sizeMultiplier = sizeMultipliers[size] || 1.0;
    
    return (baseRate * sizeMultiplier).toFixed(2);
  }
}

// Global function for reset button
function resetFilters() {
  if (window.largeFormatFilters) {
    window.largeFormatFilters.resetFilters();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.largeFormatFilters = new LargeFormatFilters();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LargeFormatFilters;
}