import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TNotification } from 'types/notification';

@WebSocketGateway({
  cors: {
    origin: [process.env.SUPER_ADMIN_APP_URL || 'http://localhost:5174'],
    credentials: true,
  },
  namespace: '/super-admin-notifications',
})
export class StoreStatusGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(StoreStatusGateway.name);

  afterInit(_server: Server) {
    this.logger.log('WebSocket Gateway Initialized.');
  }

  handleConnection(client: Socket, ..._args: any[]) {
    this.logger.log(`Client connecté (ID: ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté (ID: ${client.id})`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(userId);
    console.log(`Client ${client.id} joined notification room: ${userId}`);
  }

  notifyStoreStatusChange(notification: TNotification) {
    const targetUserId = notification.userId;

    this.server.to(targetUserId).emit('storeStatusUpdated', notification);
    this.logger.log(`Notification sent to room: ${targetUserId}`);
  }
}
