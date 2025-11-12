import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryRepository } from './delivery.repository';
import { OrdersRepository } from '../orders/orders.repository';

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryRepository, OrdersRepository],
  exports: [DeliveryService],
})
export class DeliveryModule {}
