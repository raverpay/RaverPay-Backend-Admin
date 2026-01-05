/**
 * Circle USDC Transaction Email Template
 * Used for USDC send/receive transactions
 */

interface CircleTransactionDetails {
  userName: string;
  transactionType: 'SEND' | 'RECEIVE';
  amount: string;
  usdValue?: string;
  fromAddress?: string;
  toAddress: string;
  transactionHash?: string;
  blockchain: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETE' | 'FAILED';
  timestamp: string;
  networkFee?: string;
  networkFeeUsd?: string;
  confirmations?: number;
  errorReason?: string;
}

export function circleUsdcTransactionTemplate(
  details: CircleTransactionDetails,
): {
  subject: string;
  html: string;
} {
  const statusIcons = {
    PENDING: '⏳',
    CONFIRMED: '✅',
    COMPLETE: '✅',
    FAILED: '❌',
  };

  const statusColors = {
    PENDING: '#fbbf24',
    CONFIRMED: '#10b981',
    COMPLETE: '#10b981',
    FAILED: '#ef4444',
  };

  const statusText = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    COMPLETE: details.transactionType === 'SEND' ? 'Sent' : 'Received',
    FAILED: 'Failed',
  };

  const blockchainNames: Record<string, string> = {
    ETH: 'Ethereum',
    'ETH-SEPOLIA': 'Ethereum Sepolia',
    MATIC: 'Polygon',
    'MATIC-AMOY': 'Polygon Amoy',
    ARB: 'Arbitrum',
    'ARB-SEPOLIA': 'Arbitrum Sepolia',
    SOL: 'Solana',
    'SOL-DEVNET': 'Solana Devnet',
    AVAX: 'Avalanche',
    'AVAX-FUJI': 'Avalanche Fuji',
  };

  const blockchainExplorerUrls: Record<string, string> = {
    ETH: 'https://etherscan.io/tx/',
    'ETH-SEPOLIA': 'https://sepolia.etherscan.io/tx/',
    MATIC: 'https://polygonscan.com/tx/',
    'MATIC-AMOY': 'https://amoy.polygonscan.com/tx/',
    ARB: 'https://arbiscan.io/tx/',
    'ARB-SEPOLIA': 'https://sepolia.arbiscan.io/tx/',
    SOL: 'https://explorer.solana.com/tx/',
    'SOL-DEVNET': 'https://explorer.solana.com/tx/?cluster=devnet&tx=',
    AVAX: 'https://snowtrace.io/tx/',
    'AVAX-FUJI': 'https://testnet.snowtrace.io/tx/',
  };

  const icon = statusIcons[details.status];
  const color = statusColors[details.status];
  const status = statusText[details.status];
  const blockchainName =
    blockchainNames[details.blockchain] || details.blockchain;
  const explorerUrl =
    details.transactionHash && blockchainExplorerUrls[details.blockchain]
      ? `${blockchainExplorerUrls[details.blockchain]}${details.transactionHash}`
      : null;

  const isReceive = details.transactionType === 'RECEIVE';
  const subject = isReceive
    ? `Received $${details.amount} USDC`
    : `Sent $${details.amount} USDC`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>USDC Transaction ${status}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: ${isReceive ? '#10b981' : '#5b55f6'}; padding: 35px 30px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                ${isReceive ? 'USDC Received' : 'USDC Sent'}
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

            <!-- Amount Card -->
            <div style="background: ${isReceive ? '#f0fdf4' : '#f8fafc'}; border: 2px solid ${isReceive ? '#10b981' : '#5b55f6'}; padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
                <div style="color: #64748b; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                    ${isReceive ? 'You Received' : 'You Sent'}
                </div>
                <div style="color: ${isReceive ? '#10b981' : '#5b55f6'}; font-size: 36px; font-weight: 700; margin-bottom: 4px;">
                    $${details.amount}
                </div>
                <div style="color: #64748b; font-size: 16px; font-weight: 600;">
                    USDC
                </div>
                ${
                  details.usdValue
                    ? `<div style="color: #94a3b8; font-size: 14px; margin-top: 8px;">≈ $${details.usdValue} USD</div>`
                    : ''
                }
            </div>

            <!-- Transaction Details -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="color: #334155; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    Transaction Details
                </h2>

                ${
                  details.fromAddress
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">From</span>
                    <span style="color: #1e293b; font-weight: 500; font-size: 13px; font-family: monospace; word-break: break-all; text-align: right; max-width: 60%;">
                        ${details.fromAddress}
                    </span>
                </div>
                `
                    : ''
                }

                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">To</span>
                    <span style="color: #1e293b; font-weight: 500; font-size: 13px; font-family: monospace; word-break: break-all; text-align: right; max-width: 60%;">
                        ${details.toAddress}
                    </span>
                </div>

                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Network</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${blockchainName}
                    </span>
                </div>

                ${
                  details.transactionHash
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Tx Hash</span>
                    ${
                      explorerUrl
                        ? `<a href="${explorerUrl}" style="color: #5b55f6; font-weight: 500; font-size: 13px; font-family: monospace; text-decoration: none; word-break: break-all; text-align: right; max-width: 60%;">
                        ${details.transactionHash.substring(0, 10)}...${details.transactionHash.substring(details.transactionHash.length - 8)}
                    </a>`
                        : `<span style="color: #1e293b; font-weight: 500; font-size: 13px; font-family: monospace;">
                        ${details.transactionHash.substring(0, 10)}...${details.transactionHash.substring(details.transactionHash.length - 8)}
                    </span>`
                    }
                </div>
                `
                    : ''
                }

                ${
                  details.networkFee
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Network Fee</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.networkFee}${details.networkFeeUsd ? ` ($${details.networkFeeUsd})` : ''}
                    </span>
                </div>
                `
                    : ''
                }

                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Status</span>
                    <span style="color: ${color}; font-weight: 600; font-size: 15px;">
                         ${status}
                    </span>
                </div>

                ${
                  details.confirmations
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Confirmations</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.confirmations}
                    </span>
                </div>
                `
                    : ''
                }

                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span style="color: #64748b; font-size: 15px;">Date & Time</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.timestamp}
                    </span>
                </div>
            </div>

            <!-- Status Message -->
            ${
              details.status === 'COMPLETE' || details.status === 'CONFIRMED'
                ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #15803d; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>Transaction Confirmed</strong><br>
                    ${
                      isReceive
                        ? 'Your USDC has been received and confirmed on the blockchain.'
                        : 'Your USDC has been sent successfully and confirmed on the blockchain.'
                    }
                </p>
            </div>
            `
                : details.status === 'PENDING'
                  ? `
            <div style="background: #fefce8; border-left: 4px solid #fbbf24; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #a16207; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>Transaction Pending</strong><br>
                    Your transaction is being processed on the blockchain. This usually takes 1-3 minutes. You'll receive another notification once it's confirmed.
                </p>
            </div>
            `
                  : `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #dc2626; margin: 0; font-size: 15px; line-height: 1.6;">
                    <strong>Transaction Failed</strong><br>
                    ${details.errorReason || 'Your transaction could not be completed. Please try again or contact support if the issue persists.'}
                </p>
            </div>
            `
            }

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="raverpay://app/crypto/transactions" style="display: inline-block; background: #5b55f6; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(91, 85, 246, 0.3);">
                    View Transaction History
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
