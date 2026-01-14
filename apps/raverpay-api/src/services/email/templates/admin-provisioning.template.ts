/**
 * Admin provisioning email template
 * Sent when provisioning an admin account (adding IP, MFA setup, etc.)
 */
export function adminProvisioningEmailTemplate(data: {
  firstName: string;
  email: string;
  loginUrl: string;
  ipAddress: string;
  ipWhitelistStatus: string;
  mfaStatus: string;
  hasMfaQrCode: boolean;
  passwordResetUrl?: string;
}): {
  html: string;
  subject: string;
} {
  const subject = 'RaverPay Admin Account Provisioning Update';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Account Provisioning</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Container -->
              <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" cellpadding="0" cellspacing="0">
                
                <!-- Header -->
                <tr>
                  <td style="background: #5b55f6; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                    <h2 style="margin: 15px 0 0 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                      Admin Account Provisioning Update
                    </h2>
                    <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                      Your admin account has been updated
                    </p>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; font-size: 18px; color: #333333; line-height: 1.6;">
                      Hi <strong>${data.firstName}</strong>! 
                    </p>
                    
                    <p style="margin: 0 0 25px 0; font-size: 16px; color: #666666; line-height: 1.6;">
                      Your admin account has been provisioned with the following updates:
                    </p>
                    
                    <!-- Login Credentials Reminder -->
                    <div style="background: #f8f9fa; border-left: 4px solid #5b55f6; padding: 20px; border-radius: 6px; margin: 30px 0;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; font-weight: 600;">
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
                        LOGIN CREDENTIALS<br>
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      </h3>
                      <p style="margin: 10px 0 5px 0; font-size: 15px; color: #333333;">
                        <strong>Email:</strong> ${data.email}
                      </p>
                      <p style="margin: 5px 0 5px 0; font-size: 15px; color: #333333;">
                        <strong>Login URL:</strong> <a href="${data.loginUrl}" style="color: #5b55f6; text-decoration: none;">${data.loginUrl}</a>
                      </p>
                      ${
                        data.passwordResetUrl
                          ? `
                        <p style="margin: 15px 0 5px 0; font-size: 15px; color: #333333;">
                          <strong>Forgot Password?</strong> <a href="${data.passwordResetUrl}" style="color: #5b55f6; text-decoration: none;">Reset your password here</a>
                        </p>
                      `
                          : ''
                      }
                    </div>
                    
                    <!-- IP Whitelist Status -->
                    <div style="background: #f8f9fa; border-left: 4px solid #5b55f6; padding: 20px; border-radius: 6px; margin: 30px 0;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; font-weight: 600;">
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
                        IP WHITELIST STATUS<br>
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      </h3>
                      <p style="margin: 10px 0 5px 0; font-size: 15px; color: #333333;">
                        <strong>IP Address:</strong> ${data.ipAddress}
                      </p>
                      <p style="margin: 5px 0 0 0; font-size: 15px; color: #333333;">
                        <strong>Status:</strong> ${data.ipWhitelistStatus}
                      </p>
                      <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
                        ✅ Your IP address has been added to the whitelist. You can now access the admin dashboard from this IP.
                      </p>
                    </div>
                    
                    <!-- MFA Status -->
                    <div style="background: #f8f9fa; border-left: 4px solid #5b55f6; padding: 20px; border-radius: 6px; margin: 30px 0;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; font-weight: 600;">
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
                        MFA STATUS<br>
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      </h3>
                      <p style="margin: 10px 0 5px 0; font-size: 15px; color: #333333;">
                        <strong>Status:</strong> ${data.mfaStatus}
                      </p>
                      ${
                        data.hasMfaQrCode
                          ? `
                        <p style="margin: 15px 0 5px 0; font-size: 15px; color: #333333;">
                          <strong>MFA QR Code:</strong> Attached to this email. Scan with your authenticator app to complete setup.
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666; line-height: 1.5;">
                          📱 Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan the QR code.
                        </p>
                      `
                          : ''
                      }
                    </div>
                    
                    <!-- Next Steps Section -->
                    <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; border-radius: 6px; margin: 30px 0;">
                      <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #333333; font-weight: 600;">
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br>
                        NEXT STEPS<br>
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      </h3>
                      <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #333333; font-size: 15px; line-height: 1.8;">
                        <li>Log in using your credentials at ${data.loginUrl}</li>
                        ${data.hasMfaQrCode ? '<li>Set up MFA using the QR code attached to this email</li>' : '<li>Complete MFA setup if not already done</li>'}
                        <li>Verify you can access the admin dashboard from your IP address</li>
                        <li>Contact IT support if you encounter any issues</li>
                      </ol>
                    </div>
                    
                    <!-- Help Section -->
                    <p style="margin: 30px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                      Need help? Contact your system administrator or IT support.
                    </p>
                    
                    <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666;">
                      Best regards,<br>
                      <strong>The RaverPay Team</strong>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 15px 0; color: #666666; font-size: 14px; font-weight: 600;">
                      RaverPay Admin Dashboard
                    </p>
                    <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                      <strong>RaverPay</strong>
                    </p>
                    <p style="margin: 0 0 15px 0; color: #999999; font-size: 12px;">
                      Lagos, Nigeria
                    </p>
                    <p style="margin: 0; color: #cccccc; font-size: 11px;">
                      © ${new Date().getFullYear()} RaverPay. All rights reserved.
                    </p>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { html, subject };
}
