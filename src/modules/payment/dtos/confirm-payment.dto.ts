import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Payment intent ID' })
  @IsNotEmpty()
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Payment method token' })
  @IsNotEmpty()
  @IsString()
  paymentMethodToken: string;
}
