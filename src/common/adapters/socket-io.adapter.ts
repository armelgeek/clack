import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  public createIOServer(port: number, options?: ServerOptions): any {
    options = {
      ...options,
      path: '/socket.io/',
      cors: {
        origin: true,
        credentials: true,
      },
    };

    const server = super.createIOServer(port, options);
    return server;
  }
}
