import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class SetupMfaResponseDto {
  @ApiProperty({
    description: 'Base32 encoded secret for manual entry',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;

  @ApiProperty({
    description: 'QR code data URL for scanning with authenticator app',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCode: string;

  @ApiProperty({
    description: 'Manual entry key (same as secret)',
    example: 'JBSWY3DPEHPK3PXP',
  })
  manualEntryKey: string;

  @ApiProperty({
    description: 'Backup codes (plain text - user must save these)',
    example: ['12345678', '87654321', '11223344'],
    type: [String],
  })
  backupCodes: string[];
}

export class VerifyMfaSetupDto {
  @ApiProperty({
    description: '6-digit TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'Code must be exactly 6 digits',
  })
  code: string;
}

export class VerifyMfaDto {
  @ApiProperty({
    description: 'Temporary token from login response',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: '6-digit TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'Code must be exactly 6 digits',
  })
  code: string;
}

export class VerifyBackupCodeDto {
  @ApiProperty({
    description: 'Temporary token from login response',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: '8-digit backup code',
    example: '12345678',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @Matches(/^\d{8}$/, {
    message: 'Backup code must be exactly 8 digits',
  })
  backupCode: string;
}

export class DisableMfaDto {
  @ApiProperty({
    description: 'User password for verification',
    example: 'SecurePassword123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegenerateBackupCodesDto {
  @ApiProperty({
    description: '6-digit TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, {
    message: 'Code must be exactly 6 digits',
  })
  code: string;
}

export class MfaStatusDto {
  @ApiProperty({
    description: 'Whether MFA is enabled',
    example: true,
  })
  mfaEnabled: boolean;

  @ApiProperty({
    description: 'When MFA was enabled',
    example: '2025-01-10T12:00:00Z',
    nullable: true,
  })
  mfaEnabledAt: Date | null;

  @ApiProperty({
    description: 'Number of backup codes remaining',
    example: 8,
  })
  backupCodesRemaining: number;

  @ApiProperty({
    description: 'Last successful MFA verification',
    example: '2025-01-13T10:30:00Z',
    nullable: true,
  })
  lastMfaSuccess: Date | null;
}

export class SetupMfaUnauthenticatedDto {
  @ApiProperty({
    description: 'Email address of the admin account',
    example: 'admin@raverpay.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description:
      'Temporary setup token (sent via email when admin is created). If not provided, account must be created < 24 hours ago and email verified.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsOptional()
  setupToken?: string;
}
