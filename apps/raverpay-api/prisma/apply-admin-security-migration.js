// apply-admin-security-migration.js
// Node.js script to apply the admin security features migration
// Run with: node prisma/apply-admin-security-migration.js

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  console.error('❌ DIRECT_URL not found in .env file');
  process.exit(1);
}

async function applyMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      'migrations/manual_admin_security_migration.sql',
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📊 Applying migration...');
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');

    // Verify MFA columns were added to users table
    console.log('🔍 Verifying MFA columns in users table...');
    const mfaColumns = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('mfaBackupCodes', 'mfaFailedAttempts', 'lastMfaFailure', 'mfaEnabledAt', 'lastMfaSuccess')
      ORDER BY ordinal_position
    `);

    if (mfaColumns.rows.length === 5) {
      console.log('✅ MFA columns added successfully!');
      console.table(mfaColumns.rows);
    } else {
      console.log('⚠️  Some MFA columns may be missing');
      console.table(mfaColumns.rows);
    }

    // Verify admin_ip_whitelist table was created
    console.log('\n🔍 Verifying admin_ip_whitelist table...');
    const whitelistTable = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_ip_whitelist'",
    );

    if (whitelistTable.rows.length > 0) {
      console.log('✅ Table "admin_ip_whitelist" created successfully!');

      // Show table structure
      const whitelistColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'admin_ip_whitelist'
        ORDER BY ordinal_position
      `);
      console.table(whitelistColumns.rows);
    } else {
      console.log('❌ Table "admin_ip_whitelist" was not created.');
    }

    // Verify refresh_tokens session tracking columns
    console.log('\n🔍 Verifying session tracking columns in refresh_tokens...');
    const sessionColumns = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'refresh_tokens' 
      AND column_name IN ('deviceId', 'ipAddress', 'location', 'userAgent', 'lastUsedAt')
      ORDER BY ordinal_position
    `);

    if (sessionColumns.rows.length === 5) {
      console.log('✅ Session tracking columns added successfully!');
      console.table(sessionColumns.rows);
    } else {
      console.log('⚠️  Some session tracking columns may be missing');
      console.table(sessionColumns.rows);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('   1. Run: pnpm prisma generate');
    console.log('   2. Run: pnpm exec tsc --noEmit');
    console.log('   3. Restart your dev server: pnpm dev');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
