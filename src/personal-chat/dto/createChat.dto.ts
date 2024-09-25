import { IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNumber()
  user1Id: number;
  @IsNumber()
  user2Id: number;
}
