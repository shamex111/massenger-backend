import { IsNumber } from 'class-validator';

export class DeleteMemberDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  channelId: number;
}
