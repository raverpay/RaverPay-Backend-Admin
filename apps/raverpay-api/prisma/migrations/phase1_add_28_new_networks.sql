-- Phase 1.3: Add 28 new network entries for Ethereum, BSC, Solana, and Tron
-- All new networks are initially disabled (isEnabled = false) for safety

-- ===========================
-- USDC MAINNET (3 new networks)
-- ===========================

-- Ethereum Mainnet USDC
INSERT INTO alchemy_network_config (
  "id", "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  gen_random_uuid()::text, 'USDC', 'USD Coin', 'USDC',
  'ETHEREUM', 'Ethereum', 'EVM',
  'mainnet', 'Ethereum Mainnet',
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763791/blockchain/eth-mainnet.svg',
  false, false, 13
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- BSC Mainnet USDC
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDC', 'USD Coin', 'USDC',
  'BSC', 'BNB Smart Chain', 'EVM',
  'mainnet', 'BSC Mainnet',
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763787/blockchain/bnb-mainnet.svg',
  false, false, 14
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Solana Mainnet USDC
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDC', 'USD Coin', 'USDC',
  'SOLANA', 'Solana', 'SOLANA',
  'mainnet', 'Solana Mainnet',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763799/blockchain/solana-mainnet.svg',
  false, false, 15
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- ===========================
-- USDC TESTNET (3 new networks)
-- ===========================

-- Ethereum Sepolia USDC
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDC', 'USD Coin', 'USDC',
  'ETHEREUM', 'Ethereum', 'EVM',
  'sepolia', 'Ethereum Sepolia',
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763793/blockchain/eth-testnet.svg',
  false, true, 16
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- BSC Testnet USDC (uses 18 decimals!)
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDC', 'USD Coin', 'USDC',
  'BSC', 'BNB Smart Chain', 'EVM',
  'testnet', 'BSC Testnet',
  '0x64544969ed7EBf5f083679233325356EbE738930', 18,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763789/blockchain/bnb-testnet.svg',
  false, true, 17
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Solana Devnet USDC
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDC', 'USD Coin', 'USDC',
  'SOLANA', 'Solana', 'SOLANA',
  'devnet', 'Solana Devnet',
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763801/blockchain/solana-testnet.svg',
  false, true, 18
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- ===========================
-- USDT MAINNET (4 new networks)
-- ===========================

-- Ethereum Mainnet USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'ETHEREUM', 'Ethereum', 'EVM',
  'mainnet', 'Ethereum Mainnet',
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763791/blockchain/eth-mainnet.svg',
  false, false, 19
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- BSC Mainnet USDT (uses 18 decimals!)
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'BSC', 'BNB Smart Chain', 'EVM',
  'mainnet', 'BSC Mainnet',
  '0x55d398326f99059fF775485246999027B3197955', 18,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763787/blockchain/bnb-mainnet.svg',
  false, false, 20
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Solana Mainnet USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'SOLANA', 'Solana', 'SOLANA',
  'mainnet', 'Solana Mainnet',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763799/blockchain/solana-mainnet.svg',
  false, false, 21
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Tron Mainnet USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'TRON', 'Tron', 'TRON',
  'mainnet', 'Tron Mainnet',
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763802/blockchain/tron-mainnet.svg',
  false, false, 22
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- ===========================
-- USDT TESTNET (4 new networks)
-- ===========================

-- Ethereum Sepolia USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'ETHEREUM', 'Ethereum', 'EVM',
  'sepolia', 'Ethereum Sepolia',
  '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763793/blockchain/eth-testnet.svg',
  false, true, 23
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- BSC Testnet USDT (uses 18 decimals!)
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'BSC', 'BNB Smart Chain', 'EVM',
  'testnet', 'BSC Testnet',
  '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd', 18,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763789/blockchain/bnb-testnet.svg',
  false, true, 24
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Solana Devnet USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'SOLANA', 'Solana', 'SOLANA',
  'devnet', 'Solana Devnet',
  'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763801/blockchain/solana-testnet.svg',
  false, true, 25
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- Tron Shasta Testnet USDT
INSERT INTO alchemy_network_config (
  "tokenType", "tokenName", "tokenSymbol",
  "blockchain", "blockchainName", "blockchainType",
  "network", "networkLabel",
  "tokenAddress", "decimals",
  "iconUrl",
  "isEnabled", "isTestnet", "displayOrder"
) VALUES (
  'USDT', 'Tether USD', 'USDT',
  'TRON', 'Tron', 'TRON',
  'shasta', 'Tron Shasta Testnet',
  'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', 6,
  'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763803/blockchain/tron-testnet.svg',
  false, true, 26
) ON CONFLICT ("tokenType", "blockchain", "network") DO NOTHING;

-- ===========================
-- Verification Queries
-- ===========================

-- Count total records (should be 40: 12 existing + 28 new)
SELECT COUNT(*) as total_networks FROM alchemy_network_config;

-- Show all networks grouped by blockchain
SELECT 
  "blockchain",
  "blockchainType",
  COUNT(*) as network_count,
  SUM(CASE WHEN "isEnabled" THEN 1 ELSE 0 END) as enabled_count
FROM alchemy_network_config
GROUP BY "blockchain", "blockchainType"
ORDER BY "blockchain";

-- Show all networks
SELECT 
  "displayOrder",
  "tokenType",
  "blockchain",
  "network",
  "blockchainType",
  "isEnabled",
  "isTestnet",
  "decimals",
  LEFT("iconUrl", 60) as icon_preview
FROM alchemy_network_config
ORDER BY "displayOrder";
