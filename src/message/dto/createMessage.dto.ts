import { IsNotEmpty, IsOptional, IsInt, IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsInt()
  chatId?: number;

  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsInt()
  channelId?: number;

  // @IsOptional()
  // @IsArray()
  // media?:string[]

}
