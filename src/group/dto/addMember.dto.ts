import { IsNumber } from 'class-validator';

export class AddMemberDto {
  @IsNumber()
  userId: number;
  @IsNumber()
  groupId: number;
}
