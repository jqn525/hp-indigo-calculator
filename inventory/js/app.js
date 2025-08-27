// Inventory Management App - Main Application Logic
// SFU Document Solutions

class InventoryApp {
  constructor() {
    this.currentUser = null;
    this.dbManager = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Wait for authentication to be ready
      await this.waitForAuth();
      
      // Initialize database manager
      if (window.dbManager) {
        this.dbManager = window.dbManager;
        await this.dbManager.init();
      }

      this.initialized = true;
      console.log('✅ Inventory app initialized');
      
      // Update UI with user info
      this.updateUserInterface();
      
    } catch (error) {
      console.error('❌ Failed to initialize inventory app:', error);
    }
  }

  async waitForAuth() {
    return new Promise((resolve) => {
      if (window.currentUser) {
        this.currentUser = window.currentUser;
        resolve();
      } else {
        window.addEventListener('userAuthenticated', () => {
          this.currentUser = window.currentUser;
          resolve();
        });
      }
    });
  }

  updateUserInterface() {
    // Update user email display
    const userEmailElement = document.getElementById('userEmail');
    if (userEmailElement && this.currentUser) {
      userEmailElement.textContent = this.currentUser.email;
    }

    // Show admin section if user is admin
    const adminSection = document.getElementById('adminSection');
    if (adminSection && this.currentUser && this.currentUser.is_admin) {
      adminSection.style.display = 'block';
    }
  }

  // Request submission functionality
  async submitRequest(items, notes = '') {
    if (!this.dbManager || !this.dbManager.isAvailable()) {
      throw new Error('Database not available');
    }

    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const requestData = {
        user_id: this.currentUser.id,
        user_email: this.currentUser.email,
        user_name: this.currentUser.user_metadata?.full_name || this.currentUser.email,
        items: items,
        status: 'pending',
        priority: 'normal',
        notes: notes
      };

      const { data, error } = await window.supabaseClient
        .from('inventory_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting request:', error);
        throw error;
      }

      console.log('✅ Request submitted successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to submit request:', error);
      throw error;
    }
  }

  // Get user's pending requests
  async getPendingRequests() {
    if (!this.dbManager || !this.dbManager.isAvailable()) {
      return [];
    }

    if (!this.currentUser) {
      return [];
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('inventory_requests')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Failed to fetch pending requests:', error);
      return [];
    }
  }

  // Get all user requests
  async getUserRequests() {
    if (!this.dbManager || !this.dbManager.isAvailable()) {
      return [];
    }

    if (!this.currentUser) {
      return [];
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('inventory_requests')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user requests:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Failed to fetch user requests:', error);
      return [];
    }
  }

  // Admin functions
  async getAllRequests() {
    if (!this.dbManager || !this.dbManager.isAvailable()) {
      return [];
    }

    if (!this.currentUser || !this.currentUser.is_admin) {
      throw new Error('Admin access required');
    }

    try {
      const { data, error } = await window.supabaseClient
        .from('inventory_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all requests:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Failed to fetch all requests:', error);
      return [];
    }
  }

  async updateRequestStatus(requestId, status, adminNotes = '') {
    if (!this.dbManager || !this.dbManager.isAvailable()) {
      throw new Error('Database not available');
    }

    if (!this.currentUser || !this.currentUser.is_admin) {
      throw new Error('Admin access required');
    }

    try {
      const updateData = {
        status: status,
        admin_notes: adminNotes,
        processed_at: new Date().toISOString(),
        processed_by: this.currentUser.id
      };

      const { data, error } = await window.supabaseClient
        .from('inventory_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) {
        console.error('Error updating request status:', error);
        throw error;
      }

      console.log('✅ Request status updated:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to update request status:', error);
      throw error;
    }
  }

  // Utility functions
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatStatus(status) {
    const statusMap = {
      'pending': { text: 'Pending', class: 'badge-warning' },
      'approved': { text: 'Approved', class: 'badge-success' },
      'rejected': { text: 'Rejected', class: 'badge-danger' },
      'fulfilled': { text: 'Fulfilled', class: 'badge-info' }
    };

    return statusMap[status] || { text: status, class: 'badge-secondary' };
  }

  formatPriority(priority) {
    const priorityMap = {
      'low': { text: 'Low', class: 'badge-secondary' },
      'normal': { text: 'Normal', class: 'badge-primary' },
      'high': { text: 'High', class: 'badge-warning' },
      'urgent': { text: 'Urgent', class: 'badge-danger' }
    };

    return priorityMap[priority] || { text: priority, class: 'badge-secondary' };
  }
}

// Initialize global inventory app instance
const inventoryApp = new InventoryApp();

// Make it globally available
window.inventoryApp = inventoryApp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  inventoryApp.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InventoryApp;
}