import { Module } from '@nestjs/common';
import { UserPaymentMethodsController } from './user-payment-methods.controller';
import { UserPaymentMethodsService } from './user-payment-methods.service';
import { UserPaymentMethodsRepository } from './user-payment-methods.repository';

@Module({
  controllers: [UserPaymentMethodsController],
  providers: [UserPaymentMethodsService, UserPaymentMethodsRepository],
  exports: [UserPaymentMethodsService, UserPaymentMethodsRepository],
})
export class UserPaymentMethodsModule {}
