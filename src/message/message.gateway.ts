import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type TYPE = 'chat' | 'group' | 'channel';

@WebSocketGateway()
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.server = server;
  }

  @SubscribeMessage('join-room')
  joinRoom(type: TYPE, socket: Socket, smthId: number) {
    socket.join(`${type}_${smthId}`);
  }

  @SubscribeMessage('leave-room')
  leaveRoom(type: TYPE, socket: Socket, smthId: number) {
    socket.leave(`${type}_${smthId}`);
  }

  // handleMessage(type: TYPE, data: { smthId: number; messageId: number }): void {
  //   this.server.to(`${type}_${data.smthId}`).emit('message', data);
  // }

  // handleEditMessage(
  //   type: TYPE,
  //   data: { smthId: number; messageId: number },
  // ): void {
  //   this.server.to(`${type}_${data.smthId}`).emit('message-edit', data);
  // }

  // handleDeleteMessage(type: TYPE, data: { smthId: number }): void {
  //   this.server.to(`${type}_${data.smthId}`).emit('message-delete', data);
  // }

  // handleMessageStatus(type: TYPE, smthId: number, messageId: number) {
  //   this.server.to(`${type}_${smthId}`).emit('message-read', messageId);
  // }

  // handleNotification(type: TYPE, smthId: number) {
  //   this.server.to(`${type}_${smthId}`).emit('notification');
  // }

  handleChatUpdated(
    type: TYPE,
    smthId: number,
    data: {
      event: 'message' | 'message-delete' | 'message-status' | 'notification' | 'online';
      messageId?:number;
      userId?:number;
    },
  ) {
    this.server.to(`${type}_${smthId}`).emit('chat-updated', data);
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
}
