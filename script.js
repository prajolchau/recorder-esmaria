// Global variables
let customers = [];
let bills = [];
let payments = [];
let currentBillId = 1;
let isDatabaseAvailable = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeApp();
    await initializeData();
    loadCustomers();
    loadBills();
    updateCreditsSummary();
});

// WhatsApp Integration Function
function openWhatsApp() {
    const phoneNumber = '9779810296797'; // Remove the + and spaces
    const message = 'Hello! I would like to know more about your sticker services.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
}

// Initialize data from database or localStorage
async function initializeData() {
    try {
        // Check if database service is available
        if (window.dbService) {
            isDatabaseAvailable = await window.dbService.isDatabaseAvailable();
            if (isDatabaseAvailable) {
                const data = await window.dbService.loadAllData();
                customers = data.customers;
                bills = data.bills;
                payments = data.payments;
                console.log('Data loaded from database');
                updateSyncStatus('connected', 'Database connected - Data synced across devices');
            } else {
                // Fallback to localStorage
                customers = JSON.parse(localStorage.getItem('customers')) || [];
                bills = JSON.parse(localStorage.getItem('bills')) || [];
                payments = JSON.parse(localStorage.getItem('payments')) || [];
                console.log('Data loaded from localStorage (fallback)');
                updateSyncStatus('offline', 'Using local storage - Data not synced across devices');
            }
        } else {
            // Fallback to localStorage if database service not available
            customers = JSON.parse(localStorage.getItem('customers')) || [];
            bills = JSON.parse(localStorage.getItem('bills')) || [];
            payments = JSON.parse(localStorage.getItem('payments')) || [];
            console.log('Database service not available, using localStorage');
            updateSyncStatus('offline', 'Database service not available - Using local storage');
        }
    } catch (error) {
        console.error('Error initializing data:', error);
        // Fallback to localStorage
        customers = JSON.parse(localStorage.getItem('customers')) || [];
        bills = JSON.parse(localStorage.getItem('bills')) || [];
        payments = JSON.parse(localStorage.getItem('payments')) || [];
        updateSyncStatus('error', 'Error connecting to database - Using local storage');
    }
}

// Update sync status display
function updateSyncStatus(status, message) {
    const syncStatusText = document.getElementById('syncStatusText');
    if (syncStatusText) {
        let icon = '';
        let color = '';
        
        switch(status) {
            case 'connected':
                icon = '<i class="fas fa-check-circle" style="color: #28a745;"></i>';
                color = '#28a745';
                break;
            case 'offline':
                icon = '<i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>';
                color = '#ffc107';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle" style="color: #dc3545;"></i>';
                color = '#dc3545';
                break;
            default:
                icon = '<i class="fas fa-question-circle" style="color: #6c757d;"></i>';
                color = '#6c757d';
        }
        
        syncStatusText.innerHTML = `${icon} ${message}`;
        syncStatusText.style.color = color;
    }
}

// Initialize application
function initializeApp() {
    // Tab navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Add customer form submission
    document.getElementById('addCustomerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCustomer();
    });

    // Initialize product rows
    addProductRow();
    addModalProductRow();
}

// Customer Management Functions
async function addCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const vehicle = document.getElementById('customerVehicle').value.trim();

    if (!name || !phone || !vehicle) {
        alert('Please fill in all fields');
        return;
    }

    // Check if customer already exists
    const existingCustomer = customers.find(c => c.phone === phone);
    if (existingCustomer) {
        alert('A customer with this phone number already exists');
        return;
    }

    const newCustomer = {
        id: Date.now(),
        name: name,
        phone: phone,
        vehicle: vehicle,
        credit: 0,
        createdAt: new Date().toISOString()
    };

    customers.push(newCustomer);
    await saveCustomers();
    loadCustomers();
    closeAddCustomerModal();
    
    // Clear form
    document.getElementById('addCustomerForm').reset();
    
    showNotification('Customer added successfully!', 'success');
}

function loadCustomers() {
    const customersGrid = document.getElementById('customersGrid');
    const billCustomerSelect = document.getElementById('billCustomer');
    const modalBillCustomerSelect = document.getElementById('modalBillCustomer');

    // Clear existing content
    customersGrid.innerHTML = '';
    billCustomerSelect.innerHTML = '<option value="">Choose a customer...</option>';
    modalBillCustomerSelect.innerHTML = '<option value="">Choose a customer...</option>';

    customers.forEach(customer => {
        // Add to customers grid
        const customerCard = createCustomerCard(customer);
        customersGrid.appendChild(customerCard);

        // Add to billing dropdowns
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} - ${customer.phone}`;
        billCustomerSelect.appendChild(option.cloneNode(true));
        modalBillCustomerSelect.appendChild(option);
    });

    updateCreditsSummary();
}

function createCustomerCard(customer) {
    const card = document.createElement('div');
    card.className = 'customer-card';
    card.innerHTML = `
        <div class="customer-header">
            <div class="customer-name">${customer.name}</div>
            <div class="customer-actions">
                <button class="btn btn-primary" onclick="openEditCustomerModal(${customer.id})" title="Edit Customer">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-info" onclick="createBillForCustomer(${customer.id})">
                    <i class="fas fa-receipt"></i> Bill
                </button>
                <button class="btn btn-success" onclick="openPaymentModal(${customer.id})" ${customer.credit <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-money-bill"></i> Pay
                </button>
                <button class="btn btn-warning" onclick="printCustomerBills(${customer.id})">
                    <i class="fas fa-print"></i> Bills
                </button>
                <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="customer-info">
            <div class="info-item">
                <i class="fas fa-phone"></i>
                <span>${customer.phone}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-car"></i>
                <span>${customer.vehicle}</span>
            </div>
        </div>
        <div class="customer-credit">
            <div>Outstanding Credit</div>
            <div class="credit-amount">Rs. ${customer.credit.toFixed(2)}</div>
        </div>
    `;
    return card;
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        customers = customers.filter(c => c.id !== customerId);
        // Also delete related bills and payments
        bills = bills.filter(b => b.customerId !== customerId);
        payments = payments.filter(p => p.customerId !== customerId);
        saveCustomers();
        saveBills();
        savePayments();
        loadCustomers();
        alert('Customer deleted successfully!');
    }
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const customerCards = document.querySelectorAll('.customer-card');

    customerCards.forEach(card => {
        const customerName = card.querySelector('.customer-name').textContent.toLowerCase();
        const customerPhone = card.querySelector('.info-item span').textContent.toLowerCase();
        const customerVehicle = card.querySelectorAll('.info-item span')[1].textContent.toLowerCase();

        if (customerName.includes(searchTerm) || 
            customerPhone.includes(searchTerm) || 
            customerVehicle.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Payment Functions
function openPaymentModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || customer.credit <= 0) {
        alert('No outstanding credit to pay');
        return;
    }

    const paymentModal = document.createElement('div');
    paymentModal.className = 'modal';
    paymentModal.id = 'paymentModal';
    paymentModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Record Payment - ${customer.name}</h3>
                <span class="close" onclick="closePaymentModal()">&times;</span>
            </div>
            <div style="padding: 30px;">
                <div class="form-group">
                    <label>Outstanding Credit:</label>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #dc3545; margin: 10px 0;">
                        Rs. ${customer.credit.toFixed(2)}
                    </div>
                </div>
                <div class="form-group">
                    <label for="paymentAmount">Payment Amount:</label>
                    <input type="number" id="paymentAmount" value="${customer.credit}" max="${customer.credit}" step="0.01" min="0.01" required>
                </div>
                <div class="form-group">
                    <label for="paymentDate">Payment Date:</label>
                    <input type="date" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="paymentNotes">Notes (Optional):</label>
                    <textarea id="paymentNotes" rows="3" placeholder="Any additional notes..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePaymentModal()">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="recordPayment(${customerId})">
                        <i class="fas fa-save"></i> Record Payment
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(paymentModal);
    paymentModal.style.display = 'block';
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.remove();
    }
}

function recordPayment(customerId) {
    const customer = customers.find(c => c.id === customerId);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentNotes = document.getElementById('paymentNotes').value;

    if (!paymentAmount || paymentAmount <= 0 || paymentAmount > customer.credit) {
        alert('Please enter a valid payment amount');
        return;
    }

    if (!paymentDate) {
        alert('Please select a payment date');
        return;
    }

    // Create payment record
    const payment = {
        id: Date.now(),
        customerId: customerId,
        amount: paymentAmount,
        date: paymentDate,
        notes: paymentNotes,
        createdAt: new Date().toISOString()
    };

    payments.push(payment);

    // Update customer credit
    customer.credit -= paymentAmount;
    if (customer.credit < 0) customer.credit = 0;

    savePayments();
    saveCustomers();
    loadCustomers();
    closePaymentModal();
    
    alert(`Payment of Rs. ${paymentAmount.toFixed(2)} recorded successfully!`);
}

// Billing Functions
function createBillForCustomer(customerId) {
    // Switch to billing tab
    document.querySelector('[data-tab="billing"]').click();
    
    // Select the customer
    document.getElementById('billCustomer').value = customerId;
    
    // Clear existing products
    clearProductList();
    addProductRow();
}

function addProductRow() {
    const productList = document.getElementById('productList');
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.innerHTML = `
        <input type="text" placeholder="Product name" class="product-name" onchange="calculateSubtotal()">
        <input type="number" placeholder="Quantity" class="product-quantity" value="1" min="1" onchange="calculateSubtotal()">
        <input type="number" placeholder="Price" class="product-price" step="0.01" min="0" onchange="calculateSubtotal()">
        <button type="button" class="remove-product" onclick="removeProductRow(this)">×</button>
    `;
    productList.appendChild(productRow);
}

function addModalProductRow() {
    const productList = document.getElementById('modalProductList');
    const productRow = document.createElement('div');
    productRow.className = 'product-row';
    productRow.innerHTML = `
        <input type="text" placeholder="Product name" class="product-name" onchange="calculateModalSubtotal()">
        <input type="number" placeholder="Quantity" class="product-quantity" value="1" min="1" onchange="calculateModalSubtotal()">
        <input type="number" placeholder="Price" class="product-price" step="0.01" min="0" onchange="calculateModalSubtotal()">
        <button type="button" class="remove-product" onclick="removeProductRow(this)">×</button>
    `;
    productList.appendChild(productRow);
}

function removeProductRow(button) {
    button.parentElement.remove();
    calculateSubtotal();
    calculateModalSubtotal();
}

function clearProductList() {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
}

function calculateSubtotal() {
    const productRows = document.querySelectorAll('#productList .product-row');
    let subtotal = 0;

    productRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        subtotal += quantity * price;
    });

    document.getElementById('subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    calculateTotal();
}

function calculateModalSubtotal() {
    const productRows = document.querySelectorAll('#modalProductList .product-row');
    let subtotal = 0;

    productRows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;
        subtotal += quantity * price;
    });

    document.getElementById('modalSubtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    calculateModalTotal();
}

function calculateTotal() {
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('Rs. ', '')) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = subtotal - discount;
    
    document.getElementById('total').textContent = `Rs. ${total.toFixed(2)}`;
    calculateCredit();
}

function calculateModalTotal() {
    const subtotal = parseFloat(document.getElementById('modalSubtotal').textContent.replace('Rs. ', '')) || 0;
    const discount = parseFloat(document.getElementById('modalDiscount').value) || 0;
    const total = subtotal - discount;
    
    document.getElementById('modalTotal').textContent = `Rs. ${total.toFixed(2)}`;
    calculateModalCredit();
}

function calculateCredit() {
    const total = parseFloat(document.getElementById('total').textContent.replace('Rs. ', '')) || 0;
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const credit = total - paidAmount;
    
    document.getElementById('creditAmount').textContent = `Rs. ${credit.toFixed(2)}`;
}

function calculateModalCredit() {
    const total = parseFloat(document.getElementById('modalTotal').textContent.replace('Rs. ', '')) || 0;
    const paidAmount = parseFloat(document.getElementById('modalPaidAmount').value) || 0;
    const credit = total - paidAmount;
    
    document.getElementById('modalCreditAmount').textContent = `Rs. ${credit.toFixed(2)}`;
}

function saveBill() {
    const customerId = document.getElementById('billCustomer').value;
    if (!customerId) {
        alert('Please select a customer');
        return;
    }

    const products = getProductsFromList('productList');
    if (products.length === 0) {
        alert('Please add at least one product');
        return;
    }

    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('Rs. ', '')) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = parseFloat(document.getElementById('total').textContent.replace('Rs. ', '')) || 0;
    const paidAmount = parseFloat(document.getElementById('paidAmount').value) || 0;
    const credit = parseFloat(document.getElementById('creditAmount').textContent.replace('Rs. ', '')) || 0;

    const bill = {
        id: currentBillId++,
        customerId: parseInt(customerId),
        products: products,
        subtotal: subtotal,
        discount: discount,
        total: total,
        paidAmount: paidAmount,
        credit: credit,
        date: new Date().toISOString()
    };

    bills.push(bill);
    saveBills();

    // Update customer credit
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
        customer.credit += credit;
        saveCustomers();
    }

    loadBills();
    loadCustomers();
    clearBillForm();
    alert('Bill saved successfully!');
}

function saveModalBill() {
    const customerId = document.getElementById('modalBillCustomer').value;
    if (!customerId) {
        alert('Please select a customer');
        return;
    }

    const products = getProductsFromList('modalProductList');
    if (products.length === 0) {
        alert('Please add at least one product');
        return;
    }

    const subtotal = parseFloat(document.getElementById('modalSubtotal').textContent.replace('Rs. ', '')) || 0;
    const discount = parseFloat(document.getElementById('modalDiscount').value) || 0;
    const total = parseFloat(document.getElementById('modalTotal').textContent.replace('Rs. ', '')) || 0;
    const paidAmount = parseFloat(document.getElementById('modalPaidAmount').value) || 0;
    const credit = parseFloat(document.getElementById('modalCreditAmount').textContent.replace('Rs. ', '')) || 0;

    const bill = {
        id: currentBillId++,
        customerId: parseInt(customerId),
        products: products,
        subtotal: subtotal,
        discount: discount,
        total: total,
        paidAmount: paidAmount,
        credit: credit,
        date: new Date().toISOString()
    };

    bills.push(bill);
    saveBills();

    // Update customer credit
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
        customer.credit += credit;
        saveCustomers();
    }

    loadBills();
    loadCustomers();
    closeNewBillModal();
    alert('Bill saved successfully!');
}

function getProductsFromList(listId) {
    const productRows = document.querySelectorAll(`#${listId} .product-row`);
    const products = [];

    productRows.forEach(row => {
        const name = row.querySelector('.product-name').value.trim();
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.product-price').value) || 0;

        if (name && quantity > 0 && price > 0) {
            products.push({
                name: name,
                quantity: quantity,
                price: price,
                total: quantity * price
            });
        }
    });

    return products;
}

function clearBillForm() {
    document.getElementById('billCustomer').value = '';
    clearProductList();
    addProductRow();
    document.getElementById('discount').value = '0';
    document.getElementById('paidAmount').value = '0';
    calculateSubtotal();
}

function loadBills() {
    const billsList = document.getElementById('billsList');
    billsList.innerHTML = '';

    // Show recent bills (last 10)
    const recentBills = bills.slice(-10).reverse();

    recentBills.forEach(bill => {
        const customer = customers.find(c => c.id === bill.customerId);
        if (customer) {
            const billItem = document.createElement('div');
            billItem.className = 'bill-item';
            billItem.innerHTML = `
                <div class="bill-header">
                    <div class="bill-customer">${customer.name}</div>
                    <div class="bill-date">${new Date(bill.date).toLocaleDateString()}</div>
                </div>
                <div class="bill-amount">Rs. ${bill.total.toFixed(2)}</div>
            `;
            billsList.appendChild(billItem);
        }
    });
}

// Comprehensive Bill Printing Functions
function printBill() {
    const customerId = document.getElementById('billCustomer').value;
    if (!customerId) {
        alert('Please select a customer first');
        return;
    }

    const customer = customers.find(c => c.id === parseInt(customerId));
    const products = getProductsFromList('productList');
    const total = document.getElementById('total').textContent;
    const paidAmount = document.getElementById('paidAmount').value;
    const credit = document.getElementById('creditAmount').textContent;

    printSingleBill(customer, products, total, paidAmount, credit);
}

function printCustomerBills(customerId) {
    const customer = customers.find(c => c.id === customerId);
    const customerBills = bills.filter(b => b.customerId === customerId);
    const customerPayments = payments.filter(p => p.customerId === customerId);

    if (customerBills.length === 0) {
        alert('No bills found for this customer');
        return;
    }

    printCustomerStatement(customer, customerBills, customerPayments);
}

function printSingleBill(customer, products, total, paidAmount, credit) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill - Esmaria Sticker House</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .customer-info { margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
                .products { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total { font-weight: bold; background: #f9f9f9; }
                .summary { background: #f0f8ff; padding: 15px; border-radius: 5px; margin-top: 20px; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Esmaria Sticker House</h1>
                <p>Imadol, Lalitpur</p>
                <h2>Bill</h2>
            </div>
            <div class="customer-info">
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <p><strong>Vehicle:</strong> ${customer.vehicle}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="products">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.quantity}</td>
                                <td>Rs. ${product.price.toFixed(2)}</td>
                                <td>Rs. ${product.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="summary">
                <p><strong>Total:</strong> ${total}</p>
                <p><strong>Paid Amount:</strong> Rs. ${paidAmount}</p>
                <p><strong>Credit:</strong> ${credit}</p>
            </div>
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>For any queries, please contact us.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function printCustomerStatement(customer, customerBills, customerPayments) {
    const printWindow = window.open('', '_blank');
    
    // Calculate totals
    const totalBilled = customerBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = customerBills.reduce((sum, bill) => sum + bill.paidAmount, 0) + 
                     customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCredit = customer.credit;

    printWindow.document.write(`
        <html>
        <head>
            <title>Customer Statement - ${customer.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .customer-info { margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
                .summary { background: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .bills-section, .payments-section { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total-row { font-weight: bold; background: #f9f9f9; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Esmaria Sticker House</h1>
                <p>Imadol, Lalitpur</p>
                <h2>Customer Statement</h2>
            </div>
            
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <p><strong>Vehicle:</strong> ${customer.vehicle}</p>
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="summary">
                <h3>Account Summary</h3>
                <p><strong>Total Billed:</strong> Rs. ${totalBilled.toFixed(2)}</p>
                <p><strong>Total Paid:</strong> Rs. ${totalPaid.toFixed(2)}</p>
                <p><strong>Outstanding Balance:</strong> Rs. ${totalCredit.toFixed(2)}</p>
            </div>

            <div class="bills-section">
                <h3>Billing History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Bill #</th>
                            <th>Products</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerBills.map(bill => `
                            <tr>
                                <td>${new Date(bill.date).toLocaleDateString()}</td>
                                <td>${bill.id}</td>
                                <td>${bill.products.map(p => p.name).join(', ')}</td>
                                <td>Rs. ${bill.total.toFixed(2)}</td>
                                <td>Rs. ${bill.paidAmount.toFixed(2)}</td>
                                <td>Rs. ${bill.credit.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>Total</strong></td>
                            <td><strong>Rs. ${totalBilled.toFixed(2)}</strong></td>
                            <td><strong>Rs. ${customerBills.reduce((sum, bill) => sum + bill.paidAmount, 0).toFixed(2)}</strong></td>
                            <td><strong>Rs. ${customerBills.reduce((sum, bill) => sum + bill.credit, 0).toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${customerPayments.length > 0 ? `
            <div class="payments-section">
                <h3>Payment History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerPayments.map(payment => `
                            <tr>
                                <td>${payment.date}</td>
                                <td>Rs. ${payment.amount.toFixed(2)}</td>
                                <td>${payment.notes || '-'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td><strong>Total Payments</strong></td>
                            <td><strong>Rs. ${customerPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="footer">
                <p>This statement shows all transactions for ${customer.name}</p>
                <p>Current outstanding balance: <strong>Rs. ${totalCredit.toFixed(2)}</strong></p>
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Credit Management Functions
function updateCreditsSummary() {
    const totalOutstanding = customers.reduce((sum, customer) => sum + customer.credit, 0);
    const customersWithCredit = customers.filter(customer => customer.credit > 0).length;

    document.getElementById('totalOutstanding').textContent = `Rs. ${totalOutstanding.toFixed(2)}`;
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('customersWithCredit').textContent = customersWithCredit;

    loadCreditsList();
}

function loadCreditsList() {
    const creditsList = document.getElementById('creditsList');
    creditsList.innerHTML = '';

    const customersWithCredit = customers.filter(customer => customer.credit > 0)
        .sort((a, b) => b.credit - a.credit);

    customersWithCredit.forEach(customer => {
        const creditItem = document.createElement('div');
        creditItem.className = 'credit-item';
        creditItem.innerHTML = `
            <div class="credit-customer-info">
                <div class="credit-customer-name">${customer.name}</div>
                <div class="credit-customer-details">
                    ${customer.phone} • ${customer.vehicle}
                </div>
            </div>
            <div class="credit-actions">
                <button class="btn btn-success" onclick="openPaymentModal(${customer.id})">
                    <i class="fas fa-money-bill"></i> Pay
                </button>
                <button class="btn btn-warning" onclick="printCustomerBills(${customer.id})">
                    <i class="fas fa-print"></i> Statement
                </button>
            </div>
            <div class="credit-amount-display">
                Rs. ${customer.credit.toFixed(2)}
            </div>
        `;
        creditsList.appendChild(creditItem);
    });
}

// Modal Functions
function openAddCustomerModal() {
    document.getElementById('addCustomerModal').style.display = 'block';
}

function closeAddCustomerModal() {
    document.getElementById('addCustomerModal').style.display = 'none';
}

// Edit Customer Modal Functions
function openEditCustomerModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }

    const editModal = document.createElement('div');
    editModal.className = 'modal';
    editModal.id = 'editCustomerModal';
    editModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Customer - ${customer.name}</h3>
                <span class="close" onclick="closeEditCustomerModal()">&times;</span>
            </div>
            <form id="editCustomerForm" style="padding: 30px;">
                <div class="form-group">
                    <label for="editCustomerName">Customer Name:</label>
                    <input type="text" id="editCustomerName" value="${customer.name}" required>
                </div>
                <div class="form-group">
                    <label for="editCustomerPhone">Phone Number:</label>
                    <input type="text" id="editCustomerPhone" value="${customer.phone}" required>
                </div>
                <div class="form-group">
                    <label for="editCustomerVehicle">Vehicle:</label>
                    <input type="text" id="editCustomerVehicle" value="${customer.vehicle}" required>
                </div>
                <div class="form-group">
                    <label for="editCustomerCredit">Outstanding Credit:</label>
                    <input type="number" id="editCustomerCredit" value="${customer.credit}" step="0.01" min="0">
                    <small style="color: #666; font-size: 0.9em;">Note: Only modify this if you need to adjust the credit amount manually</small>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeEditCustomerModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Update Customer
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(editModal);
    editModal.style.display = 'block';
    
    // Add form submission handler
    document.getElementById('editCustomerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateCustomer(customerId);
    });
}

function closeEditCustomerModal() {
    const editModal = document.getElementById('editCustomerModal');
    if (editModal) {
        editModal.remove();
    }
}

async function updateCustomer(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
        alert('Customer not found');
        return;
    }

    const name = document.getElementById('editCustomerName').value.trim();
    const phone = document.getElementById('editCustomerPhone').value.trim();
    const vehicle = document.getElementById('editCustomerVehicle').value.trim();
    const credit = parseFloat(document.getElementById('editCustomerCredit').value) || 0;

    if (!name || !phone || !vehicle) {
        alert('Please fill in all required fields');
        return;
    }

    // Check if phone number is being changed and if it already exists
    if (phone !== customer.phone) {
        const existingCustomer = customers.find(c => c.phone === phone && c.id !== customerId);
        if (existingCustomer) {
            alert('A customer with this phone number already exists');
            return;
        }
    }

    // Update customer data
    customer.name = name;
    customer.phone = phone;
    customer.vehicle = vehicle;
    customer.credit = credit;

    // Save to database/localStorage
    await saveCustomers();
    
    // Reload the customer list
    loadCustomers();
    
    // Close modal
    closeEditCustomerModal();
    
    showNotification('Customer updated successfully!', 'success');
}

function openNewBillModal() {
    document.getElementById('newBillModal').style.display = 'block';
    // Load customers in modal dropdown
    const modalBillCustomerSelect = document.getElementById('modalBillCustomer');
    modalBillCustomerSelect.innerHTML = '<option value="">Choose a customer...</option>';
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.name} - ${customer.phone}`;
        modalBillCustomerSelect.appendChild(option);
    });
}

function closeNewBillModal() {
    document.getElementById('newBillModal').style.display = 'none';
    // Clear modal form
    document.getElementById('modalBillCustomer').value = '';
    document.getElementById('modalProductList').innerHTML = '';
    addModalProductRow();
    document.getElementById('modalDiscount').value = '0';
    document.getElementById('modalPaidAmount').value = '0';
    calculateModalSubtotal();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const addCustomerModal = document.getElementById('addCustomerModal');
    const newBillModal = document.getElementById('newBillModal');
    const paymentModal = document.getElementById('paymentModal');
    const editCustomerModal = document.getElementById('editCustomerModal');
    const syncModal = document.getElementById('syncModal');
    
    if (event.target === addCustomerModal) {
        closeAddCustomerModal();
    }
    if (event.target === newBillModal) {
        closeNewBillModal();
    }
    if (event.target === paymentModal) {
        closePaymentModal();
    }
    if (event.target === editCustomerModal) {
        closeEditCustomerModal();
    }
    if (event.target === syncModal) {
        closeSyncModal();
    }
}

// Data Persistence Functions
async function saveCustomers() {
    try {
        if (isDatabaseAvailable && window.dbService) {
            // Save to database
            await window.dbService.saveCustomersToDB(customers);
        }
        // Always save to localStorage as backup
        localStorage.setItem('customers', JSON.stringify(customers));
    } catch (error) {
        console.error('Error saving customers:', error);
        // Fallback to localStorage only
        localStorage.setItem('customers', JSON.stringify(customers));
    }
}

async function saveBills() {
    try {
        if (isDatabaseAvailable && window.dbService) {
            // Save to database
            await window.dbService.saveBillsToDB(bills);
        }
        // Always save to localStorage as backup
        localStorage.setItem('bills', JSON.stringify(bills));
        // Update current bill ID
        if (bills.length > 0) {
            currentBillId = Math.max(...bills.map(b => b.id)) + 1;
        }
    } catch (error) {
        console.error('Error saving bills:', error);
        // Fallback to localStorage only
        localStorage.setItem('bills', JSON.stringify(bills));
        if (bills.length > 0) {
            currentBillId = Math.max(...bills.map(b => b.id)) + 1;
        }
    }
}

async function savePayments() {
    try {
        if (isDatabaseAvailable && window.dbService) {
            // Save to database
            await window.dbService.savePaymentsToDB(payments);
        }
        // Always save to localStorage as backup
        localStorage.setItem('payments', JSON.stringify(payments));
    } catch (error) {
        console.error('Error saving payments:', error);
        // Fallback to localStorage only
        localStorage.setItem('payments', JSON.stringify(payments));
    }
}

// Utility Functions
function formatCurrency(amount) {
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        default:
            notification.style.background = '#17a2b8';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Payment Functions
function openPaymentModal(customerId) {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || customer.credit <= 0) {
        alert('No outstanding credit to pay');
        return;
    }

    const paymentModal = document.createElement('div');
    paymentModal.className = 'modal';
    paymentModal.id = 'paymentModal';
    paymentModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Record Payment - ${customer.name}</h3>
                <span class="close" onclick="closePaymentModal()">&times;</span>
            </div>
            <div style="padding: 30px;">
                <div class="form-group">
                    <label>Outstanding Credit:</label>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #dc3545; margin: 10px 0;">
                        Rs. ${customer.credit.toFixed(2)}
                    </div>
                </div>
                <div class="form-group">
                    <label for="paymentAmount">Payment Amount:</label>
                    <input type="number" id="paymentAmount" value="${customer.credit}" max="${customer.credit}" step="0.01" min="0.01" required>
                </div>
                <div class="form-group">
                    <label for="paymentDate">Payment Date:</label>
                    <input type="date" id="paymentDate" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-group">
                    <label for="paymentNotes">Notes (Optional):</label>
                    <textarea id="paymentNotes" rows="3" placeholder="Any additional notes..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closePaymentModal()">Cancel</button>
                    <button type="button" class="btn btn-success" onclick="recordPayment(${customerId})">
                        <i class="fas fa-save"></i> Record Payment
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(paymentModal);
    paymentModal.style.display = 'block';
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.remove();
    }
}

function recordPayment(customerId) {
    const customer = customers.find(c => c.id === customerId);
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentNotes = document.getElementById('paymentNotes').value;

    if (!paymentAmount || paymentAmount <= 0 || paymentAmount > customer.credit) {
        alert('Please enter a valid payment amount');
        return;
    }

    if (!paymentDate) {
        alert('Please select a payment date');
        return;
    }

    // Create payment record
    const payment = {
        id: Date.now(),
        customerId: customerId,
        amount: paymentAmount,
        date: paymentDate,
        notes: paymentNotes,
        createdAt: new Date().toISOString()
    };

    payments.push(payment);

    // Update customer credit
    customer.credit -= paymentAmount;
    if (customer.credit < 0) customer.credit = 0;

    savePayments();
    saveCustomers();
    loadCustomers();
    closePaymentModal();
    
    alert(`Payment of Rs. ${paymentAmount.toFixed(2)} recorded successfully!`);
}

// Comprehensive Bill Printing Functions
function printCustomerBills(customerId) {
    const customer = customers.find(c => c.id === customerId);
    const customerBills = bills.filter(b => b.customerId === customerId);
    const customerPayments = payments.filter(p => p.customerId === customerId);

    if (customerBills.length === 0) {
        alert('No bills found for this customer');
        return;
    }

    printCustomerStatement(customer, customerBills, customerPayments);
}

function printCustomerStatement(customer, customerBills, customerPayments) {
    const printWindow = window.open('', '_blank');
    
    // Calculate totals
    const totalBilled = customerBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = customerBills.reduce((sum, bill) => sum + bill.paidAmount, 0) + 
                     customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCredit = customer.credit;

    printWindow.document.write(`
        <html>
        <head>
            <title>Customer Statement - ${customer.name}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .customer-info { margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
                .summary { background: #f0f8ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .bills-section, .payments-section { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total-row { font-weight: bold; background: #f9f9f9; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Esmaria Sticker House</h1>
                <p>Imadol, Lalitpur</p>
                <h2>Customer Statement</h2>
            </div>
            
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <p><strong>Vehicle:</strong> ${customer.vehicle}</p>
                <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="summary">
                <h3>Account Summary</h3>
                <p><strong>Total Billed:</strong> Rs. ${totalBilled.toFixed(2)}</p>
                <p><strong>Total Paid:</strong> Rs. ${totalPaid.toFixed(2)}</p>
                <p><strong>Outstanding Balance:</strong> Rs. ${totalCredit.toFixed(2)}</p>
            </div>

            <div class="bills-section">
                <h3>Billing History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Bill #</th>
                            <th>Products</th>
                            <th>Total</th>
                            <th>Paid</th>
                            <th>Credit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerBills.map(bill => `
                            <tr>
                                <td>${new Date(bill.date).toLocaleDateString()}</td>
                                <td>${bill.id}</td>
                                <td>${bill.products.map(p => p.name).join(', ')}</td>
                                <td>Rs. ${bill.total.toFixed(2)}</td>
                                <td>Rs. ${bill.paidAmount.toFixed(2)}</td>
                                <td>Rs. ${bill.credit.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3"><strong>Total</strong></td>
                            <td><strong>Rs. ${totalBilled.toFixed(2)}</strong></td>
                            <td><strong>Rs. ${customerBills.reduce((sum, bill) => sum + bill.paidAmount, 0).toFixed(2)}</strong></td>
                            <td><strong>Rs. ${customerBills.reduce((sum, bill) => sum + bill.credit, 0).toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${customerPayments.length > 0 ? `
            <div class="payments-section">
                <h3>Payment History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customerPayments.map(payment => `
                            <tr>
                                <td>${payment.date}</td>
                                <td>Rs. ${payment.amount.toFixed(2)}</td>
                                <td>${payment.notes || '-'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td><strong>Total Payments</strong></td>
                            <td><strong>Rs. ${customerPayments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}</strong></td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="footer">
                <p>This statement shows all transactions for ${customer.name}</p>
                <p>Current outstanding balance: <strong>Rs. ${totalCredit.toFixed(2)}</strong></p>
                <p>Thank you for your business!</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Clear Recent Bills Function
function clearRecentBills() {
    if (confirm('Are you sure you want to clear all recent bills? This action cannot be undone.')) {
        bills = [];
        saveBills();
        loadBills();
        showNotification('All recent bills have been cleared!', 'success');
    }
}

// Enhanced Notification System
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification container if it doesn't exist
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(notification);

    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);

    return notification;
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Analytics Functions
function loadAnalytics() {
    updateAnalyticsSummary();
    createCharts();
}

function updateAnalyticsSummary() {
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalCredit = customers.reduce((sum, customer) => sum + customer.credit, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const avgBill = bills.length > 0 ? totalRevenue / bills.length : 0;
    const paymentRate = calculatePaymentRate();
    const bestMonth = getBestMonth();
    
    // Calculate additional metrics
    const currentYear = new Date().getFullYear();
    const thisYearRevenue = bills
        .filter(bill => new Date(bill.date).getFullYear() === currentYear)
        .reduce((sum, bill) => sum + bill.total, 0);
    
    const thisYearPayments = payments
        .filter(payment => new Date(payment.date).getFullYear() === currentYear)
        .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.credit > 0).length;

    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toFixed(2)}`;
    document.getElementById('avgBill').textContent = `Rs. ${avgBill.toFixed(2)}`;
    document.getElementById('paymentRate').textContent = `${paymentRate}%`;
    document.getElementById('bestMonth').textContent = bestMonth;
    
    // Update additional summary stats if they exist
    const summaryStats = document.querySelector('.summary-stats');
    if (summaryStats) {
        summaryStats.innerHTML = `
            <div class="stat-item">
                <div class="stat-label">This Year Revenue</div>
                <div class="stat-value">Rs. ${thisYearRevenue.toFixed(2)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">This Year Payments</div>
                <div class="stat-value">Rs. ${thisYearPayments.toFixed(2)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Credit</div>
                <div class="stat-value">Rs. ${totalCredit.toFixed(2)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">${totalCustomers}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Active Customers</div>
                <div class="stat-value">${activeCustomers}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">Total Bills</div>
                <div class="stat-value">${bills.length}</div>
            </div>
        `;
    }
}

function calculatePaymentRate() {
    if (bills.length === 0) return 0;
    const totalBilled = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = bills.reduce((sum, bill) => sum + bill.paidAmount, 0) + 
                     payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.round((totalPaid / totalBilled) * 100);
}

function getBestMonth() {
    if (bills.length === 0) return '-';
    
    const monthlyRevenue = {};
    bills.forEach(bill => {
        const month = new Date(bill.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + bill.total;
    });

    const bestMonth = Object.entries(monthlyRevenue).reduce((a, b) => 
        monthlyRevenue[a[0]] > monthlyRevenue[b[0]] ? a : b
    );

    return bestMonth[0];
}

function createCharts() {
    // Simple chart implementation using CSS
    createRevenueChart();
    createCustomersChart();
    createPaymentsChart();
}

function createRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    const monthlyData = getMonthlyRevenueData();
    
    if (monthlyData.length === 0) {
        const chartContainer = canvas.parentElement;
        chartContainer.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-chart-bar"></i>
                <p>No revenue data available</p>
                <small>Start creating bills to see revenue trends</small>
            </div>
        `;
        return;
    }
    
    const maxValue = Math.max(...monthlyData.map(d => d.value));
    const totalRevenue = monthlyData.reduce((sum, item) => sum + item.value, 0);
    
    // Create a simple bar chart using CSS
    const chartContainer = canvas.parentElement;
    chartContainer.innerHTML = `
        <div class="simple-chart">
            <div class="chart-grid">
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
            </div>
            ${monthlyData.map(item => {
                const height = maxValue > 0 ? (item.value / maxValue) * 180 : 10;
                const percentage = maxValue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : 0;
                return `
                    <div class="chart-bar" style="height: ${height}px" title="Revenue: Rs. ${item.value.toFixed(2)} (${percentage}% of total)">
                        <div class="bar-label">${item.month}</div>
                        <div class="bar-value">Rs. ${item.value.toFixed(0)}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="chart-legend">
            <div class="legend-item">
                <div class="legend-color"></div>
                <span>Monthly Revenue</span>
            </div>
            <div class="legend-item">
                <i class="fas fa-info-circle"></i>
                <span>Total: Rs. ${totalRevenue.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function createCustomersChart() {
    const canvas = document.getElementById('customersChart');
    if (!canvas) return;

    const topCustomers = customers
        .filter(c => c.credit > 0)
        .sort((a, b) => b.credit - a.credit)
        .slice(0, 5);

    if (topCustomers.length === 0) {
        const chartContainer = canvas.parentElement;
        chartContainer.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-users"></i>
                <p>No customers with credit</p>
                <small>All customers are up to date with payments</small>
            </div>
        `;
        return;
    }

    const totalCredit = customers.reduce((sum, c) => sum + c.credit, 0);
    const maxCredit = Math.max(...topCustomers.map(c => c.credit));

    const chartContainer = canvas.parentElement;
    chartContainer.innerHTML = `
        <div class="customers-list">
            ${topCustomers.map((customer, index) => {
                const percentage = totalCredit > 0 ? ((customer.credit / totalCredit) * 100).toFixed(1) : 0;
                const barWidth = maxCredit > 0 ? (customer.credit / maxCredit) * 100 : 0;
                return `
                    <div class="customer-rank" title="${customer.name}: Rs. ${customer.credit.toFixed(2)} (${percentage}% of total credit)">
                        <div class="rank-number">${index + 1}</div>
                        <div class="customer-details">
                            <div class="customer-name">${customer.name}</div>
                            <div class="customer-credit">Rs. ${customer.credit.toFixed(2)}</div>
                        </div>
                        <div class="credit-bar" style="width: ${barWidth}%"></div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="chart-legend">
            <div class="legend-item">
                <i class="fas fa-trophy"></i>
                <span>Top 5 Customers by Credit</span>
            </div>
            <div class="legend-item">
                <i class="fas fa-info-circle"></i>
                <span>Total Credit: Rs. ${totalCredit.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function createPaymentsChart() {
    const canvas = document.getElementById('paymentsChart');
    if (!canvas) return;

    const monthlyPayments = getMonthlyPaymentsData();
    
    if (monthlyPayments.length === 0) {
        const chartContainer = canvas.parentElement;
        chartContainer.innerHTML = `
            <div class="chart-empty">
                <i class="fas fa-credit-card"></i>
                <p>No payment data available</p>
                <small>Record payments to see payment trends</small>
            </div>
        `;
        return;
    }
    
    const maxValue = Math.max(...monthlyPayments.map(d => d.value));
    const totalPayments = monthlyPayments.reduce((sum, item) => sum + item.value, 0);
    
    const chartContainer = canvas.parentElement;
    chartContainer.innerHTML = `
        <div class="payments-chart">
            <div class="chart-grid">
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
                <div class="grid-line"></div>
            </div>
            ${monthlyPayments.map(item => {
                const height = maxValue > 0 ? (item.value / maxValue) * 180 : 10;
                const percentage = maxValue > 0 ? ((item.value / totalPayments) * 100).toFixed(1) : 0;
                return `
                    <div class="payment-bar" style="height: ${height}px" title="Payments: Rs. ${item.value.toFixed(2)} (${percentage}% of total)">
                        <div class="bar-label">${item.month}</div>
                        <div class="bar-value">Rs. ${item.value.toFixed(0)}</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="chart-legend">
            <div class="legend-item">
                <div class="legend-color"></div>
                <span>Monthly Payments</span>
            </div>
            <div class="legend-item">
                <i class="fas fa-info-circle"></i>
                <span>Total: Rs. ${totalPayments.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function getMonthlyRevenueData() {
    const monthlyRevenue = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
        monthlyRevenue[month] = 0;
    });
    
    // Add actual revenue data
    bills.forEach(bill => {
        const billDate = new Date(bill.date);
        if (billDate.getFullYear() === currentYear) {
            const month = billDate.toLocaleDateString('en-US', { month: 'short' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + bill.total;
        }
    });

    return Object.entries(monthlyRevenue).map(([month, value]) => ({ month, value }));
}

function getMonthlyPaymentsData() {
    const monthlyPayments = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
        monthlyPayments[month] = 0;
    });
    
    // Add actual payment data
    payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        if (paymentDate.getFullYear() === currentYear) {
            const month = paymentDate.toLocaleDateString('en-US', { month: 'short' });
            monthlyPayments[month] = (monthlyPayments[month] || 0) + payment.amount;
        }
    });

    return Object.entries(monthlyPayments).map(([month, value]) => ({ month, value }));
}

// Settings Functions
function saveBusinessInfo() {
    const businessInfo = {
        name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        email: document.getElementById('businessEmail').value
    };

    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    showNotification('Business information saved successfully!', 'success');
}

function loadBusinessInfo() {
    const businessInfo = JSON.parse(localStorage.getItem('businessInfo'));
    if (businessInfo) {
        document.getElementById('businessName').value = businessInfo.name || 'Esmaria Sticker House';
        document.getElementById('businessAddress').value = businessInfo.address || 'Imadol, Lalitpur';
        document.getElementById('businessPhone').value = businessInfo.phone || '9810296797';
        document.getElementById('businessEmail').value = businessInfo.email || 'esmaria.stickerhouse0@gmail.com';
    }
}

function backupData() {
    const data = {
        customers: customers,
        bills: bills,
        payments: payments,
        businessInfo: JSON.parse(localStorage.getItem('businessInfo')),
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esmaria_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data backup completed successfully!', 'success');
}

// Enhanced data sync functions for cross-device synchronization
function syncDataToOtherDevices() {
    if (!isDatabaseAvailable) {
        showSyncInstructions();
        return;
    }
    
    showNotification('Data is automatically synced across devices via database!', 'success');
}

function showSyncInstructions() {
    const syncModal = document.createElement('div');
    syncModal.className = 'modal';
    syncModal.id = 'syncModal';
    syncModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Sync Data Across Devices</h3>
                <span class="close" onclick="closeSyncModal()">&times;</span>
            </div>
            <div style="padding: 30px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="color: #667eea; margin-top: 0;">Current Status: Using Local Storage</h4>
                    <p>Your data is currently stored locally on this device only. To sync across devices, you have two options:</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Option 1: Manual Export/Import (Quick Solution)</h4>
                    <p>Export data from one device and import it on another:</p>
                    <div style="display: flex; gap: 10px; margin: 15px 0;">
                        <button class="btn btn-primary" onclick="backupData(); closeSyncModal();">
                            <i class="fas fa-download"></i> Export Data
                        </button>
                        <button class="btn btn-success" onclick="restoreData(); closeSyncModal();">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4>Option 2: Set Up Database (Recommended)</h4>
                    <p>For automatic sync across all devices, set up a database:</p>
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <p><strong>Steps:</strong></p>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Follow the setup guide in DATABASE_SETUP.md</li>
                            <li>Create a free Supabase account</li>
                            <li>Deploy to Vercel with environment variables</li>
                            <li>Data will automatically sync across all devices</li>
                        </ol>
                    </div>
                    <button class="btn btn-info" onclick="showDatabaseSetupGuide(); closeSyncModal();">
                        <i class="fas fa-database"></i> View Setup Guide
                    </button>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <p><strong>Note:</strong> The manual export/import method works well for occasional sync, but setting up the database provides real-time synchronization across all devices.</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(syncModal);
    syncModal.style.display = 'block';
}

function closeSyncModal() {
    const syncModal = document.getElementById('syncModal');
    if (syncModal) {
        syncModal.remove();
    }
}

function showDatabaseSetupGuide() {
    const guideWindow = window.open('', '_blank');
    guideWindow.document.write(`
        <html>
        <head>
            <title>Database Setup Guide - Esmaria Sticker House</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .step { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #667eea; }
                .code { background: #f1f3f4; padding: 15px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
                .warning { background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 15px 0; }
                .success { background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Database Setup Guide</h1>
                <p>Esmaria Sticker House - Cross-Device Data Sync</p>
            </div>
            
            <div class="step">
                <h2>Step 1: Create Supabase Account</h2>
                <p>1. Go to <a href="https://supabase.com" target="_blank">https://supabase.com</a></p>
                <p>2. Click "Start your project" and sign up with GitHub</p>
                <p>3. Create a new project</p>
                <p>4. Note down your project URL and anon key</p>
            </div>
            
            <div class="step">
                <h2>Step 2: Set Up Database Tables</h2>
                <p>In your Supabase dashboard, go to the SQL Editor and run these commands:</p>
                
                <h3>Customers Table:</h3>
                <div class="code">
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
                </div>
                
                <h3>Bills Table:</h3>
                <div class="code">
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    products JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    credit DECIMAL(10,2) DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
                </div>
                
                <h3>Payments Table:</h3>
                <div class="code">
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
                </div>
            </div>
            
            <div class="step">
                <h2>Step 3: Deploy to Vercel</h2>
                <p>1. Install Vercel CLI: <code>npm install -g vercel</code></p>
                <p>2. Deploy your project: <code>vercel --prod</code></p>
                <p>3. Add environment variables in Vercel dashboard:</p>
                <div class="code">
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
                </div>
            </div>
            
            <div class="success">
                <h3>✅ Benefits of Database Setup:</h3>
                <ul>
                    <li>Real-time data sync across all devices</li>
                    <li>Automatic backup and data safety</li>
                    <li>No manual export/import needed</li>
                    <li>Access from anywhere with internet</li>
                </ul>
            </div>
            
            <div class="warning">
                <h3>⚠️ Important Notes:</h3>
                <ul>
                    <li>Both Supabase and Vercel offer free tiers</li>
                    <li>Your data will be automatically backed up</li>
                    <li>The app will work offline and sync when online</li>
                    <li>If database is unavailable, it falls back to local storage</li>
                </ul>
            </div>
        </body>
        </html>
    `);
    guideWindow.document.close();
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (confirm('This will replace all current data. Are you sure?')) {
                        customers = data.customers || [];
                        bills = data.bills || [];
                        payments = data.payments || [];
                        
                        if (data.businessInfo) {
                            localStorage.setItem('businessInfo', JSON.stringify(data.businessInfo));
                        }

                        saveCustomers();
                        saveBills();
                        savePayments();
                        loadCustomers();
                        loadBills();
                        updateCreditsSummary();
                        loadBusinessInfo();

                        showNotification('Data restored successfully!', 'success');
                    }
                } catch (error) {
                    showNotification('Invalid backup file!', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearAllData() {
    if (confirm('This will permanently delete ALL data. This action cannot be undone. Are you absolutely sure?')) {
        if (confirm('Final confirmation: Delete all data?')) {
            customers = [];
            bills = [];
            payments = [];
            
            localStorage.removeItem('customers');
            localStorage.removeItem('bills');
            localStorage.removeItem('payments');
            localStorage.removeItem('businessInfo');

            loadCustomers();
            loadBills();
            updateCreditsSummary();
            loadBusinessInfo();

            showNotification('All data has been cleared!', 'warning');
        }
    }
}

// Export and Report Functions
function exportData() {
    const data = {
        customers: customers,
        bills: bills,
        payments: payments,
        summary: {
            totalCustomers: customers.length,
            totalBills: bills.length,
            totalRevenue: bills.reduce((sum, bill) => sum + bill.total, 0),
            totalOutstanding: customers.reduce((sum, customer) => sum + customer.credit, 0)
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esmaria_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

function generateReport() {
    const reportWindow = window.open('', '_blank');
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0);
    const totalPaid = bills.reduce((sum, bill) => sum + bill.paidAmount, 0) + 
                     payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = customers.reduce((sum, customer) => sum + customer.credit, 0);

    reportWindow.document.write(`
        <html>
        <head>
            <title>Business Report - Esmaria Sticker House</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .summary { background: #f0f8ff; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .summary-item { text-align: center; padding: 15px; background: white; border-radius: 8px; }
                .summary-value { font-size: 1.5rem; font-weight: bold; color: #667eea; }
                .summary-label { color: #666; margin-top: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Esmaria Sticker House</h1>
                <p>Business Report - ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="summary">
                <h2>Business Summary</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">${customers.length}</div>
                        <div class="summary-label">Total Customers</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${bills.length}</div>
                        <div class="summary-label">Total Bills</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">Rs. ${totalRevenue.toFixed(2)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">Rs. ${totalOutstanding.toFixed(2)}</div>
                        <div class="summary-label">Outstanding Credit</div>
                    </div>
                </div>
            </div>

            <h2>Recent Bills</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Paid</th>
                        <th>Credit</th>
                    </tr>
                </thead>
                <tbody>
                    ${bills.slice(-10).reverse().map(bill => {
                        const customer = customers.find(c => c.id === bill.customerId);
                        return `
                            <tr>
                                <td>${new Date(bill.date).toLocaleDateString()}</td>
                                <td>${customer ? customer.name : 'Unknown'}</td>
                                <td>Rs. ${bill.total.toFixed(2)}</td>
                                <td>Rs. ${bill.paidAmount.toFixed(2)}</td>
                                <td>Rs. ${bill.credit.toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>Report generated on ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
    `);
    reportWindow.document.close();
}

// Quick Actions Functions
function sendReminders() {
    const customersWithCredit = customers.filter(c => c.credit > 0);
    if (customersWithCredit.length === 0) {
        showNotification('No customers with outstanding credit!', 'info');
        return;
    }

    const reminderList = customersWithCredit.map(c => 
        `${c.name} - Rs. ${c.credit.toFixed(2)}`
    ).join('\n');

    const reminderWindow = window.open('', '_blank');
    reminderWindow.document.write(`
        <html>
        <head>
            <title>Payment Reminders</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .reminder-list { background: #f9f9f9; padding: 20px; border-radius: 10px; }
                .reminder-item { padding: 10px; border-bottom: 1px solid #ddd; }
                .reminder-item:last-child { border-bottom: none; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Payment Reminders</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="reminder-list">
                <h3>Customers with Outstanding Credit:</h3>
                ${customersWithCredit.map(c => `
                    <div class="reminder-item">
                        <strong>${c.name}</strong> - Phone: ${c.phone} - Outstanding: Rs. ${c.credit.toFixed(2)}
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `);
    reminderWindow.document.close();

    showNotification(`Payment reminders generated for ${customersWithCredit.length} customers!`, 'success');
}

function generateMonthlyReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyBills = bills.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.total, 0);
    const monthlyPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    }).reduce((sum, payment) => sum + payment.amount, 0);

    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
        <html>
        <head>
            <title>Monthly Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .summary { background: #f0f8ff; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .summary-item { text-align: center; padding: 15px; background: white; border-radius: 8px; }
                .summary-value { font-size: 1.5rem; font-weight: bold; color: #667eea; }
                .summary-label { color: #666; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Esmaria Sticker House</h1>
                <h2>Monthly Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            </div>
            
            <div class="summary">
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-value">${monthlyBills.length}</div>
                        <div class="summary-label">Bills Generated</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">Rs. ${monthlyRevenue.toFixed(2)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">Rs. ${monthlyPayments.toFixed(2)}</div>
                        <div class="summary-label">Payments Received</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${monthlyBills.length > 0 ? (monthlyRevenue / monthlyBills.length).toFixed(2) : '0.00'}</div>
                        <div class="summary-label">Average Bill</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    reportWindow.document.close();

    showNotification('Monthly report generated successfully!', 'success');
}

function checkOverdueCredits() {
    const customersWithCredit = customers.filter(c => c.credit > 0);
    if (customersWithCredit.length === 0) {
        showNotification('No overdue credits found!', 'info');
        return;
    }

    const overdueList = customersWithCredit
        .sort((a, b) => b.credit - a.credit)
        .slice(0, 10);

    const overdueWindow = window.open('', '_blank');
    overdueWindow.document.write(`
        <html>
        <head>
            <title>Overdue Credits Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .overdue-item { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .overdue-amount { font-size: 1.2rem; font-weight: bold; color: #dc3545; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Overdue Credits Report</h1>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            ${overdueList.map((customer, index) => `
                <div class="overdue-item">
                    <h3>${index + 1}. ${customer.name}</h3>
                    <p>Phone: ${customer.phone}</p>
                    <p>Vehicle: ${customer.vehicle}</p>
                    <p class="overdue-amount">Outstanding: Rs. ${customer.credit.toFixed(2)}</p>
                </div>
            `).join('')}
        </body>
        </html>
    `);
    overdueWindow.document.close();

    showNotification(`Overdue credits report generated for ${overdueList.length} customers!`, 'warning');
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'default';
    document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

// Event Listeners for Theme
function setupThemeListeners() {
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    themeInputs.forEach(input => {
        input.addEventListener('change', function() {
            applyTheme(this.value);
            showNotification('Theme changed successfully!', 'success');
        });
    });
}

// Enhanced initialization
function initializeApp() {
    // Tab navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Load analytics when analytics tab is clicked
            if (targetTab === 'analytics') {
                loadAnalytics();
            }
        });
    });

    // Add customer form submission
    document.getElementById('addCustomerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCustomer();
    });

    // Initialize product rows
    addProductRow();
    addModalProductRow();
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .simple-chart, .payments-chart {
        display: flex;
        align-items: end;
        justify-content: space-around;
        height: 200px;
        padding: 20px 0;
    }

    .chart-bar, .payment-bar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        width: 40px;
        border-radius: 5px 5px 0 0;
        position: relative;
        transition: all 0.3s ease;
    }

    .chart-bar:hover, .payment-bar:hover {
        transform: scale(1.1);
    }

    .bar-label {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        color: #666;
        white-space: nowrap;
    }

    .bar-value {
        position: absolute;
        top: -25px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.8rem;
        font-weight: bold;
        color: #333;
    }

    .customers-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .customer-rank {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 10px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-radius: 10px;
        border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .rank-number {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .customer-details {
        flex: 1;
    }

    .customer-name {
        font-weight: bold;
        color: #333;
    }

    .customer-credit {
        font-size: 0.9rem;
        color: #dc3545;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeTheme();
    setupThemeListeners();
    loadBusinessInfo();
    loadCustomers();
    loadBills();
    loadCreditsList();
    updateAnalyticsSummary();
});
