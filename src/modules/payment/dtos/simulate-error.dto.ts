import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PaymentErrorType {
  DECLINED = 'declined',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_REQUIRED = 'authentication_required',
}

export class SimulatePaymentErrorDto {
  @ApiProperty({ 
    description: 'Type of payment error to simulate',
    enum: PaymentErrorType,
  })
  @IsNotEmpty()
  @IsEnum(PaymentErrorType)
  type: PaymentErrorType;
}
