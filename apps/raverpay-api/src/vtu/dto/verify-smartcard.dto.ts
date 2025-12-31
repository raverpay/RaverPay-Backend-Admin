import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifySmartcardDto {
  @ApiProperty({
    description: 'Cable TV Provider (DSTV, GOTV, STARTIMES)',
    example: 'DSTV',
  })
  @IsString()
  provider: string; // DSTV, GOTV, STARTIMES

  @ApiProperty({
    description: 'Smartcard or IUC number (10 digits)',
    example: '1234567890',
    pattern: '^\\d{10}$',
  })
  @IsString()
  @Matches(/^\d{10}$/, {
    message: 'Invalid smartcard number (must be 10 digits)',
  })
  smartcardNumber: string;
}
