import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePinDto {
  @ApiProperty({
    description: 'Current 4-digit PIN',
    example: '1234',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @Length(4, 4, { message: 'Current PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'Current PIN must contain only digits' })
  currentPin: string;

  @ApiProperty({
    description: 'New 4-digit PIN',
    example: '5678',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @Length(4, 4, { message: 'New PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'New PIN must contain only digits' })
  newPin: string;

  @ApiProperty({
    description: 'Confirm new 4-digit PIN',
    example: '5678',
    minLength: 4,
    maxLength: 4,
  })
  @IsString()
  @Length(4, 4, { message: 'Confirm new PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'Confirm new PIN must contain only digits' })
  confirmNewPin: string;
}
