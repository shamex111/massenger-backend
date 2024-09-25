import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { permissionsVariant } from '../enums/premissionEnum';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(16)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  // @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  // @IsString({ each: true })
  @IsEnum(permissionsVariant)
  permissionNames: string[];

  @IsOptional()
  @IsBoolean()
  isSystemRole?: boolean;
}
