/**
 * Circle CCTP Transfer Email Template
 * Used for cross-chain USDC transfers via Circle's CCTP
 */

interface CCTPTransferDetails {
  userName: string;
  amount: string;
  sourceChain: string;
  destinationChain: string;
  status:
    | 'INITIATED'
    | 'BURN_PENDING'
    | 'BURN_COMPLETE'
    | 'ATTESTATION_PENDING'
    | 'MINT_PENDING'
    | 'COMPLETE'
    | 'FAILED';
  burnTxHash?: string;
  mintTxHash?: string;
  attestationHash?: string;
  timestamp: string;
  estimatedTime?: string;
  errorReason?: string;
  burnFee?: string;
  mintFee?: string;
}

export function cctpTransferTemplate(details: CCTPTransferDetails): {
  subject: string;
  html: string;
} {
  const statusIcons = {
    INITIATED: '🚀',
    BURN_PENDING: '⏳',
    BURN_COMPLETE: '🔥',
    ATTESTATION_PENDING: '📝',
    MINT_PENDING: '⏳',
    COMPLETE: '✅',
    FAILED: '❌',
  };

  const statusColors = {
    INITIATED: '#3b82f6',
    BURN_PENDING: '#fbbf24',
    BURN_COMPLETE: '#f59e0b',
    ATTESTATION_PENDING: '#8b5cf6',
    MINT_PENDING: '#fbbf24',
    COMPLETE: '#10b981',
    FAILED: '#ef4444',
  };

  const statusText = {
    INITIATED: 'Transfer Initiated',
    BURN_PENDING: 'Burning USDC',
    BURN_COMPLETE: 'Burn Complete',
    ATTESTATION_PENDING: 'Awaiting Attestation',
    MINT_PENDING: 'Minting USDC',
    COMPLETE: 'Transfer Complete',
    FAILED: 'Transfer Failed',
  };

  const blockchainNames: Record<string, string> = {
    ETH: 'Ethereum',
    'ETH-SEPOLIA': 'Ethereum Sepolia',
    MATIC: 'Polygon',
    'MATIC-AMOY': 'Polygon Amoy',
    ARB: 'Arbitrum',
    'ARB-SEPOLIA': 'Arbitrum Sepolia',
    AVAX: 'Avalanche',
    'AVAX-FUJI': 'Avalanche Fuji',
  };

  const icon = statusIcons[details.status];
  const color = statusColors[details.status];
  const status = statusText[details.status];
  const sourceChainName =
    blockchainNames[details.sourceChain] || details.sourceChain;
  const destChainName =
    blockchainNames[details.destinationChain] || details.destinationChain;

  const subject =
    details.status === 'COMPLETE'
      ? `✅ Cross-Chain Transfer Complete: $${details.amount} USDC`
      : details.status === 'FAILED'
        ? `❌ Cross-Chain Transfer Failed`
        : `${icon} Cross-Chain Transfer ${status}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CCTP Transfer ${status}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #5b55f6 0%, #8b5cf6 100%); padding: 35px 30px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Cross-Chain Transfer
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">
                $${details.amount} USDC • ${status}
            </p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 35px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Greeting -->
            <p style="color: #1e293b; font-size: 16px; margin: 0 0 25px 0;">
                Hi <strong>${details.userName}</strong>,
            </p>

            <!-- Transfer Route -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <div style="text-align: center;">
                    <div style="display: inline-block; background: #5b55f6; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-bottom: 15px;">
                        $${details.amount} USDC
                    </div>
                    <div style="margin: 20px 0;">
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">FROM</div>
                        <div style="color: #1e293b; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
                            ${sourceChainName}
                        </div>
                        <div style="color: #94a3b8; font-size: 24px; margin: 15px 0;">↓</div>
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 8px;">TO</div>
                        <div style="color: #1e293b; font-size: 18px; font-weight: 600;">
                            ${destChainName}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transfer Progress -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="color: #334155; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    Transfer Progress
                </h2>

                <!-- Progress Steps -->
                <div style="margin: 20px 0;">
                    <!-- Step 1: Burn -->
                    <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                        <div style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: ${['BURN_COMPLETE', 'ATTESTATION_PENDING', 'MINT_PENDING', 'COMPLETE'].includes(details.status) ? '#10b981' : details.status === 'BURN_PENDING' ? '#fbbf24' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                            <span style="color: white; font-size: 16px;">${['BURN_COMPLETE', 'ATTESTATION_PENDING', 'MINT_PENDING', 'COMPLETE'].includes(details.status) ? '✓' : details.status === 'BURN_PENDING' ? '⏳' : '1'}</span>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Burn on ${sourceChainName}</div>
                            <div style="font-size: 14px; color: #64748b;">USDC burned on source chain</div>
                            ${
                              details.burnTxHash
                                ? `<div style="font-size: 13px; color: #5b55f6; margin-top: 4px; font-family: monospace;">${details.burnTxHash.substring(0, 10)}...${details.burnTxHash.substring(details.burnTxHash.length - 8)}</div>`
                                : ''
                            }
                        </div>
                    </div>

                    <!-- Step 2: Attestation -->
                    <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                        <div style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: ${['COMPLETE'].includes(details.status) ? '#10b981' : details.status === 'ATTESTATION_PENDING' ? '#fbbf24' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                            <span style="color: white; font-size: 16px;">${['COMPLETE'].includes(details.status) ? '✓' : details.status === 'ATTESTATION_PENDING' ? '⏳' : '2'}</span>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Circle Attestation</div>
                            <div style="font-size: 14px; color: #64748b;">Verifying cross-chain transfer</div>
                        </div>
                    </div>

                    <!-- Step 3: Mint -->
                    <div style="display: flex; align-items: flex-start;">
                        <div style="flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; background: ${details.status === 'COMPLETE' ? '#10b981' : details.status === 'MINT_PENDING' ? '#fbbf24' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                            <span style="color: white; font-size: 16px;">${details.status === 'COMPLETE' ? '✓' : details.status === 'MINT_PENDING' ? '⏳' : '3'}</span>
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Mint on ${destChainName}</div>
                            <div style="font-size: 14px; color: #64748b;">USDC minted on destination chain</div>
                            ${
                              details.mintTxHash
                                ? `<div style="font-size: 13px; color: #5b55f6; margin-top: 4px; font-family: monospace;">${details.mintTxHash.substring(0, 10)}...${details.mintTxHash.substring(details.mintTxHash.length - 8)}</div>`
                                : ''
                            }
                        </div>
                    </div>
                </div>

                <!-- Current Status -->
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #64748b; font-size: 15px;">Current Status</span>
                        <span style="color: ${color}; font-weight: 600; font-size: 15px;">
                            ${icon} ${status}
                        </span>
                    </div>
                    ${
                      details.estimatedTime
                        ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                        <span style="color: #64748b; font-size: 15px;">Estimated Time</span>
                        <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                            ${details.estimatedTime}
                        </span>
                    </div>
                    `
                        : ''
                    }
                </div>
            </div>

            <!-- Fees -->
            ${
              details.burnFee || details.mintFee
                ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                <h3 style="color: #334155; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">Network Fees</h3>
                ${
                  details.burnFee
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #64748b; font-size: 14px;">Burn Fee (${sourceChainName})</span>
                    <span style="color: #1e293b; font-weight: 500; font-size: 14px;">${details.burnFee}</span>
                </div>
                `
                    : ''
                }
                ${
                  details.mintFee
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #64748b; font-size: 14px;">Mint Fee (${destChainName})</span>
                    <span style="color: #1e293b; font-weight: 500; font-size: 14px;">${details.mintFee}</span>
                </div>
                `
                    : ''
                }
            </div>
            `
                : ''
            }

            <!-- Status Message -->
            ${
              details.status === 'COMPLETE'
                ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #15803d; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>✅ Transfer Complete!</strong><br>
                    Your USDC has been successfully transferred from ${sourceChainName} to ${destChainName}. The funds are now available in your wallet.
                </p>
            </div>
            `
                : details.status === 'FAILED'
                  ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #dc2626; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>❌ Transfer Failed</strong><br>
                    ${details.errorReason || 'Your cross-chain transfer could not be completed. Please contact support for assistance.'}
                </p>
            </div>
            `
                  : `
            <div style="background: #fefce8; border-left: 4px solid #fbbf24; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #a16207; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>⏳ Transfer In Progress</strong><br>
                    Your cross-chain transfer is being processed. This typically takes 10-20 minutes. We'll notify you once it's complete.
                </p>
            </div>
            `
            }

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="raverpay://app/crypto/cctp-transfers" style="display: inline-block; background: #5b55f6; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(91, 85, 246, 0.3);">
                    View Transfer Details
                </a>
            </div>

            <!-- Help Text -->
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 25px 0 0 0; line-height: 1.6;">
                Need help? Contact our support team at
                <a href="mailto:support@raverpay.com" style="color: #5b55f6; text-decoration: none;">support@raverpay.com</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 25px 20px; color: #94a3b8; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
                This is an automated notification from Raverpay.<br>
                Please do not reply to this email.
            </p>
            <p style="margin: 0;">
                © ${new Date().getFullYear()} Raverpay. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `;

  return { subject, html };
}
