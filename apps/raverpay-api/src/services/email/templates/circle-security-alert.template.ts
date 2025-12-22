/**
 * Circle Security Alert Email Template
 * Used for security-related notifications (large transactions, suspicious activity, etc.)
 */

interface CircleSecurityAlertDetails {
  userName: string;
  alertType:
    | 'LARGE_TRANSACTION'
    | 'SUSPICIOUS_ACTIVITY'
    | 'WALLET_FROZEN'
    | 'WALLET_UNFROZEN'
    | 'LOW_BALANCE';
  title: string;
  message: string;
  details?: Record<string, string>;
  actionRequired?: boolean;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
}

export function circleSecurityAlertTemplate(
  details: CircleSecurityAlertDetails,
): {
  subject: string;
  html: string;
} {
  const alertIcons = {
    LARGE_TRANSACTION: '💰',
    SUSPICIOUS_ACTIVITY: '⚠️',
    WALLET_FROZEN: '🔒',
    WALLET_UNFROZEN: '🔓',
    LOW_BALANCE: '📊',
  };

  const alertColors = {
    LARGE_TRANSACTION: '#5b55f6',
    SUSPICIOUS_ACTIVITY: '#ef4444',
    WALLET_FROZEN: '#ef4444',
    WALLET_UNFROZEN: '#10b981',
    LOW_BALANCE: '#f59e0b',
  };

  const icon = alertIcons[details.alertType];
  const color = alertColors[details.alertType];
  const subject = `${icon} ${details.title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${details.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: ${color}; padding: 35px 30px; text-align: center; border-radius: 16px 16px 0 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                ${details.title}
            </h1>
        </div>

        <!-- Main Content -->
        <div style="background: #ffffff; padding: 35px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Greeting -->
            <p style="color: #1e293b; font-size: 16px; margin: 0 0 25px 0;">
                Hi <strong>${details.userName}</strong>,
            </p>

            <!-- Alert Message -->
            <div style="background: ${details.alertType === 'WALLET_UNFROZEN' || details.alertType === 'LOW_BALANCE' ? '#fefce8' : '#fef2f2'}; border-left: 4px solid ${color}; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: ${details.alertType === 'WALLET_UNFROZEN' ? '#15803d' : details.alertType === 'LOW_BALANCE' ? '#92400e' : '#dc2626'}; margin: 0; font-size: 15px; line-height: 1.6;">
                    ${details.message}
                </p>
            </div>

            ${
              details.details && Object.keys(details.details).length > 0
                ? `
            <!-- Details -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                <h2 style="color: #334155; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
                    Details
                </h2>
                ${Object.entries(details.details)
                  .map(
                    ([key, value]) => `
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 15px;">${key}</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${value}
                    </span>
                </div>
                `,
                  )
                  .join('')}
                <div style="display: flex; justify-content: space-between; padding: 12px 0;">
                    <span style="color: #64748b; font-size: 15px;">Time</span>
                    <span style="color: #1e293b; font-weight: 600; font-size: 15px;">
                        ${details.timestamp}
                    </span>
                </div>
            </div>
            `
                : ''
            }

            ${
              details.actionRequired && details.actionUrl && details.actionText
                ? `
            <!-- Action Required -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">
                    Action Required
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${details.actionUrl}" style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
                    ${details.actionText}
                </a>
            </div>
            `
                : ''
            }

            <!-- Security Tips -->
            ${
              details.alertType === 'SUSPICIOUS_ACTIVITY' ||
              details.alertType === 'LARGE_TRANSACTION'
                ? `
            <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="color: #1e40af; margin: 0 0 10px 0; font-size: 15px; font-weight: 600;">
                    Security Tips
                </p>
                <ul style="color: #1e3a8a; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>If you didn't authorize this activity, contact support immediately</li>
                    <li>Never share your account credentials or verification codes</li>
                    <li>Enable two-factor authentication for added security</li>
                    <li>Review your recent transactions regularly</li>
                </ul>
            </div>
            `
                : ''
            }

            <!-- Help Text -->
            <p style="color: #64748b; font-size: 14px; text-align: center; margin: 25px 0 0 0; line-height: 1.6;">
                Questions or concerns? Contact our support team at
                <a href="mailto:support@raverpay.com" style="color: #5b55f6; text-decoration: none;">support@raverpay.com</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 25px 20px; color: #94a3b8; font-size: 13px;">
            <p style="margin: 0 0 10px 0;">
                This is an automated security notification from Raverpay.<br>
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
