import { IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @MinLength(5)
  @MaxLength(18)
  username: string;

  @MinLength(6)
  @MaxLength(32)
  @IsString()
  password: string;
  
}
