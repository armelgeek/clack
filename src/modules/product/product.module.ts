import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductImagesRepository } from './productImages.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService, ProductImagesRepository],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
