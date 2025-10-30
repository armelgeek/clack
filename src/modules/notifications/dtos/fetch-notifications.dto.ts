import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationPlatform } from 'types/enums/notification';

export class FetchNotificationDto {
  @ApiPropertyOptional({
    description: 'ID of the user who will receive the notification',
    example: '219',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Platform where the notification is sent',
    example: NotificationPlatform.SUPER_ADMIN,
  })
  @IsEnum(NotificationPlatform)
  platform: NotificationPlatform;
}
