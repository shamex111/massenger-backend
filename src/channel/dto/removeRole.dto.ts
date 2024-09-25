import { IsNumber } from 'class-validator';

export class RemoveRoleDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  channelId: number;
}
