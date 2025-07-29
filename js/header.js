// Header Navigation System
// Handles desktop header navigation, dropdowns, mobile menu, and search functionality

class HeaderNavigation {
  constructor() {
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateCartBadge();
    this.updateUserMenu();
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Dropdown toggles
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleDropdown(toggle);
      });
    });

    // User menu toggle
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleUserMenu();
      });
    }

    // Search functionality
    const searchForm = document.querySelector('.header-search');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => this.handleSearch(e));
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown') && !e.target.closest('.header-user-menu')) {
        this.closeAllDropdowns();
      }
    });

    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
        this.closeAllDropdowns();
      }
    });

    // Update cart badge when cart changes
    window.addEventListener('cartUpdated', () => {
      this.updateCartBadge();
    });

    // Update user menu when auth state changes
    window.addEventListener('authStateChanged', () => {
      this.updateUserMenu();
    });
  }

  toggleMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!mobileNav) return;

    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    if (this.mobileMenuOpen) {
      mobileNav.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      mobileNav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    const mobileNav = document.querySelector('.mobile-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileNav && this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      mobileNav.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  toggleDropdown(toggle) {
    const dropdown = toggle.nextElementSibling;
    if (!dropdown) return;

    const isOpen = dropdown.classList.contains('show');
    
    // Close all other dropdowns
    this.closeAllDropdowns();
    
    if (!isOpen) {
      dropdown.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      this.activeDropdown = dropdown;
    }
  }

  toggleUserMenu() {
    const userMenu = document.querySelector('.header-user-menu .dropdown-menu');
    if (!userMenu) return;

    const isOpen = userMenu.classList.contains('show');
    
    // Close all other dropdowns
    this.closeAllDropdowns();
    
    if (!isOpen) {
      userMenu.classList.add('show');
      this.activeDropdown = userMenu;
    }
  }

  closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
    
    document.querySelectorAll('[aria-expanded="true"]').forEach(toggle => {
      toggle.setAttribute('aria-expanded', 'false');
    });
    
    this.activeDropdown = null;
  }

  handleSearch(e) {
    e.preventDefault();
    const searchInput = e.target.querySelector('input');
    const query = searchInput.value.trim();
    
    if (query) {
      console.log('Search query:', query);
      // TODO: Implement search functionality
      // For now, just show an alert
      alert(`Search functionality coming soon! You searched for: "${query}"`);
    }
  }

  updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    if (!cartBadge) return;

    // Get cart items from localStorage or cart system
    let cartCount = 0;
    
    try {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        cartCount = Array.isArray(cart) ? cart.length : 0;
      }
    } catch (error) {
      console.error('Error reading cart data:', error);
    }

    if (cartCount > 0) {
      cartBadge.textContent = cartCount;
      cartBadge.style.display = 'block';
    } else {
      cartBadge.style.display = 'none';
    }
  }

  updateUserMenu() {
    const userMenuToggle = document.querySelector('.user-menu-toggle');
    const userMenuContent = document.querySelector('.header-user-menu .dropdown-menu');
    
    if (!userMenuToggle || !userMenuContent) return;

    // Check if user is authenticated
    const isAuthenticated = this.checkAuthStatus();
    
    if (isAuthenticated) {
      const user = this.getCurrentUser();
      userMenuToggle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span>${user?.email?.split('@')[0] || 'Account'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      `;
      
      userMenuContent.innerHTML = `
        <a href="pages/quotes.html" class="dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
          </svg>
          My Quotes
        </a>
        <a href="#" class="dropdown-item" onclick="handleSignOut()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
          </svg>
          Sign Out
        </a>
      `;
    } else {
      userMenuToggle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        Sign In
      `;
      
      userMenuContent.innerHTML = `
        <a href="pages/signin.html" class="dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z"/>
          </svg>
          Sign In
        </a>
        <a href="pages/signin.html" class="dropdown-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M21,16V10.5L15.5,16H21M4.5,10.5V16H10L4.5,10.5M15,8A7,7 0 0,1 8,1A7,7 0 0,1 1,8A7,7 0 0,1 8,15A7,7 0 0,1 15,8M8,13A5,5 0 0,0 13,8A5,5 0 0,0 8,3A5,5 0 0,0 3,8A5,5 0 0,0 8,13Z"/>
          </svg>
          Create Account
        </a>
      `;
    }
  }

  checkAuthStatus() {
    // Check if user is authenticated via Supabase
    if (window.supabaseClient) {
      try {
        const session = window.supabaseClient.auth.getSession();
        return !!session?.user;
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    }
    
    // Fallback: check localStorage for auth token
    return !!localStorage.getItem('authToken');
  }

  getCurrentUser() {
    if (window.supabaseClient) {
      try {
        const session = window.supabaseClient.auth.getSession();
        return session?.user;
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    }
    
    // Fallback: get user from localStorage
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  setActiveNavItem(path) {
    // Remove active class from all nav items
    document.querySelectorAll('.header-nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current page nav item
    const currentNavItem = document.querySelector(`[href="${path}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
    }
  }
}

// Global function for sign out (called from dropdown)
function handleSignOut() {
  if (window.authSystem && typeof window.authSystem.signOut === 'function') {
    window.authSystem.signOut();
  } else {
    // Fallback logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'pages/signin.html';
  }
}

// Initialize header navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.headerNav = new HeaderNavigation();
  
  // Set active nav item based on current page
  const currentPath = window.location.pathname;
  if (window.headerNav) {
    window.headerNav.setActiveNavItem(currentPath);
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeaderNavigation;
}