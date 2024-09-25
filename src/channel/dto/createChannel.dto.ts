import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  description: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsBoolean()
  private: boolean;
}
