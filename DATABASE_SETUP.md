# Database Setup Guide for Esmaria Sticker House

This guide will help you set up a database so that your customer data, bills, and payments are synchronized across all devices.

## Overview

Your website currently stores data locally on each device using browser storage. To make data visible across all devices, we've implemented a database solution using:

- **Supabase** (PostgreSQL database)
- **Vercel Serverless Functions** (API endpoints)
- **Automatic fallback** to localStorage if database is unavailable

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub
3. Create a new project
4. Note down your project URL and anon key

## Step 2: Set Up Database Tables

In your Supabase dashboard, go to the SQL Editor and run these commands:

### Create Customers Table
```sql
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create Bills Table
```sql
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    bill_number VARCHAR(50) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    remaining_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    items JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create Payments Table
```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 3: Configure Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

To find these values:
- Go to your Supabase project dashboard
- Click on Settings → API
- Copy the "Project URL" and "anon public" key

## Step 4: Deploy to Vercel

1. Install Vercel CLI if you haven't:
   ```bash
   npm install -g vercel
   ```

2. Deploy your project:
   ```bash
   vercel --prod
   ```

3. During deployment, Vercel will ask for your environment variables. Enter the Supabase URL and key.

## Step 5: Test the Setup

1. Open your deployed website
2. Add a customer on one device
3. Open the website on another device
4. Check if the customer appears on the second device

## How It Works

### Data Flow
1. **Frontend** → **API Endpoints** → **Supabase Database**
2. If database fails → **localStorage fallback**

### API Endpoints Created
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers` - Update customer
- `DELETE /api/customers` - Delete customer

- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `PUT /api/bills` - Update bill
- `DELETE /api/bills` - Delete bill

- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `PUT /api/payments` - Update payment
- `DELETE /api/payments` - Delete payment

## Troubleshooting

### Database Connection Issues
1. Check your environment variables in Vercel
2. Verify Supabase project is active
3. Check browser console for error messages

### Data Not Syncing
1. Ensure both devices are accessing the same deployed URL
2. Check if database is available (console will show "Data loaded from database")
3. Verify API endpoints are working

### Fallback Mode
If the database is unavailable, the app will automatically use localStorage as a fallback. You'll see a message in the console: "Data loaded from localStorage (fallback)"

## Security Features

- CORS enabled for cross-origin requests
- Input validation on both frontend and backend
- Error handling with graceful fallbacks
- No sensitive data exposed in client-side code

## Cost Information

- **Supabase**: Free tier includes 500MB database, 50MB file storage, 2GB bandwidth
- **Vercel**: Free tier includes 100GB bandwidth, 100 serverless function executions per day

For most small businesses, the free tiers should be sufficient.

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase and Vercel configurations
3. Ensure all environment variables are set correctly

The system is designed to be robust with automatic fallbacks, so your data will always be safe even if the database is temporarily unavailable.
