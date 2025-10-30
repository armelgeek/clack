import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { MemoryStoredFile } from 'nestjs-form-data';

import { TUploadFileResponse } from '../models';
import { FileUploaderService } from '../services/file-uploader.service';

/**
 * this controller is for testing purpose only, this endpoint is not exposed
 */
@Controller('file-uploader')
export class FileUploaderController {
  constructor(private readonly service: FileUploaderService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MemoryStoredFile
  ): Promise<TUploadFileResponse> {
    console.log(file);
    return this.service.uploadFile(file, `direct-images/${file.originalName}`);
  }

  @Post('/clear-directory')
  async clearDirectory(): Promise<void> {
    return this.service.clearDirectory(`direct-images`);
  }
}
