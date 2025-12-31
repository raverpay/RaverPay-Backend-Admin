import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyJAMBProfileDto {
  @ApiProperty({
    description: 'JAMB Profile ID (10 digits)',
    example: '1234567890',
    pattern: '^\\d{10}$',
  })
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Invalid JAMB Profile ID (must be 10 digits)',
  })
  profileId: string;

  @ApiProperty({
    description: 'Variation code (utme-mock or utme-no-mock)',
    example: 'utme-mock',
    enum: ['utme-mock', 'utme-no-mock'],
  })
  @IsString()
  @Matches(/^(utme-mock|utme-no-mock)$/, {
    message: 'Variation code must be utme-mock or utme-no-mock',
  })
  variationCode: string;
}
