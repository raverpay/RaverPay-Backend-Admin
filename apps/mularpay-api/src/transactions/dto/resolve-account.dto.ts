import { IsString, Length, Matches } from 'class-validator';

export class ResolveAccountDto {
  @IsString()
  @Length(10, 10, { message: 'Account number must be exactly 10 digits' })
  @Matches(/^\d+$/, { message: 'Account number must contain only digits' })
  accountNumber: string;

  @IsString()
  @Length(3, 3, { message: 'Bank code must be exactly 3 digits' })
  bankCode: string;
}
