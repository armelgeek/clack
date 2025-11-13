import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method type (card, paypal)' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: 'Payment provider (stripe, paypal)' })
  @IsNotEmpty()
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Tokenized payment method' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card' })
  @IsOptional()
  @IsString()
  last4?: string;

  @ApiPropertyOptional({ description: 'Card brand (visa, mastercard)' })
  @IsOptional()
  @IsString()
  cardBrand?: string;

  @ApiPropertyOptional({ description: 'Expiry month (1-12)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiPropertyOptional({ description: 'Expiry year' })
  @IsOptional()
  @IsInt()
  expiryYear?: number;

  @ApiPropertyOptional({ description: 'Set as default payment method', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
