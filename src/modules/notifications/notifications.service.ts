import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../notifications/notifications.repository';
import { FetchNotificationDto } from './dtos/fetch-notifications.dto';
import { BasicListResponse } from 'types/common/response';
import { TNotification } from 'types/notification';
import { UpdateNotificationDto } from './dtos/update-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async fetchNotifications(
    params: FetchNotificationDto,
  ): Promise<BasicListResponse<TNotification>> {
    try {
      const userId = params.userId ?? null;

      const notifications =
        await this.notificationRepository.findByUserIdAndPlatform(
          userId,
          params.platform,
        );

      return {
        data: notifications,
        total: notifications.length,
      };
    } catch (e) {
      this.logger.error('Error fetching notifications', e);
    }
  }

  async updateNotifications(data: UpdateNotificationDto) {
    const updatedNotifications =
      await this.notificationRepository.updateNotifications(data);

    return updatedNotifications;
  }
}
