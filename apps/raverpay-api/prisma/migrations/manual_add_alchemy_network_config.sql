-- Manual Migration: Add Alchemy Network Config Table
-- Date: 2026-01-29
-- Description: Creates the alchemy_network_config table for managing supported stablecoin networks

-- Create alchemy_network_config table
CREATE TABLE IF NOT EXISTS alchemy_network_config (
    id TEXT NOT NULL,
    "tokenType" TEXT NOT NULL,
    "tokenName" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    "blockchainName" TEXT NOT NULL,
    network TEXT NOT NULL,
    "networkLabel" TEXT NOT NULL,
    "isTestnet" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "tokenAddress" TEXT,
    decimals INTEGER NOT NULL DEFAULT 6,
    metadata JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT alchemy_network_config_pkey PRIMARY KEY (id)
);

-- Create unique constraint on tokenType + blockchain + network
CREATE UNIQUE INDEX IF NOT EXISTS alchemy_network_config_tokenType_blockchain_network_key 
ON alchemy_network_config("tokenType", blockchain, network);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS alchemy_network_config_isEnabled_idx ON alchemy_network_config("isEnabled");
CREATE INDEX IF NOT EXISTS alchemy_network_config_tokenType_idx ON alchemy_network_config("tokenType");
CREATE INDEX IF NOT EXISTS alchemy_network_config_blockchain_idx ON alchemy_network_config(blockchain);
CREATE INDEX IF NOT EXISTS alchemy_network_config_network_idx ON alchemy_network_config(network);
CREATE INDEX IF NOT EXISTS alchemy_network_config_displayOrder_idx ON alchemy_network_config("displayOrder");
