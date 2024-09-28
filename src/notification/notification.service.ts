import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}
  async getNotification(
    dto: { memberId: number; smthId: number; type: 'channel' | 'group' },
    userId: number,
  ) {

    

    if (dto.type === 'channel') {
      const member =await this.prisma.channelMember.findFirst({
        where:{
          userId:userId,
          channelId:dto.smthId
        }
      })
      if (!member || member.id !== dto.memberId) throw new BadRequestException('Ошибка!');
      return this.prisma.channelNotification.findFirst({
        where: {
          channelId: dto.smthId,
          memberId: dto.memberId,
        },
      });
    }
    if (dto.type === 'group') {
      const member =await this.prisma.groupMember.findFirst({
        where:{
          userId:userId,
          groupId:dto.smthId
        }
      })
      if (!member || member.id !== dto.memberId) throw new BadRequestException('Ошибка!');
      return this.prisma.groupNotification.findFirst({
        where: {
          groupId: dto.smthId,
          memberId: dto.memberId,
        },
      });
    }
  }
}
