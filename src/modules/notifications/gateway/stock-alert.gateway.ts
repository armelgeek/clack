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
    origin: [process.env.REACT_APP_URL_ADMIN || 'http://localhost:5173'],
    credentials: true,
  },
  namespace: '/admin-notifications',
})
export class StockAlertGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(StockAlertGateway.name);

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
  }

  notifyOutOfStockProduct(notification: TNotification) {
    const targetUserId = notification.userId;

    this.server.to(targetUserId).emit('outOfStockProduct', notification);
    this.logger.log(`Notification sent to room: ${targetUserId}`);
  }
}
