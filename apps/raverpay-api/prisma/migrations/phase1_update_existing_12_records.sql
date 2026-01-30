-- Phase 1.2: Update existing 12 network records with blockchainType and iconUrl
-- All existing networks are EVM-based (Polygon, Arbitrum, Base)

-- Update Polygon mainnet (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763795/blockchain/matic-mainnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'POLYGON' AND "network" = 'mainnet';

-- Update Polygon testnet/amoy (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763797/blockchain/matic-testnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'POLYGON' AND "network" = 'amoy';

-- Update Arbitrum mainnet (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763781/blockchain/arb-mainnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'ARBITRUM' AND "network" = 'mainnet';

-- Update Arbitrum testnet/sepolia (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763782/blockchain/arb-testnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'ARBITRUM' AND "network" = 'sepolia';

-- Update Base mainnet (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763784/blockchain/base-mainnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'BASE' AND "network" = 'mainnet';

-- Update Base testnet/sepolia (USDC)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763785/blockchain/base-testnet.svg'
WHERE "tokenType" = 'USDC' AND "blockchain" = 'BASE' AND "network" = 'sepolia';

-- Update Polygon mainnet (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763795/blockchain/matic-mainnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'POLYGON' AND "network" = 'mainnet';

-- Update Polygon testnet/amoy (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763797/blockchain/matic-testnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'POLYGON' AND "network" = 'amoy';

-- Update Arbitrum mainnet (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763781/blockchain/arb-mainnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'ARBITRUM' AND "network" = 'mainnet';

-- Update Arbitrum testnet/sepolia (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763782/blockchain/arb-testnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'ARBITRUM' AND "network" = 'sepolia';

-- Update Base mainnet (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763784/blockchain/base-mainnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'BASE' AND "network" = 'mainnet';

-- Update Base testnet/sepolia (USDT)
UPDATE alchemy_network_config
SET 
  "blockchainType" = 'EVM',
  "iconUrl" = 'https://res.cloudinary.com/db9jqfl6u/image/upload/v1769763785/blockchain/base-testnet.svg'
WHERE "tokenType" = 'USDT' AND "blockchain" = 'BASE' AND "network" = 'sepolia';

-- Verification query
SELECT 
  "tokenType", 
  "blockchain", 
  "network", 
  "blockchainType",
  "iconUrl",
  "isEnabled",
  "displayOrder"
FROM alchemy_network_config
ORDER BY "displayOrder";
