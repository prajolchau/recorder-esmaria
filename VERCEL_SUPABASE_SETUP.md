# Complete Guide: Connecting Vercel + Supabase for Data Sync

## Overview
This guide will walk you through setting up automatic data synchronization between all your devices using Vercel (hosting) and Supabase (database).

## Prerequisites
- GitHub account
- Basic understanding of web development (optional - we'll guide you through everything)

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up for Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with your **GitHub account** (recommended)
4. Complete the verification process

### 1.2 Create New Project
1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `esmaria-sticker-house` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 1.3 Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values (you'll need them later):
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## Step 2: Set Up Database Tables

### 2.1 Access SQL Editor
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 2.2 Create Customers Table
Copy and paste this SQL code, then click **"Run"**:

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

### 2.3 Create Bills Table
Run this SQL code:

```sql
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
```

### 2.4 Create Payments Table
Run this SQL code:

```sql
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.5 Verify Tables Created
1. Go to **"Table Editor"** in the left sidebar
2. You should see three tables: `customers`, `bills`, and `payments`

---

## Step 3: Prepare Your Project for Vercel

### 3.1 Install Vercel CLI
Open your terminal/command prompt and run:
```bash
npm install -g vercel
```

### 3.2 Verify Your Project Structure
Make sure your project has these files:
```
your-project/
├── api/
│   ├── customers.js
│   ├── bills.js
│   └── payments.js
├── index.html
├── script.js
├── js/
│   └── database.js
├── package.json
└── vercel.json
```

---

## Step 4: Deploy to Vercel

### 4.1 Login to Vercel
In your terminal, run:
```bash
vercel login
```
Follow the prompts to authenticate with your GitHub account.

### 4.2 Deploy Your Project
In your project directory, run:
```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No
- **Project name** → `esmaria-sticker-house` (or your preferred name)
- **Directory** → `./` (current directory)
- **Override settings?** → No

### 4.3 Get Your Deployment URL
After deployment, Vercel will give you a URL like:
`https://esmaria-sticker-house.vercel.app`

---

## Step 5: Configure Environment Variables

### 5.1 Access Vercel Dashboard
1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project and click on it

### 5.2 Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Add these two variables:

**Variable 1:**
- **Name**: `SUPABASE_URL`
- **Value**: Your Supabase Project URL (from Step 1.3)
- **Environment**: Production, Preview, Development (select all)

**Variable 2:**
- **Name**: `SUPABASE_ANON_KEY`
- **Value**: Your Supabase anon public key (from Step 1.3)
- **Environment**: Production, Preview, Development (select all)

### 5.3 Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**

---

## Step 6: Test the Connection

### 6.1 Test API Endpoints
Open your browser and test these URLs (replace with your actual Vercel URL):
- `https://your-project.vercel.app/api/customers`
- `https://your-project.vercel.app/api/bills`
- `https://your-project.vercel.app/api/payments`

You should see empty arrays `[]` if no data exists yet.

### 6.2 Test Your Application
1. Open your deployed application
2. Go to **Settings** tab
3. Check the sync status - it should show "Database connected"
4. Add a test customer
5. Check if it appears in your Supabase dashboard under **Table Editor** → **customers**

---

## Step 7: Verify Cross-Device Sync

### 7.1 Test on Multiple Devices
1. Open your app on Device A (computer)
2. Add a customer
3. Open your app on Device B (phone/tablet)
4. Refresh the page
5. The customer should appear automatically

### 7.2 Check Sync Status
In the Settings tab, you should see:
- ✅ **Database connected - Data synced across devices**

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: "Database not available" in sync status
**Solutions:**
1. Check environment variables in Vercel dashboard
2. Verify Supabase project is active
3. Check browser console for error messages
4. Redeploy your Vercel project

#### Issue: API endpoints return errors
**Solutions:**
1. Verify Supabase URL and key are correct
2. Check if database tables exist
3. Ensure CORS is enabled (already configured in your API files)

#### Issue: Data not syncing between devices
**Solutions:**
1. Make sure both devices are using the same Vercel URL
2. Check if both devices have internet connection
3. Verify sync status shows "Database connected"

#### Issue: Environment variables not working
**Solutions:**
1. Make sure you selected all environments (Production, Preview, Development)
2. Redeploy after adding environment variables
3. Check variable names are exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## Cost Information

### Free Tiers (Sufficient for Most Businesses)

**Supabase Free Tier:**
- 500MB database storage
- 50MB file storage
- 2GB bandwidth per month
- 50,000 monthly active users

**Vercel Free Tier:**
- 100GB bandwidth per month
- 100 serverless function executions per day
- Unlimited static deployments

### When You Might Need Paid Plans
- More than 50,000 monthly active users
- More than 500MB database storage
- More than 100GB bandwidth per month

---

## Security Features

✅ **CORS enabled** for cross-origin requests
✅ **Input validation** on both frontend and backend
✅ **Error handling** with graceful fallbacks
✅ **No sensitive data** exposed in client-side code
✅ **Automatic fallback** to local storage if database fails

---

## Next Steps

Once everything is working:

1. **Export your existing data** from local storage
2. **Import it into the database** using the import feature
3. **Test on all your devices** to ensure sync works
4. **Set up regular backups** (optional - Supabase handles this automatically)

---

## Support

If you encounter issues:

1. **Check browser console** for error messages
2. **Verify Supabase project** is active and tables exist
3. **Check Vercel environment variables** are set correctly
4. **Test API endpoints** directly in browser
5. **Use manual export/import** as temporary solution

Your data will now automatically sync across all devices! 🎉
