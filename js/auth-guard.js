// Global Authentication Guard
// This script protects the entire application with a single authentication gate
// Place this script in the <head> of every page except login.html

class AuthGuard {
  constructor() {
    this.init();
  }

  init() {
    // Skip auth check if we're on the login page
    if (this.isLoginPage()) {
      return true;
    }

    // Check authentication status
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }

    // Set up global auth state for the app
    this.setupGlobalAuth();
    
    // Set up logout functionality
    this.setupLogout();
    
    console.log('✅ Auth Guard: User authenticated');
    return true;
  }

  isLoginPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('login.html') || path.endsWith('/login');
  }

  isAuthenticated() {
    const authData = this.getAuthData();
    if (!authData) {
      console.log('❌ Auth Guard: No auth data found');
      return false;
    }

    // Check if token is expired
    const expires = new Date(authData.expires);
    if (expires <= new Date()) {
      console.log('❌ Auth Guard: Token expired');
      this.clearAuth();
      return false;
    }

    console.log('✅ Auth Guard: Valid token found for', authData.user.email);
    return true;
  }

  getAuthData() {
    // Check both localStorage and sessionStorage
    const fromLocal = localStorage.getItem('sfu_auth');
    const fromSession = sessionStorage.getItem('sfu_auth');

    if (fromLocal) {
      try {
        return JSON.parse(fromLocal);
      } catch (e) {
        console.warn('Invalid auth data in localStorage');
        localStorage.removeItem('sfu_auth');
      }
    }

    if (fromSession) {
      try {
        return JSON.parse(fromSession);
      } catch (e) {
        console.warn('Invalid auth data in sessionStorage');
        sessionStorage.removeItem('sfu_auth');
      }
    }

    return null;
  }

  getCurrentUser() {
    const authData = this.getAuthData();
    return authData ? authData.user : null;
  }

  getUserToken() {
    const authData = this.getAuthData();
    return authData ? authData.token : null;
  }

  clearAuth() {
    localStorage.removeItem('sfu_auth');
    sessionStorage.removeItem('sfu_auth');
    
    // Clear any global auth state
    if (window.currentUser) {
      delete window.currentUser;
    }
    if (window.authToken) {
      delete window.authToken;
    }
  }

  redirectToLogin() {
    const currentPath = window.location.pathname + window.location.search;
    const returnUrl = encodeURIComponent(currentPath);
    
    console.log('🔒 Auth Guard: Redirecting to login');
    window.location.href = `login.html?return=${returnUrl}`;
  }

  setupGlobalAuth() {
    const authData = this.getAuthData();
    if (!authData) return;

    // Set global variables for easy access throughout the app
    window.currentUser = authData.user;
    window.authToken = authData.token;
    window.isAuthenticated = true;

    // Add user info to any existing header elements
    this.updateUserInterface();
  }

  updateUserInterface() {
    const user = this.getCurrentUser();
    if (!user) return;

    // Update any user display elements
    const userElements = document.querySelectorAll('.user-email, .user-name');
    userElements.forEach(element => {
      if (element.classList.contains('user-email')) {
        element.textContent = user.email;
      } else if (element.classList.contains('user-name')) {
        element.textContent = user.name;
      }
    });

    // Show user info in header if auth header exists
    const authHeader = document.querySelector('.auth-header');
    if (authHeader && !authHeader.querySelector('.user-info')) {
      authHeader.innerHTML = `
        <div class="dropdown user-info">
          <button class="btn btn-outline-secondary dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown">
            ${user.name}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><span class="dropdown-item-text small">${user.email}</span></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="window.authGuard.logout()">Sign Out</a></li>
          </ul>
        </div>
      `;
    }
  }

  setupLogout() {
    // Handle logout links/buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-logout], .logout-btn') || 
          e.target.closest('[data-logout], .logout-btn')) {
        e.preventDefault();
        this.logout();
      }
    });

    // Global logout function
    window.logout = () => this.logout();
  }

  logout() {
    if (confirm('Are you sure you want to sign out?')) {
      console.log('🔓 Auth Guard: User logging out');
      
      // Clear authentication data
      this.clearAuth();
      
      // Redirect to login page
      window.location.href = 'login.html';
    }
  }

  // Utility method to check auth status from anywhere
  static isAuthenticated() {
    return window.authGuard && window.authGuard.isAuthenticated();
  }

  // Utility method to get current user from anywhere
  static getCurrentUser() {
    return window.authGuard ? window.authGuard.getCurrentUser() : null;
  }
}

// Initialize auth guard immediately
// This will redirect to login if not authenticated, or set up the authenticated state
window.authGuard = new AuthGuard();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthGuard;
}