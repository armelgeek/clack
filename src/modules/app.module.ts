import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.service';
import { StoreModule } from './store/store.module';
@Module({
  imports: [AuthModule.forRoot(auth), StoreModule],
})
export class AppModule {}
