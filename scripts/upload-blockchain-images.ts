/**
 * Upload Blockchain Images to Cloudinary
 *
 * This script uploads all blockchain logo SVG files from assets/blockchain
 * to Cloudinary for use in the network configuration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../apps/raverpay-api/.env') });

// Configure Cloudinary (will use environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  fileName: string;
  cloudinaryUrl: string;
  success: boolean;
  error?: string;
}

const BLOCKCHAIN_ASSETS_DIR = path.join(__dirname, '../assets/blockchain');
const CLOUDINARY_FOLDER = 'blockchain';

/**
 * Upload a single file to Cloudinary
 */
async function uploadFile(filePath: string, fileName: string): Promise<UploadResult> {
  try {
    console.log(`📤 Uploading ${fileName}...`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_FOLDER,
      public_id: fileName.replace('.svg', ''),
      resource_type: 'image',
      format: 'svg',
      overwrite: true,
      invalidate: true, // Invalidate CDN cache
      transformation: [
        { fetch_format: 'auto' }, // Serve as SVG
        { quality: 'auto' },
      ],
    });

    console.log(`✅ Uploaded: ${result.secure_url}`);

    return {
      fileName,
      cloudinaryUrl: result.secure_url,
      success: true,
    };
  } catch (error) {
    console.error(`❌ Failed to upload ${fileName}:`, (error as Error).message);
    return {
      fileName,
      cloudinaryUrl: '',
      success: false,
      error: (error as Error).message,
    };
  }
}

/**
 * Main upload function
 */
async function uploadAllBlockchainImages(): Promise<void> {
  console.log('🚀 Starting blockchain images upload to Cloudinary...\n');

  // Check if directory exists
  if (!fs.existsSync(BLOCKCHAIN_ASSETS_DIR)) {
    console.error(`❌ Directory not found: ${BLOCKCHAIN_ASSETS_DIR}`);
    process.exit(1);
  }

  // Get all SVG files
  const files = fs
    .readdirSync(BLOCKCHAIN_ASSETS_DIR)
    .filter((file) => file.endsWith('.svg'))
    .sort();

  if (files.length === 0) {
    console.error('❌ No SVG files found in assets/blockchain');
    process.exit(1);
  }

  console.log(`📁 Found ${files.length} SVG files to upload\n`);

  // Upload all files
  const results: UploadResult[] = [];

  for (const file of files) {
    const filePath = path.join(BLOCKCHAIN_ASSETS_DIR, file);
    const result = await uploadFile(filePath, file);
    results.push(result);
  }

  // Print summary
  console.log('\n📊 Upload Summary:');
  console.log('═'.repeat(80));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Successful uploads: ${successful.length}/${results.length}`);

  if (successful.length > 0) {
    console.log('\n📝 Cloudinary URLs:');
    console.log('-'.repeat(80));
    successful.forEach((result) => {
      console.log(`${result.fileName.padEnd(25)} → ${result.cloudinaryUrl}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed uploads: ${failed.length}`);
    failed.forEach((result) => {
      console.log(`  - ${result.fileName}: ${result.error}`);
    });
  }

  console.log('\n' + '═'.repeat(80));

  // Generate SQL snippets for easy database updates
  if (successful.length > 0) {
    console.log('\n📄 SQL Update Snippets (for reference):');
    console.log('-'.repeat(80));
    console.log('\n-- Update existing records with iconUrl:');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME';

    successful.forEach((result) => {
      const fileName = result.fileName.replace('.svg', '');
      const [blockchain, network] = fileName.split('-');

      // Map file names to blockchain constants
      const blockchainMap: Record<string, string> = {
        matic: 'POLYGON',
        arb: 'ARBITRUM',
        base: 'BASE',
        eth: 'ETHEREUM',
        bnb: 'BSC',
        solana: 'SOLANA',
        tron: 'TRON',
      };

      const blockchainName = blockchainMap[blockchain] || blockchain.toUpperCase();
      console.log(`-- ${fileName}`);
      console.log(
        `UPDATE alchemy_network_config SET iconUrl = '${result.cloudinaryUrl}' WHERE blockchain = '${blockchainName}' AND network = '${network}';`,
      );
    });

    console.log('\n');
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

// Run the script
uploadAllBlockchainImages()
  .then(() => {
    console.log('✨ Upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Upload failed:', error);
    process.exit(1);
  });
