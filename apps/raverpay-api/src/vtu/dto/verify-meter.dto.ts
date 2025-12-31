import { IsString, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum MeterType {
  PREPAID = 'prepaid',
  POSTPAID = 'postpaid',
}

export class VerifyMeterDto {
  @ApiProperty({
    description: 'Electricity distribution company (Disco)',
    example: 'ikeja-electric',
  })
  @IsString()
  disco: string;

  @ApiProperty({
    description: 'Meter number (10-13 digits)',
    example: '12345678901',
    pattern: '^\\d{10,13}$',
  })
  @IsString()
  @Matches(/^\d{10,13}$/, {
    message: 'Meter number must be 10-13 digits',
  })
  meterNumber: string;

  @ApiProperty({
    description: 'Meter type (prepaid/postpaid)',
    example: MeterType.PREPAID,
    enum: MeterType,
  })
  @IsEnum(MeterType)
  meterType: MeterType;
}
