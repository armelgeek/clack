import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { ProductModule } from '../product/product.module';

import { ExternalStoreMappingRepository } from '../external-store-mappings/external-store-mappings.repository';

@Module({
  imports: [ProductModule  ],
  providers: [SyncService , ExternalStoreMappingRepository],
  exports:[ExternalStoreMappingRepository]
})
export class SyncModule {}
