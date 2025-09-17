import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.service';
import { StoreModule } from './store/store.module';
import { StoreUsersModule } from './store-users/store-users.module';
@Module({
  imports: [AuthModule.forRoot(auth), StoreModule, StoreUsersModule],
})
export class AppModule {}
