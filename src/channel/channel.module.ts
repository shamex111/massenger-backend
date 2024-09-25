import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { UserGateway } from 'src/user/user.gateway';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, UserService,GroupService,UserGateway],
})
export class ChannelModule {}
