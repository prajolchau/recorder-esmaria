# Esmaria Sticker House - Credit Recorder

A modern, responsive web application for managing customers, billing, and credit tracking for your sticker shop in Imadol, Lalitpur.

## Features

### 🏪 Customer Management
- **Add New Customers**: Add customers with name, phone number, and vehicle number
- **Search Customers**: Quickly find customers by name, phone, or vehicle number
- **Customer Cards**: View all customer information and outstanding credits at a glance
- **Delete Customers**: Remove customers when needed

### 💰 Billing System
- **Create Bills**: Generate bills for customers with multiple products
- **Product Management**: Add multiple products with quantity and price
- **Automatic Calculations**: Subtotal, discount, total, and credit calculations
- **Print Bills**: Print professional-looking bills
- **Print Customer Statements**: Generate comprehensive customer statements with all bills and payments
- **Recent Bills**: View recent billing history

### 💳 Credit Tracking
- **Credit Management**: Track outstanding credits for each customer
- **Credit Summary**: View total outstanding amount and customer statistics
- **Credit List**: See all customers with outstanding credits
- **Payment System**: Record payments to reduce outstanding credit balances
- **Payment History**: Track all payment transactions with dates and notes

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Easy Navigation**: Tab-based interface for different sections
- **Data Persistence**: All data is saved locally in your browser

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. The application will load with sample data (if any) or start fresh
3. Navigate between tabs: Customers, Billing, and Credits

### Adding Customers
1. Click on the "Customers" tab
2. Click "Add New Customer" button
3. Fill in the customer details:
   - **Customer Name**: Full name of the customer
   - **Phone Number**: Contact number (unique identifier)
   - **Vehicle Number**: Vehicle registration number
4. Click "Add Customer" to save

### Creating Bills
1. Go to the "Billing" tab
2. Select a customer from the dropdown
3. Add products:
   - Click "Add Product" to add more product rows
   - Enter product name, quantity, and price
   - Remove products using the "×" button
4. Set discount (optional)
5. Enter paid amount
6. Click "Save Bill" to create the bill
7. Use "Print Bill" to print a professional bill

### Managing Credits
1. View the "Credits" tab to see:
   - Total outstanding amount
   - Number of customers with credits
   - List of customers with outstanding credits
2. Credits are automatically calculated and updated when bills are created

### Recording Payments
1. Click the "Pay" button on any customer card or in the Credits list
2. Enter the payment amount (cannot exceed outstanding credit)
3. Select the payment date
4. Add optional notes about the payment
5. Click "Record Payment" to save
6. The customer's credit balance will be automatically reduced

### Printing Customer Statements
1. Click the "Bills" button on any customer card or "Statement" button in Credits
2. A comprehensive statement will be generated showing:
   - Customer information
   - Account summary (total billed, paid, outstanding)
   - Complete billing history with all bills
   - Payment history with dates and amounts
   - Current outstanding balance
3. The statement will open in a new window for printing

### Quick Actions
- **Search**: Use the search bar in the Customers section to find specific customers
- **Quick Bill**: Click the "Bill" button on any customer card to quickly create a bill
- **Quick Payment**: Click the "Pay" button on any customer card to record a payment
- **Print Statement**: Click the "Bills" button to print a complete customer statement
- **Delete**: Remove customers using the trash icon on customer cards

## Technical Details

### Files Structure
```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

### Data Storage
- All data is stored locally in your browser using localStorage
- No internet connection required
- Data persists between browser sessions
- No data is sent to external servers

### Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript to be enabled
- Responsive design for mobile devices

## Customization

### Changing Shop Details
Edit the header section in `index.html`:
```html
<div class="logo">
    <i class="fas fa-sticky-note"></i>
    <h1>Esmaria Sticker House</h1>
</div>
<p class="location">Imadol, Lalitpur</p>
```

### Changing Colors
Modify the CSS variables in `styles.css`:
```css
/* Primary color */
.btn-primary {
    background: #667eea;  /* Change this color */
}
```

### Adding Features
The JavaScript code is well-organized and commented. You can easily add new features by:
1. Adding new functions in `script.js`
2. Creating corresponding HTML elements
3. Styling with CSS

## Tips for Best Use

1. **Regular Backups**: Export your data regularly by copying the localStorage data
2. **Customer Phone Numbers**: Use unique phone numbers as they serve as customer identifiers
3. **Product Names**: Use descriptive product names for better tracking
4. **Credit Management**: Regularly check the Credits tab to monitor outstanding amounts
5. **Print Bills**: Always print bills for customer records

## Troubleshooting

### Data Loss
- Check if JavaScript is enabled in your browser
- Ensure you're using the same browser where data was saved
- Clear browser data carefully as it will remove all saved information

### Performance Issues
- Clear browser cache if the application becomes slow
- Close other browser tabs to free up memory
- Restart the browser if needed

### Printing Issues
- Ensure your printer is connected and working
- Use the browser's print preview to check the layout
- Adjust print settings if needed

## Support

This application is designed to be simple and self-contained. If you need modifications or have questions:
1. Check the code comments for guidance
2. Test changes in a copy of the files first
3. Keep backups of your data

---

**Esmaria Sticker House** - Your complete credit management solution! 🏪✨
