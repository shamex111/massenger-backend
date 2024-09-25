import { IsBoolean, IsNumber } from 'class-validator';

export class changeNotificationsDto {
  @IsBoolean()
  isMuted: boolean;
  @IsNumber()
  groupId: number;
}
