import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.service';
@Module({
  imports: [
    AuthModule.forRoot(auth),
  ],
})
export class AppModule {}
