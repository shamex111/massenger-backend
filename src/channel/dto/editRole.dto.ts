import { IsArray, IsNumber, IsString } from 'class-validator';

export class EditRoleDto {
  @IsString()
  newRoleName: string;

  @IsArray()
  @IsString({ each: true })
  newPermissions: string[];

  @IsString()
  roleName: string;

  @IsNumber()
  channelId: number;
}
