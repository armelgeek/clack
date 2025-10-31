import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreRepository } from './store.repository';
import { ProductModule } from '../product/product.module';
import { StoreStatusGateway } from '../notifications/gateway/store-status.gateway';
import { NotificationRepository } from '../notifications/notifications.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [ProductModule],
  controllers: [StoreController],
  providers: [
    StoreRepository,
    StoreService,
    StoreStatusGateway,
    NotificationRepository,
    UserRepository,
  ],
  exports: [StoreService],
})
export class StoreModule {}
