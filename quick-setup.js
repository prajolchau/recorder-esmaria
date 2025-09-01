#!/usr/bin/env node

/**
 * Quick Setup Script for Vercel + Supabase Connection
 * This script will guide you through the entire process
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Vercel + Supabase Quick Setup Guide\n');

console.log('This script will guide you through connecting Vercel and Supabase');
console.log('for automatic data synchronization across all your devices.\n');

console.log('📋 What you\'ll need:');
console.log('1. GitHub account');
console.log('2. 15-20 minutes of time');
console.log('3. Your project files ready\n');

rl.question('Ready to start? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
        startSetup();
    } else {
        console.log('No problem! Run this script again when you\'re ready.');
        rl.close();
    }
});

function startSetup() {
    console.log('\n🎯 Step 1: Create Supabase Account & Project\n');
    
    console.log('1. Go to https://supabase.com');
    console.log('2. Click "Start your project"');
    console.log('3. Sign up with GitHub');
    console.log('4. Create new project with these details:');
    console.log('   - Name: esmaria-sticker-house');
    console.log('   - Password: [create a strong password]');
    console.log('   - Region: [choose closest to you]\n');
    
    rl.question('Have you created your Supabase project? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            getCredentials();
        } else {
            console.log('Please create your Supabase project first, then run this script again.');
            rl.close();
        }
    });
}

function getCredentials() {
    console.log('\n🔑 Step 2: Get Your Credentials\n');
    
    console.log('1. In your Supabase dashboard, go to Settings → API');
    console.log('2. Copy these two values:\n');
    
    rl.question('Enter your Supabase Project URL: ', (supabaseUrl) => {
        rl.question('Enter your Supabase Anon Key: ', (supabaseKey) => {
            setupDatabase(supabaseUrl, supabaseKey);
        });
    });
}

function setupDatabase(supabaseUrl, supabaseKey) {
    console.log('\n🗄️  Step 3: Set Up Database Tables\n');
    
    console.log('1. In Supabase dashboard, go to SQL Editor');
    console.log('2. Click "New query"');
    console.log('3. Run these SQL commands one by one:\n');
    
    console.log('-- Command 1: Create customers table');
    console.log(`CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);\n`);
    
    console.log('-- Command 2: Create bills table');
    console.log(`CREATE TABLE bills (
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
);\n`);
    
    console.log('-- Command 3: Create payments table');
    console.log(`CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);\n`);
    
    rl.question('Have you created all three tables? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            deployToVercel(supabaseUrl, supabaseKey);
        } else {
            console.log('Please create the database tables first, then run this script again.');
            rl.close();
        }
    });
}

function deployToVercel(supabaseUrl, supabaseKey) {
    console.log('\n🚀 Step 4: Deploy to Vercel\n');
    
    console.log('1. Install Vercel CLI: npm install -g vercel');
    console.log('2. Login to Vercel: vercel login');
    console.log('3. Deploy your project: vercel --prod');
    console.log('4. Follow the prompts (use default settings)\n');
    
    rl.question('Have you deployed to Vercel? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            setupEnvironmentVariables(supabaseUrl, supabaseKey);
        } else {
            console.log('Please deploy to Vercel first, then run this script again.');
            rl.close();
        }
    });
}

function setupEnvironmentVariables(supabaseUrl, supabaseKey) {
    console.log('\n⚙️  Step 5: Configure Environment Variables\n');
    
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Find your project and click on it');
    console.log('3. Go to Settings → Environment Variables');
    console.log('4. Add these two variables:\n');
    
    console.log('Variable 1:');
    console.log(`Name: SUPABASE_URL`);
    console.log(`Value: ${supabaseUrl}`);
    console.log('Environment: Production, Preview, Development (select all)\n');
    
    console.log('Variable 2:');
    console.log(`Name: SUPABASE_ANON_KEY`);
    console.log(`Value: ${supabaseKey}`);
    console.log('Environment: Production, Preview, Development (select all)\n');
    
    console.log('5. After adding variables, redeploy your project\n');
    
    rl.question('Have you added the environment variables and redeployed? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            testConnection();
        } else {
            console.log('Please add the environment variables and redeploy first.');
            rl.close();
        }
    });
}

function testConnection() {
    console.log('\n🧪 Step 6: Test the Connection\n');
    
    console.log('1. Open your deployed application');
    console.log('2. Go to Settings tab');
    console.log('3. Check sync status - should show "Database connected"');
    console.log('4. Add a test customer');
    console.log('5. Check Supabase dashboard → Table Editor → customers');
    console.log('6. Test on another device - data should sync automatically\n');
    
    console.log('🎉 Congratulations! Your data sync is now set up!\n');
    
    console.log('📱 Next steps:');
    console.log('1. Export your existing data from local storage');
    console.log('2. Import it into the database');
    console.log('3. Test on all your devices');
    console.log('4. Enjoy automatic sync across all devices!\n');
    
    console.log('💡 Tips:');
    console.log('- Your data is now backed up automatically');
    console.log('- Changes sync instantly across all devices');
    console.log('- If database is unavailable, app falls back to local storage');
    console.log('- Free tiers should be sufficient for most businesses\n');
    
    rl.close();
}

rl.on('close', () => {
    console.log('Thank you for using Esmaria Sticker House!');
    console.log('For detailed instructions, see VERCEL_SUPABASE_SETUP.md');
    process.exit(0);
});
