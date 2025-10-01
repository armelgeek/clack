import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
