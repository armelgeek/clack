import { Module } from '@nestjs/common';
import { StoreStatusGateway } from './gateway/store-status.gateway';
import { NotificationRepository } from './notifications.repository';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { StockAlertGateway } from './gateway/stock-alert.gateway';

@Module({
  controllers: [NotificationController],
  providers: [
    StoreStatusGateway,
    StockAlertGateway,
    NotificationRepository,
    NotificationService,
  ],
  exports: [StoreStatusGateway, StockAlertGateway],
})
export class NotificationModule {}
