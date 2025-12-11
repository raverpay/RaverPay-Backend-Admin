import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ReplyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Reply content is required' })
  content: string;

  @IsString()
  @IsOptional()
  subject?: string; // Optional, defaults to "Re: {originalSubject}"
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}
