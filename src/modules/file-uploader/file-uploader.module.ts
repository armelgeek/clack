import { Module } from '@nestjs/common';
import { FileUploaderService } from './services/file-uploader.service';
import { FileUploaderController } from './controllers/file-uploader.controller';

@Module({
  providers: [FileUploaderService],
  controllers: [FileUploaderController],
  exports: [FileUploaderService],
})
export class FileUploaderModule {}
