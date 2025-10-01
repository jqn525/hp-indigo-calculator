// Authentication Management for SFU Document Solutions
// Handles user sign in, sign up, and session management

class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.initialized = false;
    this.initPromise = null;
  }

  // Initialize auth - wait for Supabase to be ready
  async init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve) => {
      if (window.supabaseClient) {
        this.setupAuth();
        resolve();
      } else if (window.isSupabaseConfigured && !window.isSupabaseConfigured()) {
        // Supabase not configured, auth disabled
        console.log('Auth disabled - Supabase not configured');
        this.initialized = true;
        resolve();
      } else {
        // Wait for Supabase to load
        window.addEventListener('supabaseReady', () => {
          this.setupAuth();
          resolve();
        });
      }
    });
    
    return this.initPromise;
  }

  async setupAuth() {
    if (!window.supabaseClient) return;
    
    // Check for existing session
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    this.session = session;
    this.user = session?.user || null;
    
    // Listen for auth changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.user = session?.user || null;
      this.updateAuthUI();
      
      // Handle cart migration on login
      if (event === 'SIGNED_IN' && window.cartManager) {
        window.cartManager.migrateLocalCartToCloud();
      }
    });
    
    this.initialized = true;
    this.updateAuthUI();
  }

  // Sign up new user
  async signUp(email, password, metadata = {}) {
    if (!window.supabaseClient) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // full_name, company_name, etc.
        emailRedirectTo: 'https://docsol.ca/pages/signin.html'
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign in existing user
  async signIn(email, password) {
    if (!window.supabaseClient) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  // Sign out current user
  async signOut() {
    if (!window.supabaseClient) return;
    
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) throw error;
    
    // Clear local data
    this.user = null;
    this.session = null;
    
    // Redirect to home
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
      window.location.href = '../index.html';
    }
  }

  // Request password reset
  async resetPassword(email) {
    if (!window.supabaseClient) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
  }

  // Update user password
  async updatePassword(newPassword) {
    if (!window.supabaseClient) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await window.supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }

  // Get current user
  getUser() {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user;
  }

  // Update auth UI elements
  updateAuthUI() {
    const authButton = document.getElementById('authButton');
    const userMenu = document.getElementById('userMenu');
    const userEmail = document.getElementById('userEmail');
    
    if (this.isAuthenticated()) {
      // User is signed in
      if (authButton) authButton.style.display = 'none';
      if (userMenu) {
        userMenu.style.display = 'block';
        if (userEmail) userEmail.textContent = this.user.email;
      }
      
      // Add sign out listeners
      document.querySelectorAll('.sign-out-btn').forEach(btn => {
        btn.addEventListener('click', () => this.signOut());
      });
    } else {
      // User is not signed in
      if (authButton) authButton.style.display = 'block';
      if (userMenu) userMenu.style.display = 'none';
    }
    
    // Update navigation auth indicators
    document.body.classList.toggle('authenticated', this.isAuthenticated());
  }

  // Generate session ID for anonymous users
  getSessionId() {
    let sessionId = localStorage.getItem('sfu_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sfu_session_id', sessionId);
    }
    return sessionId;
  }
}

// Initialize auth manager
const authManager = new AuthManager();
authManager.init();

// Make globally available
window.authManager = authManager;