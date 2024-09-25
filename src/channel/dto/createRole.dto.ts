import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ArrayNotEmpty,
  ArrayUnique,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { permissionsVariant } from 'src/group/enums/premissionEnum';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(16)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  channelId: number;

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
