import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BasicListResponse } from 'types/common/response';
import { NotificationService } from './notifications.service';
import { FetchNotificationDto } from './dtos/fetch-notifications.dto';
import { TNotification } from 'types/notification';
import { UpdateNotificationDto } from './dtos/update-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch notifications by userId and platform' })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Error while fetching notifications',
  })
  async fetchNotifications(
    @Query() data: FetchNotificationDto,
  ): Promise<BasicListResponse<TNotification>> {
    const notifications =
      await this.notificationService.fetchNotifications(data);
    return notifications;
  }

  @Put()
  @ApiOperation({ summary: 'Update notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications updated successfully',
  })
  @ApiResponse({
    status: 500,
    description: `Error while updating notifications`,
  })
  async updateNotifications(@Body() dto: UpdateNotificationDto) {
    return this.notificationService.updateNotifications(dto);
  }
}
