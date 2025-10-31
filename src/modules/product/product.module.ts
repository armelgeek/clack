import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductImagesRepository } from './productImages.repository';
import { HttpModule } from '@nestjs/axios';
import { FileUploaderModule } from '../file-uploader/file-uploader.module';

@Module({
  imports: [HttpModule, FileUploaderModule],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService, ProductImagesRepository],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
