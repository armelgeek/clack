import { Module } from "@nestjs/common";
import { StoreUserRepository } from "./store-user.repository";
import { StoreUserService } from "./store-user.service";
import { StoreUserController } from "./store-user.controller";
@Module({
  providers: [StoreUserService, StoreUserRepository],
  exports: [StoreUserService],
  controllers: [StoreUserController],
})
export class StoreUserModule {} 