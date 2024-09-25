import { Module } from '@nestjs/common';
import { PersonalChatService } from './personal-chat.service';
import { PersonalChatController } from './personal-chat.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { UserGateway } from 'src/user/user.gateway';

@Module({
  controllers: [PersonalChatController],
  providers: [PersonalChatService,PrismaService,UserService,UserGateway],
})
export class PersonalChatModule {}
