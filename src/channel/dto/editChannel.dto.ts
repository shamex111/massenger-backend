import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsBoolean()
  private:boolean

  @IsNumber()
  channelId:number
}
