import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MemoryStoredFile } from 'nestjs-form-data';
import { TUploadFileResponse } from '../models';

@Injectable()
export class FileUploaderService {
  private readonly ownLogger = new Logger(FileUploaderService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'objectStorage.bucketName',
      'images',
    );

    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>(
        'objectStorage.url',
        'localhost',
      ),
      credentials: {
        accessKeyId: this.configService.get<string>('objectStorage.accessKey'),
        secretAccessKey: this.configService.get<string>(
          'objectStorage.secretKey',
        ),
      },
      forcePathStyle: true,
      region: this.configService.get<string>(
        'objectStorage.region',
        'us-east-1',
      ),
    });
  }

  async uploadFile(
    file: MemoryStoredFile,
    objectName: string,
  ): Promise<TUploadFileResponse> {
    const fileBuffer = file.buffer;
    const fileSize = file.size;
    const filename = objectName.split('/').pop();
    const objectKey = `${this.bucketName}/${objectName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectName,
        Body: fileBuffer,
        ContentLength: fileSize,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      const url = `${this.configService.get<string>(
        'objectStorage.url',
        'localhost',
      )}/${objectKey}`;

      this.ownLogger.log('File uploaded successfully');

      return { url, filename, objectKey };
    } catch (e) {
      this.ownLogger.error('Error while uploading file', e);
      throw new InternalServerErrorException(
        'Failed to upload file to storage.',
      );
    }
  }

  async clearDirectory(directory: string): Promise<void> {
    const directoryKey = `${directory}/`;
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: directoryKey,
      });
      const listedObjects = await this.s3Client.send(listCommand);

      const objectsToDelete =
        listedObjects.Contents?.length > 0
          ? listedObjects.Contents.map((obj) => ({
              Key: obj.Key,
            }))
          : [];

      if (objectsToDelete.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: this.bucketName,
          Delete: { Objects: objectsToDelete },
        });
        await this.s3Client.send(deleteCommand);
      }

      this.ownLogger.log(`Directory cleared: ${directory}`);
    } catch (e) {
      this.ownLogger.error('Error while clearing directory', e);
    }
  }
}
