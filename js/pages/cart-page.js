// Cart Page Module
// Handles quote saving, updating, and editing mode management

async function initCartPage() {
    if (window.authManager) {
        await authManager.init();
    }

    // Check if we're in editing mode
    const editingQuoteData = localStorage.getItem('editingQuoteData');
    const isEditingMode = editingQuoteData !== null;

    if (isEditingMode) {
        document.getElementById('saveQuoteBtn').style.display = 'none';
        document.getElementById('updateQuoteBtn').style.display = 'block';

        const cartHeader = document.querySelector('.cart-items-section h2');
        if (cartHeader) {
            const quoteData = JSON.parse(editingQuoteData);
            cartHeader.innerHTML = `Cart Items <small class="text-warning">(Editing Quote ${quoteData.quote_number})</small>`;
        }
    }

    // Save Quote Handler
    document.getElementById('saveQuoteBtn')?.addEventListener('click', async () => {
        if (!window.dbManager?.isAvailable()) {
            alert('Unable to save quote. Please check your connection.');
            return;
        }

        const items = cartManager.getItems();
        if (items.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        showSaveQuoteModal(items);
    });

    // Update Quote Handler
    document.getElementById('updateQuoteBtn')?.addEventListener('click', async () => {
        if (!window.dbManager?.isAvailable()) {
            alert('Unable to update quote. Please check your connection.');
            return;
        }

        const items = cartManager.getItems();
        if (items.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        showUpdateQuoteModal(items);
    });
}

function showSaveQuoteModal(items) {
    const modalHtml = `
        <div class="modal fade" id="saveQuoteModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Save Quote</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="saveQuoteForm">
                            <div class="mb-3">
                                <label class="form-label">Customer Name</label>
                                <input type="text" class="form-control" id="customerName" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="customerEmail">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="customerPhone">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Department/Faculty</label>
                                <input type="text" class="form-control" id="customerDepartment" placeholder="e.g. School of Business, Faculty of Applied Sciences">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Assigned By</label>
                                <input type="text" class="form-control" id="assignedBy" placeholder="Staff member name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="quoteNotes" rows="3" placeholder="Additional notes or requirements"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmSaveQuote">Save Quote</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('saveQuoteModal'));
    modal.show();

    document.getElementById('confirmSaveQuote').addEventListener('click', async () => {
        const quoteData = {
            customer_name: document.getElementById('customerName').value,
            customer_email: document.getElementById('customerEmail').value,
            customer_phone: document.getElementById('customerPhone').value,
            department: document.getElementById('customerDepartment').value,
            assigned_by: document.getElementById('assignedBy').value,
            notes: document.getElementById('quoteNotes').value,
            items: items.map(item => ({
                product_type: item.productType,
                configuration: item.configuration,
                quantity: parseInt(item.configuration.quantity),
                unit_price: parseFloat(item.pricing.unitPrice),
                total_price: parseFloat(item.pricing.totalPrice || item.pricing.totalCost)
            }))
        };

        try {
            const quote = await window.dbManager.createQuote(quoteData);
            modal.hide();

            if (confirm('Quote saved successfully! Would you like to clear your cart?')) {
                cartManager.clearCart();
            }

            setTimeout(() => {
                window.location.href = 'quotes.html';
            }, 1000);
        } catch (error) {
            alert('Failed to save quote: ' + error.message);
        }
    });

    document.getElementById('saveQuoteModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function showUpdateQuoteModal(items) {
    const editingQuoteData = JSON.parse(localStorage.getItem('editingQuoteData'));
    if (!editingQuoteData) {
        alert('Error: Quote data not found. Please restart the editing process.');
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="updateQuoteModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Quote ${editingQuoteData.quote_number}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="updateQuoteForm">
                            <div class="mb-3">
                                <label class="form-label">Customer Name</label>
                                <input type="text" class="form-control" id="updateCustomerName" value="${editingQuoteData.customer_name || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="updateCustomerEmail" value="${editingQuoteData.customer_email || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="updateCustomerPhone" value="${editingQuoteData.customer_phone || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Department/Faculty</label>
                                <input type="text" class="form-control" id="updateCustomerDepartment" value="${editingQuoteData.department || ''}" placeholder="e.g. School of Business, Faculty of Applied Sciences">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Assigned By</label>
                                <input type="text" class="form-control" id="updateAssignedBy" value="${editingQuoteData.assigned_by || ''}" placeholder="Staff member name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="updateQuoteNotes" rows="3" placeholder="Additional notes or requirements">${editingQuoteData.notes || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-warning" id="confirmUpdateQuote">Update Quote</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('updateQuoteModal'));
    modal.show();

    document.getElementById('confirmUpdateQuote').addEventListener('click', async () => {
        const updatedQuoteData = {
            customer_name: document.getElementById('updateCustomerName').value,
            customer_email: document.getElementById('updateCustomerEmail').value,
            customer_phone: document.getElementById('updateCustomerPhone').value,
            department: document.getElementById('updateCustomerDepartment').value,
            assigned_by: document.getElementById('updateAssignedBy').value,
            notes: document.getElementById('updateQuoteNotes').value,
            items: items.map(item => ({
                product_type: item.productType,
                configuration: item.configuration,
                quantity: parseInt(item.configuration.quantity),
                unit_price: parseFloat(item.pricing.unitPrice),
                total_price: parseFloat(item.pricing.totalPrice || item.pricing.totalCost)
            }))
        };

        try {
            const updatedQuote = await window.dbManager.updateQuote(editingQuoteData.id, updatedQuoteData);
            modal.hide();

            localStorage.removeItem('editingQuoteData');

            if (confirm('Quote updated successfully! Would you like to clear your cart?')) {
                cartManager.clearCart();
            }

            setTimeout(() => {
                window.location.href = 'quotes.html';
            }, 1000);
        } catch (error) {
            alert('Failed to update quote: ' + error.message);
        }
    });

    document.getElementById('updateQuoteModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

function handleCartCleared() {
    const editingQuoteData = localStorage.getItem('editingQuoteData');
    if (editingQuoteData) {
        localStorage.removeItem('editingQuoteData');

        document.getElementById('saveQuoteBtn').style.display = 'block';
        document.getElementById('updateQuoteBtn').style.display = 'none';

        const cartHeader = document.querySelector('.cart-items-section h2');
        if (cartHeader) {
            cartHeader.innerHTML = 'Cart Items';
        }
    }
}

// Handle page unload to clean up editing data
window.addEventListener('beforeunload', function() {
    const editingQuoteData = localStorage.getItem('editingQuoteData');
    if (editingQuoteData) {
        const cartItems = cartManager.getItems();
        if (cartItems.length === 0) {
            localStorage.removeItem('editingQuoteData');
        }
    }
});

// Listen for cart changes
document.addEventListener('cartChanged', function() {
    const cartItems = cartManager.getItems();
    if (cartItems.length === 0) {
        handleCartCleared();
    }
});

// Initialize page
initCartPage();

// Initialize header navigation
if (typeof HeaderNavigation !== 'undefined') {
    new HeaderNavigation();
}
