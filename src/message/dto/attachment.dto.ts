import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class AttachmentDto {
  @IsString()
  url: string;

  @IsString()
  type: 'image' | 'video';

  @IsNumber()
  messageId: number;
  
  @IsOptional()
  @IsInt()
  chatId?: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsInt()
  channelId?: number;
}
