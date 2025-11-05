import { NotificationRepository } from '../notifications/notifications.repository';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductService } from '../product/product.service';
import { UserInventoryPreferencesRepository } from '../user-inventory-preferences/user-inventory-preferences.repository';
import { StockAlertGateway } from '../notifications/gateway/stock-alert.gateway';
import { CreateNotificationDto } from '../notifications/dtos/create-notification.dto';
import {
  NotificationPlatform,
  NotificationType,
} from 'types/enums/notification';

@Injectable()
export class StockAlertService {
  private readonly logger = new Logger(StockAlertService.name);

  constructor(
    private readonly stockAlertGateway: StockAlertGateway,
    private readonly userInventoryPreferencesRepository: UserInventoryPreferencesRepository,
    private readonly notificationRepository: NotificationRepository,
    private readonly productService: ProductService,
  ) {}

  /** This cron job will run every 4 hours */
  @Cron('0 0 */4 * * *')
  async handleStockAlertCron() {
    const targetUsersAndStores =
      await this.userInventoryPreferencesRepository.getTargetUsersForStockAlert();

    if (targetUsersAndStores.length === 0) {
      this.logger.log('Aucun utilisateur cible trouvé.');
      return;
    }

    let notificationsSentCount = 0;

    for (const { userId, storeId, threshold } of targetUsersAndStores) {
      if (!storeId) {
        this.logger.warn(
          `Skipping notification for user ${userId}: No store found.`,
        );
        continue;
      }

      const outOfStockResponse =
        await this.productService.fetchFilteredProductsByStoreId(storeId, {
          threshold,
        });

      const outOfStockProductsCount = outOfStockResponse?.total || 0;

      if (outOfStockProductsCount > 0) {
        const notificationToInsert: CreateNotificationDto = {
          userId: userId,
          type: NotificationType.STOCK_ALERT,
          data: {
            outOfStockProductsCount,
            threshold,
          },
          platform: NotificationPlatform.STORE_ADMIN,
          redirectUrl: storeId,
        };

        const newNotifications =
          await this.notificationRepository.createNotificationsBatch([
            notificationToInsert,
          ]);

        this.stockAlertGateway.notifyOutOfStockProduct(newNotifications[0]);
        notificationsSentCount++;
      }
    }

    this.logger.log(
      `Tâche de stock terminée. ${notificationsSentCount} notifications envoyées.`,
    );
  }
}
