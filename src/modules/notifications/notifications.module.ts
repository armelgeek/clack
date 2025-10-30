import { Module } from '@nestjs/common';
import { StoreStatusGateway } from './gateway/store-status.gateway';
import { NotificationRepository } from './notifications.repository';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';

@Module({
  controllers: [NotificationController],
  providers: [StoreStatusGateway, NotificationRepository, NotificationService],
  exports: [StoreStatusGateway],
})
export class NotificationModule {}
