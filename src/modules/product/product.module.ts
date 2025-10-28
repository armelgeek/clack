import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductImagesRepository } from './productImages.repository';

@Module({
  controllers: [ProductController],
  providers: [ProductRepository, ProductService, ProductImagesRepository],
  exports: [ProductService],
})
export class ProductModule {}
