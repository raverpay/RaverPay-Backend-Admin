import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * MFA Secret Encryption Utility
 *
 * Encrypts and decrypts MFA TOTP secrets using AES-256-GCM (Galois/Counter Mode)
 * GCM provides both confidentiality and authenticity
 *
 * Similar to BVN encryption but specifically for MFA secrets
 */
@Injectable()
export class MfaEncryptionUtil {
  private readonly logger = new Logger(MfaEncryptionUtil.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Get encryption key from environment variable
    // Use MFA_ENCRYPTION_KEY if available, otherwise fall back to BVN_ENCRYPTION_KEY
    const key =
      this.configService.get<string>('MFA_ENCRYPTION_KEY') ||
      this.configService.get<string>('BVN_ENCRYPTION_KEY');

    if (!key) {
      throw new Error(
        'MFA_ENCRYPTION_KEY or BVN_ENCRYPTION_KEY environment variable is required for MFA secret encryption',
      );
    }

    // Derive encryption key from environment variable using PBKDF2
    const salt =
      this.configService.get<string>('MFA_ENCRYPTION_SALT') ||
      this.configService.get<string>('BVN_ENCRYPTION_SALT') ||
      key;
    this.encryptionKey = crypto.pbkdf2Sync(
      key,
      salt,
      100000, // 100k iterations
      this.keyLength,
      'sha512',
    );

    this.logger.log('MFA encryption utility initialized');
  }

  /**
   * Encrypt MFA secret
   * @param secret - Plain text TOTP secret (base32 encoded)
   * @returns Encrypted secret string (base64 encoded)
   */
  encryptSecret(secret: string): string {
    if (!secret || secret.trim().length === 0) {
      throw new Error('MFA secret cannot be empty');
    }

    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      // Encrypt secret
      let encrypted = cipher.update(secret, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine IV, tag, and encrypted data
      // Format: iv:tag:encrypted (all base64 encoded)
      const result = `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;

      return result;
    } catch (error) {
      this.logger.error('Failed to encrypt MFA secret', error);
      throw new Error('Failed to encrypt MFA secret');
    }
  }

  /**
   * Decrypt MFA secret
   * @param encryptedSecret - Encrypted secret string (base64 encoded)
   * @returns Plain text TOTP secret (base32 encoded)
   */
  decryptSecret(encryptedSecret: string): string {
    if (!encryptedSecret || encryptedSecret.trim().length === 0) {
      throw new Error('Encrypted MFA secret cannot be empty');
    }

    try {
      // Split the encrypted string into IV, tag, and encrypted data
      const parts = encryptedSecret.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted MFA secret format');
      }

      const [ivBase64, tagBase64, encrypted] = parts;

      // Decode IV and tag
      const iv = Buffer.from(ivBase64, 'base64');
      const tag = Buffer.from(tagBase64, 'base64');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );

      // Set authentication tag
      decipher.setAuthTag(tag);

      // Decrypt secret
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Failed to decrypt MFA secret', error);
      throw new Error('Failed to decrypt MFA secret');
    }
  }

  /**
   * Check if a string is encrypted (has the expected format)
   * @param value - String to check
   * @returns True if encrypted, false otherwise
   */
  isEncrypted(value: string): boolean {
    if (!value || value.trim().length === 0) {
      return false;
    }

    // Check if it has the encrypted format: iv:tag:encrypted
    const parts = value.split(':');
    return parts.length === 3;
  }
}
