// Database Service for Esmaria Sticker House
class DatabaseService {
    constructor() {
        this.baseUrl = window.location.origin;
        this.apiEndpoints = {
            customers: '/api/customers',
            bills: '/api/bills',
            payments: '/api/payments'
        };
    }

    // Generic API call method
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // Customer operations
    async getCustomers() {
        return await this.apiCall(this.apiEndpoints.customers);
    }

    async createCustomer(customerData) {
        return await this.apiCall(this.apiEndpoints.customers, 'POST', customerData);
    }

    async updateCustomer(customerData) {
        return await this.apiCall(this.apiEndpoints.customers, 'PUT', customerData);
    }

    async deleteCustomer(customerId) {
        return await this.apiCall(`${this.apiEndpoints.customers}?id=${customerId}`, 'DELETE');
    }

    // Bill operations
    async getBills() {
        return await this.apiCall(this.apiEndpoints.bills);
    }

    async createBill(billData) {
        return await this.apiCall(this.apiEndpoints.bills, 'POST', billData);
    }

    async updateBill(billData) {
        return await this.apiCall(this.apiEndpoints.bills, 'PUT', billData);
    }

    async deleteBill(billId) {
        return await this.apiCall(`${this.apiEndpoints.bills}?id=${billId}`, 'DELETE');
    }

    // Payment operations
    async getPayments() {
        return await this.apiCall(this.apiEndpoints.payments);
    }

    async createPayment(paymentData) {
        return await this.apiCall(this.apiEndpoints.payments, 'POST', paymentData);
    }

    async updatePayment(paymentData) {
        return await this.apiCall(this.apiEndpoints.payments, 'PUT', paymentData);
    }

    async deletePayment(paymentId) {
        return await this.apiCall(`${this.apiEndpoints.payments}?id=${paymentId}`, 'DELETE');
    }

    // Load all data (for initialization)
    async loadAllData() {
        try {
            const [customers, bills, payments] = await Promise.all([
                this.getCustomers(),
                this.getBills(),
                this.getPayments()
            ]);

            return {
                customers: customers || [],
                bills: bills || [],
                payments: payments || []
            };
        } catch (error) {
            console.error('Failed to load data:', error);
            // Fallback to localStorage if API fails
            return {
                customers: JSON.parse(localStorage.getItem('customers')) || [],
                bills: JSON.parse(localStorage.getItem('bills')) || [],
                payments: JSON.parse(localStorage.getItem('payments')) || []
            };
        }
    }

    // Save all data (for backup/fallback)
    async saveAllData(customers, bills, payments) {
        try {
            // Save to database
            await Promise.all([
                this.saveCustomersToDB(customers),
                this.saveBillsToDB(bills),
                this.savePaymentsToDB(payments)
            ]);

            // Also save to localStorage as backup
            localStorage.setItem('customers', JSON.stringify(customers));
            localStorage.setItem('bills', JSON.stringify(bills));
            localStorage.setItem('payments', JSON.stringify(payments));
        } catch (error) {
            console.error('Failed to save data:', error);
            // Fallback to localStorage only
            localStorage.setItem('customers', JSON.stringify(customers));
            localStorage.setItem('bills', JSON.stringify(bills));
            localStorage.setItem('payments', JSON.stringify(payments));
        }
    }

    // Helper methods for bulk operations
    async saveCustomersToDB(customers) {
        // Clear existing customers and add new ones
        const existingCustomers = await this.getCustomers();
        for (const customer of existingCustomers) {
            await this.deleteCustomer(customer.id);
        }
        
        for (const customer of customers) {
            const { id, ...customerData } = customer;
            await this.createCustomer(customerData);
        }
    }

    async saveBillsToDB(bills) {
        // Clear existing bills and add new ones
        const existingBills = await this.getBills();
        for (const bill of existingBills) {
            await this.deleteBill(bill.id);
        }
        
        for (const bill of bills) {
            const { id, ...billData } = bill;
            await this.createBill(billData);
        }
    }

    async savePaymentsToDB(payments) {
        // Clear existing payments and add new ones
        const existingPayments = await this.getPayments();
        for (const payment of existingPayments) {
            await this.deletePayment(payment.id);
        }
        
        for (const payment of payments) {
            const { id, ...paymentData } = payment;
            await this.createPayment(paymentData);
        }
    }

    // Check if database is available
    async isDatabaseAvailable() {
        try {
            // Check if environment variables are set
            if (!this.baseUrl || this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1')) {
                console.warn('Running locally, database not available');
                return false;
            }
            
            // Try a simple API call to check connectivity
            const response = await fetch(`${this.baseUrl}/api/customers`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                return true;
            } else {
                console.warn('Database API not responding properly');
                return false;
            }
        } catch (error) {
            console.warn('Database not available, using localStorage fallback:', error.message);
            return false;
        }
    }
}

// Create global instance
window.dbService = new DatabaseService();
