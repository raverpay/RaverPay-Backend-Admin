# Admin Security Guide

## Overview

This guide explains the enhanced security features available for admin users in the RaverPay admin dashboard. These features include Multi-Factor Authentication (MFA), IP Whitelisting, Session Management, and Re-authentication for sensitive operations.

---

## Table of Contents

1. [Multi-Factor Authentication (MFA)](#multi-factor-authentication-mfa)
2. [IP Whitelisting](#ip-whitelisting)
3. [Session Management](#session-management)
4. [Re-authentication](#re-authentication)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Multi-Factor Authentication (MFA)

### What is MFA?

Multi-Factor Authentication adds an extra layer of security to your admin account. After entering your password, you'll need to provide a 6-digit code from your authenticator app (like Google Authenticator, Authy, or 1Password).

### Setting Up MFA

1. **Navigate to Security Settings**
   - Go to Dashboard → Settings → Security
   - Find the "Multi-Factor Authentication" section

2. **Start Setup**
   - Click "Enable MFA"
   - You'll see a QR code and a manual entry key

3. **Scan QR Code**
   - Open your authenticator app
   - Scan the QR code displayed on screen
   - Or manually enter the key if scanning isn't possible

4. **Verify Setup**
   - Enter the 6-digit code from your authenticator app
   - Click "Verify and Enable"

5. **Save Backup Codes**
   - You'll receive 10 backup codes
   - **Important**: Save these codes in a secure location
   - These codes can be used if you lose access to your authenticator app

### Using MFA During Login

1. Enter your email and password as usual
2. If MFA is enabled, you'll be prompted for a 6-digit code
3. Open your authenticator app and enter the current code
4. Click "Verify" to complete login

### Backup Codes

**When to Use:**

- You lost access to your authenticator app
- Your phone is unavailable
- You're setting up a new device

**How to Use:**

- During login, click "Use Backup Code"
- Enter one of your saved backup codes
- **Note**: Each backup code can only be used once

**Regenerating Backup Codes:**

- Go to Settings → Security → MFA
- Click "Regenerate Backup Codes"
- Save the new codes immediately
- Old codes will no longer work

### Disabling MFA

1. Go to Settings → Security → MFA
2. Click "Disable MFA"
3. Enter your password to confirm
4. MFA will be disabled immediately

**⚠️ Warning**: Disabling MFA reduces your account security. Only disable if absolutely necessary.

---

## IP Whitelisting

### What is IP Whitelisting?

IP Whitelisting restricts admin access to specific IP addresses or IP ranges. Only connections from whitelisted IPs can access the admin dashboard.

### Managing IP Whitelist

**Access**: Dashboard → Security → IP Whitelist

### Adding an IP Address

1. Click "Add IP Address"
2. Enter the IP address or CIDR range (e.g., `192.168.1.1` or `192.168.1.0/24`)
3. Add an optional description (e.g., "Office WiFi", "VPN Server")
4. Set status to "Active"
5. Click "Add IP Address"

### Supported Formats

- **Single IP**: `192.168.1.1`
- **CIDR Range**: `192.168.1.0/24` (allows all IPs from 192.168.1.1 to 192.168.1.254)
- **IPv6**: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **IPv6 CIDR**: `2001:0db8::/32`

### Editing IP Whitelist Entry

1. Find the IP address in the list
2. Click the edit icon
3. Update description or status
4. Click "Update"

**Note**: IP addresses cannot be changed. Delete and recreate to change the IP.

### Removing an IP Address

1. Find the IP address in the list
2. Click the delete icon
3. Confirm deletion

**⚠️ Warning**: Removing your current IP address will immediately lock you out. Make sure you have another whitelisted IP before removing the current one.

### Best Practices

- **Office Networks**: Whitelist your office IP range (CIDR notation)
- **VPN Access**: Whitelist your VPN server IP
- **Remote Work**: Use a VPN and whitelist the VPN IP
- **Multiple Locations**: Add all office locations to the whitelist
- **Testing**: Temporarily disable IP whitelisting for testing (set status to "Inactive")

---

## Session Management

### What is Session Management?

Session Management allows you to view and control all active sessions (devices) that have access to your admin account.

### Viewing Active Sessions

**Access**: Dashboard → Security → Sessions

You'll see:

- **Current Session**: Your current active session
- **Other Active Sessions**: All other devices with active sessions

### Session Information

Each session shows:

- **Device ID**: Unique identifier for the device
- **IP Address**: IP address used for the session
- **Location**: Geographic location (if available)
- **User Agent**: Browser/device information
- **Last Used**: When the session was last active
- **Created**: When the session was created

### Revoking Sessions

**Revoke Single Session:**

1. Find the session in the list
2. Click the delete icon
3. Confirm revocation
4. The device will be logged out immediately

**Revoke All Other Sessions:**

1. Click "Revoke All Other Sessions"
2. Confirm the action
3. All other devices will be logged out immediately
4. Your current session will remain active

### When to Revoke Sessions

- You see an unfamiliar device or location
- You've lost a device
- You suspect unauthorized access
- You want to force logout from all devices

**⚠️ Warning**: Revoking all sessions will log you out from all devices except your current one. Make sure you have access to your authenticator app if MFA is enabled.

---

## Re-authentication

### What is Re-authentication?

Re-authentication requires you to enter your password again before performing sensitive operations, even if you're already logged in.

### When Re-authentication is Required

Re-authentication is required for:

- Disabling MFA
- Regenerating backup codes
- Changing security settings
- Modifying IP whitelist
- Other critical security operations

### How It Works

1. When you attempt a sensitive operation, a modal appears
2. Enter your password
3. Click "Verify"
4. The operation proceeds if verification succeeds

**Security**: Re-authentication tokens expire after 15 minutes. You'll need to re-authenticate again if the token expires.

---

## Security Best Practices

### General Security

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - Don't reuse passwords from other services

2. **Enable MFA**
   - Always enable MFA for admin accounts
   - Use a reputable authenticator app
   - Keep backup codes in a secure location

3. **Manage Sessions**
   - Regularly review active sessions
   - Revoke sessions from unknown devices
   - Log out when finished working

4. **IP Whitelisting**
   - Whitelist only trusted IP addresses
   - Use VPN for remote access
   - Review and update whitelist regularly

5. **Stay Alert**
   - Monitor security notifications
   - Report suspicious activity immediately
   - Keep your authenticator app updated

### MFA Best Practices

- **Backup Codes**: Store backup codes in a password manager or secure location
- **Multiple Devices**: Set up MFA on multiple devices (phone + tablet)
- **Recovery Plan**: Have a recovery plan if you lose access to your authenticator app
- **Don't Share**: Never share your MFA codes or backup codes

### IP Whitelisting Best Practices

- **Office Networks**: Use CIDR notation for office IP ranges
- **VPN Required**: Require VPN for all remote access
- **Regular Review**: Review whitelist monthly and remove unused IPs
- **Documentation**: Document why each IP is whitelisted

---

## Troubleshooting

### MFA Issues

**Problem**: Can't access authenticator app

- **Solution**: Use a backup code to log in
- **Prevention**: Set up MFA on multiple devices

**Problem**: Backup codes not working

- **Solution**: Check if the code was already used (each code is single-use)
- **Solution**: Regenerate backup codes if needed

**Problem**: MFA code expired

- **Solution**: Wait for the next code (codes refresh every 30 seconds)
- **Solution**: Make sure your device time is synchronized

### IP Whitelisting Issues

**Problem**: Locked out after removing IP

- **Solution**: Contact another admin to add your IP
- **Prevention**: Always have multiple IPs whitelisted

**Problem**: IP not matching CIDR range

- **Solution**: Verify CIDR notation is correct
- **Solution**: Check if IP is within the specified range

**Problem**: Can't access from new location

- **Solution**: Add the new IP to whitelist (requires another admin if you're locked out)
- **Prevention**: Use VPN with whitelisted IP

### Session Issues

**Problem**: Can't revoke session

- **Solution**: Try refreshing the page
- **Solution**: Check if you have permission to manage sessions

**Problem**: Session shows wrong location

- **Solution**: Location is approximate based on IP geolocation
- **Solution**: Verify IP address matches your actual location

### Re-authentication Issues

**Problem**: Re-authentication fails

- **Solution**: Verify password is correct
- **Solution**: Check if account is locked
- **Solution**: Try again after a few minutes

**Problem**: Re-authentication required too frequently

- **Solution**: This is normal for security-sensitive operations
- **Solution**: Tokens expire after 15 minutes for security

---

## Getting Help

If you encounter issues or have questions:

1. **Check this guide** for common solutions
2. **Contact Support**: Reach out to your system administrator
3. **Emergency Access**: Contact another SUPER_ADMIN if you're locked out

---

## Security Incident Response

If you suspect unauthorized access:

1. **Immediately revoke all sessions** (except current)
2. **Change your password**
3. **Review audit logs** for suspicious activity
4. **Report the incident** to your security team
5. **Regenerate backup codes** if MFA is enabled

---

**Last Updated**: January 2025  
**Version**: 1.0
