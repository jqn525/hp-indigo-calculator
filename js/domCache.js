// DOM Cache System for Performance Optimization
// Reduces repeated DOM queries by caching frequently accessed elements

class DOMCache {
  constructor() {
    this.cache = new Map();
    this.observers = new Map();
    this.debug = false; // Set to true for debugging
  }

  // Get single element (cached)
  get(selector, forceRefresh = false) {
    if (forceRefresh || !this.cache.has(selector)) {
      const element = document.querySelector(selector);
      this.cache.set(selector, element);

      if (this.debug && element) {
        console.log(`DOMCache: Cached "${selector}"`);
      }
    }

    return this.cache.get(selector);
  }

  // Get element by ID (optimized)
  getId(id, forceRefresh = false) {
    const selector = `#${id}`;
    if (forceRefresh || !this.cache.has(selector)) {
      const element = document.getElementById(id);
      this.cache.set(selector, element);

      if (this.debug && element) {
        console.log(`DOMCache: Cached ID "${id}"`);
      }
    }

    return this.cache.get(selector);
  }

  // Get multiple elements (cached)
  getAll(selector, forceRefresh = false) {
    const cacheKey = `${selector}:all`;
    if (forceRefresh || !this.cache.has(cacheKey)) {
      const elements = document.querySelectorAll(selector);
      this.cache.set(cacheKey, elements);

      if (this.debug && elements.length > 0) {
        console.log(`DOMCache: Cached ${elements.length} elements for "${selector}"`);
      }
    }

    return this.cache.get(cacheKey);
  }

  // Check if element exists in cache
  has(selector) {
    return this.cache.has(selector);
  }

  // Clear specific cache entry or all entries
  clear(selector = null) {
    if (selector) {
      this.cache.delete(selector);
      if (this.debug) {
        console.log(`DOMCache: Cleared "${selector}"`);
      }
    } else {
      this.cache.clear();
      if (this.debug) {
        console.log('DOMCache: Cleared all cache');
      }
    }
  }

  // Pre-cache common elements (call once on page load)
  preCache(selectors = []) {
    const defaultSelectors = [
      '#quantity',
      '.total-price',
      '#totalPrice',
      '.unit-price',
      '#unitPrice',
      '#addToCartBtn',
      '#requestQuoteBtn',
      '.quantity-btn.minus',
      '.quantity-btn.plus',
      '.option-card',
      '.qty-suggestion'
    ];

    const allSelectors = [...defaultSelectors, ...selectors];

    allSelectors.forEach(selector => {
      if (selector.includes(':all')) {
        this.getAll(selector.replace(':all', ''));
      } else {
        this.get(selector);
      }
    });

    if (this.debug) {
      console.log(`DOMCache: Pre-cached ${allSelectors.length} selectors`);
    }
  }

  // Watch for DOM changes and invalidate cache
  observe(selector, callback = null) {
    if (!this.observers.has(selector)) {
      const observer = new MutationObserver((mutations) => {
        let shouldInvalidate = false;

        mutations.forEach(mutation => {
          if (mutation.type === 'childList' ||
              mutation.type === 'attributes') {
            shouldInvalidate = true;
          }
        });

        if (shouldInvalidate) {
          this.clear(selector);
          if (callback) callback();

          if (this.debug) {
            console.log(`DOMCache: Auto-invalidated "${selector}" due to DOM changes`);
          }
        }
      });

      // Start observing
      const element = this.get(selector);
      if (element) {
        observer.observe(element, {
          childList: true,
          attributes: true,
          subtree: true
        });
        this.observers.set(selector, observer);
      }
    }
  }

  // Stop observing changes
  unobserve(selector) {
    const observer = this.observers.get(selector);
    if (observer) {
      observer.disconnect();
      this.observers.delete(selector);

      if (this.debug) {
        console.log(`DOMCache: Stopped observing "${selector}"`);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      observers: this.observers.size,
      cached: Array.from(this.cache.keys())
    };
  }

  // Enable/disable debug logging
  setDebug(enabled) {
    this.debug = enabled;
    if (enabled) {
      console.log('DOMCache: Debug mode enabled');
    }
  }
}

// Create global instance
const domCache = new DOMCache();

// Make it globally accessible
window.domCache = domCache;

// Auto pre-cache on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    domCache.preCache();
  });
} else {
  // DOM already loaded
  domCache.preCache();
}