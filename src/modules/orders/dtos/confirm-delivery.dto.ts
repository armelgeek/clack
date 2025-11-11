import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmDeliveryDto {
  @ApiPropertyOptional({ description: 'Photo URL as proof of delivery' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Electronic signature' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({ description: 'Delivery notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
