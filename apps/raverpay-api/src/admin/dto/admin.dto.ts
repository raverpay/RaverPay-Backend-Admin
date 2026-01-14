import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class CreateAdminDto {
  @ApiProperty({
    description: 'Corporate email address',
    example: 'admin@raverpay.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+2348012345678' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'Temporary password (user must change on first login)',
    example: 'TempPassword123!',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Admin role',
    enum: ['ADMIN', 'SUPPORT', 'SUPER_ADMIN'],
    example: 'ADMIN',
  })
  @IsEnum(['ADMIN', 'SUPPORT', 'SUPER_ADMIN'])
  role: 'ADMIN' | 'SUPPORT' | 'SUPER_ADMIN';

  @ApiPropertyOptional({
    description: 'Initial IP address to whitelist for this admin',
    example: '203.0.113.45',
  })
  @IsString()
  @IsOptional()
  initialIpAddress?: string;

  @ApiPropertyOptional({
    description:
      'Skip IP whitelist requirement for 24 hours (creates temporary whitelist entry)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  skipIpWhitelist?: boolean;

  @ApiPropertyOptional({
    description:
      'Personal email for initial credential delivery (if corporate email not ready)',
    example: 'admin.personal@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @ApiPropertyOptional({
    description: 'Send credentials via email',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendCredentials?: boolean;

  @ApiPropertyOptional({
    description: 'Generate and send MFA setup QR code via email',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  sendMfaSetup?: boolean;
}

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Admin role',
    enum: ['ADMIN', 'SUPPORT', 'SUPER_ADMIN'],
    example: 'ADMIN',
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'SUPPORT', 'SUPER_ADMIN'])
  role?: 'ADMIN' | 'SUPPORT' | 'SUPER_ADMIN';

  @ApiPropertyOptional({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description:
      'IP addresses to add/update in whitelist (replaces existing user-specific entries)',
    example: ['203.0.113.45', '203.0.113.46'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipAddresses?: string[];

  @ApiPropertyOptional({
    description: 'Enable or disable MFA for this admin',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @ApiPropertyOptional({
    description:
      'Enable or disable two-factor authentication (alias for mfaEnabled)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}

export class ProvisionAdminDto {
  @ApiProperty({
    description: 'IP address to whitelist for this admin',
    example: '203.0.113.45',
  })
  @IsString()
  ipAddress: string;

  @ApiPropertyOptional({
    description: 'Description for the IP whitelist entry',
    example: 'Office WiFi - Main building',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Generate and send MFA setup QR code via email',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  setupMfa?: boolean;
}
