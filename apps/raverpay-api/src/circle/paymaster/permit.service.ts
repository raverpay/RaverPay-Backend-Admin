import { Injectable, Logger } from '@nestjs/common';
import { maxUint256, encodePacked, parseErc6492Signature } from 'viem';

/**
 * EIP-2612 Permit Service
 * Handles USDC permit signing for Paymaster allowance
 */
@Injectable()
export class PermitService {
  private readonly logger = new Logger(PermitService.name);

  /**
   * EIP-2612 ABI with nonces and version functions
   */
  private readonly eip2612Abi = [
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'value', type: 'uint256' },
        { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        { internalType: 'uint8', name: 'v', type: 'uint8' },
        { internalType: 'bytes32', name: 'r', type: 'bytes32' },
        { internalType: 'bytes32', name: 's', type: 'bytes32' },
      ],
      name: 'permit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
      name: 'nonces',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    },
    {
      inputs: [],
      name: 'version',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  /**
   * Generate EIP-2612 permit typed data for USDC
   */
  async generatePermitTypedData(params: {
    tokenAddress: string;
    tokenName: string;
    tokenVersion: string;
    chainId: number;
    ownerAddress: string;
    spenderAddress: string;
    value: bigint;
    nonce: bigint;
  }) {
    const {
      tokenAddress,
      tokenName,
      tokenVersion,
      chainId,
      ownerAddress,
      spenderAddress,
      value,
      nonce,
    } = params;

    return {
      types: {
        // Required for compatibility with Circle PW Sign Typed Data API
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      domain: {
        name: tokenName,
        version: tokenVersion,
        chainId,
        verifyingContract: tokenAddress,
      },
      message: {
        owner: ownerAddress,
        spender: spenderAddress,
        value: value.toString(),
        nonce: nonce.toString(),
        // The paymaster cannot access block.timestamp due to 4337 opcode
        // restrictions, so the deadline must be MAX_UINT256.
        deadline: maxUint256.toString(),
      },
    };
  }

  /**
   * Parse permit signature from ERC-6492 wrapped signature
   */
  parsePermitSignature(wrappedSignature: `0x${string}`): `0x${string}` {
    try {
      const { signature } = parseErc6492Signature(wrappedSignature);
      return signature;
    } catch (error) {
      this.logger.warn(
        'Failed to parse ERC-6492 signature, using raw signature',
      );
      return wrappedSignature;
    }
  }

  /**
   * Encode paymaster data with permit signature
   * Format: [mode (uint8), token (address), amount (uint256), signature (bytes)]
   */
  encodePaymasterData(params: {
    tokenAddress: string;
    permitAmount: bigint;
    permitSignature: `0x${string}`;
  }): `0x${string}` {
    const { tokenAddress, permitAmount, permitSignature } = params;

    return encodePacked(
      ['uint8', 'address', 'uint256', 'bytes'],
      [0, tokenAddress as `0x${string}`, permitAmount, permitSignature],
    );
  }

  /**
   * Get EIP-2612 ABI
   */
  getEip2612Abi() {
    return this.eip2612Abi;
  }
}
