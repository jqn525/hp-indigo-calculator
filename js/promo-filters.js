// Promotional Products Category Page - Product Filtering and View Controls
class PromoFilters {
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
    const productTypeFilter = document.getElementById('productTypeFilter');
    const turnaroundFilter = document.getElementById('turnaroundFilter');
    const resetButton = document.querySelector('.reset-filters');

    if (quantityFilter) {
      quantityFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (productTypeFilter) {
      productTypeFilter.addEventListener('change', () => this.applyFilters());
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
    const productTypeFilter = document.getElementById('productTypeFilter').value;
    const turnaroundFilter = document.getElementById('turnaroundFilter').value;

    let visibleCount = 0;

    this.products.forEach(product => {
      const productQuantity = product.dataset.quantity;
      const productType = product.dataset.type;
      const productTurnaround = product.dataset.turnaround;

      let show = true;

      // Quantity filter
      if (quantityFilter && !this.matchesQuantityRange(productQuantity, quantityFilter)) {
        show = false;
      }

      // Product type filter
      if (productTypeFilter && productType !== productTypeFilter) {
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
    // Convert product range like "25-1000" to numbers
    const [productMin, productMax] = productRange.split('-').map(n => parseInt(n) || 999999);
    
    // Parse filter range
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
    // Reset all filter dropdowns
    document.getElementById('quantityFilter').value = '';
    document.getElementById('productTypeFilter').value = '';
    document.getElementById('turnaroundFilter').value = '';
    
    // Show all products
    this.products.forEach(product => {
      product.style.display = 'block';
    });
    
    // Hide no results message
    this.noResultsElement.style.display = 'none';
    
    // Update product count
    this.updateProductCount(this.products.length);
  }

  setView(view) {
    this.currentView = view;
    
    // Update view button states
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Apply view class to products grid
    const productsGrid = document.getElementById('productsGrid');
    if (view === 'list') {
      productsGrid.classList.add('list-view');
    } else {
      productsGrid.classList.remove('list-view');
    }
  }

  updateProductCount(count = null) {
    // Optional: Update product count display
    // This could be implemented later if needed
    if (count !== null) {
      console.log(`Showing ${count} of ${this.products.length} products`);
    }
  }

  updateComparison() {
    // Optional: Product comparison feature for future implementation
    const selectedProducts = document.querySelectorAll('.compare-checkbox:checked');
    console.log(`${selectedProducts.length} products selected for comparison`);
  }
}

// Global reset filters function for the no-results message
function resetFilters() {
  if (window.promoFilters) {
    window.promoFilters.resetFilters();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.promoFilters = new PromoFilters();
});