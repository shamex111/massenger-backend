import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
  
  @IsBoolean()
  @IsOptional()
  private?: boolean;
}
