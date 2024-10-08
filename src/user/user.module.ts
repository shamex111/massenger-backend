import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { UserGateway } from './user.gateway';

@Module({
  controllers: [UserController],
  providers: [UserService,PrismaService,UserGateway],
})
export class UserModule {}
