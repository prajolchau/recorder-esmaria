#!/usr/bin/env node

/**
 * Database Setup Helper for Esmaria Sticker House
 * This script helps you set up the database for cross-device data synchronization
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Esmaria Sticker House - Database Setup Helper\n');

console.log('This script will help you set up cross-device data synchronization.');
console.log('You have two options:\n');

console.log('1. 🗄️  Set up Supabase Database (Recommended)');
console.log('   - Real-time sync across all devices');
console.log('   - Automatic backup and data safety');
console.log('   - Free tier available\n');

console.log('2. 📁  Use Manual Export/Import');
console.log('   - Export data from one device');
console.log('   - Import on another device');
console.log('   - Good for occasional sync\n');

rl.question('Which option would you like to set up? (1 or 2): ', (answer) => {
    if (answer === '1') {
        setupSupabase();
    } else if (answer === '2') {
        showManualSyncInstructions();
    } else {
        console.log('Invalid option. Please run the script again and choose 1 or 2.');
        rl.close();
    }
});

function setupSupabase() {
    console.log('\n📋 Supabase Database Setup\n');
    
    console.log('Step 1: Create Supabase Account');
    console.log('1. Go to https://supabase.com');
    console.log('2. Click "Start your project" and sign up with GitHub');
    console.log('3. Create a new project');
    console.log('4. Note down your project URL and anon key\n');
    
    rl.question('Have you created your Supabase project? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            setupDatabaseTables();
        } else {
            console.log('Please create your Supabase project first, then run this script again.');
            rl.close();
        }
    });
}

function setupDatabaseTables() {
    console.log('\nStep 2: Set Up Database Tables');
    console.log('In your Supabase dashboard, go to the SQL Editor and run these commands:\n');
    
    console.log('-- Customers Table');
    console.log(`CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle VARCHAR(255) NOT NULL,
    credit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);\n`);
    
    console.log('-- Bills Table');
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
    
    console.log('-- Payments Table');
    console.log(`CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);\n`);
    
    rl.question('Have you created the database tables? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            setupVercel();
        } else {
            console.log('Please create the database tables first, then run this script again.');
            rl.close();
        }
    });
}

function setupVercel() {
    console.log('\nStep 3: Deploy to Vercel');
    console.log('1. Install Vercel CLI: npm install -g vercel');
    console.log('2. Deploy your project: vercel --prod');
    console.log('3. Add environment variables in Vercel dashboard:\n');
    
    rl.question('Enter your Supabase Project URL: ', (supabaseUrl) => {
        rl.question('Enter your Supabase Anon Key: ', (supabaseKey) => {
            console.log('\nEnvironment Variables to add in Vercel:');
            console.log(`SUPABASE_URL=${supabaseUrl}`);
            console.log(`SUPABASE_ANON_KEY=${supabaseKey}\n`);
            
            console.log('✅ Setup Complete!');
            console.log('Your data will now sync across all devices automatically.');
            console.log('If the database is unavailable, the app will fall back to local storage.\n');
            
            rl.close();
        });
    });
}

function showManualSyncInstructions() {
    console.log('\n📁 Manual Export/Import Instructions\n');
    
    console.log('To sync data between devices:');
    console.log('1. On Device A: Go to Settings → Export Data');
    console.log('2. Save the exported file');
    console.log('3. Transfer the file to Device B');
    console.log('4. On Device B: Go to Settings → Import Data');
    console.log('5. Select the exported file\n');
    
    console.log('⚠️  Note: This method requires manual intervention each time you want to sync.');
    console.log('For automatic sync, consider setting up the database instead.\n');
    
    rl.close();
}

rl.on('close', () => {
    console.log('\nThank you for using Esmaria Sticker House!');
    process.exit(0);
});
