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

  handleChatUpdated(
    type: TYPE,
    smthId: number,
    data: {
      event:
        | 'message'
        | 'message-delete'
        | 'message-status'
        | 'notification'
        | 'message-edit';
      messageId?: number;
      userId?: number;
      newContent?:string;
      newMessageData?:any;
      incrementOrDecrement?:'increment' | 'decrement'      
    },
  ) {
    this.server.to(`${type}_${smthId}`).emit('chat-updated', { ...data, smthId, type });
    console.log(`${type}_${smthId}`)
  }

  @SubscribeMessage('subscribeToStatus')
  handleSubscribeToStatus(socket: Socket, data: { targetUserIds: number[] }) {
    const { targetUserIds } = data;
    console.log('sub', data.targetUserIds, socket.id);
    targetUserIds.forEach((userId) => {
      socket.join(`status_${userId}`);
    });
  }

  @SubscribeMessage('unsubscribeFromStatus')
  handleUnsubscribeFromStatus(
    socket: Socket,
    @MessageBody() data: { targetUserIds: number[] },
  ) {
    const { targetUserIds } = data;
    targetUserIds.forEach((userId) => {
      socket.leave(`status_${userId}`);
    });
  }

  changeOnline(userId: number, event: 'online' | 'offline') {
    this.server.to(`status_${userId}`).emit(`set-status-online`);
  }

  @SubscribeMessage('typing')
  handleTyping(dto: { type: TYPE; smthId: number; writersId: number }) {
    this.server.to(`${dto.type}_${dto.smthId}`).emit('typing', dto.writersId);
  }

  @SubscribeMessage('typing-stop')
  handleStopTyping(dto: { type: TYPE; smthId: number; writersId: number }) {
    this.server
      .to(`${dto.type}_${dto.smthId}`)
      .emit('typing-stop', dto.writersId);
  }

  @SubscribeMessage('join-room')
  joinRoom(socket: Socket, payload: { type: TYPE; smthId: number }) {
    socket.join(`${payload.type}_${payload.smthId}`);
  }

  @SubscribeMessage('leave-room')
  leaveRoom(socket: Socket, payload: { type: TYPE; smthId: number }) {
    socket.leave(`${payload.type}_${payload.smthId}`);
  }
}
