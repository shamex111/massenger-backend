import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventEmitter } from 'events';
type TYPE = 'channel' | 'group' | 'chat';

EventEmitter.defaultMaxListeners = 14;
@WebSocketGateway()
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UserGateway.name);
  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: any, ...args: any[]) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage('joinPersonalRoom')
  joinPersonalRoom(socket: Socket, userId: number) {
    socket.join(`user_${userId}`);
  }

  @SubscribeMessage('leavePersonalRoom')
  leavePersonalRoom(socket: Socket, userId: number) {
    socket.leave(`user_${userId}`);
  }

  // addUser(type: TYPE, userId: number, smthId: number) {
  //   this.server.to(`user_${userId}`).emit('add-user', {
  //     type,
  //     smthId,
  //   });
  // }

  // deleteUser(type: TYPE, userId: number, smthId: number) {
  //   this.server.to(`user_${userId}`).emit('delete-user', {
  //     type,
  //     smthId,
  //   });
  // }

  handleChangeUserChats(
    type: TYPE,
    userId: number,
    smthId: number,
    event: 'delete' | 'add',
  ) {
    this.server.to(`user_${userId}`).emit('user-chats', {
      event,
      type,
      smthId,
    });
  }

  editUser(userId: number) {
    this.server.to(`user_${userId}`).emit('edit-user');
  }

  // @SubscribeMessage('subscribeToStatus')
  // handleSubscribeToStatus(socket: Socket, data: { targetUserIds: number[] }) {
  //   const { targetUserIds } = data;
  //   console.log('sub', data.targetUserIds, socket.id); // Добавь socket.id для отслеживания подключений
  //   targetUserIds.forEach((userId) => {
  //     socket.join(`status_${userId}`);
  //   });
  // }

  // // Отписка от статусов пользователей (при закрытии чата, группы или канала)
  // @SubscribeMessage('unsubscribeFromStatus')
  // handleUnsubscribeFromStatus(
  //   socket: Socket,
  //   @MessageBody() data: { targetUserIds: number[] },
  // ) {
  //   const { targetUserIds } = data;
  //   targetUserIds.forEach((userId) => {
  //     socket.leave(`status_${userId}`);
  //   });
  // }

  // // Когда пользователь становится онлайн
  // handleOnline(userId: number) {
  //   // Отправляем "онлайн" только тем, кто подписан на этого пользователя
  //   this.server.to(`status_${userId}`).emit('set-online', userId);
  // }

  // // Когда пользователь становится офлайн
  // handleOffline(userId: number) {
  //   // Отправляем "офлайн" только тем, кто подписан на этого пользователя
  //   this.server.to(`status_${userId}`).emit('set-offline', userId);
  // }
}
