import { Module } from '@nestjs/common';
import { StoreFolderService } from './store-folder.service';
import { StoreFolderController } from './store-folder.controller';
import { StoreFolderRepository } from './store-folder.repository';
@Module({
  providers: [StoreFolderService, StoreFolderRepository],
  controllers: [StoreFolderController]
})
export class StoreFolderModule {}
