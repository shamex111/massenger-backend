import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AddMemberDto } from './dto/addMember.dto';
import { CreateRoleDto } from './dto/createRole.dto';
import { RemoveRoleDto } from './dto/removeRole.dto';
import { AssignRoleDto } from './dto/assignRole.dto';
import { DeleteRoleDto } from './dto/deleteRole.dto';
import { EditRoleDto } from './dto/editRole.dto';
import { DeleteMemberDto } from './dto/deleteMember.dto';
import { changeNotificationsDto } from './dto/changeNotifications.dto';
import { CreateChannelDto } from './dto/createChannel.dto';
import { EditChannelDto } from './dto/editChannel.dto';
import { permissionsVariant } from 'src/group/enums/premissionEnum';
import { GroupService } from 'src/group/group.service';
import { UserGateway } from 'src/user/user.gateway';

@Injectable()
export class ChannelService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private groupService: GroupService,
    private userGateway: UserGateway,
  ) {}
  async getById(userId: number, id: number) {
    const userMember = this.prisma.channelMember.findFirst({
      where: {
        userId,
        channelId: id,
      },
    });
    if (userMember) {
      return this.prisma.channel.findUnique({
        where: {
          id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
            include:{
              readUsers:{},
              readGroups:{},
              readChannels:{},
            }
          },
          members: {},
          roles: {},
        },
      });
    }
  }

  async searchChannels(param: string) {
    return this.prisma.channel.findMany({
      where: {
        name: {
          startsWith: param,
          mode: 'insensitive',
        },
        private: false,
      },
      take: 40,
    });
  }

  async create(dto: CreateChannelDto, userId: number) {
    const isUserReal = await this.userService.getById(userId);
    if (!isUserReal)
      throw new BadRequestException(
        'Пользователя для создания группы не существует!',
      );

    const newChannel = await this.prisma.channel.create({
      data: dto,
    });
    const ADMIN_NAME = 'Администратор';
    await this.createRole({
      name: ADMIN_NAME,
      channelId: newChannel.id,
      permissionNames: [
        'delete',
        'edit',
        'addMember',
        'removeMember',
        'sendMessage',
        'addMedia',
        'changeRole',
        'seeUsers',
        'changeDiscussion',
      ],
      isSystemRole: true,
    });
    await this.createRole({
      name: 'Подписчик',
      channelId: newChannel.id,
      permissionNames: ['addMember'],
      isSystemRole: true,
    });
    await this.addMember({ userId, channelId: newChannel.id });
    await this.assignRole({
      userId: userId,
      channelId: newChannel.id,
      roleName: ADMIN_NAME,
    });
    return newChannel;
  }

  async edit(dto: EditChannelDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.edit,
      );
    }
    return this.prisma.channel.update({
      where: {
        id: dto.channelId,
      },
      data: {
        name: dto.name,
        avatar: dto.avatar,
        description: dto.description,
        private: dto.private,
      },
    });
  }

  async delete(channelId: number, userId?: number) {
    if (userId) {
      await this.checkPermission(userId, channelId, permissionsVariant.delete);
    }

    return this.prisma.channel.delete({
      where: {
        id: channelId,
      },
    });
  }

  async addMember(dto: AddMemberDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.addMember,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel)
      throw new BadRequestException(
        'Канала для добавления пользователя не существует!',
      );
    const user = await this.prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
    });
    if (!user)
      throw new BadRequestException(
        'Пользователя для добавления в канал не существует!',
      );
    const isExists = await this.prisma.channelMember.findFirst({
      where: {
        userId: dto.userId,
        channelId: dto.channelId,
      },
    });
    if (isExists)
      throw new BadRequestException('Пользователь уже находиться в канале!');
    const userRoleId = await this.getRoleIdByName('Подписчик', dto.channelId);
    const member = await this.prisma.channelMember.create({
      data: { ...dto, channelRoleId: userRoleId as number },
    });
    await this.prisma.channelNotification.create({
      data: {
        memberId: member.id,
        channelId: dto.channelId,
      },
    });
    this.userGateway.handleChangeUserChats('group', dto.userId, dto.channelId,'add');
    await this.prisma.channel.update({
      where:{
        id:dto.channelId
      },
      data: {
        qtyUsers: {
          increment: 1,
        },
      },
    })
    return member;
  }

  async changeUserNotification(dto: changeNotificationsDto, userId: number) {
    const isUserInChannel = await this.prisma.channelMember.findFirst({
      where: {
        userId: userId,
        channelId: dto.channelId,
      },
    });
    if (!isUserInChannel)
      throw new BadRequestException(
        'Не существует либо пользователя либо канала либо пользователь не находится в канале в которой хочет изменить состояние уведомлений!',
      );
    return this.prisma.channelMember.update({
      where: {
        id: isUserInChannel.id,
      },
      data: {
        isMuted: dto.isMuted,
      },
    });
  }

  async deleteMember(dto: DeleteMemberDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.removeMember,
      );
    }

    const user = await this.userService.getById(dto.userId);
    if (!user)
      throw new BadRequestException('Пользователя для удаления не существует!');
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel)
      throw new BadRequestException(
        'Канала для удаления пользователя не существует!',
      );
    const isUserInChannel = await this.prisma.channelMember.findFirst({
      where: {
        userId: dto.userId,
        channelId: dto.channelId,
      },
    });
    if (!isUserInChannel)
      throw new BadRequestException('Пользователя итак нет в данном канале!');
    const deleteUser = await this.prisma.channelMember.delete({
      where: {
        id: isUserInChannel.id,
      },
    });
    this.userGateway.handleChangeUserChats('channel', dto.userId, dto.channelId,'delete');
    await this.prisma.channel.update({
      where:{
        id:dto.channelId
      },
      data: {
        qtyUsers: {
          decrement: 1,
        },
      },
    })
    return deleteUser;
  }

  async createRole(dto: CreateRoleDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.changeRole,
      );
    }

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel) throw new BadRequestException('Канал не найдена!');

    const permissions = await this.prisma.permission.findMany({
      where: {
        action: {
          in: dto.permissionNames,
        },
      },
    });

    if (permissions.length !== dto.permissionNames.length) {
      throw new BadRequestException('Некоторые пермиссии недействительны!');
    }

    const newRole = await this.prisma.channelRole.create({
      data: {
        name: dto.name,
        isSystemRole: dto.isSystemRole ? dto.isSystemRole : false,
        channelId: dto.channelId,
        permissions: {
          create: await Promise.all(
            dto.permissionNames.map(async (permissionName) => ({
              permission: {
                connect: {
                  id: await this.getPermissionIdByName(permissionName),
                },
              },
            })),
          ),
        },
      },
    });

    return newRole;
  }

  async removeRole(dto: RemoveRoleDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.changeRole,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel) throw new BadRequestException('Канал не найдена!');

    const user = await this.prisma.channelMember.findFirst({
      where: {
        userId: dto.userId,
        channelId: dto.channelId,
      },
    });
    if (!user)
      throw new BadRequestException(
        'Несуществует либо пользователя либо канала либо пользователь не находится в указанном канале!',
      );

    const channelMemberId = user.id;
    const roleId = await this.getRoleIdByName('Подписчик', dto.channelId);
    return this.prisma.channelMember.update({
      where: {
        id: channelMemberId,
      },
      data: {
        channelRoleId: roleId as number,
      },
    });
  }

  async assignRole(dto: AssignRoleDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.changeRole,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel) throw new BadRequestException('Канал не найден!');

    const user = await this.prisma.channelMember.findFirst({
      where: {
        userId: dto.userId,
        channelId: dto.channelId,
      },
    });
    if (!user)
      throw new BadRequestException(
        'Несуществует либо пользователя либо канала либо пользователь не находится в указанном канале!',
      );

    const channelMemberId = user.id;
    const roleId = await this.getRoleIdByName(dto.roleName, dto.channelId);

    return this.prisma.channelMember.update({
      where: {
        id: channelMemberId,
      },
      data: {
        channelRoleId: roleId as number,
      },
    });
  }

  async editRole(dto: EditRoleDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.changeRole,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel)
      throw new BadRequestException('Канала для изменения роли не существует!');

    const role = (await this.getRoleIdByName(
      dto.roleName,
      dto.channelId,
      true,
    )) as { id: number; isSystem: boolean };
    if (role.isSystem)
      throw new BadRequestException(
        'Пользователь не может изменять системные роли!',
      );
    const permissions = await this.prisma.permission.findMany({
      where: {
        action: {
          in: dto.newPermissions,
        },
      },
    });

    if (permissions.length !== dto.newPermissions.length) {
      throw new BadRequestException('Некоторые пермиссии недействительны!');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.channelRolePermission.deleteMany({
        where: {
          channelRoleId: role.id,
        },
      });

      return prisma.channelRole.update({
        where: {
          id: role.id,
        },
        data: {
          name: dto.newRoleName,
          permissions: {
            create: permissions.map((permission) => ({
              permission: {
                connect: {
                  id: permission.id,
                },
              },
            })),
          },
        },
      });
    });
  }

  async deleteRole(dto: DeleteRoleDto, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        dto.channelId,
        permissionsVariant.changeRole,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: dto.channelId,
      },
    });
    if (!channel)
      throw new BadRequestException('Канала для удаления роли не существует!');

    const role = (await this.getRoleIdByName(
      dto.roleName,
      dto.channelId,
      true,
    )) as { id: number; isSystem: boolean };
    if (!role) throw new BadRequestException('Роль не найдена!');

    if (role.isSystem)
      throw new BadRequestException(
        'Пользователь не может удалять системные роли!',
      );

    const userRoleId = role.id;

    const membersWithRole = await this.prisma.channelMember.findMany({
      where: { channelRoleId: role.id },
    });

    for (const member of membersWithRole) {
      await this.assignUserRole(member.userId, userRoleId, dto.channelId);
    }

    await this.prisma.channelRolePermission.deleteMany({
      where: { channelRoleId: role.id },
    });

    return this.prisma.channelRole.delete({
      where: { id: role.id },
    });
  }

  async createDiscussion(channelId: number, userId: number) {
    await this.checkPermission(
      userId,
      channelId,
      permissionsVariant.changeDiscussion,
    );

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: { discussion: true },
    });

    if (!channel) {
      throw new BadRequestException('Канал для создания обсуждения не найден!');
    }

    if (channel.discussion) {
      throw new BadRequestException(
        'Для данного канала уже существует обсуждение!',
      );
    }

    const group = await this.groupService.create(
      {
        name: `${channel.name} - обсуждение`,
        description: `Обсуждение канала ${channel.name}.`,
        private: true,
      },
      userId,
    );

    return this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        groupId: group.id,
      },
    });
  }

  async deleteDiscussion(channelId: number, userId?: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        channelId,
        permissionsVariant.changeDiscussion,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: { discussion: true },
    });

    if (!channel) {
      throw new BadRequestException('Канал для удаления обсуждения не найден!');
    }

    if (!channel.discussion) {
      throw new BadRequestException(
        'Для данного канала не существует обсуждения!',
      );
    }

    // Удаление группы, связанной с обсуждением
    await this.prisma.group.delete({
      where: { id: channel.groupId },
    });

    return this.prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        groupId: null,
      },
    });
  }

  async assignUserRole(userId: number, roleId: number, channelId: number) {
    const userInChannel = await this.prisma.channelMember.findFirst({
      where: { userId: userId, channelId: channelId },
    });
    if (!userInChannel)
      throw new BadRequestException(
        `Пользователь с ID ${userId} не находится в группе с ID ${channelId}`,
      );

    return this.prisma.channelMember.update({
      where: { id: userInChannel.id },
      data: { channelRoleId: roleId },
    });
  }

  async getPermissionIdByName(permissionName: string): Promise<number> {
    const permission = await this.prisma.permission.findFirst({
      where: { action: permissionName },
    });
    if (!permission) {
      throw new BadRequestException(
        `Возможность с именем ${permissionName} не найдена!`,
      );
    }
    return permission.id;
  }

  async getRoleIdByName(
    roleName: string,
    channelId: number,
    checkSystem?: boolean,
  ) {
    const role = await this.prisma.channelRole.findFirst({
      where: { name: roleName, channelId: channelId },
    });
    if (!role) {
      throw new BadRequestException(
        `Роли с именем ${roleName} в канале ${channelId} не существует!`,
      );
    }
    if (checkSystem) {
      return {
        id: role.id,
        isSystem: role.isSystemRole,
      };
    }
    return role.id;
  }

  async listMembers(channelId: number, userId: number) {
    if (userId) {
      await this.checkPermission(
        userId,
        channelId,
        permissionsVariant.seeUsers,
      );
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    if (!channel)
      throw new BadRequestException(
        'Группы для получения списка пользователей не существует!',
      );
    const isUSerInChannel = await this.prisma.channelMember.findFirst({
      where: {
        channelId: channelId,
        userId: userId,
      },
    });
    if (!isUSerInChannel)
      throw new BadRequestException(
        'Пользователь не может получить данные о пользователях канала в котором он не состоит!',
      );
    return this.prisma.channelMember.findMany({
      where: {
        channelId: channelId,
      },
    });
  }

  async listRoles(channelId: number, userId: number) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    if (!channel)
      throw new BadRequestException(
        'Канала для получения списка ролей не существует!',
      );
    const isUSerInChannel = await this.prisma.channelMember.findFirst({
      where: {
        channelId: channelId,
        userId: userId,
      },
    });
    if (!isUSerInChannel)
      throw new BadRequestException(
        'Пользователь не может получить данные о ролях канала в котором он не состоит!',
      );
    return this.prisma.channelRole.findMany({
      where: {
        channelId: channelId,
      },
    });
  }
  async listPermissions() {
    return this.prisma.permission.findMany();
  }
  async checkPermission(
    userId: number,
    channelId: number,
    permission: permissionsVariant,
  ) {
    const member = await this.prisma.channelMember.findFirst({
      where: {
        userId: userId,
        channelId: channelId,
      },
    });
    if (!userId)
      throw new BadRequestException(
        'Пользователя отправишего запрос на добавления пользователя не существует!',
      );
    const permissionUserRole = await this.prisma.channelRolePermission.findMany(
      {
        where: {
          channelRoleId: member.channelRoleId,
        },
      },
    );
    if (permissionUserRole) {
      const permissionIds = permissionUserRole.map(
        (per: any) => per.permissionId,
      );
      const permissionId = await this.getPermissionIdByName(permission);
      if (permissionIds.includes(permissionId)) {
        return true;
      } else {
        throw new BadRequestException(
          'У пользователя не хватает прав для выполнения данного действия!',
        );
      }
    }
  }
}
