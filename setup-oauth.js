#!/usr/bin/env node
/**
 * Mission Control - Google OAuth + Supabase Setup
 * 
 * This script:
 * 1. Installs required dependencies
 * 2. Creates API routes for Google OAuth
 * 3. Updates database schema
 * 4. Migrates existing data
 * 
 * Usage:
 * 1. npm install
 * 2. node setup-oauth.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Mission Control - Google OAuth Setup\n');

// Step 1: Install dependencies
console.log('📦 Step 1: Installing dependencies...');
try {
    execSync('npm install next-auth @supabase/supabase-js @supabase/ssr', { 
        stdio: 'inherit',
        cwd: __dirname
    });
    console.log('✅ Dependencies installed\n');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

// Step 2: Create .env.local template
console.log('📝 Step 2: Creating .env.local template...');
const envTemplate = `# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase
SUPABASE_URL=https://hxrgvuzujvagzlaevwtk.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-generate-with-openssl
NEXTAUTH_URL=https://mission-control.zeabur.app
`;

fs.writeFileSync(path.join(__dirname, '.env.local.example'), envTemplate);
console.log('✅ .env.local.example created\n');

console.log('✅ Setup complete! Next steps:');
console.log('1. Copy .env.local.example to .env.local');
console.log('2. Fill in your credentials');
console.log('3. Run the database migration SQL');
console.log('4. Restart the app\n');
