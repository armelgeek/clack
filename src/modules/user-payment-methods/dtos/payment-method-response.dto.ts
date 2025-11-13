import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentMethodResponseDto {
  @ApiProperty({ description: 'Payment method ID' })
  id: string;

  @ApiProperty({ description: 'Payment method type (card, paypal, other)' })
  type: string;

  @ApiProperty({ description: 'Payment provider (stripe, paypal)' })
  provider: string;

  @ApiPropertyOptional({ description: 'Tokenized payment method (masked)' })
  token?: string;

  @ApiPropertyOptional({ description: 'Last 4 digits of card' })
  last4?: string;

  @ApiPropertyOptional({ description: 'Card brand (visa, mastercard)' })
  cardBrand?: string;

  @ApiPropertyOptional({ description: 'Expiry month (1-12)', type: Number })
  expiryMonth?: number;

  @ApiPropertyOptional({ description: 'Expiry year', type: Number })
  expiryYear?: number;

  @ApiPropertyOptional({ description: 'Is default payment method', type: Boolean })
  isDefault?: boolean;

  @ApiProperty({ description: 'Creation date (ISO 8601)' })
  createdAt: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)' })
  updatedAt: string;
}

export class GetPaymentMethodsResponseDto {
  @ApiProperty({ type: [PaymentMethodResponseDto] })
  paymentMethods: PaymentMethodResponseDto[];
}
