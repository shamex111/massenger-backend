import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username: string;
  @IsOptional()
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  avatar: string;
  @IsOptional()
  @IsString()
  description: string;
}
export class UpdateLastOnlineUserDto {
  lastOnline: any;
}
