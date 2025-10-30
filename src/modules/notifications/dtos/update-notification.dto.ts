import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Notification IDs',
    example: ['219', '220', '221'],
  })
  @IsArray()
  notificationIds: string[];

  @ApiPropertyOptional({
    description: 'If the notification has been read',
    example: true,
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'If the notification has been seen',
    example: true,
  })
  @IsBoolean()
  isSeen?: boolean;
}
