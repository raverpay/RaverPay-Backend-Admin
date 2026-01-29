import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface NetworkConfigData {
  tokenType: string;
  tokenName: string;
  tokenSymbol: string;
  blockchain: string;
  blockchainName: string;
  network: string;
  networkLabel: string;
  isTestnet: boolean;
  isEnabled: boolean;
  displayOrder: number;
  tokenAddress: string;
  decimals: number;
}

async function seedNetworkConfig() {
  const configs: NetworkConfigData[] = [
    // USDT - Polygon
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'mainnet',
      networkLabel: 'Polygon Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 1,
      tokenAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'amoy',
      networkLabel: 'Polygon Amoy Testnet',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 2,
      tokenAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // Testnet USDT
      decimals: 6,
    },
    // USDT - Arbitrum
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'mainnet',
      networkLabel: 'Arbitrum Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 3,
      tokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'sepolia',
      networkLabel: 'Arbitrum Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 4,
      tokenAddress: '0x...', // USDT on Arbitrum Sepolia (placeholder)
      decimals: 6,
    },
    // USDT - Base
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'mainnet',
      networkLabel: 'Base Mainnet',
      isTestnet: false,
      isEnabled: false, // Disabled until available
      displayOrder: 5,
      tokenAddress: '0x...', // USDT on Base (not yet available)
      decimals: 6,
    },
    {
      tokenType: 'USDT',
      tokenName: 'Tether USD',
      tokenSymbol: 'USDT',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'sepolia',
      networkLabel: 'Base Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 6,
      tokenAddress: '0x...', // USDT on Base Sepolia (placeholder)
      decimals: 6,
    },
    // USDC - Polygon
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'mainnet',
      networkLabel: 'Polygon Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 7,
      tokenAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC on Polygon (Native)
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'POLYGON',
      blockchainName: 'Polygon',
      network: 'amoy',
      networkLabel: 'Polygon Amoy Testnet',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 8,
      tokenAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', // USDC on Amoy
      decimals: 6,
    },
    // USDC - Arbitrum
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'mainnet',
      networkLabel: 'Arbitrum Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 9,
      tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum (Native)
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'ARBITRUM',
      blockchainName: 'Arbitrum',
      network: 'sepolia',
      networkLabel: 'Arbitrum Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 10,
      tokenAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // USDC on Arbitrum Sepolia
      decimals: 6,
    },
    // USDC - Base
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'mainnet',
      networkLabel: 'Base Mainnet',
      isTestnet: false,
      isEnabled: true,
      displayOrder: 11,
      tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
      decimals: 6,
    },
    {
      tokenType: 'USDC',
      tokenName: 'USD Coin',
      tokenSymbol: 'USDC',
      blockchain: 'BASE',
      blockchainName: 'Base',
      network: 'sepolia',
      networkLabel: 'Base Sepolia',
      isTestnet: true,
      isEnabled: true,
      displayOrder: 12,
      tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
      decimals: 6,
    },
  ];

  for (const config of configs) {
    await prisma.alchemyNetworkConfig.upsert({
      where: {
        tokenType_blockchain_network: {
          tokenType: config.tokenType,
          blockchain: config.blockchain,
          network: config.network,
        },
      },
      update: config,
      create: config,
    });
  }

  console.log('✅ Alchemy Network Config seeded successfully');
  console.log(`   Created/Updated ${configs.length} network configurations`);
}

seedNetworkConfig()
  .catch((e) => {
    console.error('❌ Error seeding network config:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
