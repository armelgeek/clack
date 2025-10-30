import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { MailService } from './mail.service';
import { StoreRepository } from '../store/store.repository';

@Module({
  providers: [UserService, UserRepository, MailService, StoreRepository],
  controllers: [UserController],
  exports: [MailService],
})

export class UserModule {}
