import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ProductModule } from '../product/product.module';
import { CategoryRepository } from '../category/category.repository';
import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';

@Module({
  imports: [ProductModule  ],
  providers: [SyncService , ExternalStoreMappingRepository , CategoryRepository],
  exports:[ExternalStoreMappingRepository , CategoryRepository]
})
export class SyncModule {}
