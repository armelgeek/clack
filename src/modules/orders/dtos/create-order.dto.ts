import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'Address ID for delivery' })
  @IsNotEmpty()
  @IsString()
  addressId: string;

  @ApiProperty({ description: 'Payment method ID' })
  @IsNotEmpty()
  @IsString()
  paymentMethodId: string;

  @ApiPropertyOptional({ description: 'Order notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
