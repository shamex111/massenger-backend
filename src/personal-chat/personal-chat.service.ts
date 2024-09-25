import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateChatDto } from './dto/createChat.dto';
import { UserService } from 'src/user/user.service';
import { UserGateway } from 'src/user/user.gateway';

@Injectable()
export class PersonalChatService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private userGateway: UserGateway,
  ) {}
  async getById(userId: number, id: number) {
    const personalChat = await this.prisma.personalChat.findUnique({
      where: {
        id,
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        },
      },
    });
    if(!personalChat){
      throw new BadRequestException('Ошибка!')
    }
    return personalChat
  }
  

  async create(dto: CreateChatDto, userId: number) {
    let isFirstUserReal = await this.userService.getById(dto.user1Id);
    if (!isFirstUserReal)
      throw new BadRequestException(
        'Одного или двух пользователей для создания чата не существует!',
      );
    let isSecondUserReal = await this.userService.getById(dto.user2Id);
    if (!isSecondUserReal)
      throw new BadRequestException(
        'Одного из пользователей для создания чата не существует!',
      );
    if (dto.user1Id === dto.user2Id)
      throw new BadRequestException(
        'Пользователь не может создать чат с самим собой!',
      );
    if (dto.user1Id !== userId && dto.user2Id !== userId) {
      throw new BadRequestException(
        'Пользователь не может создать чат другим пользователям!',
      );
    }
    const isExists = await this.prisma.personalChat.findFirst({
      where: {
        OR: [
          { user1Id: dto.user1Id, user2Id: dto.user2Id },
          { user1Id: dto.user2Id, user2Id: dto.user1Id },
        ],
      },
    });
    if (isExists)
      throw new BadRequestException(
        'Чат с такими пользователями уже существует!',
      );
    const chat = await this.prisma.personalChat.create({
      data: dto,
    });
    await this.prisma.personalChatNotification.create({
      data: {
        personalChatId: chat.id,
        userId: dto.user1Id,
      },
    });
    await this.prisma.personalChatNotification.create({
      data: {
        personalChatId: chat.id,
        userId: dto.user2Id,
      },
    });

    this.userGateway.addUser('chat', dto.user1Id, chat.id);
    this.userGateway.addUser('chat', dto.user2Id, chat.id);
    return chat;
  }

  // async addMessage(dto: CreateMessageDto, userId: number) {
  //   let isChatIdCorrect = this.prisma.personalChat.findUnique({
  //     where: {
  //       id: dto.chatId,
  //     },
  //   });
  //   if (!isChatIdCorrect)
  //     throw new BadRequestException(
  //       'Группы указанной для добавления сообщение не существует!',
  //     );
  //   return this.messageService.create(userId, dto);
  // }

  async delete(id: number, userId: number) {
    const chat = await this.prisma.personalChat.findUnique({
      where: {
        id,
      },
    });
    if (!chat)
      throw new BadRequestException(
        'Чат указанный для удаление не существует!',
      );
    if (chat.user1Id !== userId && chat.user2Id !== userId)
      throw new BadRequestException(
        'Пользователь не может удалять чужие чаты!',
      );
    const deleteChat = await this.prisma.personalChat.delete({
      where: {
        id,
      },
    });

    this.userGateway.deleteUser('chat', chat.user1Id, chat.id);
    this.userGateway.deleteUser('chat', chat.user2Id, chat.id);
    return deleteChat;
  }
}
