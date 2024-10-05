import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  returnUserObject,
  returnUserObjectForServer,
  returnUserObjectShort,
} from './objects/returnUser.object';
import { AuthDto } from 'src/auth/dto/Auth.dto';
import { hash } from 'argon2';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserGateway } from './user.gateway';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private userGateway: UserGateway,
  ) {}

  async searchUsers(param: string) {
    return this.prisma.user.findMany({
      where: {
        username: {
          startsWith: param,
          mode: 'insensitive',
        },
      },
      take: 40,
      select: returnUserObjectShort,
    });
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        channelMembers: {
          include: {
            channelRole: {
              include: {
                permissions: {
                  include: {
                    permission: {},
                  },
                },
              },
            },
          },
        },
        groupMembers: {
          include: {
            groupRole: {
              include: {
                permissions: {
                  include: {
                    permission: {},
                  },
                },
              },
            },
          },
        },
        personalChats: true, // Если вам нужны все поля, просто ставьте true
        personalChats2: true,
        PersonalChatNotification: true,
        MessageReadUser: true,
      },
    });

    // Обработка случая, если пользователь не найден
    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }

    return user;
  }

  async getUser(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: returnUserObjectShort,
    });
    return user;
  }

  async create(dto: AuthDto) {
    try {
      const user = {
        name: dto.username,
        username: dto.username,
        password: await hash(dto.password),
      };
      return this.prisma.user.create({ data: user });
    } catch (error) {
      throw new InternalServerErrorException('Unable to create user');
    }
  }

  async edit(dto: UpdateUserDto, id: number) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: dto,
      });
      this.userGateway.editUser(id);
    } catch (error) {
      throw new InternalServerErrorException('Unable to edit user');
    }
  }

  async delete(id: number) {
    try {
      return this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException('Unable to delete user');
    }
  }

  async updateLastOnline(id: number) {
    const now = new Date();
    try {
      return this.prisma.user.update({
        where: { id },
        data: { lastOnline: now },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Unable to update last online time',
      );
    }
  }

  async setOnlineStatus(id: number, action: 'online' | 'offline') {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) throw new BadRequestException('Пользователя несуществует!');
    if (action === 'offline') {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isOnline: false,
        },
      });
      this.updateLastOnline(id);
      this.userGateway.changeOnline(user.id, 'offline',);
    } else {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isOnline: true,
        },
      });
      this.userGateway.changeOnline(user.id, 'online');
    }
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: returnUserObjectForServer,
    });
    return user;
  }

  async getByIdForClients(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: returnUserObjectShort,
    });
    return user;
  }
}
