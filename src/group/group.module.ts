import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { UserGateway } from 'src/user/user.gateway';

@Module({
  controllers: [GroupController],
  providers: [GroupService, PrismaService, UserService, UserGateway],
})
export class GroupModule {}
