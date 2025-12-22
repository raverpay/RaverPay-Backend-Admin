import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsArray,
} from 'class-validator';

/**
 * DTO for sending a fresh email (not a reply)
 */
export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string[];

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string[];

  @IsString()
  @IsOptional()
  fromEmail?: string; // Optional: support@raverpay.com, admin@raverpay.com, etc.
}
