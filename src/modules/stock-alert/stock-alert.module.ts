import { Module } from '@nestjs/common';
import { StockAlertService } from './stock-alert.service';

import { ProductModule } from '../product/product.module';
import { NotificationRepository } from '../notifications/notifications.repository';
import { UserInventoryPreferencesRepository } from '../user-inventory-preferences/user-inventory-preferences.repository';
import { StockAlertGateway } from '../notifications/gateway/stock-alert.gateway';

@Module({
  imports: [ProductModule],
  providers: [
    StockAlertService,
    StockAlertGateway,
    NotificationRepository,
    UserInventoryPreferencesRepository,
  ],
})
export class StockAlertModule {}
