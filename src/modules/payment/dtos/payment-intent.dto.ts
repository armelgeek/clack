import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount in currency' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g., EUR, USD)' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsString()
  orderId: string;
}
