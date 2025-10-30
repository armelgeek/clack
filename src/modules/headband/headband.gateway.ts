import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { HeadbandService } from './headband.service';
import { HeadBand } from '@/database';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BannerGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => HeadbandService))
    private readonly headbandService: HeadbandService,
  ) {}

  async broadcastBannerUpdate() {
    const banner: HeadBand[] = await this.headbandService.findAll();
    this.server.emit('bannerUpdated', banner[0] || null);
  }

  @SubscribeMessage('banner:fetch')
  async handleFetch(@ConnectedSocket() client: Socket) {
    const banner: HeadBand[] = await this.headbandService.findAll();
    client.emit('bannerUpdated', banner[0] || null);
  }
}
