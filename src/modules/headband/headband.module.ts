import { Module } from '@nestjs/common';
import { HeadbandController } from './headband.controller';
import { HeadbandService } from './headband.service';
import { HeadbandRepository } from './headband.repository';
import { BannerGateway } from './headband.gateway';
@Module({
  controllers: [HeadbandController],
  providers: [HeadbandService , HeadbandRepository , BannerGateway] , 
  exports : [HeadbandService , HeadbandRepository , BannerGateway],
})
export class HeadbandModule {}
