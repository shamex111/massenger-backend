import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from 'src/prisma.service';
import { GroupService } from 'src/group/group.service';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/user/user.service';
import { MessagesGateway } from './message.gateway';
import { UserGateway } from 'src/user/user.gateway';

@Module({
  controllers: [MessageController],
  providers: [MessageService,PrismaService,GroupService,ChannelService,UserService,MessagesGateway,UserGateway],
})
export class MessageModule {}
