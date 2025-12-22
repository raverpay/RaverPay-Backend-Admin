/**
 * Circle Wallet Created Email Template
 * Used when a user successfully creates a Circle USDC wallet
 */

interface CircleWalletCreatedDetails {
  userName: string;
  walletAddress: string;
  blockchain: string;
  accountType: 'SCA' | 'EOA';
  walletName?: string;
  timestamp: string;
}

export function circleWalletCreatedTemplate(
  details: CircleWalletCreatedDetails,
): {
  subject: string;
  html: string;
} {
  const subject = `Your ${details.blockchain} USDC Wallet is Ready!`;

  const accountTypeDescription = {
    SCA: 'Smart Contract Account - Enhanced security with programmable features',
    EOA: 'Externally Owned Account - Direct blockchain control',
  };

  const blockchainNames: Record<string, string> = {
    ETH: 'Ethereum',
    'ETH-SEPOLIA': 'Ethereum Sepolia Testnet',
    MATIC: 'Polygon',
    'MATIC-AMOY': 'Polygon Amoy Testnet',
    ARB: 'Arbitrum',
    'ARB-SEPOLIA': 'Arbitrum Sepolia Testnet',
    SOL: 'Solana',
    'SOL-DEVNET': 'Solana Devnet',
    AVAX: 'Avalanche',
    'AVAX-FUJI': 'Avalanche Fuji Testnet',
  };

  const blockchainExplorerUrls: Record<string, string> = {
    ETH: 'https://etherscan.io/address/',
    'ETH-SEPOLIA': 'https://sepolia.etherscan.io/address/',
    MATIC: 'https://polygonscan.com/address/',
    'MATIC-AMOY': 'https://amoy.polygonscan.com/address/',
    ARB: 'https://arbiscan.io/address/',
    'ARB-SEPOLIA': 'https://sepolia.arbiscan.io/address/',
    SOL: 'https://explorer.solana.com/address/',
    'SOL-DEVNET':
      'https://explorer.solana.com/address/?cluster=devnet&address=',
    AVAX: 'https://snowtrace.io/address/',
    'AVAX-FUJI': 'https://testnet.snowtrace.io/address/',
  };

  const blockchainName =
    blockchainNames[details.blockchain] || details.blockchain;
  const explorerUrl = blockchainExplorerUrls[details.blockchain]
    ? `${blockchainExplorerUrls[details.blockchain]}${details.walletAddress}`
    : null;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Circle Wallet Created</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: #5b55f6; padding: 35px 30px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                USDC Wallet Created!
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 16px;">
                Your ${blockchainName} wallet is ready to use
            </p>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 35px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Greeting -->
            <p style="color: #1e293b; font-size: 16px; margin: 0 0 25px 0;">
                Hi <strong>${details.userName}</strong>,
            </p>f

            <p style="color: #475569; font-size: 15px; margin: 0 0 25px 0; line-height: 1.6;">
                Great news! Your Circle USDC wallet has been successfully created and is ready to use. You can now send, receive, and manage USDC (USD Coin) on the ${blockchainName} network.
            </p>

            <!-- Wallet Details Card -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="color: #334155; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    Wallet Details
                </h2>
                
                <!-- Wallet Address -->
                <div style="margin-bottom: 20px;">
                    <div style="color: #64748b; font-size: 13px; margin-bottom: 6px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                        Wallet Address
                    </div>
                    <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #1e293b; word-break: break-all;">
                        ${details.walletAddress}
                    </div>
                    ${
                      explorerUrl
                        ? `
                    <div style="margin-top: 8px;">
                        <a href="${explorerUrl}" style="color: #10b981; font-size: 13px; text-decoration: none; font-weight: 500;">
                            View on ${blockchainName} Explorer →
                        </a>
                    </div>
                    `
                        : ''
                    }
                </div>

                <!-- Network -->
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Network</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${blockchainName}
                    </span>
                </div>

                <!-- Account Type -->
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Account Type</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.accountType}
                    </span>
                </div>

                <!-- Wallet Name -->
                ${
                  details.walletName
                    ? `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">Wallet Name</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.walletName}
                    </span>
                </div>
                `
                    : ''
                }

                <!-- Created At -->
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span style="color: #64748b; font-size: 15px;">Created</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.timestamp}
                    </span>
                </div>
            </div>

            <!-- Info Box -->
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #15803d; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                    About ${details.accountType}
                </p>
                <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
                    ${accountTypeDescription[details.accountType]}
                </p>
            </div>

            <!-- What's Next Section -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #92400e; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                    What's Next?
                </p>
                <ul style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Fund your wallet by sending USDC to your wallet address</li>
                    <li>Start making instant, low-cost USDC transfers</li>
                    <li>Use USDC for payments, savings, or cross-border transactions</li>
                    <li>Bridge USDC across different blockchains using CCTP</li>
                </ul>
            </div>

            <!-- Security Notice -->
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                 Security Reminder
                </p>
                <ul style="color: #7f1d1d; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Never share your wallet's private keys or recovery phrase</li>
                    <li>Always verify the recipient address before sending funds</li>
                    <li>Enable two-factor authentication on your account</li>
                    <li>Be cautious of phishing attempts and suspicious links</li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="raverpay://app/crypto/wallets" style="display: inline-block; background: #5b55f6; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    View My Wallet
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
