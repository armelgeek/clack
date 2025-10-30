import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import {
  NotificationPlatform,
  NotificationType,
} from 'types/enums/notification';
import { v4 as uuidv4 } from 'uuid';

export class CreateNotificationDto {
  @ApiPropertyOptional({
    description: 'Optional UUID for internal use during batch insertion.',
    example: uuidv4(),
    readOnly: true,
    type: 'string',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  id?: string = uuidv4();

  @ApiProperty({
    description: 'Notification type',
    example: NotificationType.STORE_STATUS_CHANGE,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiPropertyOptional({
    description: 'Notification data',
    example: {
      storeId: '219',
      newStatus: 'ACTIVATED',
      storeName: 'My Store',
    },
  })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Redirect URL',
    example: 'https://example.com',
  })
  @IsString()
  redirectUrl?: string;

  @ApiProperty({
    description: 'Platform where the notification is sent',
    example: NotificationPlatform.SUPER_ADMIN,
  })
  @IsEnum(NotificationPlatform)
  platform: NotificationPlatform;

  @ApiPropertyOptional({
    description: 'User who will receive the notification',
    example: '2199732',
  })
  @IsString()
  userId?: string;
}
